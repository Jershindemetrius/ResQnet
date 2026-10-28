package com.resqnet.api;

import com.resqnet.model.enums.ResourceType;
import com.resqnet.model.resource.Resource;
import com.resqnet.service.ResourceManager;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** Provides the live ambulance inventory without exposing unrelated resources. */
public final class AmbulanceHandler implements HttpHandler {
    private final ResourceManager resources;

    public AmbulanceHandler(ResourceManager resources) {
        if (resources == null) throw new IllegalArgumentException("resource manager must not be null");
        this.resources = resources;
    }

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        if (!"/api/ambulances".equals(exchange.getRequestURI().getPath())) {
            JsonSerializer.sendError(exchange, 404, "Route not found");
            return;
        }
        if (!"GET".equalsIgnoreCase(exchange.getRequestMethod())) {
            exchange.getResponseHeaders().set("Allow", "GET, OPTIONS");
            JsonSerializer.sendError(exchange, 405, "Method not allowed");
            return;
        }

        List<Resource> ambulances = new ArrayList<Resource>();
        long totalUnits = 0;
        long availableUnits = 0;
        for (Resource resource : resources.getAllResources()) {
            if (resource.getType() != ResourceType.AMBULANCE) continue;
            ambulances.add(resource);
            totalUnits += resource.getQuantity();
            if (resource.isAvailable()) availableUnits += resource.getQuantity();
        }
        ambulances.sort(Comparator.comparing(Resource::getId));

        try {
            List<Resource> page = exchange.getRequestURI().getRawQuery() == null
                    ? ambulances.subList(0, Math.min(12, ambulances.size()))
                    : JsonSerializer.page(exchange, ambulances);
            Map<String, Object> response = new LinkedHashMap<String, Object>();
            response.put("totalResources", ambulances.size());
            response.put("totalUnits", totalUnits);
            response.put("availableUnits", availableUnits);
            response.put("ambulances", page);
            JsonSerializer.send(exchange, 200, response);
        } catch (IllegalArgumentException exception) {
            JsonSerializer.sendError(exchange, 400, exception.getMessage());
        } catch (JsonSerializer.ResponseWriteException exception) {
            JsonSerializer.logResponseWriteFailure(exception);
        }
    }
}
