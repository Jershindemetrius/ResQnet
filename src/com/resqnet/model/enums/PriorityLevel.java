package com.resqnet.model.enums;

/** Priorities are assigned numeric weights so larger values sort first. */
public enum PriorityLevel {
    CRITICAL(4), HIGH(3), MEDIUM(2), LOW(1);

    private final int value;

    PriorityLevel(int value) {
        this.value = value;
    }

    public int getValue() {
        return value;
    }
}
