package com.resqnet.model.user;

/** Shared identity and contact details for all system users. */
public abstract class User {
    private final String id;
    private String name;
    private String contact;
    private String location;

    protected User(String id, String name, String contact, String location) {
        this.id = required(id, "id");
        setName(name);
        setContact(contact);
        setLocation(location);
    }

    private static String required(String value, String field) {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException(field + " must not be blank");
        }
        return value.trim();
    }

    public String getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = required(name, "name"); }
    public String getContact() { return contact; }
    public void setContact(String contact) { this.contact = required(contact, "contact"); }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = required(location, "location"); }
}
