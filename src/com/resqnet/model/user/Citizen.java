package com.resqnet.model.user;

/** A member of the public who can report an emergency. */
public class Citizen extends User {
    public Citizen(String id, String name, String contact, String location) {
        super(id, name, contact, location);
    }
}
