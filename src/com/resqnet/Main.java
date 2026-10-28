package com.resqnet;

import com.resqnet.api.AuthHandler;
import com.resqnet.api.CorsFilter;
import com.resqnet.api.DashboardHandler;
import com.resqnet.api.DispatchHandler;
import com.resqnet.api.EmergencyHandler;
import com.resqnet.api.ResourceHandler;
import com.resqnet.api.VolunteerHandler;
import com.resqnet.model.emergency.EmergencyRequest;
import com.resqnet.model.resource.Resource;
import com.resqnet.model.user.Volunteer;
import com.resqnet.service.AuthManager;
import com.resqnet.service.EmergencyManager;
import com.resqnet.service.MatchingEngine;
import com.resqnet.service.ResourceManager;
import com.resqnet.service.UserManager;
import com.resqnet.storage.SQLiteStorageManager;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.file.Paths;
import java.nio.file.Path;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.logging.Level;
import java.util.logging.Logger;

/** ResQNet API entry point. Run from the project root with Java 17 or later. */
public final class Main {
    private static final Logger LOGGER = Logger.getLogger(Main.class.getName());
    private static final int DEFAULT_PORT = 8080;

    private Main() { }

    public static void main(String[] args) throws IOException {
        int port = configuredPort();
        Path dataDirectory = Paths.get("data");
        Path databasePath = configuredDatabasePath(dataDirectory);
        SQLiteStorageManager storage = new SQLiteStorageManager(databasePath, dataDirectory);
        AuthManager authManager = new AuthManager(databasePath, dataDirectory.resolve("auth_users.csv"));
        EmergencyManager emergencyManager = new EmergencyManager();
        ResourceManager resourceManager = new ResourceManager();
        UserManager userManager = new UserManager();

        for (EmergencyRequest emergency : storage.loadEmergencies()) emergencyManager.addOrUpdateEmergency(emergency);
        for (Resource resource : storage.loadResources()) resourceManager.addOrUpdateResource(resource);
        for (Volunteer volunteer : storage.loadVolunteers()) userManager.addOrUpdateUser(volunteer);

        MatchingEngine matchingEngine = new MatchingEngine(resourceManager, userManager);
        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);
        int threadCount = Math.max(4, Math.min(32, Runtime.getRuntime().availableProcessors()));
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        server.setExecutor(executor);
        server.createContext("/api/auth", new CorsFilter(new AuthHandler(authManager)));
        server.createContext("/api/emergencies", new CorsFilter(new EmergencyHandler(emergencyManager, storage)));
        server.createContext("/api/resources", new CorsFilter(new ResourceHandler(resourceManager, storage)));
        server.createContext("/api/volunteers", new CorsFilter(new VolunteerHandler(userManager, storage)));
        server.createContext("/api/dispatch", new CorsFilter(new DispatchHandler(emergencyManager,
                resourceManager, userManager, matchingEngine, storage)));
        server.createContext("/api/dashboard",
                new CorsFilter(new DashboardHandler(emergencyManager, resourceManager, userManager)));
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            server.stop(1);
            executor.shutdown();
        }, "resqnet-shutdown"));
        server.start();
        LOGGER.info("ResQNet API listening on port " + port);
    }

    private static Path configuredDatabasePath(Path dataDirectory) {
        String configured = System.getenv("RESQNET_DB_PATH");
        if (configured == null || configured.trim().isEmpty()) return dataDirectory.resolve("resqnet.db");
        return Paths.get(configured.trim());
    }

    private static int configuredPort() {
        String configured = System.getenv("RESQNET_PORT");
        if (configured == null || configured.trim().isEmpty()) return DEFAULT_PORT;
        try {
            int port = Integer.parseInt(configured.trim());
            if (port < 1 || port > 65535) throw new NumberFormatException("out of range");
            return port;
        } catch (NumberFormatException exception) {
            LOGGER.log(Level.SEVERE, "Invalid RESQNET_PORT value: " + configured, exception);
            throw new IllegalArgumentException("RESQNET_PORT must be an integer from 1 to 65535", exception);
        }
    }
}
