# ResQNet Frontend

A modern, responsive React frontend for the ResQNet Emergency Resource Management System.

## 🎨 Features

### 📊 Dashboard View
- Backend-backed overview of active emergencies
- Available resources and volunteers statistics
- Priority breakdown visualization
- Recent emergency requests display
- System status indicators

### 🚨 Report Emergency
- Comprehensive emergency reporting form
- Multiple emergency types (Medical, Fire, Flood, Accident, Earthquake, etc.)
- Priority level selection (Critical, High, Medium, Low)
- Location and affected people tracking
- Required resources specification

### 🎯 Dispatch Center
- **Main Feature**: Emergency management hub
- View paginated emergency requests with filtering
- Select emergencies to view detailed information
- **Automatic Resource Matching**: System suggests best matching resources based on:
  - GPS proximity when coordinates are supplied, otherwise location-name similarity
  - Resource availability
  - Emergency type and requirements
- Backend-persisted status progression (Pending → Resource Assigned → Responding → On Site → Resolved)
- One-click resource assignment
- Backend-confirmed status updates

### 📦 Resource Inventory
- Complete resource management system
- Add new resources (Ambulances, Fire Trucks, Medical Kits, Food, Water, Shelter, etc.)
- Filter by resource type and availability
- Toggle availability status
- Track resource location and provider
- Inventory summary statistics

### 👷 Volunteer Directory
- Volunteer registration and management
- Skill-based filtering (First Aid, Medical, Firefighting, Rescue, Driver, etc.)
- Availability status tracking
- Location-based volunteer listing
- Emergency assignment tracking
- Volunteer summary statistics

## 🏗️ Technology Stack

- **React 18.3.1** - Modern UI library
- **React Router DOM 6.22.0** - Client-side routing
- **Vite 5.4.14** - Fast build tool and dev server
- **CSS3** - Custom styling with modern features

## 📦 Installation

```bash
cd frontend
npm install
```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```
The application will start at `http://localhost:5173`

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 🔧 Configuration

The API base URL can be configured using environment variables:

Copy `.env.example` to `.env` in the frontend directory:
```env
VITE_API_BASE_URL=http://localhost:8080/api
```

For local development, start the Java backend before using the dashboard, report
form, directories, or account page. These pages display backend responses and
show an error when the API cannot be reached; they do not fill in demo values.

### Free map tiles

The map uses OpenStreetMap tiles by default and does not require an API key.
Incident markers are shown only for backend records whose location includes
valid GPS coordinates. Name-only locations remain in the incident feed, but are
not guessed or geocoded.

To use a different tile provider, set `VITE_MAP_TILE_URL` to its URL template
and `VITE_MAP_ATTRIBUTION` to the provider's required attribution, then restart
Vite or rebuild:

```env
VITE_MAP_TILE_URL=https://tile-provider.example/{z}/{x}/{y}?key=YOUR_API_KEY
VITE_MAP_ATTRIBUTION=Map tiles © Your provider
```

Vite variables are shipped to browsers. Only use a public, domain-restricted
browser key; never put a private or secret key in frontend configuration.

## 📁 Project Structure

```
frontend/
├── src/
│   ├── api/
│   │   └── resqnetApi.js          # API client functions
│   ├── components/
│   │   ├── DispatchMap.jsx         # OpenStreetMap with persisted GPS locations
│   │   ├── PriorityBadge.jsx       # Priority level indicator
│   │   └── StatusTimeline.jsx      # Emergency status progression
│   ├── pages/
│   │   ├── DashboardView.jsx       # Main dashboard
│   │   ├── ReportEmergencyView.jsx # Emergency reporting form
│   │   ├── auth/LoginPage.tsx      # Backend account sign-in and signup
│   │   ├── DispatchCenterView.jsx  # Emergency management hub
│   │   ├── ResourceInventoryView.jsx # Resource management
│   │   └── VolunteerDirectoryView.jsx # Volunteer management
│   ├── App.jsx                     # Main app component with routing
│   ├── main.jsx                    # React entry point
│   └── index.css                   # Global styles
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## 🎯 Key Features Explained

### Automatic Resource Matching
When an emergency is reported as "Pending" in the Dispatch Center:
1. System analyzes emergency location, type, and requirements
2. Searches available resources database
3. Calculates proximity and suitability
4. Displays recommended resources with distance
5. Coordinator can assign all resources with one click
6. Status automatically updates to "Resource Assigned"

### Status Workflow
```
PENDING
   ↓
RESOURCE_ASSIGNED
   ↓
RESPONDING
   ↓
ON_SITE
   ↓
