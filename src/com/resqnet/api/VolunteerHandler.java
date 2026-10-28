package com.resqnet.api;

import com.resqnet.exception.ResourceNotFoundException;
import com.resqnet.service.AuthManager;
import com.resqnet.model.user.Volunteer;
import com.resqnet.service.UserManager;
import com.resqnet.storage.SQLiteStorageManager;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import java.io.IOException;
import java.util.Map;
import java.util.UUID;

/** Lists, registers, and updates volunteer availability. */
public class VolunteerHandler implements HttpHandler {
    private final UserManager users;
    private final SQLiteStorageManager storage;
    private final AuthManager auth;

    public VolunteerHandler(UserManager users, SQLiteStorageManager storage, AuthManager auth) {
        this.users = users;
        this.storage = storage;
        this.auth = auth;
    }

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        try {
            if (!"/api/volunteers".equals(exchange.getRequestURI().getPath())) {
                JsonSerializer.sendError(exchange, 404, "Route not found");
                return;
            }
            if ("GET".equalsIgnoreCase(exchange.getRequestMethod())) {
                JsonSerializer.send(exchange, 200, JsonSerializer.page(exchange, users.getVolunteers()));
                return;
            }
            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.getResponseHeaders().set("Allow", "GET, POST, OPTIONS");
                JsonSerializer.sendError(exchange, 405, "Method not allowed");
                return;
            }
            Map<String, Object> body = JsonSerializer.parseObject(exchange.getRequestBody());
            String id = JsonSerializer.optionalString(body, "id", "");
            if (!id.isEmpty() && body.containsKey("status")) {
                if (!AuthGuard.requireAdmin(exchange, auth)) return;
                Volunteer existing = users.getVolunteer(id);
                existing.setStatus(JsonSerializer.requiredEnum(body, "status", Volunteer.Status.class));
                if (body.containsKey("assignedEmergencyId")) {
                    existing.setAssignedEmergencyId(
                            JsonSerializer.optionalString(body, "assignedEmergencyId", ""));
                }
                storage.saveVolunteer(existing);
                JsonSerializer.send(exchange, 200, existing);
                return;
            }

            Volunteer volunteer = new Volunteer(
                    id.isEmpty() ? UUID.randomUUID().toString() : id,
                    JsonSerializer.requiredString(body, "name"),
                    JsonSerializer.requiredString(body, "contact"),
                    JsonSerializer.requiredString(body, "location"),
                    JsonSerializer.stringList(body, "skillSet"),
                    Volunteer.Status.AVAILABLE,
                    null);
            users.addUser(volunteer);
            storage.saveVolunteer(volunteer);
            JsonSerializer.send(exchange, 201, volunteer);
        } catch (ResourceNotFoundException exception) {
            JsonSerializer.sendError(exchange, 404, exception.getMessage());
        } catch (IllegalArgumentException exception) {
            JsonSerializer.sendError(exchange, 400, exception.getMessage());
        } catch (JsonSerializer.ResponseWriteException exception) {
            JsonSerializer.logResponseWriteFailure(exception);
        } catch (IOException exception) {
            JsonSerializer.sendServerError(exchange, "Unable to persist volunteer data", exception);
        } catch (RuntimeException exception) {
            JsonSerializer.sendError(exchange, 500, "Unable to process volunteer request");
            throw exception;
        }
    }
}
