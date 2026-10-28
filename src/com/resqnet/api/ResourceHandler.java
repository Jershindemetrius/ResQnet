package com.resqnet.api;

import com.resqnet.model.enums.ResourceType;
import com.resqnet.model.resource.MedicalResource;
import com.resqnet.model.resource.Resource;
import com.resqnet.model.resource.Shelter;
import com.resqnet.model.resource.Vehicle;
import com.resqnet.exception.ResourceNotFoundException;
import com.resqnet.service.ResourceManager;
import com.resqnet.storage.SQLiteStorageManager;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import java.io.IOException;
import java.util.Map;
import java.util.UUID;

/** Lists and registers dispatchable resources. */
public class ResourceHandler implements HttpHandler {
    private final ResourceManager resources;
    private final SQLiteStorageManager storage;

    public ResourceHandler(ResourceManager resources, SQLiteStorageManager storage) {
        this.resources = resources;
        this.storage = storage;
    }

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        try {
            String path = exchange.getRequestURI().getPath();
            if (path.matches("/api/resources/[^/]+/availability")
                    && "PUT".equalsIgnoreCase(exchange.getRequestMethod())) {
                updateAvailability(exchange, path);
                return;
            }
            if (!"/api/resources".equals(path)) {
                JsonSerializer.sendError(exchange, 404, "Route not found");
                return;
            }
            if ("GET".equalsIgnoreCase(exchange.getRequestMethod())) {
                JsonSerializer.send(exchange, 200, JsonSerializer.page(exchange, resources.getAllResources()));
                return;
            }
            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.getResponseHeaders().set("Allow", "GET, POST, OPTIONS");
                JsonSerializer.sendError(exchange, 405, "Method not allowed");
                return;
            }
            Map<String, Object> body = JsonSerializer.parseObject(exchange.getRequestBody());
            String id = JsonSerializer.optionalString(body, "id", UUID.randomUUID().toString());
            String name = JsonSerializer.requiredString(body, "name");
            ResourceType type = JsonSerializer.requiredEnum(body, "type", ResourceType.class);
            String location = JsonSerializer.requiredString(body, "location");
            int quantity = JsonSerializer.integerOrDefault(body, "quantity", 1);
            String provider = JsonSerializer.optionalString(body, "provider", "");
            if (quantity <= 0) throw new IllegalArgumentException("quantity must be positive");

            Resource resource;
            if (type == ResourceType.VEHICLE) {
                resource = new Vehicle(id, name, location, quantity, true, provider);
            } else if (type == ResourceType.SHELTER) {
                resource = new Shelter(id, name, location, quantity, true, provider);
            } else {
                resource = new MedicalResource(id, name, type, location, quantity, true, provider);
            }
            resources.addResource(resource);
            storage.saveResource(resource);
            JsonSerializer.send(exchange, 201, resource);
        } catch (ResourceNotFoundException exception) {
            JsonSerializer.sendError(exchange, 404, exception.getMessage());
        } catch (IllegalArgumentException exception) {
            JsonSerializer.sendError(exchange, 400, exception.getMessage());
        } catch (JsonSerializer.ResponseWriteException exception) {
            JsonSerializer.logResponseWriteFailure(exception);
        } catch (IOException exception) {
            JsonSerializer.sendServerError(exchange, "Unable to persist resource data", exception);
        } catch (RuntimeException exception) {
            JsonSerializer.sendError(exchange, 500, "Unable to process resource request");
            throw exception;
        }
    }

    private void updateAvailability(HttpExchange exchange, String path)
            throws IOException, ResourceNotFoundException {
        String id = path.substring("/api/resources/".length(),
                path.length() - "/availability".length());
        Map<String, Object> body = JsonSerializer.parseObject(exchange.getRequestBody());
        Object available = body.get("available");
        if (!(available instanceof Boolean)) {
            throw new IllegalArgumentException("available must be a boolean");
        }
        Resource resource = resources.getResource(id);
        resource.setAvailable((Boolean) available);
        storage.saveResource(resource);
        JsonSerializer.send(exchange, 200, resource);
    }
}
