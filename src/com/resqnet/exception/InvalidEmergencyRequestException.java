package com.resqnet.exception;

/** Indicates that an emergency report failed validation. */
public class InvalidEmergencyRequestException extends Exception {
    private static final long serialVersionUID = 1L;

    public InvalidEmergencyRequestException(String message) { super(message); }
}