RESOLVED
```

### Priority System
- 🔴 **CRITICAL** - Immediate life-threatening emergencies
- 🟠 **HIGH** - Serious situations requiring urgent response
- 🟡 **MEDIUM** - Important but not immediately critical
- 🟢 **LOW** - General assistance requests

## 🎨 UI/UX Highlights

- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Intuitive Navigation**: Clear routing with active state indicators
- **Color-Coded Priority**: Visual priority system for quick assessment
- **Status Timeline**: Visual representation of backend-persisted emergency progression
- **Backend-backed Updates**: Changes are shown only after the backend accepts them
- **Empty States**: Helpful messages when no data is available
- **Error Handling**: User-friendly error messages with retry options
- **Loading States**: Clear indicators during data fetching

## 🔌 API Integration

The frontend communicates with the Java backend API:

### Endpoints Used
- `GET /api/dashboard` - Dashboard statistics
- `POST /api/auth/signup` and `POST /api/auth/login` - Create or verify an account; login issues an HttpOnly session cookie
- `GET /api/auth/session` and `POST /api/auth/logout` - Restore or revoke the current browser session
- `GET /api/admin/dashboard` and `GET /api/admin/incidents` - Administrator-only operations data
- `GET /api/emergencies?limit=100&offset=0` - List a page of emergencies
- `POST /api/emergencies` - Create an emergency (`reporterName`, `contact`, `type`, `location`, `affectedPeopleCount`, `priority`, and `requiredResourceType`)
- `PUT /api/dispatch/status` - Update emergency status (`emergencyId` and `status` in the JSON body; administrator session required)
- `GET /api/resources?limit=100&offset=0` - List a page of resources
- `POST /api/resources` - Add a resource (`name`, `type`, `location`, `quantity`, and optional `provider`; administrator session required)
- `PUT /api/resources/{id}/availability` - Update resource availability (administrator session required)
- `GET /api/volunteers?limit=100&offset=0` - List a page of volunteers
- `POST /api/volunteers` - Register new volunteer
- `POST /api/volunteers` - Update volunteer availability (`id` and `status` in the JSON body; administrator session required)
- `GET /api/dispatch/{id}/suggestions` - Preview the best currently available resource and volunteer without assigning them (administrator session required)
- `POST /api/dispatch/match` - Match and assign available units (`emergencyId` in the JSON body; administrator session required)

List endpoints accept optional `limit` (1–500) and `offset` query parameters, for example
`GET /api/resources?limit=100&offset=0`. The frontend loads records in batches to avoid
transferring the entire CSV-backed dataset in a single request; use the directory's
“Load next” button to fetch subsequent batches. Requests without these parameters retain
the unpaged array response for existing clients.

The Java backend uses SQLite as its active store. CSVs are read during one-time import and are not rewritten, but they may not contain complete historical backups. See [BACKEND_SETUP.md](../BACKEND_SETUP.md) for database configuration and Eclipse/Maven setup.

List endpoints accept optional `limit` (1–500) and `offset` query parameters to keep large database responses bounded. Directories provide a “Load next” button to fetch subsequent pages.

## Backend capability boundaries

Account sign-in and signup call the Java backend, which stores account
credentials in SQLite. Successful sign-in creates an eight-hour, server-side
session represented by an HttpOnly, SameSite cookie. The admin page and
operational write routes verify the administrator role on the backend; the
React route guard is only a usability layer. Administrator email addresses
must be provisioned using `RESQNET_ADMIN_EMAILS` as described in
[BACKEND_SETUP.md](../BACKEND_SETUP.md). Public incident/resource feeds and
citizen emergency/volunteer submissions remain public. Driver telematics,
vehicle GPS tracking, hospital capacity, audit, and system-configuration
screens are not backed by APIs and are disabled.

## 🌟 Best Practices Implemented

- **Component-Based Architecture**: Reusable, maintainable components
- **Separation of Concerns**: API logic separated from UI components
- **State Management**: Efficient React hooks usage
- **Error Handling**: Comprehensive error catching and user feedback
- **Accessibility**: Semantic HTML and ARIA labels
- **Performance**: Optimized rendering and API calls
- **Code Organization**: Clear file structure and naming conventions

## 🚀 Future Enhancements

- Real-time notifications using WebSockets
- GPS coordinate storage and live map locations
- Advanced filtering and search capabilities
- Export emergency reports
- User authentication and role-based access
- Mobile app version
- Multi-language support
- Dark mode theme

## 📱 Responsive Breakpoints

- **Desktop**: > 768px (full layout)
- **Tablet**: 768px (adjusted grid layouts)
- **Mobile**: < 768px (stacked layouts, simplified navigation)

## 🎓 For Project Presentation

### Highlight These Points:
1. **Automatic Resource Matching Algorithm**: Core innovation of the system
2. **Persisted Status Tracking**: Visual timeline showing backend emergency progression
3. **Comprehensive Resource Management**: Complete inventory system
4. **Volunteer Coordination**: Skill-based volunteer matching
5. **User-Friendly Interface**: Intuitive design for emergency situations
6. **Scalable Architecture**: Modern React best practices

### Demo Flow:
1. Show Dashboard with statistics
2. Report a new emergency with critical priority
3. Navigate to Dispatch Center
4. Demonstrate automatic resource matching
5. Assign resources and update status
6. Show resource and volunteer management

## 📄 License

This project is part of the ResQNet Emergency Management System.

---

Built with ❤️ for emergency response coordination
