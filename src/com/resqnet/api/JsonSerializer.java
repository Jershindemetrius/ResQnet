package com.resqnet.api;

import com.resqnet.model.emergency.EmergencyRequest;
import com.resqnet.model.emergency.MatchResult;
import com.resqnet.model.resource.Resource;
import com.resqnet.model.user.User;
import com.resqnet.model.user.Volunteer;
import com.sun.net.httpserver.HttpExchange;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.lang.reflect.Array;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Locale;
import java.util.logging.Level;
import java.util.logging.Logger;

/** Small dependency-free JSON codec for the API's JSON values and model objects. */
public final class JsonSerializer {
    private static final int MAX_BODY_BYTES = 1024 * 1024;
    private static final Logger LOGGER = Logger.getLogger(JsonSerializer.class.getName());

    private JsonSerializer() { }

    public static Map<String, Object> parseObject(InputStream input) throws IOException {
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        byte[] buffer = new byte[4096];
        int read;
        while ((read = input.read(buffer)) != -1) {
            if (output.size() + read > MAX_BODY_BYTES) {
                throw new IllegalArgumentException("JSON request body exceeds 1 MiB");
            }
            output.write(buffer, 0, read);
        }
        Object parsed = parse(new String(output.toByteArray(), StandardCharsets.UTF_8));
        if (!(parsed instanceof Map)) throw new IllegalArgumentException("JSON body must be an object");
        @SuppressWarnings("unchecked")
        Map<String, Object> object = (Map<String, Object>) parsed;
        return object;
    }

    public static String requiredString(Map<String, Object> body, String key) {
        Object value = body.get(key);
        if (!(value instanceof String) || ((String) value).trim().isEmpty()) {
            throw new IllegalArgumentException(key + " must be a non-empty string");
        }
        return ((String) value).trim();
    }

    public static String optionalString(Map<String, Object> body, String key, String defaultValue) {
        Object value = body.get(key);
        if (value == null) return defaultValue;
        if (!(value instanceof String)) throw new IllegalArgumentException(key + " must be a string");
        return ((String) value).trim();
    }

    public static int requiredInteger(Map<String, Object> body, String key) {
        Object value = body.get(key);
        if (!(value instanceof Number)) throw new IllegalArgumentException(key + " must be an integer");
        double number = ((Number) value).doubleValue();
        if (!Double.isFinite(number) || number != Math.rint(number)
                || number < Integer.MIN_VALUE || number > Integer.MAX_VALUE) {
            throw new IllegalArgumentException(key + " must be an integer");
        }
        return (int) number;
    }

    public static int integerOrDefault(Map<String, Object> body, String key, int defaultValue) {
        return body.containsKey(key) ? requiredInteger(body, key) : defaultValue;
    }

