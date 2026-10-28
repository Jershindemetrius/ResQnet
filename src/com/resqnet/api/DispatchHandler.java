package com.resqnet.api;

import com.resqnet.exception.ResourceNotFoundException;
import com.resqnet.model.emergency.EmergencyRequest;
import com.resqnet.model.emergency.MatchResult;
import com.resqnet.model.enums.RequestStatus;
import com.resqnet.model.resource.Resource;
import com.resqnet.model.user.Volunteer;
import com.resqnet.service.EmergencyManager;
import com.resqnet.service.MatchingEngine;
import com.resqnet.service.ResourceManager;
import com.resqnet.service.UserManager;
import com.resqnet.storage.SQLiteStorageManager;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import java.io.IOException;
import java.util.Map;

/** Dispatch matching and request status updates. */
public class DispatchHandler implements HttpHandler {
    private final EmergencyManager emergencies;
    private final ResourceManager resources;
    private final UserManager users;
    private final MatchingEngine matchingEngine;
    private final SQLiteStorageManager storage;

    public DispatchHandler(EmergencyManager emergencies, ResourceManager resources, UserManager users,
            MatchingEngine matchingEngine, SQLiteStorageManager storage) {
        this.emergencies = emergencies;
        this.resources = resources;
        this.users = users;
        this.matchingEngine = matchingEngine;
        this.storage = storage;
    }

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        String path = exchange.getRequestURI().getPath();
        try {
            if (path.matches("/api/dispatch/[^/]+/suggestions")
                    && "GET".equalsIgnoreCase(exchange.getRequestMethod())) {
                String emergencyId = path.substring("/api/dispatch/".length(),
                        path.length() - "/suggestions".length());
                EmergencyRequest emergency = emergencies.getEmergency(emergencyId);
                JsonSerializer.send(exchange, 200, matchingEngine.suggest(emergency));
            } else if ("/api/dispatch/match".equals(path)
                    && "POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                match(exchange);
            } else if ("/api/dispatch/status".equals(path)
                    && "PUT".equalsIgnoreCase(exchange.getRequestMethod())) {
                updateStatus(exchange);
            } else if ("/api/dispatch/match".equals(path) || "/api/dispatch/status".equals(path)
                    || path.matches("/api/dispatch/[^/]+/suggestions")) {
                exchange.getResponseHeaders().set("Allow",
                        "/api/dispatch/match".equals(path) ? "POST, OPTIONS"
                                : "/api/dispatch/status".equals(path) ? "PUT, OPTIONS" : "GET, OPTIONS");
                JsonSerializer.sendError(exchange, 405, "Method not allowed");
            } else {
                JsonSerializer.sendError(exchange, 404, "Route not found");
            }
        } catch (ResourceNotFoundException exception) {
            JsonSerializer.sendError(exchange, 404, exception.getMessage());
        } catch (IllegalArgumentException exception) {
            JsonSerializer.sendError(exchange, 400, exception.getMessage());
        } catch (JsonSerializer.ResponseWriteException exception) {
            JsonSerializer.logResponseWriteFailure(exception);
        } catch (IOException exception) {
            JsonSerializer.sendServerError(exchange, "Unable to persist dispatch data", exception);
        } catch (RuntimeException exception) {
            JsonSerializer.sendError(exchange, 500, "Unable to process dispatch request");
            throw exception;
        }
    }

    private void match(HttpExchange exchange) throws IOException, ResourceNotFoundException {
        Map<String, Object> body = JsonSerializer.parseObject(exchange.getRequestBody());
        String emergencyId = JsonSerializer.optionalString(body, "emergencyId", "");
        EmergencyRequest emergency;
        if (emergencyId.isEmpty()) {
            emergency = emergencies.pollNextPending();
            if (emergency == null) {
                JsonSerializer.sendError(exchange, 409, "There are no pending emergencies to dispatch");
                return;
            }
        } else {
            emergency = emergencies.getEmergency(emergencyId);
        }
        if (emergency.getStatus() != RequestStatus.PENDING) {
            emergencies.refreshQueue();
            JsonSerializer.sendError(exchange, 409, "Only pending emergencies can be matched");
            return;
        }
        MatchResult result = matchingEngine.match(emergency);
        if (!result.isSuccessful()) {
            emergencies.refreshQueue();
            JsonSerializer.sendError(exchange, 409, "No compatible resource or volunteer is available");
            return;
        }
        emergencies.refreshQueue();
        storage.saveDispatch(emergency, result.getResource(), result.getVolunteer());
        JsonSerializer.send(exchange, 200, result);
    }

    private void updateStatus(HttpExchange exchange) throws IOException, ResourceNotFoundException {
        Map<String, Object> body = JsonSerializer.parseObject(exchange.getRequestBody());
        String emergencyId = JsonSerializer.requiredString(body, "emergencyId");
        RequestStatus next = JsonSerializer.requiredEnum(body, "status", RequestStatus.class);
        EmergencyRequest emergency = emergencies.getEmergency(emergencyId);
        if (next.ordinal() < emergency.getStatus().ordinal()) {
            JsonSerializer.sendError(exchange, 409, "Emergency status cannot move backwards");
            return;
        }
        if (next == emergency.getStatus()) {
            JsonSerializer.send(exchange, 200, emergency);
            return;
        }

        Resource assignedResource = null;
        Volunteer assignedVolunteer = null;
        if (next == RequestStatus.RESOLVED && emergency.getStatus() != RequestStatus.RESOLVED) {
            String resourceId = emergency.getAssignedResourceId();
            if (resourceId != null) assignedResource = resources.getResource(resourceId);
            String volunteerId = emergency.getAssignedVolunteerId();
            if (volunteerId != null) assignedVolunteer = users.getVolunteer(volunteerId);
        }
        if (assignedResource != null) assignedResource.release();
        if (assignedVolunteer != null) assignedVolunteer.release();
        emergency.setStatus(next);
        emergencies.refreshQueue();
        storage.saveDispatch(emergency, assignedResource, assignedVolunteer);
        JsonSerializer.send(exchange, 200, emergency);
    }
}
