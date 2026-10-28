# ResQNet Backend and SQLite

The Java backend uses SQLite for emergency reports, resources, volunteers, and
authentication accounts. The default database is `data/resqnet.db`.

## One-time CSV import

On its first start, the backend imports any existing `emergencies.csv`,
`resources.csv`, `volunteers.csv`, and `auth_users.csv` files from `data/` into
SQLite. The import is recorded in the database and is not repeated on later
starts. The original CSV files are left untouched as a backup. After migration,
SQLite is the active data store; changing a CSV file will not update the database.

Keep a backup of `data/resqnet.db` while the backend is stopped. To use another
database file, set `RESQNET_DB_PATH` to its path before starting the backend.
The default server port remains 8080 and can be changed with `RESQNET_PORT`.

## Build and run

From the repository root with Java 17 and Maven installed:

```powershell
mvn clean package
mvn exec:java
```

The API starts at `http://localhost:8080`.

## Run from Eclipse

1. Import the repository root as an **Existing Maven Project**.
2. Let Eclipse resolve the Maven dependencies, including the SQLite JDBC driver.
3. Run `com.resqnet.Main` as a Java Application with the repository root as the
   working directory.
4. If needed, add `RESQNET_DB_PATH` and `RESQNET_PORT` in the run configuration's
   Environment tab.

The list APIs accept optional `limit` (1–500) and `offset` query parameters.
The frontend loads large CSV-imported directories in batches rather than
requesting every row in one response.
