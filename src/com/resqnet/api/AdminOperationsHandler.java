package com.resqnet.api;

import com.resqnet.service.AuthManager;
import com.resqnet.service.EmergencyManager;
import com.resqnet.service.ResourceManager;
import com.resqnet.service.UserManager;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import java.io.IOException;

/** Provides operational dashboard data only to authenticated administrator sessions. */
public final class AdminOperationsHandler implements HttpHandler {
    private final AuthManager auth;
    private final EmergencyManager emergencies;
    private final ResourceManager resources;
    private final UserManager users;

    public AdminOperationsHandler(AuthManager auth, EmergencyManager emergencies,
            ResourceManager resources, UserManager users) {
        this.auth = auth;
        this.emergencies = emergencies;
        this.resources = resources;
        this.users = users;
    }

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        if (!AuthGuard.requireAdmin(exchange, auth)) return;
        String path = exchange.getRequestURI().getPath();
        if (!"GET".equalsIgnoreCase(exchange.getRequestMethod())) {
            exchange.getResponseHeaders().set("Allow", "GET, OPTIONS");
            JsonSerializer.sendError(exchange, 405, "Method not allowed");
            return;
        }
        try {
            if ("/api/admin/dashboard".equals(path)) {
                JsonSerializer.send(exchange, 200,
                        DashboardHandler.dashboardData(emergencies, resources, users));
            } else if ("/api/admin/incidents".equals(path)) {
                JsonSerializer.send(exchange, 200,
                        JsonSerializer.page(exchange, emergencies.getPriorityOrderedEmergencies()));
            } else {
                JsonSerializer.sendError(exchange, 404, "Route not found");
            }
        } catch (IllegalArgumentException exception) {
            JsonSerializer.sendError(exchange, 400, exception.getMessage());
        }
    }
}
