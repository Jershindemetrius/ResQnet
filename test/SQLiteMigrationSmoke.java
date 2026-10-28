import com.resqnet.model.emergency.EmergencyRequest;
import com.resqnet.model.enums.EmergencyType;
import com.resqnet.model.enums.PriorityLevel;
import com.resqnet.model.enums.RequestStatus;
import com.resqnet.model.enums.ResourceType;
import com.resqnet.model.resource.Resource;
import com.resqnet.model.resource.Vehicle;
import com.resqnet.model.user.Volunteer;
import com.resqnet.service.AuthManager;
import com.resqnet.storage.SQLiteStorageManager;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;

public final class SQLiteMigrationSmoke {
    private SQLiteMigrationSmoke() { }

    public static void main(String[] args) throws Exception {
        Path database = Paths.get(args[0]);
        Path legacy = Paths.get(args[1]);
        long emergencyCsvSize = Files.size(legacy.resolve("emergencies.csv"));
        long resourceCsvSize = Files.size(legacy.resolve("resources.csv"));
        long volunteerCsvSize = Files.size(legacy.resolve("volunteers.csv"));

        SQLiteStorageManager storage = new SQLiteStorageManager(database, legacy);
        int emergencyCount = storage.loadEmergencies().size();
        int resourceCount = storage.loadResources().size();
        int volunteerCount = storage.loadVolunteers().size();
        if (emergencyCount != 100000 || resourceCount < 50000 || volunteerCount < 50000) {
            throw new AssertionError("CSV migration imported unexpected record totals: "
                    + emergencyCount + ", " + resourceCount + ", " + volunteerCount);
        }
        if (args.length > 2 && "import-only".equals(args[2])) {
            System.out.println("SQLite import passed: " + emergencyCount + " emergencies, "
                    + resourceCount + " resources, " + volunteerCount + " volunteers.");
            return;
        }

        Resource resource = new Vehicle("SMOKE-R", "Smoke Vehicle", "Kovilpatti", 1, true, "Smoke Test");
        Volunteer volunteer = new Volunteer("SMOKE-V", "Smoke Volunteer", "9000000000", "Kovilpatti",
                Arrays.asList("First Aid"), Volunteer.Status.AVAILABLE, null);
        EmergencyRequest emergency = new EmergencyRequest("SMOKE-E", "Smoke Reporter", "9000000000",
                EmergencyType.MEDICAL, "Kovilpatti", 1, "SQLite persistence smoke test",
                PriorityLevel.MEDIUM, ResourceType.VEHICLE);
        emergency.setAssignedResourceId(resource.getId());
        emergency.setAssignedVolunteerId(volunteer.getId());
        emergency.setStatus(RequestStatus.RESOURCE_ASSIGNED);
        storage.saveDispatch(emergency, resource, volunteer);

        SQLiteStorageManager restarted = new SQLiteStorageManager(database, legacy);
        List<EmergencyRequest> emergencies = restarted.loadEmergencies();
        if (emergencies.size() != emergencyCount + 1
                || emergencies.stream().noneMatch(value -> "SMOKE-E".equals(value.getId()))) {
            throw new AssertionError("Emergency writes were not persisted");
        }
        if (restarted.loadResources().stream().noneMatch(value -> "SMOKE-R".equals(value.getId()))
                || restarted.loadVolunteers().stream().noneMatch(value -> "SMOKE-V".equals(value.getId()))) {
            throw new AssertionError("Related dispatch records were not persisted");
        }

        Path accountsFile = legacy.resolve("auth_users.csv");
        AuthManager auth = new AuthManager(database, accountsFile);
        char[] password = "SmokeTestPassword1".toCharArray();
        auth.register("Smoke Test", "smoke@example.test", password);
        AuthManager restartedAuth = new AuthManager(database, accountsFile);
        if (restartedAuth.authenticate("SMOKE@example.test", password) == null) {
            throw new AssertionError("SQLite account registration did not persist");
        }
        Arrays.fill(password, '\0');

        if (Files.size(legacy.resolve("emergencies.csv")) != emergencyCsvSize
                || Files.size(legacy.resolve("resources.csv")) != resourceCsvSize
                || Files.size(legacy.resolve("volunteers.csv")) != volunteerCsvSize) {
            throw new AssertionError("CSV source files changed during migration");
        }
        System.out.println("SQLite migration and persistence smoke test passed: "
                + emergencyCount + " emergencies, " + resourceCount + " resources, "
                + volunteerCount + " volunteers.");
    }
}
