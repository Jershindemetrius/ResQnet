package com.resqnet;

import com.resqnet.api.AmbulanceHandler;
import com.resqnet.model.enums.ResourceType;
import com.resqnet.model.resource.MedicalResource;
import com.resqnet.service.ResourceManager;
import com.sun.net.httpserver.HttpServer;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public final class AmbulanceHandlerSmoke {
    private AmbulanceHandlerSmoke() { }

    public static void main(String[] args) throws Exception {
        ResourceManager resources = new ResourceManager();
        for (int index = 0; index < 14; index++) {
            resources.addResource(new MedicalResource("AMB-" + index, "Unit " + index,
                    ResourceType.AMBULANCE, "Kovilpatti", 1, index != 13, "ResQNet"));
        }
        resources.addResource(new MedicalResource("KIT-1", "Medical kit",
                ResourceType.MEDICAL_KIT, "Kovilpatti", 2));

        HttpServer server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/api/ambulances", new AmbulanceHandler(resources));
        server.start();
        try {
            HttpClient client = HttpClient.newHttpClient();
            URI base = URI.create("http://127.0.0.1:" + server.getAddress().getPort() + "/api/ambulances");
            HttpResponse<String> defaultPage = client.send(HttpRequest.newBuilder(base).GET().build(),
                    HttpResponse.BodyHandlers.ofString());
            if (defaultPage.statusCode() != 200
                    || !defaultPage.body().contains("\"totalResources\":14")
                    || !defaultPage.body().contains("\"totalUnits\":14")
                    || !defaultPage.body().contains("\"availableUnits\":13")
                    || count(defaultPage.body(), "\"type\":\"AMBULANCE\"") != 12) {
                throw new AssertionError("Default ambulance inventory page is incorrect: " + defaultPage.body());
            }

            URI invalidPage = URI.create(base + "?limit=0&offset=0");
            HttpResponse<String> invalid = client.send(HttpRequest.newBuilder(invalidPage).GET().build(),
                    HttpResponse.BodyHandlers.ofString());
            if (invalid.statusCode() != 400 || !invalid.body().contains("limit must be from 1 to 500")) {
                throw new AssertionError("Invalid pagination was not rejected: " + invalid.body());
            }
        } finally {
            server.stop(0);
        }
        System.out.println("Ambulance inventory smoke test passed.");
    }

    private static int count(String value, String match) {
        int count = 0;
        int offset = 0;
        while ((offset = value.indexOf(match, offset)) >= 0) {
            count++;
            offset += match.length();
        }
        return count;
    }
}
