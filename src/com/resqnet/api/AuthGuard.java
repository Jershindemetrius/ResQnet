package com.resqnet.api;

import com.resqnet.model.user.AuthAccount;
import com.resqnet.service.AuthManager;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpsExchange;
import java.io.IOException;

/** Reads and validates the server-issued session cookie for protected API routes. */
public final class AuthGuard {
    public static final String COOKIE_NAME = "RESQNET_SESSION";
    private static final long SESSION_MAX_AGE_SECONDS = 8 * 60 * 60;

    private AuthGuard() { }

    public static String sessionToken(HttpExchange exchange) {
        String cookieHeader = exchange.getRequestHeaders().getFirst("Cookie");
        if (cookieHeader == null) return null;
        for (String cookie : cookieHeader.split(";")) {
            String[] parts = cookie.trim().split("=", 2);
            if (parts.length == 2 && COOKIE_NAME.equals(parts[0])) return parts[1];
        }
        return null;
    }

    public static AuthAccount currentAccount(HttpExchange exchange, AuthManager auth) {
        return auth.getSession(sessionToken(exchange));
    }

    public static boolean requireAdmin(HttpExchange exchange, AuthManager auth) throws IOException {
        exchange.getResponseHeaders().set("Cache-Control", "no-store");
        AuthAccount account = currentAccount(exchange, auth);
        if (account == null) {
            JsonSerializer.sendError(exchange, 401, "Sign in is required");
            return false;
        }
        if (!account.isAdmin()) {
            JsonSerializer.sendError(exchange, 403, "Administrator access is required");
            return false;
        }
        return true;
    }

    public static void setSessionCookie(HttpExchange exchange, String token) {
        exchange.getResponseHeaders().set("Cache-Control", "no-store");
        exchange.getResponseHeaders().add("Set-Cookie", cookieValue(exchange, token, SESSION_MAX_AGE_SECONDS));
    }

    public static void clearSessionCookie(HttpExchange exchange) {
        exchange.getResponseHeaders().set("Cache-Control", "no-store");
        exchange.getResponseHeaders().add("Set-Cookie", cookieValue(exchange, "", 0));
    }

    private static String cookieValue(HttpExchange exchange, String token, long maxAge) {
        StringBuilder cookie = new StringBuilder(COOKIE_NAME).append('=').append(token)
                .append("; Path=/api; HttpOnly; SameSite=Strict; Max-Age=").append(maxAge);
        if (exchange instanceof HttpsExchange
                || Boolean.parseBoolean(System.getenv("RESQNET_SECURE_COOKIES"))) cookie.append("; Secure");
        return cookie.toString();
    }
}
