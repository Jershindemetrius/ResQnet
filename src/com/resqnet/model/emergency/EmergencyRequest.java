package com.resqnet.model.emergency;

import com.resqnet.exception.InvalidEmergencyRequestException;
import com.resqnet.model.enums.EmergencyType;
import com.resqnet.model.enums.PriorityLevel;
import com.resqnet.model.enums.RequestStatus;
import com.resqnet.model.enums.ResourceType;
import java.time.LocalDateTime;

/** Validated emergency report, ordered by priority for dispatch. */
public class EmergencyRequest implements Comparable<EmergencyRequest> {
    private final String id;
    private String reporterName;
    private String contact;
    private EmergencyType type;
    private String location;
    private int affectedPeopleCount;
    private String description;
    private PriorityLevel priority;
    private ResourceType requiredResourceType;
    private RequestStatus status;
    private String assignedResourceId;
    private String assignedVolunteerId;
    private LocalDateTime resolvedAt;

    public EmergencyRequest(String id, String reporterName, String contact, EmergencyType type,
            String location, int affectedPeopleCount, String description, PriorityLevel priority,
            ResourceType requiredResourceType) throws InvalidEmergencyRequestException {
        this(id, reporterName, contact, type, location, affectedPeopleCount, description, priority,
                requiredResourceType, RequestStatus.PENDING, null, null);
    }

    public EmergencyRequest(String id, String reporterName, String contact, EmergencyType type,
            String location, int affectedPeopleCount, String description, PriorityLevel priority,
            ResourceType requiredResourceType, RequestStatus status, String resourceId, String volunteerId)
            throws InvalidEmergencyRequestException {
        this(id, reporterName, contact, type, location, affectedPeopleCount, description, priority,
                requiredResourceType, status, resourceId, volunteerId, null);
    }

    public EmergencyRequest(String id, String reporterName, String contact, EmergencyType type,
            String location, int affectedPeopleCount, String description, PriorityLevel priority,
            ResourceType requiredResourceType, RequestStatus status, String resourceId, String volunteerId,
            LocalDateTime resolvedAt) throws InvalidEmergencyRequestException {
        if (blank(id) || blank(reporterName) || blank(contact) || type == null || blank(location)
                || affectedPeopleCount <= 0 || priority == null || requiredResourceType == null) {
            throw new InvalidEmergencyRequestException("Emergency requires an ID, reporter, contact, type, "
                    + "location, positive affected-people count, priority, and required resource type");
        }
        this.id = id.trim();
        this.reporterName = reporterName.trim();
        this.contact = contact.trim();
        this.type = type;
        this.location = location.trim();
        this.affectedPeopleCount = affectedPeopleCount;
        this.description = description == null ? "" : description.trim();
        this.priority = priority;
        this.requiredResourceType = requiredResourceType;
        this.status = status == null ? RequestStatus.PENDING : status;
        this.assignedResourceId = resourceId;
        this.assignedVolunteerId = volunteerId;
        this.resolvedAt = resolvedAt;
    }

    private static boolean blank(String value) { return value == null || value.trim().isEmpty(); }
    public String getId() { return id; }
    public String getReporterName() { return reporterName; }
    public void setReporterName(String value) { reporterName = nonBlank(value, "reporterName"); }
    public String getContact() { return contact; }
    public void setContact(String value) { contact = nonBlank(value, "contact"); }
    public EmergencyType getType() { return type; }
    public void setType(EmergencyType value) {
        if (value == null) throw new IllegalArgumentException("type must not be null");
        type = value;
    }
    public String getLocation() { return location; }
    public void setLocation(String value) { location = nonBlank(value, "location"); }
    public int getAffectedPeopleCount() { return affectedPeopleCount; }
    public void setAffectedPeopleCount(int value) {
        if (value <= 0) throw new IllegalArgumentException("affectedPeopleCount must be positive");
        affectedPeopleCount = value;
    }
    public String getDescription() { return description; }
    public void setDescription(String value) { description = value == null ? "" : value.trim(); }
    public PriorityLevel getPriority() { return priority; }
    public void setPriority(PriorityLevel value) {
        if (value == null) throw new IllegalArgumentException("priority must not be null");
        priority = value;
    }
    public ResourceType getRequiredResourceType() { return requiredResourceType; }
    public void setRequiredResourceType(ResourceType value) {
        if (value == null) throw new IllegalArgumentException("requiredResourceType must not be null");
        requiredResourceType = value;
    }
    public RequestStatus getStatus() { return status; }
    public void setStatus(RequestStatus value) {
        if (value == null) throw new IllegalArgumentException("status must not be null");
        status = value;
        if (value == RequestStatus.RESOLVED && resolvedAt == null) {
            resolvedAt = LocalDateTime.now();
        } else if (value != RequestStatus.RESOLVED) {
            resolvedAt = null;
        }
    }
    public String getAssignedResourceId() { return assignedResourceId; }
    public void setAssignedResourceId(String value) { assignedResourceId = value; }
    public String getAssignedVolunteerId() { return assignedVolunteerId; }
    public void setAssignedVolunteerId(String value) { assignedVolunteerId = value; }
    public LocalDateTime getResolvedAt() { return resolvedAt; }

    private static String nonBlank(String value, String field) {
        if (blank(value)) throw new IllegalArgumentException(field + " must not be blank");
        return value.trim();
    }

    @Override
    public int compareTo(EmergencyRequest other) {
        int priorityOrder = Integer.compare(other.priority.getValue(), priority.getValue());
        return priorityOrder != 0 ? priorityOrder : id.compareTo(other.id);
    }
}
