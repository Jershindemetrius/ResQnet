package com.resqnet.api;

import com.resqnet.exception.InvalidEmergencyRequestException;
import com.resqnet.model.emergency.EmergencyRequest;
import com.resqnet.model.enums.EmergencyType;
import com.resqnet.model.enums.PriorityLevel;
import com.resqnet.model.enums.ResourceType;
import com.resqnet.service.EmergencyManager;
import com.resqnet.storage.SQLiteStorageManager;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import java.io.IOException;
import java.util.Map;
import java.util.UUID;

/** Handles emergency creation and priority-ordered listing. */
public class EmergencyHandler implements HttpHandler {
    private final EmergencyManager emergencies;
    private final SQLiteStorageManager storage;

    public EmergencyHandler(EmergencyManager emergencies, SQLiteStorageManager storage) {
        this.emergencies = emergencies;
        this.storage = storage;
    }

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        try {
            if (!"/api/emergencies".equals(exchange.getRequestURI().getPath())) {
                JsonSerializer.sendError(exchange, 404, "Route not found");
                return;
            }
            String method = exchange.getRequestMethod();
            if ("GET".equalsIgnoreCase(method)) {
                JsonSerializer.send(exchange, 200,
                        JsonSerializer.page(exchange, emergencies.getPriorityOrderedEmergencies()));
            } else if ("POST".equalsIgnoreCase(method)) {
                Map<String, Object> body = JsonSerializer.parseObject(exchange.getRequestBody());
                EmergencyRequest request = new EmergencyRequest(
                        JsonSerializer.optionalString(body, "id", UUID.randomUUID().toString()),
                        JsonSerializer.requiredString(body, "reporterName"),
                        JsonSerializer.requiredString(body, "contact"),
                        JsonSerializer.requiredEnum(body, "type", EmergencyType.class),
                        JsonSerializer.requiredString(body, "location"),
                        JsonSerializer.requiredInteger(body, "affectedPeopleCount"),
                        JsonSerializer.optionalString(body, "description", ""),
                        JsonSerializer.enumOrDefault(body, "priority", PriorityLevel.class, PriorityLevel.MEDIUM),
                        JsonSerializer.requiredEnum(body, "requiredResourceType", ResourceType.class));
                emergencies.addEmergency(request);
                storage.saveEmergency(request);
                JsonSerializer.send(exchange, 201, request);
            } else {
                exchange.getResponseHeaders().set("Allow", "GET, POST, OPTIONS");
                JsonSerializer.sendError(exchange, 405, "Method not allowed");
            }
        } catch (InvalidEmergencyRequestException | IllegalArgumentException exception) {
            JsonSerializer.sendError(exchange, 400, exception.getMessage());
        } catch (JsonSerializer.ResponseWriteException exception) {
            JsonSerializer.logResponseWriteFailure(exception);
        } catch (IOException exception) {
            JsonSerializer.sendServerError(exchange, "Unable to persist emergency data", exception);
        } catch (RuntimeException exception) {
            JsonSerializer.sendError(exchange, 500, "Unable to process emergency request");
            throw exception;
        }
    }
}
