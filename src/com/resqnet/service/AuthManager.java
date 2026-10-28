package com.resqnet.service;

import com.resqnet.model.user.AuthAccount;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.Base64;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.time.Instant;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;

/** SQLite-backed account registration and password verification. */
public class AuthManager {
    private static final String HEADER = "id,name,email,salt,passwordHash";
    private static final String MIGRATION_KEY = "legacy-auth-csv-v1";
    private static final int SALT_BYTES = 16;
    private static final int HASH_BITS = 256;
    private static final int ITERATIONS = 120_000;
    private static final SecureRandom RANDOM = new SecureRandom();

    private final Path databasePath;
    private final Path legacyAccountsFile;
    private final Map<String, StoredAccount> accounts = new LinkedHashMap<String, StoredAccount>();
    private final Set<String> adminEmails;
    private final Map<String, Session> sessions = new LinkedHashMap<String, Session>();

    public AuthManager(Path databasePath, Path legacyAccountsFile) throws IOException {
        this(databasePath, legacyAccountsFile, configuredAdminEmails());
    }

    public AuthManager(Path databasePath, Path legacyAccountsFile, Set<String> adminEmails) throws IOException {
        if (databasePath == null) throw new IllegalArgumentException("databasePath must not be null");
        if (legacyAccountsFile == null) {
            throw new IllegalArgumentException("legacyAccountsFile must not be null");
        }
        if (adminEmails == null) throw new IllegalArgumentException("adminEmails must not be null");
        this.databasePath = databasePath.toAbsolutePath().normalize();
        this.legacyAccountsFile = legacyAccountsFile;
        this.adminEmails = normalizeAdminEmails(adminEmails);
        Path parent = this.databasePath.getParent();
        if (parent != null) Files.createDirectories(parent);
        loadAccounts();
    }

    public synchronized AuthAccount register(String name, String email, char[] password)
            throws IOException, GeneralSecurityException, DuplicateAccountException,
            AdminAccountRegistrationException {
        String normalizedName = validateName(name);
        String normalizedEmail = validateEmail(email);
        validatePassword(password);
        if (adminEmails.contains(normalizedEmail)) throw new AdminAccountRegistrationException();
        if (accounts.containsKey(normalizedEmail)) throw new DuplicateAccountException();

        byte[] salt = new byte[SALT_BYTES];
        RANDOM.nextBytes(salt);
        StoredAccount account = new StoredAccount(UUID.randomUUID().toString(), normalizedName,
                normalizedEmail, salt, hashPassword(password, salt));
        persist(account);
        accounts.put(normalizedEmail, account);
        return toPublicAccount(account);
    }

    public synchronized AuthAccount authenticate(String email, char[] password)
            throws GeneralSecurityException {
        String normalizedEmail = validateEmail(email);
        validatePassword(password);
        StoredAccount account = accounts.get(normalizedEmail);
        if (account == null || !MessageDigest.isEqual(account.passwordHash, hashPassword(password, account.salt))) {
            return null;
        }
        return toPublicAccount(account);
    }

    public synchronized String createSession(AuthAccount account) {
        if (account == null) throw new IllegalArgumentException("account must not be null");
        byte[] tokenBytes = new byte[32];
        RANDOM.nextBytes(tokenBytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);
        sessions.put(token, new Session(account, Instant.now().plusSeconds(8 * 60 * 60)));
        return token;
    }

    public synchronized AuthAccount getSession(String token) {
        if (token == null || token.isEmpty()) return null;
        Session session = sessions.get(token);
        if (session == null) return null;
        if (!session.expiresAt.isAfter(Instant.now())) {
            sessions.remove(token);
            return null;
        }
        return session.account;
    }

    public synchronized void revokeSession(String token) {
        if (token != null) sessions.remove(token);
    }

    private AuthAccount toPublicAccount(StoredAccount account) {
        return new AuthAccount(account.id, account.name, account.email, adminEmails.contains(account.email));
    }

    private static Set<String> configuredAdminEmails() {
        String configured = System.getenv("RESQNET_ADMIN_EMAILS");
        Set<String> result = new LinkedHashSet<String>();
        if (configured == null || configured.trim().isEmpty()) {
            result.add(validateEmail("admin@resqnet.org"));
            result.add(validateEmail("jeslin@gmail.com"));
            return result;
        }
        for (String email : configured.split(",")) {
            if (!email.trim().isEmpty()) result.add(validateEmail(email));
        }
        return result;
    }

