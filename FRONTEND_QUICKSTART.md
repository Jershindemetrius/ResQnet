# 🚀 ResQNet Frontend - Quick Start Guide

## What You Have

A complete, production-ready React frontend for your ResQNet Emergency Management System with:

✅ **5 Complete Views**:
1. 📊 Dashboard - Real-time overview
2. 🚨 Report Emergency - Citizen reporting form
3. 🎯 Dispatch Center - Emergency management hub (MAIN FEATURE)
4. 📦 Resource Inventory - Resource management
5. 👷 Volunteer Directory - Volunteer coordination

✅ **Key Features**:
- Automatic Resource Matching Engine
- Status Timeline Visualization
- Priority-based Emergency Handling
- Complete CRUD operations
- Responsive Design
- Error Handling

## Installation & Running

### Step 1: Install Dependencies
```bash
cd frontend
npm install
```

This will install:
- React 18.3.1
- React Router DOM 6.22.0
- Vite 5.4.14
- And all required development dependencies

### Step 2: Start Development Server
```bash
npm run dev
```

The application will start at: **http://localhost:5173**

### Step 3: Ensure Backend is Running
Make sure your Java backend is running on: **http://localhost:8080**

If your backend is on a different port, create a `.env` file:
```env
VITE_API_BASE_URL=http://localhost:YOUR_PORT/api
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── api/
│   │   └── resqnetApi.js          # All API calls
│   ├── components/
│   │   ├── Navbar.jsx              # Navigation with routing
│   │   ├── PriorityBadge.jsx       # Priority indicator
│   │   ├── StatCard.jsx            # Statistics display
│   │   └── StatusTimeline.jsx      # Status progression visual
│   ├── pages/
│   │   ├── DashboardView.jsx       # Main dashboard
│   │   ├── ReportEmergencyView.jsx # Report form
│   │   ├── DispatchCenterView.jsx  # Emergency management ⭐
│   │   ├── ResourceInventoryView.jsx # Resource CRUD
│   │   └── VolunteerDirectoryView.jsx # Volunteer CRUD
│   ├── App.jsx                     # Routes & layout
│   ├── main.jsx                    # React entry point
│   └── index.css                   # All styles
├── index.html
├── package.json
├── vite.config.js
├── .env.example
└── README.md                       # Detailed documentation
```

## 🎯 Testing the Application

### Test Flow 1: Report Emergency
1. Go to http://localhost:5173
2. Click "Report Emergency" in navbar
3. Fill out the form:
   - Name: Test User
   - Contact: 1234567890
   - Type: Medical Emergency
   - Priority: Critical
   - Location: Kovilpatti
   - People: 2
   - Description: Accident on highway
4. Click Submit
5. Should redirect to Dispatch Center

### Test Flow 2: Resource Matching (Main Feature)
1. Go to Dispatch Center
2. Click on the emergency you just created
3. Right panel shows emergency details
4. System automatically shows "Recommended Resources"
5. Resources are sorted by distance from emergency
6. Click "Assign All Recommended Resources"
7. Status updates to "RESOURCE_ASSIGNED"
8. Continue updating status through the timeline

### Test Flow 3: Add Resource
1. Go to "Resources" tab
2. Click "+ Add Resource"
3. Fill in details:
   - Type: Ambulance
   - Quantity: 1
   - Location: Kovilpatti Hospital
   - Provider: City Hospital
4. Submit
5. Resource appears in grid
6. Toggle availability as needed

### Test Flow 4: Register Volunteer
1. Go to "Volunteers" tab
2. Click "+ Register Volunteer"
3. Fill in details:
   - Name: John Doe
   - Contact: 9876543210
   - Skills: First Aid
   - Location: Kovilpatti
4. Submit
5. Volunteer appears in directory

## 🔧 Backend API Endpoints Required

Your Java backend should implement these endpoints:

```
GET    /api/dashboard                      → Dashboard stats
GET    /api/emergencies                    → List emergencies
POST   /api/emergencies                    → Create emergency
PUT    /api/emergencies/{id}/status        → Update status
GET    /api/resources                      → List resources
POST   /api/resources                      → Create resource
PUT    /api/resources/{id}/availability    → Update availability
GET    /api/volunteers                     → List volunteers
POST   /api/volunteers                     → Register volunteer
PUT    /api/volunteers/{id}/availability   → Update availability
GET    /api/dispatch/{id}/suggestions      → Get matching resources ⭐
POST   /api/dispatch/{id}/assign           → Assign resources
```

