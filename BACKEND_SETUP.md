# ResQNet Backend and SQLite

The Java backend uses SQLite for emergency reports, resources, volunteers, and
authentication accounts. The default database is `data/resqnet.db`.

## One-time CSV import

On its first start, the backend imports any existing `emergencies.csv`,
`resources.csv`, `volunteers.csv`, and `auth_users.csv` files from `data/` into
SQLite. The import is recorded in the database and is not repeated on later
starts. The CSV files are read-only during migration, but they might not contain
a complete backup of previously stored data. SQLite is the active data store
after migration; changing a CSV file will not update the database. In this
project, the historical emergency records were recovered directly into
`data/resqnet.db`, while `emergencies.csv` may still contain only its header.

Keep a backup of `data/resqnet.db` while the backend is stopped. To use another
database file, set `RESQNET_DB_PATH` to its path before starting the backend.
The default server port remains 8080 and can be changed with `RESQNET_PORT`.

## Administrator access

The admin workspace and operational APIs require a backend-issued, HttpOnly
session. The server assigns the `ADMIN` role only to emails in the
comma-separated `RESQNET_ADMIN_EMAILS` allowlist. Public signup is rejected for
allowlisted addresses, preventing a visitor from claiming an administrator
address through the signup form. With no allowlist configured, no account has
admin access.

Provision each administrator before exposing the service: start the backend in
a trusted, private setup environment without `RESQNET_ADMIN_EMAILS`, create the
administrator's account using the intended email and a strong password, stop
the backend, then restart it with that email in the allowlist. For example, in
PowerShell:

```powershell
$env:RESQNET_ADMIN_EMAILS = "admin@example.org"
mvn exec:java
```

Changing the allowlist takes effect after a backend restart and existing
sessions are invalidated on restart. Sessions expire after eight hours and are
held in server memory. Dashboard endpoints and operational writes are
role-checked by the backend; the frontend route guard is an additional usability
layer, not the security boundary. Public incident/resource feeds and citizen
reporting remain public.

Credentialed browser requests are limited to `http://localhost:5173` by
default. Set `RESQNET_ALLOWED_ORIGINS` to a comma-separated list of exact
frontend origins for other environments (no wildcards). Production deployments
must use HTTPS; when TLS terminates at a reverse proxy, set
`RESQNET_SECURE_COOKIES=true` so the session cookie is marked `Secure`.
Keep the frontend and API on the same site so the `SameSite=Strict` session
cookie is sent with browser API requests.

## Build and run

From the repository root with Java 17 and Maven installed:

```powershell
mvn clean package
mvn exec:java
```

The API starts at `http://localhost:8080`.
If another backend is already using port 8080, stop that instance before
starting a second one. For a second instance, set `RESQNET_PORT` to an available
port and set the frontend's `VITE_API_BASE_URL` to that same port.

## Run from Eclipse

1. If this project is already open in Eclipse, right-click it and select
   **Configure > Convert to Maven Project** (or remove it from the workspace
   without deleting files, then use **File > Import > Maven > Existing Maven
   Projects** and select this repository root).
2. Right-click the project and select **Maven > Update Project...**. Select the
   project and click **OK** to resolve `sqlite-jdbc` from `pom.xml`.
3. Confirm **Maven Dependencies** appears in the project's **Java Build Path**.
   The project's `.project` and `.classpath` files include the Maven nature and
   dependency container so ordinary **Run As > Java Application** launch
   configurations include the SQLite driver.
4. Run `com.resqnet.Main` as a Java Application with the repository root as the
   working directory.
5. Add any required `RESQNET_DB_PATH`, `RESQNET_PORT`,
   `RESQNET_ADMIN_EMAILS`, and `RESQNET_ALLOWED_ORIGINS` values in the run
   configuration's Environment tab.
   If Eclipse reports that the address is already in use, stop the earlier
   backend from its Eclipse Console/Terminate button, or use another port and
   update `VITE_API_BASE_URL` in the frontend's `.env` file to match.

If startup reports that the SQLite JDBC driver is missing, Eclipse has not
resolved the Maven dependency yet. Run **Maven > Update Project...** and verify
that Maven Dependencies includes `org.xerial:sqlite-jdbc:3.46.1.0` before
launching again. Alternatively, start from the repository root with
`mvn exec:java`, which includes the Maven runtime dependencies.
The `slf4j-nop` dependency suppresses SQLite's optional SLF4J logger warning;
the application uses `java.util.logging` for its own startup messages.

The list APIs accept optional `limit` (1–500) and `offset` query parameters.
The frontend loads large CSV-imported directories in batches rather than
requesting every row in one response.