    public static <T extends Enum<T>> T requiredEnum(Map<String, Object> body, String key, Class<T> type) {
        String value = requiredString(body, key);
        try {
            return Enum.valueOf(type, value.toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException exception) {
            throw new IllegalArgumentException("Invalid " + key + ": " + value, exception);
        }
    }

    public static <T extends Enum<T>> T enumOrDefault(Map<String, Object> body, String key,
                                                       Class<T> type, T defaultValue) {
        return body.containsKey(key) ? requiredEnum(body, key, type) : defaultValue;
    }

    public static List<String> stringList(Map<String, Object> body, String key) {
        Object value = body.get(key);
        if (value == null) return new ArrayList<String>();
        if (!(value instanceof List<?>)) throw new IllegalArgumentException(key + " must be an array");
        List<String> result = new ArrayList<String>();
        for (Object item : (List<?>) value) {
            if (!(item instanceof String)) throw new IllegalArgumentException(key + " must contain strings");
            result.add(((String) item).trim());
        }
        return result;
    }

    public static void send(HttpExchange exchange, int statusCode, Object value) throws IOException {
        byte[] body = toJson(value).getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=utf-8");
        exchange.sendResponseHeaders(statusCode, body.length);
        try (java.io.OutputStream response = exchange.getResponseBody()) {
            response.write(body);
        }
    }

    public static void sendError(HttpExchange exchange, int statusCode, String message) throws IOException {
        Map<String, Object> body = new LinkedHashMap<String, Object>();
        body.put("error", message);
        send(exchange, statusCode, body);
    }

    public static void sendServerError(HttpExchange exchange, String operation, IOException exception)
            throws IOException {
        LOGGER.log(Level.SEVERE, operation + " failed", exception);
        sendError(exchange, 500, operation + " failed");
    }

    public static Object parse(String json) {
        if (json == null) throw new IllegalArgumentException("JSON input must not be null");
        Parser parser = new Parser(json);
        Object value = parser.readValue();
        parser.skipWhitespace();
        if (!parser.atEnd()) throw parser.error("Unexpected trailing content");
        return value;
    }

    public static String toJson(Object value) {
        StringBuilder json = new StringBuilder();
        writeValue(json, value);
        return json.toString();
    }

    private static void writeValue(StringBuilder json, Object value) {
        if (value == null) {
            json.append("null");
        } else if (value instanceof String || value instanceof Character || value instanceof Enum<?>) {
            quote(json, value instanceof Enum<?> ? ((Enum<?>) value).name() : value.toString());
        } else if (value instanceof Number) {
            double number = ((Number) value).doubleValue();
            if (!Double.isFinite(number)) json.append("null");
            else json.append(value);
        } else if (value instanceof Boolean) {
            json.append(value);
        } else if (value instanceof EmergencyRequest) {
            writeValue(json, emergencyMap((EmergencyRequest) value));
        } else if (value instanceof Resource) {
            writeValue(json, resourceMap((Resource) value));
        } else if (value instanceof Volunteer) {
            writeValue(json, volunteerMap((Volunteer) value));
        } else if (value instanceof User) {
            User user = (User) value;
            Map<String, Object> map = new LinkedHashMap<String, Object>();
            map.put("id", user.getId()); map.put("name", user.getName());
            map.put("contact", user.getContact()); map.put("location", user.getLocation());
            writeValue(json, map);
        } else if (value instanceof MatchResult) {
            MatchResult match = (MatchResult) value;
            Map<String, Object> map = new LinkedHashMap<String, Object>();
            map.put("resource", match.getResource()); map.put("volunteer", match.getVolunteer());
            map.put("resourceScore", match.getResourceScore());
            map.put("volunteerScore", match.getVolunteerScore());
            map.put("successful", match.isSuccessful());
            writeValue(json, map);
        } else if (value instanceof Map<?, ?>) {
            json.append('{');
            boolean first = true;
            for (Map.Entry<?, ?> entry : ((Map<?, ?>) value).entrySet()) {
                if (!first) json.append(',');
                quote(json, String.valueOf(entry.getKey()));
                json.append(':');
                writeValue(json, entry.getValue());
                first = false;
            }
            json.append('}');
        } else if (value instanceof Iterable<?>) {
            json.append('[');
            boolean first = true;
            for (Object item : (Iterable<?>) value) {
                if (!first) json.append(',');
                writeValue(json, item);
                first = false;
            }
            json.append(']');
        } else if (value.getClass().isArray()) {
            json.append('[');
            for (int index = 0; index < Array.getLength(value); index++) {
                if (index > 0) json.append(',');
                writeValue(json, Array.get(value, index));
            }
            json.append(']');
        } else {
            throw new IllegalArgumentException("Unsupported JSON value: " + value.getClass().getName());
        }
    }

    private static Map<String, Object> emergencyMap(EmergencyRequest request) {
        Map<String, Object> map = new LinkedHashMap<String, Object>();
        map.put("id", request.getId()); map.put("reporterName", request.getReporterName());
        map.put("contact", request.getContact()); map.put("type", request.getType());
        map.put("location", request.getLocation()); map.put("affectedPeopleCount", request.getAffectedPeopleCount());
        map.put("description", request.getDescription()); map.put("priority", request.getPriority());
        map.put("requiredResourceType", request.getRequiredResourceType()); map.put("status", request.getStatus());
        map.put("assignedResourceId", request.getAssignedResourceId());
        map.put("assignedVolunteerId", request.getAssignedVolunteerId());
        map.put("resolvedAt", request.getResolvedAt() == null ? null : request.getResolvedAt().toString());
        return map;
    }

    private static Map<String, Object> resourceMap(Resource resource) {
        Map<String, Object> map = new LinkedHashMap<String, Object>();
        map.put("id", resource.getId()); map.put("name", resource.getName());
        map.put("type", resource.getType()); map.put("location", resource.getLocation());
        map.put("quantity", resource.getQuantity()); map.put("available", resource.isAvailable());
        map.put("provider", resource.getProvider());
        return map;
    }

    private static Map<String, Object> volunteerMap(Volunteer volunteer) {
        Map<String, Object> map = new LinkedHashMap<String, Object>();
        map.put("id", volunteer.getId()); map.put("name", volunteer.getName());
        map.put("contact", volunteer.getContact()); map.put("location", volunteer.getLocation());
        map.put("skillSet", volunteer.getSkillSet()); map.put("status", volunteer.getStatus());
        map.put("assignedEmergencyId", volunteer.getAssignedEmergencyId());
        return map;
    }

    private static void quote(StringBuilder output, String value) {
        output.append('"');
        for (int index = 0; index < value.length(); index++) {
            char character = value.charAt(index);
            switch (character) {
                case '"': output.append("\\\""); break;
                case '\\': output.append("\\\\"); break;
                case '\b': output.append("\\b"); break;
                case '\f': output.append("\\f"); break;
                case '\n': output.append("\\n"); break;
                case '\r': output.append("\\r"); break;
                case '\t': output.append("\\t"); break;
                default:
                    if (character < 0x20) {
                        output.append(String.format("\\u%04x", (int) character));
                    } else {
                        output.append(character);
                    }
            }
        }
        output.append('"');
    }

    private static final class Parser {
        private final String input;
        private int position;

        Parser(String input) { this.input = input; }
        boolean atEnd() { return position >= input.length(); }

        Object readValue() {
            skipWhitespace();
            if (atEnd()) throw error("Expected a JSON value");
            char current = input.charAt(position);
            if (current == '{') return readObject();
            if (current == '[') return readArray();
            if (current == '"') return readString();
            if (current == 't') return readLiteral("true", Boolean.TRUE);
            if (current == 'f') return readLiteral("false", Boolean.FALSE);
            if (current == 'n') return readLiteral("null", null);
            if (current == '-' || (current >= '0' && current <= '9')) return readNumber();
            throw error("Unexpected character '" + current + "'");
        }

        void skipWhitespace() {
            while (!atEnd() && Character.isWhitespace(input.charAt(position))) position++;
        }

        private Map<String, Object> readObject() {
            Map<String, Object> result = new LinkedHashMap<String, Object>();
            position++;
            skipWhitespace();
            if (consume('}')) return result;
            while (true) {
                skipWhitespace();
                if (atEnd() || input.charAt(position) != '"') throw error("Expected an object key");
                String key = readString();
                skipWhitespace();
                if (!consume(':')) throw error("Expected ':' after object key");
                if (result.containsKey(key)) throw error("Duplicate object key: " + key);
                result.put(key, readValue());
                skipWhitespace();
                if (consume('}')) return result;
                if (!consume(',')) throw error("Expected ',' or '}'");
            }
        }

        private List<Object> readArray() {
            List<Object> result = new ArrayList<Object>();
            position++;
            skipWhitespace();
            if (consume(']')) return result;
            while (true) {
                result.add(readValue());
                skipWhitespace();
                if (consume(']')) return result;
                if (!consume(',')) throw error("Expected ',' or ']'");
            }
        }

        private String readString() {
            position++;
            StringBuilder result = new StringBuilder();
            while (!atEnd()) {
                char character = input.charAt(position++);
                if (character == '"') return result.toString();
                if (character == '\\') {
                    if (atEnd()) throw error("Incomplete escape sequence");
                    char escaped = input.charAt(position++);
                    switch (escaped) {
                        case '"': result.append('"'); break;
                        case '\\': result.append('\\'); break;
                        case '/': result.append('/'); break;
                        case 'b': result.append('\b'); break;
                        case 'f': result.append('\f'); break;
                        case 'n': result.append('\n'); break;
                        case 'r': result.append('\r'); break;
                        case 't': result.append('\t'); break;
                        case 'u': result.append(readUnicode()); break;
                        default: throw error("Invalid escape sequence");
                    }
                } else {
                    if (character < 0x20) throw error("Control character in string");
                    result.append(character);
                }
            }
            throw error("Unterminated string");
        }

        private char readUnicode() {
            if (position + 4 > input.length()) throw error("Incomplete Unicode escape");
            try {
                char result = (char) Integer.parseInt(input.substring(position, position + 4), 16);
                position += 4;
                return result;
            } catch (NumberFormatException exception) {
                throw error("Invalid Unicode escape");
            }
        }

        private Object readNumber() {
            int start = position;
            if (consume('-') && atEnd()) throw error("Incomplete number");
            if (consume('0')) {
                if (!atEnd() && Character.isDigit(input.charAt(position))) throw error("Leading zero in number");
            } else {
                if (atEnd() || !Character.isDigit(input.charAt(position))) throw error("Invalid number");
                while (!atEnd() && Character.isDigit(input.charAt(position))) position++;
            }
            boolean decimal = false;
            if (consume('.')) {
                decimal = true;
                if (atEnd() || !Character.isDigit(input.charAt(position))) throw error("Invalid fraction");
                while (!atEnd() && Character.isDigit(input.charAt(position))) position++;
            }
            if (!atEnd() && (input.charAt(position) == 'e' || input.charAt(position) == 'E')) {
                decimal = true;
                position++;
                if (!atEnd() && (input.charAt(position) == '+' || input.charAt(position) == '-')) position++;
                if (atEnd() || !Character.isDigit(input.charAt(position))) throw error("Invalid exponent");
                while (!atEnd() && Character.isDigit(input.charAt(position))) position++;
            }
            String number = input.substring(start, position);
            try {
                return decimal ? Double.valueOf(number) : Long.valueOf(number);
            } catch (NumberFormatException exception) {
                throw error("Number is out of range");
            }
        }

        private Object readLiteral(String literal, Object result) {
            if (!input.regionMatches(position, literal, 0, literal.length())) throw error("Invalid literal");
            position += literal.length();
            return result;
        }

        private boolean consume(char expected) {
            if (!atEnd() && input.charAt(position) == expected) {
                position++;
                return true;
            }
            return false;
        }

        private IllegalArgumentException error(String message) {
            return new IllegalArgumentException(message + " at character " + position);
        }
    }
}
