package com.resqnet.storage;

import com.resqnet.exception.InvalidEmergencyRequestException;
import com.resqnet.model.emergency.EmergencyRequest;
import com.resqnet.model.enums.EmergencyType;
import com.resqnet.model.enums.PriorityLevel;
import com.resqnet.model.enums.RequestStatus;
import com.resqnet.model.enums.ResourceType;
import com.resqnet.model.resource.MedicalResource;
import com.resqnet.model.resource.Resource;
import com.resqnet.model.resource.Shelter;
import com.resqnet.model.resource.Vehicle;
import com.resqnet.model.user.Volunteer;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.AtomicMoveNotSupportedException;
import java.nio.file.StandardCopyOption;
import java.nio.file.StandardOpenOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/** Reads and writes the application's three CSV stores using UTF-8. */
public class FileStorageManager {
    private static final String EMERGENCY_HEADER = "id,reporterName,contact,type,location,affectedPeopleCount,"
            + "description,priority,requiredResourceType,status,assignedResourceId,assignedVolunteerId,resolvedAt";
    private static final String RESOURCE_HEADER =
            "id,name,type,location,quantity,available,provider";
    private static final String VOLUNTEER_HEADER =
            "id,name,contact,location,skills,status,assignedEmergencyId";

    private final Path dataDirectory;

    public FileStorageManager() throws IOException {
        this(Paths.get("data"));
    }

    public FileStorageManager(Path dataDirectory) throws IOException {
        if (dataDirectory == null) throw new IllegalArgumentException("dataDirectory must not be null");
        this.dataDirectory = dataDirectory;
        initializeFile("emergencies.csv", EMERGENCY_HEADER,
                "E-1001,Sample Reporter,0000000000,MEDICAL,0 0,1,Sample medical emergency,MEDIUM,AMBULANCE,PENDING,,,");
        initializeFile("resources.csv", RESOURCE_HEADER,
                "R-1001,Sample Ambulance,AMBULANCE,0 0,1,true,ResQNet");
        initializeFile("volunteers.csv", VOLUNTEER_HEADER,
                "V-1001,Sample Volunteer,0000000000,0 0,First Aid|Driving,AVAILABLE,");
    }

    private void initializeFile(String name, String header, String sample) throws IOException {
        Files.createDirectories(dataDirectory);
        Path file = dataDirectory.resolve(name);
        if (!Files.exists(file)) {
            Files.write(file, Arrays.asList(header, sample), StandardCharsets.UTF_8,
                    StandardOpenOption.CREATE_NEW, StandardOpenOption.WRITE);
        } else {
            List<String> existing = Files.readAllLines(file, StandardCharsets.UTF_8);
            if (existing.isEmpty() || (existing.size() == 1 && !existing.get(0).equals(header))) {
                Files.write(file, Arrays.asList(header, sample), StandardCharsets.UTF_8,
                        StandardOpenOption.TRUNCATE_EXISTING, StandardOpenOption.WRITE);
            }
        }
    }

    public synchronized List<EmergencyRequest> loadEmergencies() throws IOException {
        List<EmergencyRequest> result = new ArrayList<EmergencyRequest>();
        List<List<String>> rows = readRows("emergencies.csv");
        for (int line = 1; line < rows.size(); line++) {
            List<String> row = rows.get(line);
            if (row.size() != 13) throw malformed("emergencies.csv", line + 1, "expected 13 columns");
            try {
                result.add(new EmergencyRequest(row.get(0), row.get(1), row.get(2),
                        EmergencyType.valueOf(row.get(3)), row.get(4), Integer.parseInt(row.get(5)),
                        row.get(6), PriorityLevel.valueOf(row.get(7)), ResourceType.valueOf(row.get(8)),
                        RequestStatus.valueOf(row.get(9)), emptyToNull(row.get(10)), emptyToNull(row.get(11)),
                        row.get(12).isEmpty() ? null : LocalDateTime.parse(row.get(12))));
            } catch (IllegalArgumentException | InvalidEmergencyRequestException | DateTimeParseException exception) {
                throw malformed("emergencies.csv", line + 1, exception.getMessage(), exception);
            }
        }
        return result;
    }

