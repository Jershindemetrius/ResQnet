import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import DashboardView from './pages/DashboardView.jsx';
import ReportEmergencyView from './pages/ReportEmergencyView.jsx';
import DispatchCenterView from './pages/DispatchCenterView.jsx';
import ResourceInventoryView from './pages/ResourceInventoryView.jsx';
import VolunteerDirectoryView from './pages/VolunteerDirectoryView.jsx';
import Login from './pages/Login.jsx';
import DashboardPlaceholder from './pages/DashboardPlaceholder.jsx';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const currentUser = localStorage.getItem('currentUser');
  return currentUser ? children : <Navigate to="/login" replace />;
};

export default function App() {
  const currentUser = localStorage.getItem('currentUser');
  const isAuthenticated = !!currentUser;

  return (
    <BrowserRouter>
      <Routes>
        {/* Login Route */}
        <Route path="/login" element={<Login />} />
        
        {/* Role-specific Dashboard Placeholders */}
        <Route 
          path="/citizen-dashboard" 
          element={
            <ProtectedRoute>
              <DashboardPlaceholder roleType="Citizen" />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/volunteer-dashboard" 
          element={
            <ProtectedRoute>
              <DashboardPlaceholder roleType="Volunteer" />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/provider-dashboard" 
          element={
            <ProtectedRoute>
              <DashboardPlaceholder roleType="Resource Provider" />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/coordinator-dashboard" 
          element={
            <ProtectedRoute>
              <DashboardPlaceholder roleType="Emergency Coordinator" />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin-dashboard" 
          element={
            <ProtectedRoute>
              <DashboardPlaceholder roleType="Administrator" />
            </ProtectedRoute>
          } 
        />

        {/* Main Application Routes (Protected) */}
        <Route 
          path="/*" 
          element={
            isAuthenticated ? (
              <div className="app-layout">
                <Sidebar />
                <main className="main-content">
                  <Routes>
                    <Route path="/" element={<DashboardView />} />
                    <Route path="/report" element={<ReportEmergencyView />} />
                    <Route path="/emergencies" element={<DispatchCenterView />} />
                    <Route path="/dispatch" element={<DispatchCenterView />} />
                    <Route path="/resources" element={<ResourceInventoryView />} />
                    <Route path="/volunteers" element={<VolunteerDirectoryView />} />
                    <Route path="/matcher" element={<DispatchCenterView />} />
                    <Route path="/analytics" element={<DashboardView />} />
                    <Route path="/settings" element={<DashboardView />} />
                  </Routes>
                </main>
              </div>
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}
