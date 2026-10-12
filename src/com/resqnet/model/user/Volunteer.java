package com.resqnet.model.user;

import com.resqnet.model.resource.Assignable;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/** Volunteer who can be assigned to one emergency at a time. */
public class Volunteer extends User implements Assignable {
    public enum Status { AVAILABLE, BUSY }

    private final List<String> skillSet = new ArrayList<String>();
    private Status status;
    private String assignedEmergencyId;

    public Volunteer(String id, String name, String contact, String location,
                     List<String> skills, Status status, String assignedEmergencyId) {
        super(id, name, contact, location);
        setSkillSet(skills);
        this.status = status == null ? Status.AVAILABLE : status;
        this.assignedEmergencyId = assignedEmergencyId;
    }

    public Volunteer(String id, String name, String contact, String location, List<String> skills) {
        this(id, name, contact, location, skills, Status.AVAILABLE, null);
    }

    public List<String> getSkillSet() {
        return Collections.unmodifiableList(skillSet);
    }

    public void setSkillSet(List<String> skills) {
        skillSet.clear();
        if (skills != null) {
            for (String skill : skills) {
                if (skill != null && !skill.trim().isEmpty()) {
                    skillSet.add(skill.trim());
                }
            }
        }
    }

    public synchronized Status getStatus() { return status; }
    public synchronized String getAssignedEmergencyId() { return assignedEmergencyId; }

    public synchronized void setStatus(Status status) {
        if (status == null) {
            throw new IllegalArgumentException("status must not be null");
        }
        this.status = status;
        if (status == Status.AVAILABLE) {
            assignedEmergencyId = null;
        }
    }

    public synchronized void setAssignedEmergencyId(String emergencyId) {
        assignedEmergencyId = emergencyId;
        status = emergencyId == null || emergencyId.trim().isEmpty() ? Status.AVAILABLE : Status.BUSY;
    }

    @Override
    public synchronized boolean isAvailable() { return status == Status.AVAILABLE; }

    @Override
    public synchronized void assign() {
        if (!isAvailable()) {
            throw new IllegalStateException("Volunteer " + getId() + " is already assigned");
        }
        status = Status.BUSY;
    }

    public synchronized void assign(String emergencyId) {
        assign();
        setAssignedEmergencyId(emergencyId);
    }

    @Override
    public synchronized void release() {
        status = Status.AVAILABLE;
        assignedEmergencyId = null;
    }
}
