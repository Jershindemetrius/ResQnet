package com.resqnet.api;

import com.resqnet.model.user.AuthAccount;
import com.resqnet.service.AuthManager;
import com.resqnet.service.AuthManager.DuplicateAccountException;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

/** Handles account signup and login at /api/auth/signup and /api/auth/login. */
public class AuthHandler implements HttpHandler {
    private static final Logger LOGGER = Logger.getLogger(AuthHandler.class.getName());
    private final AuthManager auth;

    public AuthHandler(AuthManager auth) {
        if (auth == null) throw new IllegalArgumentException("auth manager must not be null");
        this.auth = auth;
    }

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        String path = exchange.getRequestURI().getPath();
        boolean signup = "/api/auth/signup".equals(path);
        boolean login = "/api/auth/login".equals(path);
        if (!signup && !login) {
            JsonSerializer.sendError(exchange, 404, "Route not found");
            return;
        }
        if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
            exchange.getResponseHeaders().set("Allow", "POST, OPTIONS");
            JsonSerializer.sendError(exchange, 405, "Method not allowed");
            return;
        }

        char[] password = null;
        try {
            Map<String, Object> body = JsonSerializer.parseObject(exchange.getRequestBody());
            String email = JsonSerializer.requiredString(body, "email");
            password = JsonSerializer.requiredString(body, "password").toCharArray();
            AuthAccount account;
            int status;
            if (signup) {
                account = auth.register(JsonSerializer.requiredString(body, "name"), email, password);
                status = 201;
            } else {
                account = auth.authenticate(email, password);
                if (account == null) {
                    JsonSerializer.sendError(exchange, 401, "Invalid email or password");
                    return;
                }
                status = 200;
            }
            Map<String, Object> response = new LinkedHashMap<String, Object>();
            response.put("id", account.getId());
            response.put("name", account.getName());
            response.put("email", account.getEmail());
            JsonSerializer.send(exchange, status, response);
        } catch (DuplicateAccountException exception) {
            JsonSerializer.sendError(exchange, 409, "An account with this email already exists");
        } catch (IllegalArgumentException exception) {
            JsonSerializer.sendError(exchange, 400, exception.getMessage());
        } catch (GeneralSecurityException exception) {
            LOGGER.log(Level.SEVERE, "Unable to verify account password", exception);
            JsonSerializer.sendError(exchange, 500, "Unable to process authentication request");
        } catch (IOException exception) {
            JsonSerializer.sendServerError(exchange, "Unable to persist account data", exception);
        } finally {
            if (password != null) java.util.Arrays.fill(password, '\0');
        }
    }
}
