package com.resqnet.model.emergency;

import com.resqnet.model.resource.Resource;
import com.resqnet.model.user.Volunteer;

/** Chosen resource and volunteer with their location match scores. */
public class MatchResult {
    private final Resource resource;
    private final Volunteer volunteer;
    private final double resourceScore;
    private final double volunteerScore;

    public MatchResult(Resource resource, Volunteer volunteer, double resourceScore, double volunteerScore) {
        this.resource = resource;
        this.volunteer = volunteer;
        this.resourceScore = resourceScore;
        this.volunteerScore = volunteerScore;
    }

    public Resource getResource() { return resource; }
    public Volunteer getVolunteer() { return volunteer; }
    public double getResourceScore() { return resourceScore; }
    public double getVolunteerScore() { return volunteerScore; }
    public boolean isSuccessful() { return resource != null || volunteer != null; }
}
