# ResQNet Frontend

A modern, responsive React frontend for the ResQNet Emergency Resource Management System.

## 🎨 Features

### 📊 Dashboard View
- Real-time overview of active emergencies
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
- View all emergency requests with filtering
- Select emergencies to view detailed information
- **Automatic Resource Matching**: System suggests best matching resources based on:
  - Proximity to emergency location
  - Resource availability
  - Emergency type and requirements
- Status timeline visualization (Pending → Resource Assigned → Responding → On Site → Resolved)
- One-click resource assignment
- Real-time status updates

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

Create a `.env` file in the frontend directory:
```env
VITE_API_BASE_URL=http://localhost:8080/api
```

Default: `http://localhost:8080/api`

## 📁 Project Structure

```
frontend/
├── src/
│   ├── api/
│   │   └── resqnetApi.js          # API client functions
│   ├── components/
│   │   ├── Navbar.jsx              # Navigation bar with routing
│   │   ├── PriorityBadge.jsx       # Priority level indicator
│   │   ├── StatCard.jsx            # Dashboard statistics card
│   │   └── StatusTimeline.jsx      # Emergency status progression
│   ├── pages/
│   │   ├── DashboardView.jsx       # Main dashboard
│   │   ├── ReportEmergencyView.jsx # Emergency reporting form
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
- **Status Timeline**: Visual representation of emergency progression
- **Real-time Updates**: Immediate feedback on all actions
- **Empty States**: Helpful messages when no data is available
- **Error Handling**: User-friendly error messages with retry options
- **Loading States**: Clear indicators during data fetching

## 🔌 API Integration

The frontend communicates with the Java backend API:

### Endpoints Used
- `GET /api/dashboard` - Dashboard statistics
- `GET /api/emergencies` - List all emergencies
- `POST /api/emergencies` - Create new emergency
- `PUT /api/emergencies/{id}/status` - Update emergency status
- `GET /api/resources` - List all resources
- `POST /api/resources` - Add new resource
- `PUT /api/resources/{id}/availability` - Update resource availability
- `GET /api/volunteers` - List all volunteers
- `POST /api/volunteers` - Register new volunteer
- `PUT /api/volunteers/{id}/availability` - Update volunteer availability
- `GET /api/dispatch/{id}/suggestions` - Get matching suggestions
- `POST /api/dispatch/{id}/assign` - Assign resources to emergency

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
- Map integration for location visualization
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
2. **Real-time Status Tracking**: Visual timeline showing emergency progression
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
