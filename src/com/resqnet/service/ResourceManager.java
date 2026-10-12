package com.resqnet.service;

import com.resqnet.exception.ResourceNotFoundException;
import com.resqnet.model.enums.ResourceType;
import com.resqnet.model.resource.MedicalResource;
import com.resqnet.model.resource.Resource;
import com.resqnet.model.resource.Shelter;
import com.resqnet.model.resource.Vehicle;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/** Fast ID lookup and typed lists of available inventory. */
public class ResourceManager {
    private final Map<String, Resource> resources = new HashMap<String, Resource>();
    private final List<MedicalResource> medicalResources = new ArrayList<MedicalResource>();
    private final List<Vehicle> vehicles = new ArrayList<Vehicle>();
    private final List<Shelter> shelters = new ArrayList<Shelter>();

    public synchronized void addResource(Resource resource) {
        if (resource == null) throw new IllegalArgumentException("resource must not be null");
        if (resources.putIfAbsent(resource.getId(), resource) != null) {
            throw new IllegalArgumentException("Resource already exists: " + resource.getId());
        }
        categorize(resource);
    }

    public synchronized void addOrUpdateResource(Resource resource) {
        if (resource == null) throw new IllegalArgumentException("resource must not be null");
        Resource old = resources.put(resource.getId(), resource);
        if (old != null) removeFromCategories(old);
        categorize(resource);
    }

    private void categorize(Resource resource) {
        if (resource instanceof MedicalResource) medicalResources.add((MedicalResource) resource);
        if (resource instanceof Vehicle) vehicles.add((Vehicle) resource);
        if (resource instanceof Shelter) shelters.add((Shelter) resource);
    }

    private void removeFromCategories(Resource resource) {
        medicalResources.remove(resource);
        vehicles.remove(resource);
        shelters.remove(resource);
    }

    public synchronized Resource getResource(String id) throws ResourceNotFoundException {
        Resource resource = resources.get(id);
        if (resource == null) throw new ResourceNotFoundException("Resource not found: " + id);
        return resource;
    }

    public synchronized List<Resource> getAllResources() {
        return Collections.unmodifiableList(new ArrayList<Resource>(resources.values()));
    }

    public synchronized List<Resource> getAvailableResources(ResourceType type) {
        List<Resource> result = new ArrayList<Resource>();
        for (Resource resource : resources.values()) {
            if (resource.isAvailable() && (type == null || resource.getType() == type)) result.add(resource);
        }
        return result;
    }

    public synchronized List<MedicalResource> getMedicalResources() {
        return Collections.unmodifiableList(new ArrayList<MedicalResource>(medicalResources));
    }
    public synchronized List<Vehicle> getVehicles() {
        return Collections.unmodifiableList(new ArrayList<Vehicle>(vehicles));
    }
    public synchronized List<Shelter> getShelters() {
        return Collections.unmodifiableList(new ArrayList<Shelter>(shelters));
    }
}
