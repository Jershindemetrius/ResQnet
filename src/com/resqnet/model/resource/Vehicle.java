package com.resqnet.model.resource;

import com.resqnet.model.enums.ResourceType;

/** A transport or rescue vehicle. */
public class Vehicle extends Resource {
    public Vehicle(String id, String name, String location, int quantity,
                   boolean available, String provider) {
        super(id, name, ResourceType.VEHICLE, location, quantity, available, provider);
    }

    public Vehicle(String id, String name, String location, int quantity) {
        this(id, name, location, quantity, quantity > 0, "");
    }
}