    public synchronized List<Resource> loadResources() throws IOException {
        List<Resource> result = new ArrayList<Resource>();
        List<List<String>> rows = readRows("resources.csv");
        for (int line = 1; line < rows.size(); line++) {
            List<String> row = rows.get(line);
            if (row.size() != 7) throw malformed("resources.csv", line + 1, "expected 7 columns");
            try {
                ResourceType type = ResourceType.valueOf(row.get(2));
                int quantity = Integer.parseInt(row.get(4));
                if (!"true".equalsIgnoreCase(row.get(5)) && !"false".equalsIgnoreCase(row.get(5))) {
                    throw new IllegalArgumentException("available must be true or false");
                }
                boolean available = Boolean.parseBoolean(row.get(5));
                String provider = row.get(6);
                if (type == ResourceType.VEHICLE) {
                    result.add(new Vehicle(row.get(0), row.get(1), row.get(3), quantity, available, provider));
                } else if (type == ResourceType.SHELTER) {
                    result.add(new Shelter(row.get(0), row.get(1), row.get(3), quantity, available, provider));
                } else {
                    result.add(new MedicalResource(row.get(0), row.get(1), type, row.get(3),
                            quantity, available, provider));
                }
            } catch (IllegalArgumentException exception) {
                throw malformed("resources.csv", line + 1, exception.getMessage(), exception);
            }
        }
        return result;
    }

    public synchronized List<Volunteer> loadVolunteers() throws IOException {
        List<Volunteer> result = new ArrayList<Volunteer>();
        List<List<String>> rows = readRows("volunteers.csv");
        for (int line = 1; line < rows.size(); line++) {
            List<String> row = rows.get(line);
            if (row.size() != 7) throw malformed("volunteers.csv", line + 1, "expected 7 columns");
            try {
                List<String> skills = new ArrayList<String>();
                if (!row.get(4).isEmpty()) skills.addAll(Arrays.asList(row.get(4).split("\\|", -1)));
                result.add(new Volunteer(row.get(0), row.get(1), row.get(2), row.get(3), skills,
                        Volunteer.Status.valueOf(row.get(5)), emptyToNull(row.get(6))));
            } catch (IllegalArgumentException exception) {
                throw malformed("volunteers.csv", line + 1, exception.getMessage(), exception);
            }
        }
        return result;
    }

    public synchronized void saveEmergencies(List<EmergencyRequest> emergencies) throws IOException {
        List<String> lines = new ArrayList<String>();
        lines.add(EMERGENCY_HEADER);
        for (EmergencyRequest request : emergencies) {
            lines.add(csv(request.getId()) + "," + csv(request.getReporterName()) + ","
                    + csv(request.getContact()) + "," + request.getType().name() + ","
                    + csv(request.getLocation()) + "," + request.getAffectedPeopleCount() + ","
                    + csv(request.getDescription()) + "," + request.getPriority().name() + ","
                    + request.getRequiredResourceType().name() + "," + request.getStatus().name() + ","
                    + csv(nullToEmpty(request.getAssignedResourceId())) + ","
                    + csv(nullToEmpty(request.getAssignedVolunteerId())) + ","
                    + csv(request.getResolvedAt() == null ? "" : request.getResolvedAt().toString()));
        }
        writeRows("emergencies.csv", lines);
    }

    public synchronized void saveResources(List<Resource> resources) throws IOException {
        List<String> lines = new ArrayList<String>();
        lines.add(RESOURCE_HEADER);
        for (Resource resource : resources) {
            lines.add(csv(resource.getId()) + "," + csv(resource.getName()) + ","
                    + resource.getType().name() + "," + csv(resource.getLocation()) + ","
                    + resource.getQuantity() + "," + resource.isAvailable() + "," + csv(resource.getProvider()));
        }
        writeRows("resources.csv", lines);
    }

    public synchronized void saveVolunteers(List<Volunteer> volunteers) throws IOException {
        List<String> lines = new ArrayList<String>();
        lines.add(VOLUNTEER_HEADER);
        for (Volunteer volunteer : volunteers) {
            lines.add(csv(volunteer.getId()) + "," + csv(volunteer.getName()) + ","
                    + csv(volunteer.getContact()) + "," + csv(volunteer.getLocation()) + ","
                    + csv(join(volunteer.getSkillSet(), "|")) + "," + volunteer.getStatus().name() + ","
                    + csv(nullToEmpty(volunteer.getAssignedEmergencyId())));
        }
        writeRows("volunteers.csv", lines);
    }

