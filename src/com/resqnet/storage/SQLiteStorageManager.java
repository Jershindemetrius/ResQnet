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
import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/** SQLite-backed persistence for emergency, resource, and volunteer records. */
public final class SQLiteStorageManager {
    private static final String MIGRATION_KEY = "legacy-csv-v1";
    private static final String EMERGENCY_INSERT = "INSERT OR REPLACE INTO emergencies "
            + "(id, reporter_name, contact, type, location, affected_people_count, description, priority, "
            + "required_resource_type, status, assigned_resource_id, assigned_volunteer_id, resolved_at) "
            + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    private static final String RESOURCE_INSERT = "INSERT OR REPLACE INTO resources "
            + "(id, name, type, location, quantity, available, provider) VALUES (?, ?, ?, ?, ?, ?, ?)";
    private static final String VOLUNTEER_INSERT = "INSERT OR REPLACE INTO volunteers "
            + "(id, name, contact, location, skills, status, assigned_emergency_id) "
            + "VALUES (?, ?, ?, ?, ?, ?, ?)";

    private final Path databasePath;

    public SQLiteStorageManager(Path databasePath, Path legacyDataDirectory) throws IOException {
        if (databasePath == null) throw new IllegalArgumentException("databasePath must not be null");
        if (legacyDataDirectory == null) {
            throw new IllegalArgumentException("legacyDataDirectory must not be null");
        }
        this.databasePath = databasePath.toAbsolutePath().normalize();
        Path parent = this.databasePath.getParent();
        if (parent != null) Files.createDirectories(parent);
        ensureJdbcDriver();
        initializeSchema();
        migrateLegacyCsv(legacyDataDirectory);
    }

    private static void ensureJdbcDriver() throws IOException {
        try {
            Class.forName("org.sqlite.JDBC");
        } catch (ClassNotFoundException exception) {
            throw new IOException("SQLite JDBC driver is missing from the runtime classpath. "
                    + "Import the project as an Existing Maven Project and run Maven > Update Project "
                    + "in Eclipse.", exception);
        }
    }

    public List<EmergencyRequest> loadEmergencies() throws IOException {
        String sql = "SELECT id, reporter_name, contact, type, location, affected_people_count, description, "
                + "priority, required_resource_type, status, assigned_resource_id, assigned_volunteer_id, "
                + "resolved_at FROM emergencies";
        List<EmergencyRequest> result = new ArrayList<EmergencyRequest>();
        try (Connection connection = connect();
             Statement statement = connection.createStatement();
             ResultSet rows = statement.executeQuery(sql)) {
            while (rows.next()) {
                String resolvedAt = rows.getString("resolved_at");
                result.add(new EmergencyRequest(rows.getString("id"), rows.getString("reporter_name"),
                        rows.getString("contact"), EmergencyType.valueOf(rows.getString("type")),
                        rows.getString("location"), rows.getInt("affected_people_count"),
                        rows.getString("description"), PriorityLevel.valueOf(rows.getString("priority")),
                        ResourceType.valueOf(rows.getString("required_resource_type")),
                        RequestStatus.valueOf(rows.getString("status")),
                        rows.getString("assigned_resource_id"), rows.getString("assigned_volunteer_id"),
                        resolvedAt == null ? null : LocalDateTime.parse(resolvedAt)));
            }
        } catch (SQLException | IllegalArgumentException | InvalidEmergencyRequestException exception) {
            throw storageFailure("Unable to load emergency records from SQLite", exception);
        }
        return result;
    }

