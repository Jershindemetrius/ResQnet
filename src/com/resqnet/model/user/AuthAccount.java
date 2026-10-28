package com.resqnet.model.user;

/** Public account details returned by the authentication API. */
public final class AuthAccount {
    private final String id;
    private final String name;
    private final String email;
    private final boolean admin;

    public AuthAccount(String id, String name, String email) {
        this(id, name, email, false);
    }

    public AuthAccount(String id, String name, String email, boolean admin) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.admin = admin;
    }

    public String getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public boolean isAdmin() { return admin; }
}
