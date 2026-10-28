package com.resqnet.api;

import com.resqnet.model.emergency.EmergencyRequest;
import com.resqnet.model.enums.PriorityLevel;
import com.resqnet.model.enums.RequestStatus;
import com.resqnet.model.user.Volunteer;
import com.resqnet.model.resource.Resource;
import com.resqnet.service.EmergencyManager;
import com.resqnet.service.ResourceManager;
import com.resqnet.service.UserManager;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import java.io.IOException;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.Map;

/** Provides live emergency and volunteer counts for the dashboard. */
public class DashboardHandler implements HttpHandler {
    private final EmergencyManager emergencies;
    private final ResourceManager resources;
    private final UserManager users;

    public DashboardHandler(EmergencyManager emergencies, ResourceManager resources, UserManager users) {
        this.emergencies = emergencies;
        this.resources = resources;
        this.users = users;
    }

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        if (!"/api/dashboard".equals(exchange.getRequestURI().getPath())) {
            JsonSerializer.sendError(exchange, 404, "Route not found");
            return;
        }
        if (!"GET".equalsIgnoreCase(exchange.getRequestMethod())) {
            exchange.getResponseHeaders().set("Allow", "GET, OPTIONS");
            JsonSerializer.sendError(exchange, 405, "Method not allowed");
            return;
        }
        Map<String, Object> counts = new LinkedHashMap<String, Object>();
        int active = 0;
        int critical = 0;
        int high = 0;
        int medium = 0;
        int low = 0;
        int resolvedToday = 0;
        LocalDate today = LocalDate.now();
        for (EmergencyRequest emergency : emergencies.getAllEmergencies()) {
            if (emergency.getStatus() == RequestStatus.RESOLVED) {
                if (emergency.getResolvedAt() != null
                        && emergency.getResolvedAt().toLocalDate().equals(today)) resolvedToday++;
                continue;
            }
            active++;
            PriorityLevel priority = emergency.getPriority();
            if (priority == PriorityLevel.CRITICAL) critical++;
            else if (priority == PriorityLevel.HIGH) high++;
            else if (priority == PriorityLevel.MEDIUM) medium++;
            else if (priority == PriorityLevel.LOW) low++;
        }
        int availableVolunteers = 0;
        for (Volunteer volunteer : users.getVolunteers()) {
            if (volunteer.isAvailable()) availableVolunteers++;
        }
        int availableResources = 0;
        for (Resource resource : resources.getAllResources()) {
            if (resource.isAvailable()) availableResources++;
        }
        counts.put("active", active);
        counts.put("critical", critical);
        counts.put("high", high);
        counts.put("medium", medium);
        counts.put("low", low);
        counts.put("availableVolunteers", availableVolunteers);
        counts.put("availableResources", availableResources);
        counts.put("resolvedToday", resolvedToday);
        try {
            JsonSerializer.send(exchange, 200, counts);
        } catch (IOException exception) {
            throw exception;
        }
    }
}