    public List<Resource> loadResources() throws IOException {
        String sql = "SELECT id, name, type, location, quantity, available, provider FROM resources";
        List<Resource> result = new ArrayList<Resource>();
        try (Connection connection = connect();
             Statement statement = connection.createStatement();
             ResultSet rows = statement.executeQuery(sql)) {
            while (rows.next()) {
                ResourceType type = ResourceType.valueOf(rows.getString("type"));
                String id = rows.getString("id");
                String name = rows.getString("name");
                String location = rows.getString("location");
                int quantity = rows.getInt("quantity");
                boolean available = rows.getInt("available") != 0;
                String provider = rows.getString("provider");
                if (type == ResourceType.VEHICLE) {
                    result.add(new Vehicle(id, name, location, quantity, available, provider));
                } else if (type == ResourceType.SHELTER) {
                    result.add(new Shelter(id, name, location, quantity, available, provider));
                } else {
                    result.add(new MedicalResource(id, name, type, location, quantity, available, provider));
                }
            }
        } catch (SQLException | IllegalArgumentException exception) {
            throw storageFailure("Unable to load resource records from SQLite", exception);
        }
        return result;
    }

    public List<Volunteer> loadVolunteers() throws IOException {
        String sql = "SELECT id, name, contact, location, skills, status, assigned_emergency_id FROM volunteers";
        List<Volunteer> result = new ArrayList<Volunteer>();
        try (Connection connection = connect();
             Statement statement = connection.createStatement();
             ResultSet rows = statement.executeQuery(sql)) {
            while (rows.next()) {
                String skills = rows.getString("skills");
                List<String> skillSet = skills == null || skills.isEmpty()
                        ? new ArrayList<String>() : Arrays.asList(skills.split("\\|", -1));
                result.add(new Volunteer(rows.getString("id"), rows.getString("name"),
                        rows.getString("contact"), rows.getString("location"), skillSet,
                        Volunteer.Status.valueOf(rows.getString("status")),
                        rows.getString("assigned_emergency_id")));
            }
        } catch (SQLException | IllegalArgumentException exception) {
            throw storageFailure("Unable to load volunteer records from SQLite", exception);
        }
        return result;
    }

    public void saveEmergency(EmergencyRequest emergency) throws IOException {
        try (Connection connection = connect();
             PreparedStatement statement = connection.prepareStatement(EMERGENCY_INSERT)) {
            bindEmergency(statement, emergency);
            statement.executeUpdate();
        } catch (SQLException exception) {
            throw storageFailure("Unable to save emergency record to SQLite", exception);
        }
    }

    public void saveResource(Resource resource) throws IOException {
        try (Connection connection = connect();
             PreparedStatement statement = connection.prepareStatement(RESOURCE_INSERT)) {
            bindResource(statement, resource);
            statement.executeUpdate();
        } catch (SQLException exception) {
            throw storageFailure("Unable to save resource record to SQLite", exception);
        }
    }

    public void saveVolunteer(Volunteer volunteer) throws IOException {
        try (Connection connection = connect();
             PreparedStatement statement = connection.prepareStatement(VOLUNTEER_INSERT)) {
            bindVolunteer(statement, volunteer);
            statement.executeUpdate();
        } catch (SQLException exception) {
            throw storageFailure("Unable to save volunteer record to SQLite", exception);
        }
    }

    public void saveDispatch(EmergencyRequest emergency, Resource resource, Volunteer volunteer)
            throws IOException {
        try (Connection connection = connect()) {
            connection.setAutoCommit(false);
            try (PreparedStatement emergencyStatement = connection.prepareStatement(EMERGENCY_INSERT);
                 PreparedStatement resourceStatement = resource == null ? null
                         : connection.prepareStatement(RESOURCE_INSERT);
                 PreparedStatement volunteerStatement = volunteer == null ? null
                         : connection.prepareStatement(VOLUNTEER_INSERT)) {
                bindEmergency(emergencyStatement, emergency);
                emergencyStatement.executeUpdate();
                if (resourceStatement != null) {
                    bindResource(resourceStatement, resource);
                    resourceStatement.executeUpdate();
                }
                if (volunteerStatement != null) {
                    bindVolunteer(volunteerStatement, volunteer);
                    volunteerStatement.executeUpdate();
                }
                connection.commit();
            } catch (SQLException exception) {
                rollback(connection, exception);
                throw exception;
            }
        } catch (SQLException exception) {
            throw storageFailure("Unable to save dispatch records to SQLite", exception);
        }
    }

