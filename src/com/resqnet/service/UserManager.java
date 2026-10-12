package com.resqnet.service;

import com.resqnet.exception.ResourceNotFoundException;
import com.resqnet.model.user.User;
import com.resqnet.model.user.Volunteer;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/** In-memory user index. Mutations are synchronized for HTTP worker threads. */
public class UserManager {
    private final Map<String, User> users = new HashMap<String, User>();

    public synchronized void addUser(User user) {
        if (user == null) throw new IllegalArgumentException("user must not be null");
        if (users.putIfAbsent(user.getId(), user) != null) {
            throw new IllegalArgumentException("User already exists: " + user.getId());
        }
    }

    public synchronized void addOrUpdateUser(User user) {
        if (user == null) throw new IllegalArgumentException("user must not be null");
        users.put(user.getId(), user);
    }

    public synchronized User getUser(String id) throws ResourceNotFoundException {
        User user = users.get(id);
        if (user == null) throw new ResourceNotFoundException("User not found: " + id);
        return user;
    }

    public synchronized Volunteer getVolunteer(String id) throws ResourceNotFoundException {
        User user = getUser(id);
        if (!(user instanceof Volunteer)) {
            throw new ResourceNotFoundException("Volunteer not found: " + id);
        }
        return (Volunteer) user;
    }

    public synchronized List<User> getAllUsers() {
        return Collections.unmodifiableList(new ArrayList<User>(users.values()));
    }

    public synchronized List<Volunteer> getVolunteers() {
        List<Volunteer> result = new ArrayList<Volunteer>();
        for (User user : users.values()) {
            if (user instanceof Volunteer) result.add((Volunteer) user);
        }
        return Collections.unmodifiableList(result);
    }
}
