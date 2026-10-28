package com.resqnet;

import com.resqnet.api.AdminOperationsHandler;
import com.resqnet.api.AuthHandler;
import com.resqnet.api.CorsFilter;
import com.resqnet.api.ResourceHandler;
import com.resqnet.service.AuthManager;
import com.resqnet.service.EmergencyManager;
import com.resqnet.service.ResourceManager;
import com.resqnet.service.UserManager;
import com.resqnet.storage.SQLiteStorageManager;
import com.sun.net.httpserver.HttpServer;
import java.net.CookieManager;
import java.net.CookiePolicy;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Set;

public final class AdminAuthorizationSmoke {
    private static final String ADMIN_EMAIL = "admin@example.org";
    private static final String ADMIN_PASSWORD = "admin-pass-123";
    private static final String USER_EMAIL = "user@example.org";
    private static final String USER_PASSWORD = "user-pass-123";
    private static final String ALLOWED_ORIGIN = "http://localhost:5173";

    private AdminAuthorizationSmoke() { }

    public static void main(String[] args) throws Exception {
        Path directory = Files.createTempDirectory("resqnet-admin-auth-");
        Path database = directory.resolve("auth.db");
        HttpServer server = null;
        try {
            AuthManager bootstrap = new AuthManager(database, directory.resolve("auth_users.csv"), Set.of());
            bootstrap.register("Admin", ADMIN_EMAIL, ADMIN_PASSWORD.toCharArray());

            AuthManager auth = new AuthManager(database, directory.resolve("auth_users.csv"), Set.of(ADMIN_EMAIL));
            auth.register("User", USER_EMAIL, USER_PASSWORD.toCharArray());
            ResourceManager resources = new ResourceManager();
            SQLiteStorageManager storage = new SQLiteStorageManager(database, directory);
            server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
            server.createContext("/api/auth",
                    new CorsFilter(new AuthHandler(auth), Set.of(ALLOWED_ORIGIN)));
            server.createContext("/api/admin",
                    new CorsFilter(new AdminOperationsHandler(auth, new EmergencyManager(),
                            resources, new UserManager()), Set.of(ALLOWED_ORIGIN)));
            server.createContext("/api/resources",
                    new CorsFilter(new ResourceHandler(resources, storage, auth), Set.of(ALLOWED_ORIGIN)));
            server.start();

            URI api = URI.create("http://127.0.0.1:" + server.getAddress().getPort() + "/api/");
            CookieManager anonymousCookies = cookies();
            HttpClient anonymous = client(anonymousCookies);
            assertStatus(send(anonymous, api.resolve("admin/dashboard"), "GET", null, null), 401,
                    "admin dashboard must reject anonymous requests");
            String resource = "{\"name\":\"Response unit\",\"type\":\"AMBULANCE\","
                    + "\"location\":\"Kovilpatti\",\"quantity\":1}";
            assertStatus(send(anonymous, api.resolve("resources"), "POST", resource, null), 401,
                    "resource writes must reject anonymous requests");

            CookieManager userCookies = cookies();
            HttpClient user = client(userCookies);
            HttpResponse<String> userLogin = send(user, api.resolve("auth/login"), "POST",
                    credentials(USER_EMAIL, USER_PASSWORD), null);
            assertStatus(userLogin, 200, "regular user login");
            if (!userLogin.body().contains("\"role\":\"USER\"")) {
                throw new AssertionError("Regular login did not receive the USER role");
            }
            assertStatus(send(user, api.resolve("admin/dashboard"), "GET", null, null), 403,
                    "admin dashboard must reject regular users");
            assertStatus(send(user, api.resolve("resources"), "POST", resource, null), 403,
                    "resource writes must reject regular users");

            CookieManager adminCookies = cookies();
            HttpClient admin = client(adminCookies);
            HttpResponse<String> adminLogin = send(admin, api.resolve("auth/login"), "POST",
                    credentials(ADMIN_EMAIL, ADMIN_PASSWORD), null);
            assertStatus(adminLogin, 200, "administrator login");
            if (!adminLogin.body().contains("\"role\":\"ADMIN\"")) {
                throw new AssertionError("Allowlisted login did not receive the ADMIN role");
            }
            HttpResponse<String> dashboard = send(admin, api.resolve("admin/dashboard"), "GET", null, null);
            assertStatus(dashboard, 200, "administrator dashboard");
            if (!"no-store".equals(dashboard.headers().firstValue("Cache-Control").orElse(""))) {
                throw new AssertionError("Administrator response must not be cached");
            }
            assertStatus(send(admin, api.resolve("resources"), "POST", resource, null), 201,
                    "administrator resource creation");

            HttpResponse<String> blockedOrigin = send(admin, api.resolve("admin/dashboard"), "GET",
                    null, "https://untrusted.example");
            assertStatus(blockedOrigin, 403, "untrusted browser origin");

            HttpResponse<String> blockedSignup = send(anonymous, api.resolve("auth/signup"), "POST",
                    "{\"name\":\"Impostor\",\"email\":\"" + ADMIN_EMAIL
                            + "\",\"password\":\"" + ADMIN_PASSWORD + "\"}", null);
            assertStatus(blockedSignup, 403, "public signup for an allowlisted address");

            assertStatus(send(admin, api.resolve("auth/logout"), "POST", "{}", null), 200,
                    "administrator logout");
            assertStatus(send(admin, api.resolve("admin/dashboard"), "GET", null, null), 401,
                    "revoked administrator session");
        } finally {
            if (server != null) server.stop(0);
            Files.deleteIfExists(database);
            Files.deleteIfExists(directory.resolve("auth_users.csv"));
            Files.deleteIfExists(directory);
        }
        System.out.println("Admin authorization smoke test passed.");
    }

    private static CookieManager cookies() {
        return new CookieManager(null, CookiePolicy.ACCEPT_ALL);
    }

    private static HttpClient client(CookieManager cookies) {
        return HttpClient.newBuilder().cookieHandler(cookies).build();
    }

    private static String credentials(String email, String password) {
        return "{\"email\":\"" + email + "\",\"password\":\"" + password + "\"}";
    }

    private static HttpResponse<String> send(HttpClient client, URI uri, String method,
            String body, String origin) throws Exception {
        HttpRequest.Builder request = HttpRequest.newBuilder(uri);
        if (origin != null) request.header("Origin", origin);
        if (body == null) {
            request.method(method, HttpRequest.BodyPublishers.noBody());
        } else {
            request.header("Content-Type", "application/json")
                    .method(method, HttpRequest.BodyPublishers.ofString(body));
        }
        return client.send(request.build(), HttpResponse.BodyHandlers.ofString());
    }

    private static void assertStatus(HttpResponse<String> response, int expected, String description) {
        if (response.statusCode() != expected) {
            throw new AssertionError(description + ": expected " + expected + " but got "
                    + response.statusCode() + " (" + response.body() + ")");
        }
    }
}
