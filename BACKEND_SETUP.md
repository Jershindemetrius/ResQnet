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
By default, the backend binds to `0.0.0.0` so a private-LAN frontend can reach
it. Set `RESQNET_BIND_ADDRESS=127.0.0.1` to restrict the backend to this
computer, or set it to a specific local interface address.

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

In Vite development mode, the browser sends API calls to the same-origin
`/api` path. Vite proxies these requests to the Java backend on the host and
removes the browser Origin header, so LAN browser addresses do not need to be
added to the backend CORS allowlist. Direct browser-to-backend requests remain
restricted to `http://localhost:5173` by default; set
`RESQNET_ALLOWED_ORIGINS` to a comma-separated list of exact frontend origins
if direct requests are needed. Never use wildcard origins with credentials.
Production deployments must use HTTPS; when TLS terminates at a reverse proxy, set
`RESQNET_SECURE_COOKIES=true` so the session cookie is marked `Secure`.

## Private Wi-Fi/LAN demonstration

The application uses one Java backend and one SQLite database on the host. A
client computer must open the host's Vite URL; do not start a second backend or
use a client computer's local database. By default, the frontend calls `/api`
on its current origin and Vite proxies those calls to `http://127.0.0.1:8080`.
This avoids hard-coded IP addresses and browser CORS errors. `VITE_API_BASE_URL`
is an optional override for direct API access; leave it unset for the LAN demo.

The host Wi-Fi IPv4 address detected in this environment is
`10.84.181.130`. Vite also advertises `192.168.56.1` and `169.254.83.107` for other local
interfaces. The same-origin proxy works on all three addresses, although only
the Wi-Fi address is normally reachable from another computer. If you choose
direct browser-to-backend requests instead, configure the exact CORS origins:

```powershell
$env:RESQNET_ALLOWED_ORIGINS = "http://localhost:5173,http://10.84.181.130:5173,http://192.168.56.1:5173,http://169.254.83.107:5173"
```

The `169.254.*` address is link-local and the `192.168.56.*` address may be a
virtual-machine adapter; they generally are not suitable for a separate
computer over Wi-Fi. Prefer the host's Wi-Fi address (`10.84.181.130` here).
Addresses can change when interfaces or networks change. Confirm the current
Wi-Fi address on the host with:

```powershell
Get-NetIPAddress -AddressFamily IPv4 |
  Where-Object { $_.InterfaceAlias -match 'Wi-Fi' -and $_.AddressState -eq 'Preferred' } |
  Select-Object -ExpandProperty IPAddress
```

The Wi-Fi profile detected for this host is currently **Public**. Do not open
inbound development-server ports on a public/untrusted network. Only if this is
a trusted private Wi-Fi network, change its profile in an elevated PowerShell
window before adding the private-profile firewall rules:

```powershell
Set-NetConnectionProfile -InterfaceAlias "Wi-Fi" -NetworkCategory Private
```

If the Wi-Fi is not trusted, do not change its profile or add inbound rules;
use a trusted private network instead.

In the host's first PowerShell terminal, from the repository root, start the
only backend process. Leave `RESQNET_ALLOWED_ORIGINS` unset when using the Vite
proxy:

```powershell
$env:RESQNET_BIND_ADDRESS = "127.0.0.1"
mvn exec:java
```

Replace the example address with the current host Wi-Fi address. In a second
host terminal:

```powershell
Set-Location "C:\Karunya\Sem 3\OOPS\ResQNet-Project\frontend"
npm run dev -- --host 0.0.0.0
```

The Vite configuration binds to all interfaces on port 5173 and refuses to
silently select a different port. Open locally on the host:

- `http://localhost:5173/book-ambulance`
- `http://localhost:5173/emergencies`

On each client computer connected to the same reachable private Wi-Fi, open:

- `http://10.84.181.130:5173/book-ambulance`
- `http://10.84.181.130:5173/emergencies`

Use the current Wi-Fi address in place of `10.84.181.130` when it changes.
Client computers run only a browser; they do not run Vite, Java, or SQLite.
Direct nested URLs are handled by the Vite SPA fallback.

### Windows Firewall

The Vite proxy connects to Java on the host loopback interface, so only port
5173 needs to be reachable from client computers. If Windows Firewall blocks
the frontend, run this command in an elevated PowerShell window on a trusted
Private network. It allows only TCP connections from the local subnet:

```powershell
New-NetFirewallRule -DisplayName "ResQNet Vite (Private LAN)" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 5173 -RemoteAddress LocalSubnet -Profile Private
```

Do not create public-profile or internet-wide firewall rules. A router's
wireless client isolation, guest Wi-Fi, VPN policy, or endpoint firewall can
still prevent clients from reaching the host. Do not expose these development
servers to the public internet.

### Shared data and synchronization

SQLite at `data/resqnet.db` is the shared source of truth. Keep the backend
running on the host and back up that file while the backend is stopped. The
dashboard and operational lists refresh from the backend about every 2.5
seconds; synchronization is polling-based, not instantaneous or guaranteed
while a client is offline. Browser form input is not part of the shared state.
Authentication sessions are held in backend memory and must be re-established
after a backend restart. With no `RESQNET_ADMIN_EMAILS` configured, no account
has administrator access.

### Implemented API routes

All paths below are under `/api`. Emergency creation and public listing,
resource/volunteer listing, ambulance inventory, and dashboard summary are
available without an administrator session. Resource and volunteer creation
and availability updates, dispatch, and admin routes require a server-validated
administrator session.

| Method | Route | Purpose |
|---|---|---|
| POST | `/auth/signup`, `/auth/login`, `/auth/logout` | Account registration, login, and logout |
| GET | `/auth/session` | Check the current server session |
| GET, POST | `/emergencies` | List emergencies or submit a report |
| GET | `/ambulances` | Read paginated ambulance inventory and totals |
| GET, POST | `/resources` | List or register resources |
| PUT | `/resources/{id}/availability` | Change resource availability |
| GET, POST | `/volunteers` | List or register volunteers; admin POST with an ID updates status |
| GET | `/dispatch/{id}/suggestions` | Suggest compatible resources and volunteers |
| POST | `/dispatch/match` | Assign available resources/volunteers to a pending emergency |
| PUT | `/dispatch/status` | Advance an emergency through its supported lifecycle |
| GET | `/dashboard` | Read shared operational statistics |
| GET | `/admin/dashboard`, `/admin/incidents` | Read administrator dashboard and incident data |

Status progression is `PENDING` → `RESOURCE_ASSIGNED` → `RESPONDING` →
`ON_SITE` → `RESOLVED`. The current model does not implement cancellation,
driver telemetry, hospital management, or separate dispatch-record queries.

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