    private static Set<String> normalizeAdminEmails(Set<String> emails) {
        Set<String> result = new LinkedHashSet<String>();
        for (String email : emails) result.add(validateEmail(email));
        return result;
    }

    private void loadAccounts() throws IOException {
        try (Connection connection = connect(); Statement statement = connection.createStatement()) {
            statement.execute("CREATE TABLE IF NOT EXISTS auth_users ("
                    + "id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, "
                    + "salt TEXT NOT NULL, password_hash TEXT NOT NULL)");
            statement.execute("CREATE TABLE IF NOT EXISTS schema_migrations ("
                    + "migration_key TEXT PRIMARY KEY, applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)");
            if (!migrationApplied(connection)) migrateLegacyAccounts(connection);

            try (Statement query = connection.createStatement();
                 ResultSet rows = query.executeQuery(
                         "SELECT id, name, email, salt, password_hash FROM auth_users ORDER BY email")) {
                while (rows.next()) {
                    StoredAccount account = new StoredAccount(rows.getString("id"), rows.getString("name"),
                            rows.getString("email"), rows.getString("salt"), rows.getString("password_hash"));
                    if (account.salt.length != SALT_BYTES || account.passwordHash.length != HASH_BITS / 8
                            || accounts.putIfAbsent(account.email, account) != null) {
                        throw new IOException("SQLite contains malformed or duplicate account data");
                    }
                }
            }
        } catch (SQLException | IllegalArgumentException exception) {
            throw new IOException("Unable to load account records from SQLite: " + exception.getMessage(),
                    exception);
        }
    }

    private void migrateLegacyAccounts(Connection connection) throws IOException, SQLException {
        connection.setAutoCommit(false);
        try {
            if (accountCount(connection) == 0 && Files.exists(legacyAccountsFile)) {
                importLegacyAccounts(connection);
            }
            try (PreparedStatement marker = connection.prepareStatement(
                    "INSERT INTO schema_migrations (migration_key) VALUES (?)")) {
                marker.setString(1, MIGRATION_KEY);
                marker.executeUpdate();
            }
            connection.commit();
        } catch (IOException | SQLException | RuntimeException exception) {
            try {
                connection.rollback();
            } catch (SQLException rollbackFailure) {
                exception.addSuppressed(rollbackFailure);
            }
            if (exception instanceof IOException) throw (IOException) exception;
            throw exception;
        } finally {
            connection.setAutoCommit(true);
        }
    }

    private void importLegacyAccounts(Connection connection) throws IOException, SQLException {
        List<String> lines = Files.readAllLines(legacyAccountsFile, StandardCharsets.UTF_8);
        if (lines.isEmpty() || !HEADER.equals(lines.get(0))) {
            throw new IOException(legacyAccountsFile + ": missing or unsupported account file header");
        }
        Set<String> importedEmails = new HashSet<String>();
        try (PreparedStatement insert = connection.prepareStatement(
                "INSERT INTO auth_users (id, name, email, salt, password_hash) VALUES (?, ?, ?, ?, ?)")) {
            for (int line = 1; line < lines.size(); line++) {
                if (lines.get(line).trim().isEmpty()) continue;
                String[] fields = lines.get(line).split(",", -1);
                if (fields.length != 5) throw malformed(line + 1);
                try {
                    StoredAccount account = new StoredAccount(decode(fields[0]), decode(fields[1]),
                            decode(fields[2]), fields[3], fields[4]);
                    if (account.salt.length != SALT_BYTES || account.passwordHash.length != HASH_BITS / 8
                            || !importedEmails.add(account.email)) {
                        throw malformed(line + 1);
                    }
                    insert.setString(1, account.id);
                    insert.setString(2, account.name);
                    insert.setString(3, account.email);
                    insert.setString(4, fields[3]);
                    insert.setString(5, fields[4]);
                    insert.executeUpdate();
                } catch (IllegalArgumentException | SQLException exception) {
                    throw new IOException(legacyAccountsFile + ":" + (line + 1)
                            + ": invalid or duplicate account data", exception);
                }
            }
        }
    }

