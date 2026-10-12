package com.resqnet.service;

import com.resqnet.model.user.AuthAccount;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.AtomicMoveNotSupportedException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.nio.file.StandardOpenOption;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;

/** File-backed account registration and password verification. */
public class AuthManager {
    private static final String HEADER = "id,name,email,salt,passwordHash";
    private static final int SALT_BYTES = 16;
    private static final int HASH_BITS = 256;
    private static final int ITERATIONS = 120_000;
    private static final SecureRandom RANDOM = new SecureRandom();

    private final Path accountsFile;
    private final Map<String, StoredAccount> accounts = new LinkedHashMap<String, StoredAccount>();

    public AuthManager(Path accountsFile) throws IOException {
        if (accountsFile == null) throw new IllegalArgumentException("accountsFile must not be null");
        this.accountsFile = accountsFile;
        loadAccounts();
    }

    public synchronized AuthAccount register(String name, String email, char[] password)
            throws IOException, GeneralSecurityException, DuplicateAccountException {
        String normalizedName = validateName(name);
        String normalizedEmail = validateEmail(email);
        validatePassword(password);
        if (accounts.containsKey(normalizedEmail)) throw new DuplicateAccountException();

        byte[] salt = new byte[SALT_BYTES];
        RANDOM.nextBytes(salt);
        StoredAccount account = new StoredAccount(UUID.randomUUID().toString(), normalizedName,
                normalizedEmail, salt, hashPassword(password, salt));

        List<StoredAccount> updatedAccounts = new ArrayList<StoredAccount>(accounts.values());
        updatedAccounts.add(account);
        persist(updatedAccounts);
        accounts.put(normalizedEmail, account);
        return account.toPublicAccount();
    }

    public synchronized AuthAccount authenticate(String email, char[] password)
            throws GeneralSecurityException {
        String normalizedEmail = validateEmail(email);
        validatePassword(password);
        StoredAccount account = accounts.get(normalizedEmail);
        if (account == null || !MessageDigest.isEqual(account.passwordHash, hashPassword(password, account.salt))) {
            return null;
        }
        return account.toPublicAccount();
    }

    private void loadAccounts() throws IOException {
        Files.createDirectories(accountsFile.toAbsolutePath().getParent());
        if (!Files.exists(accountsFile)) {
            Files.write(accountsFile, java.util.Collections.singletonList(HEADER), StandardCharsets.UTF_8,
                    StandardOpenOption.CREATE_NEW, StandardOpenOption.WRITE);
            return;
        }

        List<String> lines = Files.readAllLines(accountsFile, StandardCharsets.UTF_8);
        if (lines.isEmpty() || !HEADER.equals(lines.get(0))) {
            throw new IOException(accountsFile + ": missing or unsupported account file header");
        }
        for (int line = 1; line < lines.size(); line++) {
            if (lines.get(line).trim().isEmpty()) continue;
            String[] fields = lines.get(line).split(",", -1);
            if (fields.length != 5) throw malformed(line + 1);
            try {
                StoredAccount account = new StoredAccount(decode(fields[0]), decode(fields[1]),
                        decode(fields[2]), decode(fields[3]), decode(fields[4]));
                if (account.salt.length != SALT_BYTES || account.passwordHash.length != HASH_BITS / 8
                        || accounts.putIfAbsent(account.email, account) != null) {
                    throw malformed(line + 1);
                }
            } catch (IllegalArgumentException exception) {
                throw new IOException(accountsFile + ":" + (line + 1) + ": invalid account data", exception);
            }
        }
    }

    private void persist(List<StoredAccount> values) throws IOException {
        List<String> lines = new ArrayList<String>();
        lines.add(HEADER);
        for (StoredAccount account : values) {
            lines.add(encode(account.id) + "," + encode(account.name) + "," + encode(account.email) + ","
                    + encode(account.salt) + "," + encode(account.passwordHash));
        }
        Path parent = accountsFile.toAbsolutePath().getParent();
        Path temporary = Files.createTempFile(parent, "auth-users", ".tmp");
        try {
            Files.write(temporary, lines, StandardCharsets.UTF_8,
                    StandardOpenOption.TRUNCATE_EXISTING, StandardOpenOption.WRITE);
            try {
                Files.move(temporary, accountsFile, StandardCopyOption.REPLACE_EXISTING,
                        StandardCopyOption.ATOMIC_MOVE);
            } catch (AtomicMoveNotSupportedException exception) {
                Files.move(temporary, accountsFile, StandardCopyOption.REPLACE_EXISTING);
            }
        } finally {
            Files.deleteIfExists(temporary);
        }
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

    private static String encode(String value) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(value.getBytes(StandardCharsets.UTF_8));
    }

    private static String encode(byte[] value) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(value);
    }

    private static String decode(String value) {
        return new String(Base64.getUrlDecoder().decode(value), StandardCharsets.UTF_8);
    }

    private static byte[] decodeBytes(String value) {
        return Base64.getUrlDecoder().decode(value);
    }

    private IOException malformed(int line) {
        return new IOException(accountsFile + ":" + line + ": malformed or duplicate account");
    }

    public static final class DuplicateAccountException extends Exception {
        private static final long serialVersionUID = 1L;
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
            this(id, name, email, decodeBytes(salt), decodeBytes(passwordHash));
        }

        private AuthAccount toPublicAccount() {
            return new AuthAccount(id, name, email);
        }
    }
}
