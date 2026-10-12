package com.resqnet.service;

import com.resqnet.exception.ResourceNotFoundException;
import com.resqnet.model.emergency.EmergencyRequest;
import com.resqnet.model.emergency.MatchResult;
import com.resqnet.model.enums.RequestStatus;
import com.resqnet.model.resource.Resource;
import com.resqnet.model.user.Volunteer;
import java.util.List;
import java.util.Locale;
import java.util.HashSet;
import java.util.Set;

/** Selects nearest compatible available inventory and volunteer. */
public class MatchingEngine {
    private final ResourceManager resourceManager;
    private final UserManager userManager;

    public MatchingEngine(ResourceManager resourceManager, UserManager userManager) {
        if (resourceManager == null || userManager == null) {
            throw new IllegalArgumentException("Managers must not be null");
        }
        this.resourceManager = resourceManager;
        this.userManager = userManager;
    }

    public synchronized MatchResult match(EmergencyRequest emergency) {
        if (emergency == null) throw new IllegalArgumentException("emergency must not be null");
        Resource bestResource = null;
        double bestResourceScore = Double.NEGATIVE_INFINITY;
        List<Resource> candidates = resourceManager.getAvailableResources(emergency.getRequiredResourceType());
        for (Resource candidate : candidates) {
            double score = locationScore(emergency.getLocation(), candidate.getLocation());
            if (score > bestResourceScore || (score == bestResourceScore && bestResource != null
                    && candidate.getId().compareTo(bestResource.getId()) < 0)) {
                bestResource = candidate;
                bestResourceScore = score;
            }
        }

        Volunteer bestVolunteer = null;
        double bestVolunteerScore = Double.NEGATIVE_INFINITY;
        for (Volunteer candidate : userManager.getVolunteers()) {
            if (!candidate.isAvailable()) continue;
            double score = locationScore(emergency.getLocation(), candidate.getLocation());
            if (score > bestVolunteerScore || (score == bestVolunteerScore && bestVolunteer != null
                    && candidate.getId().compareTo(bestVolunteer.getId()) < 0)) {
                bestVolunteer = candidate;
                bestVolunteerScore = score;
            }
        }

        if (bestResource != null) {
            bestResource.assign();
            emergency.setAssignedResourceId(bestResource.getId());
        }
        if (bestVolunteer != null) {
            bestVolunteer.assign(emergency.getId());
            emergency.setAssignedVolunteerId(bestVolunteer.getId());
        }
        if (bestResource != null || bestVolunteer != null) {
            emergency.setStatus(RequestStatus.RESOURCE_ASSIGNED);
        }
        return new MatchResult(bestResource, bestVolunteer,
                bestResource == null ? 0.0 : bestResourceScore,
                bestVolunteer == null ? 0.0 : bestVolunteerScore);
    }

    public synchronized MatchResult match(String emergencyId, EmergencyManager emergencyManager)
            throws ResourceNotFoundException {
        if (emergencyManager == null) throw new IllegalArgumentException("emergencyManager must not be null");
        return match(emergencyManager.getEmergency(emergencyId));
    }

    /** Coordinates in "latitude,longitude" use inverse Euclidean distance; names use similarity. */
    public static double locationScore(String origin, String destination) {
        double[] first = coordinates(origin);
        double[] second = coordinates(destination);
        if (first != null && second != null) {
            double distance = Math.sqrt(Math.pow(first[0] - second[0], 2)
                    + Math.pow(first[1] - second[1], 2));
            return 1.0 / (1.0 + distance);
        }
        String left = origin == null ? "" : origin.trim().toLowerCase(Locale.ROOT);
        String right = destination == null ? "" : destination.trim().toLowerCase(Locale.ROOT);
        if (left.isEmpty() || right.isEmpty()) return 0.0;
        if (left.equals(right)) return 1.0;
        if (left.contains(right) || right.contains(left)) return 0.75;
        Set<String> leftWords = locationWords(left);
        Set<String> rightWords = locationWords(right);
        Set<String> commonWords = new HashSet<String>(leftWords);
        commonWords.retainAll(rightWords);
        Set<String> allWords = new HashSet<String>(leftWords);
        allWords.addAll(rightWords);
        return allWords.isEmpty() ? 0.0 : (double) commonWords.size() / allWords.size();
    }

    private static Set<String> locationWords(String location) {
        Set<String> words = new HashSet<String>();
        for (String word : location.split("[^a-z0-9]+")) {
            if (word.length() > 1) words.add(word);
        }
        return words;
    }

    private static double[] coordinates(String value) {
        if (value == null) return null;
        String[] parts = value.trim().split("\\s*,\\s*");
        if (parts.length != 2) return null;
        try {
            double latitude = Double.parseDouble(parts[0]);
            double longitude = Double.parseDouble(parts[1]);
            if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return null;
            return new double[] {latitude, longitude};
        } catch (NumberFormatException exception) {
            return null;
        }
    }
}
