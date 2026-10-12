package com.resqnet.exception;

/** Indicates that a requested resource or emergency does not exist. */
public class ResourceNotFoundException extends Exception {
    private static final long serialVersionUID = 1L;

    public ResourceNotFoundException(String message) { super(message); }
}
