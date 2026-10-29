package com.resqnet.api;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import java.io.IOException;
import java.util.LinkedHashSet;
import java.util.Set;

/** Restricts credentialed browser requests to explicitly configured frontend origins. */
public class CorsFilter implements HttpHandler {
    private final HttpHandler next;
    private final Set<String> allowedOrigins;

    public CorsFilter(HttpHandler next) {
        this(next, configuredOrigins());
    }

    public CorsFilter(HttpHandler next, Set<String> allowedOrigins) {
        if (next == null) throw new IllegalArgumentException("next handler must not be null");
        if (allowedOrigins == null) throw new IllegalArgumentException("allowedOrigins must not be null");
        this.next = next;
        this.allowedOrigins = new LinkedHashSet<String>(allowedOrigins);
    }

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        String origin = exchange.getRequestHeaders().getFirst("Origin");
        if (origin != null && !allowedOrigins.contains(origin)) {
            JsonSerializer.sendError(exchange, 403, "Browser origin is not allowed");
            return;
        }
        exchange.getResponseHeaders().set("Vary", "Origin");
        if (origin != null) {
            exchange.getResponseHeaders().set("Access-Control-Allow-Origin", origin);
            exchange.getResponseHeaders().set("Access-Control-Allow-Credentials", "true");
        }
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods",
                "GET, POST, PUT, DELETE, OPTIONS");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type, Authorization");
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=utf-8");
        if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
            exchange.getResponseHeaders().set("Access-Control-Max-Age", "86400");
            exchange.sendResponseHeaders(204, -1);
            exchange.close();
            return;
        }
        next.handle(exchange);
    }

    private static Set<String> configuredOrigins() {
        String configured = System.getenv("RESQNET_ALLOWED_ORIGINS");
        String origins = configured == null || configured.trim().isEmpty()
                ? "http://localhost:5173" : configured;
        Set<String> result = new LinkedHashSet<String>();
        for (String origin : origins.split(",")) {
            String normalized = origin.trim();
            if (!normalized.isEmpty()) result.add(normalized);
        }
        return result;
    }

}
