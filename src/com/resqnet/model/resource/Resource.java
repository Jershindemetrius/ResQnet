package com.resqnet.model.resource;

import com.resqnet.model.enums.ResourceType;

/** Base class for dispatchable equipment and facilities. */
public abstract class Resource implements Assignable {
    private final String id;
    private String name;
    private ResourceType type;
    private String location;
    private int quantity;
    private boolean available;
    private String provider;

    protected Resource(String id, String name, ResourceType type, String location,
                       int quantity, boolean available, String provider) {
        this.id = required(id, "id");
        setName(name);
        setType(type);
        setLocation(location);
        setQuantity(quantity);
        this.available = available && quantity > 0;
        this.provider = provider == null ? "" : provider.trim();
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
    public ResourceType getType() { return type; }
    public void setType(ResourceType type) {
        if (type == null) throw new IllegalArgumentException("type must not be null");
        this.type = type;
    }
    @Override
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = required(location, "location"); }
    public synchronized int getQuantity() { return quantity; }
    public synchronized void setQuantity(int quantity) {
        if (quantity < 0) throw new IllegalArgumentException("quantity cannot be negative");
        this.quantity = quantity;
        available = quantity > 0;
    }
    @Override
    public synchronized boolean isAvailable() { return available && quantity > 0; }
    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider == null ? "" : provider.trim(); }

    public synchronized void setAvailable(boolean available) {
        this.available = available && quantity > 0;
    }

    @Override
    public synchronized void assign() {
        if (!isAvailable()) throw new IllegalStateException("Resource " + id + " is not available");
        quantity--;
        available = quantity > 0;
    }

    @Override
    public synchronized void release() {
        quantity++;
        available = true;
    }
}