    private void initializeSchema() throws IOException {
        String[] schema = {
            "CREATE TABLE IF NOT EXISTS emergencies ("
                    + "id TEXT PRIMARY KEY, reporter_name TEXT NOT NULL, contact TEXT NOT NULL, type TEXT NOT NULL, "
                    + "location TEXT NOT NULL, affected_people_count INTEGER NOT NULL, description TEXT NOT NULL, "
                    + "priority TEXT NOT NULL, required_resource_type TEXT NOT NULL, status TEXT NOT NULL, "
                    + "assigned_resource_id TEXT, assigned_volunteer_id TEXT, resolved_at TEXT)",
            "CREATE TABLE IF NOT EXISTS resources ("
                    + "id TEXT PRIMARY KEY, name TEXT NOT NULL, type TEXT NOT NULL, location TEXT NOT NULL, "
                    + "quantity INTEGER NOT NULL, available INTEGER NOT NULL, provider TEXT NOT NULL)",
            "CREATE TABLE IF NOT EXISTS volunteers ("
                    + "id TEXT PRIMARY KEY, name TEXT NOT NULL, contact TEXT NOT NULL, location TEXT NOT NULL, "
                    + "skills TEXT NOT NULL, status TEXT NOT NULL, assigned_emergency_id TEXT)",
            "CREATE TABLE IF NOT EXISTS auth_users ("
                    + "id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, "
                    + "salt TEXT NOT NULL, password_hash TEXT NOT NULL)",
            "CREATE TABLE IF NOT EXISTS schema_migrations ("
                    + "migration_key TEXT PRIMARY KEY, applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)",
            "CREATE INDEX IF NOT EXISTS idx_emergencies_status_priority ON emergencies(status, priority)",
            "CREATE INDEX IF NOT EXISTS idx_resources_type_available ON resources(type, available)",
            "CREATE INDEX IF NOT EXISTS idx_volunteers_status ON volunteers(status)"
        };
        try (Connection connection = connect(); Statement statement = connection.createStatement()) {
            statement.execute("PRAGMA journal_mode = WAL");
            for (String sql : schema) statement.execute(sql);
        } catch (SQLException exception) {
            throw storageFailure("Unable to initialize SQLite database", exception);
        }
    }

    private void migrateLegacyCsv(Path legacyDataDirectory) throws IOException {
        try (Connection connection = connect()) {
            if (migrationApplied(connection, MIGRATION_KEY)) return;
            connection.setAutoCommit(false);
            try {
                FileStorageManager csv = new FileStorageManager(legacyDataDirectory, false);
                Path emergenciesFile = legacyDataDirectory.resolve("emergencies.csv");
                Path resourcesFile = legacyDataDirectory.resolve("resources.csv");
                Path volunteersFile = legacyDataDirectory.resolve("volunteers.csv");
                if (Files.exists(emergenciesFile)) insertEmergencies(connection, csv.loadEmergencies());
                if (Files.exists(resourcesFile)) insertResources(connection, csv.loadResources());
                if (Files.exists(volunteersFile)) insertVolunteers(connection, csv.loadVolunteers());
                markMigration(connection, MIGRATION_KEY);
                connection.commit();
            } catch (IOException | SQLException | RuntimeException exception) {
                rollback(connection, exception);
                if (exception instanceof IOException) throw (IOException) exception;
                throw storageFailure("Unable to migrate CSV records into SQLite", exception);
            }
        } catch (SQLException exception) {
            throw storageFailure("Unable to migrate CSV records into SQLite", exception);
        }
    }

    private void insertEmergencies(Connection connection, List<EmergencyRequest> values) throws SQLException {
        try (PreparedStatement statement = connection.prepareStatement(EMERGENCY_INSERT)) {
            for (EmergencyRequest value : values) {
                bindEmergency(statement, value);
                statement.addBatch();
            }
            statement.executeBatch();
        }
    }