    private void persist(StoredAccount account) throws IOException, DuplicateAccountException {
        try (Connection connection = connect();
             PreparedStatement statement = connection.prepareStatement(
                     "INSERT INTO auth_users (id, name, email, salt, password_hash) VALUES (?, ?, ?, ?, ?)")) {
            statement.setString(1, account.id);
            statement.setString(2, account.name);
            statement.setString(3, account.email);
            statement.setString(4, encode(account.salt));
            statement.setString(5, encode(account.passwordHash));
            statement.executeUpdate();
        } catch (SQLException exception) {
            if (exception.getErrorCode() == 19) throw new DuplicateAccountException();
            throw new IOException("Unable to persist account data to SQLite: " + exception.getMessage(),
                    exception);
        }
    }

    private boolean migrationApplied(Connection connection) throws SQLException {
        try (PreparedStatement statement = connection.prepareStatement(
                "SELECT 1 FROM schema_migrations WHERE migration_key = ?")) {
            statement.setString(1, MIGRATION_KEY);
            try (ResultSet result = statement.executeQuery()) {
                return result.next();
            }
        }
    }

    private static int accountCount(Connection connection) throws SQLException {
        try (Statement statement = connection.createStatement();
             ResultSet result = statement.executeQuery("SELECT COUNT(*) FROM auth_users")) {
            return result.next() ? result.getInt(1) : 0;
        }
    }

    private Connection connect() throws SQLException {
        Connection connection = DriverManager.getConnection("jdbc:sqlite:" + databasePath);
        try (Statement statement = connection.createStatement()) {
            statement.execute("PRAGMA busy_timeout = 5000");
            statement.execute("PRAGMA foreign_keys = ON");
        } catch (SQLException exception) {
            connection.close();
            throw exception;
        }
        return connection;
    }

    private IOException malformed(int line) {
        return new IOException(legacyAccountsFile + ":" + line + ": malformed or duplicate account");
    }

    private static byte[] hashPassword(char[] password, byte[] salt) throws GeneralSecurityException {
        PBEKeySpec specification = new PBEKeySpec(password, salt, ITERATIONS, HASH_BITS);
        try {
            return SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256").generateSecret(specification).getEncoded();
        } finally {
            specification.clearPassword();
        }
    }

    private static String validateName(String name) {
        if (name == null || name.trim().isEmpty() || name.trim().length() > 100) {
            throw new IllegalArgumentException("name must contain 1 to 100 characters");
        }
        return name.trim();
    }

    private static String validateEmail(String email) {
        String normalized = normalizeEmail(email);
        if (normalized.length() > 254 || !normalized.matches("[^\\s@]+@[^\\s@]+\\.[^\\s@]+")) {
            throw new IllegalArgumentException("email must be a valid email address");
        }
        return normalized;
    }

    private static String normalizeEmail(String email) {
        if (email == null || email.trim().isEmpty()) throw new IllegalArgumentException("email is required");
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private static void validatePassword(char[] password) {
        if (password == null || password.length < 8 || password.length > 128) {
            throw new IllegalArgumentException("password must contain 8 to 128 characters");
        }
    }

    private static String encode(byte[] value) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(value);
    }

    private static String decode(String value) {
        return new String(Base64.getUrlDecoder().decode(value), StandardCharsets.UTF_8);
    }

    public static final class DuplicateAccountException extends Exception {
        private static final long serialVersionUID = 1L;
    }

    public static final class AdminAccountRegistrationException extends Exception {
        private static final long serialVersionUID = 1L;
    }

    private static final class Session {
        private final AuthAccount account;
        private final Instant expiresAt;

        private Session(AuthAccount account, Instant expiresAt) {
            this.account = account;
            this.expiresAt = expiresAt;
        }
    }

    private static final class StoredAccount {
        private final String id;
        private final String name;
        private final String email;
        private final byte[] salt;
        private final byte[] passwordHash;

        private StoredAccount(String id, String name, String email, byte[] salt, byte[] passwordHash) {
            this.id = id;
            this.name = name;
            this.email = email;
            this.salt = salt;
            this.passwordHash = passwordHash;
        }

        private StoredAccount(String id, String name, String email, String salt, String passwordHash) {
            this(id, name, email, Base64.getUrlDecoder().decode(salt),
                    Base64.getUrlDecoder().decode(passwordHash));
        }

    }
}