## 🎨 UI Features

### Navigation
- Top navbar with active page highlighting
- 5 main navigation links
- Responsive mobile menu

### Dashboard
- 4 statistics cards with color coding
- Priority breakdown
- Recent emergencies list
- System status indicators

### Report Emergency
- Comprehensive form with validation
- Multiple emergency types
- Priority selection
- Success feedback with auto-redirect

### Dispatch Center (⭐ Main Feature)
- **Left Panel**: Emergency list with filtering
- **Right Panel**: 
  - Emergency details
  - Status timeline
  - Automatic resource suggestions
  - Status update buttons
  - Resource assignment

### Resources & Volunteers
- Filtering by type/skill and availability
- Add new items with forms
- Toggle availability
- Summary statistics

## 🎓 For Presentation

### Demonstrate These:

1. **Dashboard Overview** (30 seconds)
   - Show statistics
   - Priority distribution
   - Recent emergencies

2. **Report Emergency** (1 minute)
   - Fill and submit form
   - Show validation
   - Demonstrate redirect

3. **Resource Matching** (2 minutes) ⭐ HIGHLIGHT THIS
   - Open Dispatch Center
   - Select pending emergency
   - Show automatic suggestions
   - Explain the algorithm:
     - Distance calculation
     - Availability check
     - Type matching
   - Assign resources
   - Show status update

4. **Status Progression** (1 minute)
   - Show timeline visualization
   - Update through stages
   - Mark as resolved

5. **Resource Management** (30 seconds)
   - Add new resource
   - Toggle availability

6. **Volunteer Management** (30 seconds)
   - Register volunteer
   - Show skill-based filtering

### Key Talking Points:

1. **Problem**: During emergencies, information is scattered
2. **Solution**: Centralized system with automatic matching
3. **Innovation**: Resource matching algorithm
4. **Benefits**: 
   - Faster response time
   - Optimal resource allocation
   - Complete tracking
   - Reduced confusion
5. **Technology**: Modern React with Vite
6. **Scalability**: Modular architecture

## 🐛 Troubleshooting

### Issue: "Failed to fetch"
- **Cause**: Backend not running or wrong URL
- **Fix**: Ensure Java backend is running on port 8080

### Issue: "CORS Error"
- **Cause**: Backend CORS not configured
- **Fix**: Check CorsFilter.java in your backend

### Issue: Blank page
- **Cause**: JavaScript error
- **Fix**: Check browser console (F12)

### Issue: Styles not loading
- **Cause**: Build issue
- **Fix**: Stop server, run `npm run dev` again

## 📝 Build Commands

### Development
```bash
npm run dev          # Start dev server with hot reload
```

### Production
```bash
npm run build        # Build for production (creates dist/)
npm run preview      # Preview production build
```

## 🌟 What Makes This Special

Your ResQNet frontend stands out because:

1. **Complete Feature Set**: Not just a UI, but a fully functional system
2. **Automatic Matching**: The resource matching algorithm is the innovation
3. **Professional Design**: Modern, clean, intuitive interface
4. **Real-World Ready**: Error handling, validation, responsive design
5. **Scalable Code**: Well-organized, reusable components
6. **Production Quality**: Ready for actual deployment

## 💡 Tips for Demo

1. **Prepare Test Data**: Have backend populated with sample emergencies, resources, and volunteers
2. **Practice Flow**: Test the entire workflow before presentation
3. **Emphasize Innovation**: Spend most time on the resource matching feature
4. **Show Responsiveness**: Resize browser to show mobile view
5. **Explain Architecture**: Mention React, component structure, API integration
6. **Discuss Future**: Talk about potential enhancements

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Verify backend is running
3. Check network tab in browser dev tools
4. Ensure all dependencies are installed

## ✅ Checklist Before Presentation

- [ ] npm install completed successfully
- [ ] Backend server is running
- [ ] Frontend dev server starts without errors
- [ ] Can navigate to all pages
- [ ] Can submit emergency form
- [ ] Can see resource suggestions in Dispatch Center
- [ ] Can add resources and volunteers
- [ ] All API calls working
- [ ] Tested on different screen sizes
- [ ] Prepared talking points

---

## 🎉 You're Ready!

Your ResQNet frontend is complete and ready for demonstration. The automatic resource matching feature in the Dispatch Center is your project's standout innovation. 

**Good luck with your presentation!** 🚀

For detailed documentation, see `frontend/README.md`
