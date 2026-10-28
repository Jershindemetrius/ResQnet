package com.resqnet.service;

import com.resqnet.exception.ResourceNotFoundException;
import com.resqnet.model.emergency.EmergencyRequest;
import com.resqnet.model.enums.RequestStatus;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.PriorityQueue;

/** Priority queue for pending dispatch and a hash index for all requests. */
public class EmergencyManager {
    private final PriorityQueue<EmergencyRequest> pending = new PriorityQueue<EmergencyRequest>();
    private final Map<String, EmergencyRequest> emergencies = new HashMap<String, EmergencyRequest>();

    public synchronized void addEmergency(EmergencyRequest emergency) {
        if (emergency == null) throw new IllegalArgumentException("emergency must not be null");
        if (emergencies.putIfAbsent(emergency.getId(), emergency) != null) {
            throw new IllegalArgumentException("Emergency already exists: " + emergency.getId());
        }
        if (emergency.getStatus() == RequestStatus.PENDING) pending.add(emergency);
    }

    public synchronized void addOrUpdateEmergency(EmergencyRequest emergency) {
        if (emergency == null) throw new IllegalArgumentException("emergency must not be null");
        EmergencyRequest previous = emergencies.get(emergency.getId());
        if (previous != null) pending.remove(previous);
        emergencies.put(emergency.getId(), emergency);
        if (emergency.getStatus() == RequestStatus.PENDING) pending.add(emergency);
    }

    public synchronized EmergencyRequest getEmergency(String id) throws ResourceNotFoundException {
        EmergencyRequest request = emergencies.get(id);
        if (request == null) throw new ResourceNotFoundException("Emergency not found: " + id);
        return request;
    }

    public synchronized List<EmergencyRequest> getPriorityOrderedEmergencies() {
        List<EmergencyRequest> result = new ArrayList<EmergencyRequest>(emergencies.values());
        Collections.sort(result);
        return result;
    }

    public synchronized List<EmergencyRequest> getAllEmergencies() {
        List<EmergencyRequest> result = new ArrayList<EmergencyRequest>(emergencies.values());
        Collections.sort(result, Comparator.comparing(EmergencyRequest::getId));
        return result;
    }

    public synchronized EmergencyRequest pollNextPending() {
        EmergencyRequest request;
        do {
            request = pending.poll();
        } while (request != null && request.getStatus() != RequestStatus.PENDING);
        return request;
    }

    public synchronized int countByStatus(RequestStatus status) {
        int count = 0;
        for (EmergencyRequest request : emergencies.values()) {
            if (request.getStatus() == status) count++;
        }
        return count;
    }

    public synchronized void refreshQueue() { rebuildQueue(); }

    private void rebuildQueue() {
        pending.clear();
        for (EmergencyRequest request : emergencies.values()) {
            if (request.getStatus() == RequestStatus.PENDING) pending.add(request);
        }
    }
}
