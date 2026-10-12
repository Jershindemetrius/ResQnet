package com.resqnet.model.resource;

import com.resqnet.model.enums.ResourceType;

/** Medical supplies such as kits, medicine, and ambulances. */
public class MedicalResource extends Resource {
    public MedicalResource(String id, String name, ResourceType type, String location,
                           int quantity, boolean available, String provider) {
        super(id, name, type, location, quantity, available, provider);
    }

    public MedicalResource(String id, String name, ResourceType type, String location, int quantity) {
        this(id, name, type, location, quantity, quantity > 0, "");
    }
}
