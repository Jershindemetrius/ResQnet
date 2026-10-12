package com.resqnet.model.resource;

import com.resqnet.model.enums.ResourceType;

/** Temporary shelter capacity available for dispatch. */
public class Shelter extends Resource {
    public Shelter(String id, String name, String location, int quantity,
                   boolean available, String provider) {
        super(id, name, ResourceType.SHELTER, location, quantity, available, provider);
    }

    public Shelter(String id, String name, String location, int quantity) {
        this(id, name, location, quantity, quantity > 0, "");
    }
}
