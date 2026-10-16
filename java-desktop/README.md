# ResQNet - Community Emergency Resource Management System
## Java Desktop Application

## 🎯 Project Overview

ResQNet is a comprehensive Java-based desktop application designed to manage community emergency responses efficiently. The system enables citizens to report emergencies, coordinators to manage resources and volunteers, and automatically matches the best available resources to emergency requests based on location, priority, and availability.

### Key Innovation: **Automatic Resource Matching Engine**

The system doesn't just store emergency reports—it actively analyzes and recommends the most suitable resources and volunteers for each emergency based on:
- Emergency type and priority
- Resource/volunteer availability
- Location proximity
- Required skills and resources
- Match scoring algorithm

## 📋 Table of Contents

1. [Features](#features)
2. [User Roles](#user-roles)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Database Setup](#database-setup)
6. [Installation & Running](#installation--running)
7. [Login Credentials](#login-credentials)
8. [Module Overview](#module-overview)
9. [Java Concepts Used](#java-concepts-used)
10. [Testing](#testing)

## ✨ Features

### Core Functionality
- **Emergency Reporting**: Citizens can report emergencies with detailed information
- **Priority-Based Queue**: Automatic prioritization (CRITICAL → HIGH → MEDIUM → LOW)
- **Resource Management**: Complete CRUD operations for emergency resources
- **Volunteer Coordination**: Manage volunteer availability and skills
- **Automatic Resource Matching**: AI-powered matching engine
- **Status Tracking**: Complete lifecycle tracking from PENDING to RESOLVED
- **Dashboard Analytics**: Real-time statistics and insights
- **Role-Based Access Control**: Secure access based on user roles
- **Reports & History**: Comprehensive reporting system

### Emergency Workflow
```
Citizen Reports Emergency
         ↓
System Stores & Prioritizes
         ↓
Coordinator Views Request
         ↓
Automatic Matching Suggests Resources
         ↓
Coordinator Assigns Resources/Volunteers
         ↓
Status: RESOURCE_ASSIGNED → RESPONDING → ON_SITE
         ↓
Emergency RESOLVED
         ↓
Resources & Volunteers Become Available
```

## 👥 User Roles

### 1. **Citizen**
- Register and login
- Report emergency requests
- View own emergency requests
- Track request status
- Cancel pending requests

### 2. **Volunteer**
- Register and login
- Add skills, location, availability
- View assigned emergencies
- Update availability status
- Update emergency response status

### 3. **Resource Provider**
- Register and login
- Add emergency resources
- Update resource details
- View resource assignments
- Manage availability

### 4. **Emergency Coordinator**
- View all emergency requests
- Use automatic resource matching
- Assign resources and volunteers
- Update emergency status
- Mark emergencies as resolved
- Access dashboard analytics

### 5. **Administrator**
- Full system access
- Manage all users
- Manage all resources and volunteers
- View comprehensive reports
- System configuration

## 🛠️ Technology Stack

- **Programming Language**: Java 8+
- **GUI Framework**: Java Swing
- **Database**: MySQL 8.0+
- **Database Connectivity**: JDBC
- **Password Hashing**: BCrypt
- **Design Pattern**: MVC (Model-View-Controller)
- **Build Tool**: Maven (optional) or standard Java compilation

## 📁 Project Structure

```
java-desktop/
├── src/
│   └── com/
│       └── resqnet/
│           ├── main/
│           │   └── Main.java
│           ├── model/
│           │   ├── User.java
│           │   ├── Citizen.java
│           │   ├── Volunteer.java
│           │   ├── ResourceProvider.java
│           │   ├── Coordinator.java
│           │   ├── Administrator.java
│           │   ├── EmergencyRequest.java
│           │   ├── Resource.java
│           │   ├── Assignment.java
│           │   └── MatchResult.java
│           ├── dao/
│           │   ├── UserDAO.java
│           │   ├── EmergencyRequestDAO.java
│           │   ├── ResourceDAO.java
│           │   ├── VolunteerDAO.java
│           │   ├── AssignmentDAO.java
│           │   └── ReportDAO.java
│           ├── service/
│           │   ├── AuthService.java
│           │   ├── EmergencyService.java
│           │   ├── ResourceService.java
│           │   ├── VolunteerService.java
│           │   ├── MatchingEngine.java
│           │   └── ReportService.java
│           ├── ui/
│           │   ├── LoginFrame.java
│           │   ├── SignupFrame.java
│           │   ├── CitizenDashboard.java
│           │   ├── CoordinatorDashboard.java
│           │   ├── AdminDashboard.java
│           │   ├── ReportEmergencyPanel.java
│           │   ├── MyRequestsPanel.java
│           │   ├── EmergencyManagementPanel.java
│           │   ├── ResourceManagementPanel.java
│           │   ├── VolunteerManagementPanel.java
│           │   ├── ResourceMatchingPanel.java
│           │   └── ReportsPanel.java
│           └── util/
│               ├── DBConnection.java
│               ├── ValidationUtil.java
│               ├── PasswordUtil.java
│               ├── IDGenerator.java
│               └── DateUtil.java
├── database/
│   ├── resqnet_schema.sql
│   └── sample_data.sql
├── lib/
│   ├── mysql-connector-java-8.0.x.jar
│   └── bcrypt-x.x.x.jar
├── config/
│   └── db.properties
└── README.md
```

## 🗄️ Database Setup

### Prerequisites
- MySQL 8.0 or higher installed
- MySQL server running

### Setup Steps

1. **Start MySQL Server**
   ```bash
   # On Mac
   mysql.server start
   
   # On Windows (as Administrator)
   net start MySQL80
   ```

2. **Login to MySQL**
   ```bash
   mysql -u root -p
   ```

3. **Create Database and Tables**
   ```bash
   source /path/to/resqnet_schema.sql
   ```

4. **Insert Sample Data**
   ```bash
   source /path/to/sample_data.sql
   ```

5. **Verify Installation**
   ```sql
   USE resqnet_db;
   SHOW TABLES;
   SELECT * FROM users;
   ```

### Database Tables

1. **users** - Store user accounts
2. **emergency_requests** - Store emergency reports
3. **resources** - Store emergency resources
4. **volunteers** - Store volunteer information
5. **assignments** - Track resource/volunteer assignments
6. **emergency_updates** - Log status changes

## 🚀 Installation & Running

### Step 1: Download Required Libraries

Download and place in `lib/` folder:
- [MySQL Connector/J](https://dev.mysql.com/downloads/connector/j/)
- [jBCrypt](https://www.mindrot.org/projects/jBCrypt/)

### Step 2: Configure Database Connection

Create `config/db.properties`:
```properties
db.url=jdbc:mysql://localhost:3306/resqnet_db
db.username=root
db.password=your_mysql_password
db.driver=com.mysql.cj.jdbc.Driver
```

### Step 3: Compile the Project

```bash
cd java-desktop

# Compile all Java files
javac -d bin -cp "lib/*" src/com/resqnet/**/*.java
```

### Step 4: Run the Application

```bash
# Run the main class
java -cp "bin:lib/*" com.resqnet.main.Main
```

## 🔑 Login Credentials

### Sample Users for Testing

| Role | Username | Password |
|------|----------|----------|
| Administrator | admin | admin123 |
| Coordinator | coordinator | coord123 |
| Citizen | citizen1 | citizen123 |
| Volunteer | volunteer1 | volunteer123 |
| Resource Provider | provider1 | provider123 |

**Note**: In production, these passwords are hashed using BCrypt.

## 📚 Module Overview

### 1. User Management Module
- User registration with role selection
- Secure login with password hashing
- Profile management
- Role-based dashboard redirection

### 2. Emergency Request Module
- Submit emergency requests with details
- Auto-generate unique Request IDs (ER101, ER102...)
- Support multiple emergency types
- Priority classification (CRITICAL, HIGH, MEDIUM, LOW)
- Status tracking through lifecycle

### 3. Resource Management Module
- Add, update, delete resources
- Track availability (AVAILABLE, BUSY, UNDER_MAINTENANCE)
- Assign resources to emergencies
- Multiple resource types supported

### 4. Volunteer Management Module
- Register volunteers with skills
- Track availability
- Skill-based matching
- Assignment tracking

### 5. Emergency Priority Module
- Automatic prioritization using PriorityQueue
- Process high-priority emergencies first
- FIFO within same priority level

### 6. **Automatic Resource Matching Module** ⭐

#### The Core Innovation

The matching engine uses a sophisticated scoring algorithm:

**Match Score Formula:**
```
Total Score = Availability Score (40 points)
            + Location Score (30 points)
            + Type/Skill Match Score (20 points)
            + Priority Bonus (10 points)
```

**Matching Criteria:**
- ✅ Resource type matches required resource
- ✅ Resource/volunteer is AVAILABLE
- ✅ Volunteer skill matches emergency needs
- ✅ Proximity to emergency location
- ✅ Priority boost for CRITICAL emergencies

**Output:**
- Ranked list of recommended resources
- Ranked list of recommended volunteers
- Match scores with explanations
- One-click assignment

### 7. Dashboard Module
- Active emergencies count
- Priority-wise breakdown
- Available resources and volunteers
- Resolved emergencies today
- Quick action buttons

### 8. Reports & History Module
- Total emergencies by type
- Priority distribution
- Resource utilization
- Volunteer participation
- Date-filtered reports
- Export capability

## 🎓 Java Concepts Used

### Object-Oriented Programming
- ✅ **Classes & Objects**: User, EmergencyRequest, Resource, Volunteer
- ✅ **Encapsulation**: Private fields with getters/setters
- ✅ **Inheritance**: User → Citizen, Volunteer, Coordinator, Admin
- ✅ **Polymorphism**: Role-specific behavior overriding
- ✅ **Abstraction**: Abstract User class, Matchable interface

### Data Structures
- ✅ **ArrayList**: Temporary lists for queries
- ✅ **HashMap**: Fast user/resource lookup
- ✅ **PriorityQueue**: Emergency priority processing
- ✅ **TreeSet**: Sorted match results

### Advanced Concepts
- ✅ **Exception Handling**: Try-catch, custom exceptions
- ✅ **JDBC**: Database connectivity with PreparedStatements
- ✅ **Java Swing**: Complete GUI application
- ✅ **Event Handling**: ActionListeners, mouse events
- ✅ **File I/O**: Export reports to CSV
- ✅ **Multithreading**: SwingWorker for background tasks
- ✅ **Interfaces**: Manageable, Trackable, Matchable

## 🧪 Testing

### Manual Test Cases

#### Test Case 1: User Registration & Login
1. Launch application
2. Click "Sign Up"
3. Fill registration form as Citizen
4. Submit and verify success
5. Login with new credentials
6. Verify redirect to Citizen Dashboard

#### Test Case 2: Emergency Reporting
1. Login as Citizen
2. Click "Report Emergency"
3. Fill all fields (Type: Medical Emergency, Priority: HIGH)
4. Submit
5. Verify Request ID generated
6. Check "My Requests" - emergency should appear

#### Test Case 3: Automatic Resource Matching
1. Login as Coordinator
2. Go to Emergency Management
3. Select emergency ER102
4. Click "Find Best Match"
5. Verify resources are ranked by match score
6. Verify volunteers are suggested
7. Select resource and volunteer
8. Click "Assign"
9. Verify status changes to "RESOURCE_ASSIGNED"
10. Verify resource status changes to "BUSY"

#### Test Case 4: Status Update Workflow
1. Login as Coordinator
2. Select assigned emergency
3. Update status: RESPONDING
4. Update status: ON_SITE
5. Update status: RESOLVED
6. Verify resource becomes AVAILABLE again
7. Verify volunteer becomes AVAILABLE again

#### Test Case 5: Dashboard Statistics
1. Login as Admin or Coordinator
2. View dashboard
3. Verify active emergencies count
4. Verify critical count matches database
5. Verify resource availability counts
6. Add new emergency
7. Refresh dashboard
8. Verify counts updated

### Expected Results

✅ All users can login successfully  
✅ Citizens can report emergencies  
✅ Request IDs generated correctly  
✅ Priorities work (CRITICAL processed first)  
✅ Matching engine suggests appropriate resources  
✅ Assignments update database correctly  
✅ Status transitions work smoothly  
✅ Resources/volunteers freed after resolution  
✅ Dashboard shows accurate statistics  
✅ Input validation prevents invalid data  
✅ SQL injection prevented by PreparedStatements  
✅ Passwords hashed securely  

## 🎨 UI Design

### Color Theme
- **Primary**: #e74c3c (Red) - Emergency/Alert
- **Secondary**: #3498db (Blue) - Information
- **Success**: #27ae60 (Green) - Available/Success
- **Warning**: #f39c12 (Orange) - Caution
- **Background**: #ecf0f1 (Light Gray)
- **Text**: #2c3e50 (Dark Gray)

### Layout Components
- Sidebar navigation
- Summary cards with icons
- Data tables with sorting
- Modal dialogs for forms
- Status badges with colors
- Action buttons with icons

## 📝 Project Presentation Tips

### Demonstration Flow

1. **Introduction** (2 min)
   - Explain the problem: Scattered emergency information
   - Show ResQNet solution

2. **User Registration** (2 min)
   - Demonstrate sign-up process
   - Show role selection

3. **Emergency Reporting** (3 min)
   - Login as Citizen
   - Report a Medical Emergency
   - Show generated Request ID

4. **Automatic Matching** (5 min) ⭐
   - Login as Coordinator
   - Select pending emergency
   - Click "Find Best Match"
   - Explain scoring algorithm
   - Show ranked results
   - Assign resources

5. **Status Tracking** (2 min)
   - Update status through workflow
   - Show real-time updates

6. **Dashboard & Reports** (2 min)
   - Show statistics
   - Generate report

7. **Code Walkthrough** (4 min)
   - Show OOP concepts
   - Explain matching algorithm
   - Show database integration

### Key Talking Points

1. **Innovation**: Automatic resource matching is unique
2. **Real-World Application**: Solves actual emergency coordination problems
3. **Scalability**: Can handle multiple simultaneous emergencies
4. **Technology**: Modern Java practices with JDBC, Swing, BCrypt
5. **Security**: Password hashing, SQL injection prevention
6. **User Experience**: Intuitive UI, role-based access

## 🔒 Security Features

- ✅ BCrypt password hashing
- ✅ Prepared statements (SQL injection prevention)
- ✅ Input validation and sanitization
- ✅ Role-based access control
- ✅ Session management
- ✅ Secure password requirements

## 📊 Performance Considerations

- Indexed database columns for fast queries
- Connection pooling for database
- Background tasks using SwingWorker
- Efficient matching algorithm (O(n log n))
- Cached frequently accessed data

## 🚀 Future Enhancements

1. Real-time notifications
2. SMS/Email alerts
3. Mobile application
4. GPS integration for location
5. Map visualization
6. AI-powered priority prediction
7. Multi-language support
8. Cloud deployment
9. API for third-party integration
10. Advanced analytics dashboard

## 📄 License

This project is for educational purposes as part of college coursework.

## 👨‍💻 Development Team

ResQNet Development Team  
College Project - Emergency Management System

---

**For any questions or issues, please refer to the documentation or contact the development team.**

## 📞 Support

For technical support:
- Check the database connection settings
- Verify MySQL server is running
- Ensure all library files are in the lib/ folder
- Check Java version compatibility (Java 8+)

---

**Built with ❤️ for emergency response coordination**
