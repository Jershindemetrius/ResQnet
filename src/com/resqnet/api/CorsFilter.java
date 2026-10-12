package com.resqnet.api;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import java.io.IOException;

/** Decorates API handlers with CORS headers and handles browser preflight. */
public class CorsFilter implements HttpHandler {
    private final HttpHandler next;

    public CorsFilter(HttpHandler next) {
        if (next == null) throw new IllegalArgumentException("next handler must not be null");
        this.next = next;
    }

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type");
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=utf-8");
        if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
            exchange.getResponseHeaders().set("Access-Control-Max-Age", "86400");
            exchange.sendResponseHeaders(204, -1);
            exchange.close();
            return;
        }
        next.handle(exchange);
    }
}
