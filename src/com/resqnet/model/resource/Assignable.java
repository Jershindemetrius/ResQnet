package com.resqnet.model.resource;

/** A person or inventory item that can be assigned to an emergency. */
public interface Assignable {
    boolean isAvailable();
    void assign();
    void release();
    String getLocation();
}