    private List<List<String>> readRows(String name) throws IOException {
        Path file = dataDirectory.resolve(name);
        String contents = new String(Files.readAllBytes(file), StandardCharsets.UTF_8);
        if (contents.startsWith("\uFEFF")) contents = contents.substring(1);
        List<List<String>> result = new ArrayList<List<String>>();
        try {
            result.addAll(parseCsv(contents));
        } catch (IllegalArgumentException exception) {
            throw malformed(name, 1, exception.getMessage(), exception);
        }
        String expectedHeader = "emergencies.csv".equals(name) ? EMERGENCY_HEADER
                : "resources.csv".equals(name) ? RESOURCE_HEADER : VOLUNTEER_HEADER;
        if (result.isEmpty() || !expectedHeader.equals(join(result.get(0), ","))) {
            throw malformed(name, 1, "missing or unsupported CSV header");
        }
        return result;
    }

    private void writeRows(String name, List<String> lines) throws IOException {
        Files.createDirectories(dataDirectory);
        Path target = dataDirectory.resolve(name);
        Path temporary = Files.createTempFile(dataDirectory, name, ".tmp");
        try {
            Files.write(temporary, lines, StandardCharsets.UTF_8,
                    StandardOpenOption.TRUNCATE_EXISTING, StandardOpenOption.WRITE);
            try {
                Files.move(temporary, target, StandardCopyOption.REPLACE_EXISTING, StandardCopyOption.ATOMIC_MOVE);
            } catch (AtomicMoveNotSupportedException atomicMoveFailure) {
                Files.move(temporary, target, StandardCopyOption.REPLACE_EXISTING);
            }
        } finally {
            Files.deleteIfExists(temporary);
        }
    }

    private static List<List<String>> parseCsv(String contents) {
        List<List<String>> rows = new ArrayList<List<String>>();
        List<String> fields = new ArrayList<String>();
        StringBuilder field = new StringBuilder();
        boolean quoted = false;
        boolean afterQuote = false;
        int line = 1;
        for (int index = 0; index < contents.length(); index++) {
            char character = contents.charAt(index);
            if (quoted) {
                if (character == '"' && index + 1 < contents.length() && contents.charAt(index + 1) == '"') {
                    field.append('"');
                    index++;
                } else if (character == '"') {
                    quoted = false;
                    afterQuote = true;
                } else {
                    field.append(character);
                    if (character == '\n') line++;
                }
            } else if (afterQuote && character != ',' && character != '\r' && character != '\n') {
                throw new IllegalArgumentException("unexpected character after a quoted field on line " + line);
            } else if (character == ',') {
                fields.add(field.toString());
                field.setLength(0);
                afterQuote = false;
            } else if (character == '"' && field.length() == 0 && !afterQuote) {
                quoted = true;
            } else if (character == '\r' || character == '\n') {
                fields.add(field.toString());
                field.setLength(0);
                if (fields.size() > 1 || !fields.get(0).trim().isEmpty() || rows.isEmpty()) {
                    rows.add(fields);
                }
                fields = new ArrayList<String>();
                afterQuote = false;
                if (character == '\r' && index + 1 < contents.length() && contents.charAt(index + 1) == '\n') {
                    index++;
                }
                line++;
            } else if (character == '"' && !afterQuote) {
                throw new IllegalArgumentException("quote inside an unquoted field on line " + line);
            } else {
                field.append(character);
                afterQuote = false;
            }
        }
        if (quoted) throw new IllegalArgumentException("unterminated quoted field");
        if (field.length() > 0 || !fields.isEmpty() || afterQuote) {
            fields.add(field.toString());
            rows.add(fields);
        }
        return rows;
    }

    private static String csv(String value) {
        String safe = value == null ? "" : value;
        return "\"" + safe.replace("\"", "\"\"") + "\"";
    }

    private static String join(List<String> values, String separator) {
        StringBuilder result = new StringBuilder();
        for (String value : values) {
            if (result.length() > 0) result.append(separator);
            result.append(value);
        }
        return result.toString();
    }

    private static String emptyToNull(String value) { return value.isEmpty() ? null : value; }
    private static String nullToEmpty(String value) { return value == null ? "" : value; }

    private static IOException malformed(String file, int line, String reason) {
        return new IOException(file + ":" + line + ": " + reason);
    }

    private static IOException malformed(String file, int line, String reason, Exception cause) {
        return new IOException(file + ":" + line + ": " + reason, cause);
    }
}
