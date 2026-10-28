package com.resqnet;

import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.net.BindException;
import java.net.ServerSocket;

public final class PortConflictSmoke {
    private PortConflictSmoke() { }

    public static void main(String[] args) throws Exception {
        try (ServerSocket occupiedPort = new ServerSocket(0)) {
            try {
                HttpServer unexpected = Main.createServer(occupiedPort.getLocalPort());
                unexpected.stop(0);
                throw new AssertionError("Expected occupied-port startup to fail");
            } catch (IOException exception) {
                if (!exception.getMessage().contains("is already in use")
                        || !(exception.getCause() instanceof BindException)) {
                    throw new AssertionError("Port conflict was not reported clearly", exception);
                }
            }
        }
        System.out.println("Port conflict smoke test passed.");
    }
}