    private void insertResources(Connection connection, List<Resource> values) throws SQLException {
        try (PreparedStatement statement = connection.prepareStatement(RESOURCE_INSERT)) {
            for (Resource value : values) {
                bindResource(statement, value);
                statement.addBatch();
            }
            statement.executeBatch();
        }
    }

    private void insertVolunteers(Connection connection, List<Volunteer> values) throws SQLException {
        try (PreparedStatement statement = connection.prepareStatement(VOLUNTEER_INSERT)) {
            for (Volunteer value : values) {
                bindVolunteer(statement, value);
                statement.addBatch();
            }
            statement.executeBatch();
        }
    }

    private static void bindEmergency(PreparedStatement statement, EmergencyRequest emergency) throws SQLException {
        statement.setString(1, emergency.getId());
        statement.setString(2, emergency.getReporterName());
        statement.setString(3, emergency.getContact());
        statement.setString(4, emergency.getType().name());
        statement.setString(5, emergency.getLocation());
        statement.setInt(6, emergency.getAffectedPeopleCount());
        statement.setString(7, emergency.getDescription());
        statement.setString(8, emergency.getPriority().name());
        statement.setString(9, emergency.getRequiredResourceType().name());
        statement.setString(10, emergency.getStatus().name());
        statement.setString(11, emergency.getAssignedResourceId());
        statement.setString(12, emergency.getAssignedVolunteerId());
        statement.setString(13, emergency.getResolvedAt() == null ? null : emergency.getResolvedAt().toString());
    }

    private static void bindResource(PreparedStatement statement, Resource resource) throws SQLException {
        statement.setString(1, resource.getId());
        statement.setString(2, resource.getName());
        statement.setString(3, resource.getType().name());
        statement.setString(4, resource.getLocation());
        statement.setInt(5, resource.getQuantity());
        statement.setInt(6, resource.isAvailable() ? 1 : 0);
        statement.setString(7, resource.getProvider());
    }

    private static void bindVolunteer(PreparedStatement statement, Volunteer volunteer) throws SQLException {
        statement.setString(1, volunteer.getId());
        statement.setString(2, volunteer.getName());
        statement.setString(3, volunteer.getContact());
        statement.setString(4, volunteer.getLocation());
        statement.setString(5, String.join("|", volunteer.getSkillSet()));
        statement.setString(6, volunteer.getStatus().name());
        statement.setString(7, volunteer.getAssignedEmergencyId());
    }

    private static boolean migrationApplied(Connection connection, String key) throws SQLException {
        try (PreparedStatement statement = connection.prepareStatement(
                "SELECT 1 FROM schema_migrations WHERE migration_key = ?")) {
            statement.setString(1, key);
            try (ResultSet result = statement.executeQuery()) {
                return result.next();
            }
        }
    }

    private static void markMigration(Connection connection, String key) throws SQLException {
        try (PreparedStatement statement = connection.prepareStatement(
                "INSERT INTO schema_migrations (migration_key) VALUES (?)")) {
            statement.setString(1, key);
            statement.executeUpdate();
        }
    }

    private Connection connect() throws SQLException {
        Connection connection = DriverManager.getConnection("jdbc:sqlite:" + databasePath);
        try (Statement statement = connection.createStatement()) {
            statement.execute("PRAGMA busy_timeout = 5000");
            statement.execute("PRAGMA foreign_keys = ON");
        } catch (SQLException exception) {
            connection.close();
            throw exception;
        }
        return connection;
    }

    private static void rollback(Connection connection, Exception failure) {
        try {
            connection.rollback();
        } catch (SQLException rollbackFailure) {
            failure.addSuppressed(rollbackFailure);
        }
    }

    private static IOException storageFailure(String message, Exception cause) {
        return new IOException(message + ": " + cause.getMessage(), cause);
    }
}
