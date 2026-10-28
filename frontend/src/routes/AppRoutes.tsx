import React from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';

// Layout Wrappers
import PublicLayout from '../layouts/PublicLayout';
import LoginPage from '../pages/auth/LoginPage';

// Public & Citizen Pages
import DashboardView from '../pages/DashboardView';
import ReportEmergencyView from '../pages/ReportEmergencyView';
import DispatchCenterView from '../pages/DispatchCenterView';
import ResourceInventoryView from '../pages/ResourceInventoryView';
import VolunteerDirectoryView from '../pages/VolunteerDirectoryView';
import BackendFeatureUnavailable from '../pages/BackendFeatureUnavailable';
import AdminDashboardView from '../pages/AdminDashboardView.jsx';
import AmbulanceBookingView from '../pages/AmbulanceBookingView.jsx';
import { useAuth } from '../context/AuthContext';

const AdminOnlyRoute: React.FC = () => {
  const { user, isAdmin, loading, authError, refreshSession } = useAuth();
  const location = useLocation();

  if (loading) return <p role="status">Verifying administrator session…</p>;
  if (authError) {
    return (
      <main className="admin-route-message" role="alert">
        <h1>Unable to verify your session</h1>
        <p>{authError}</p>
        <button type="button" onClick={() => void refreshSession()}>Try again</button>
      </main>
    );
  }
  if (!user) {
    const redirect = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }
  if (!isAdmin) {
    return (
      <main className="admin-route-message" role="alert">
        <h1>Administrator access required</h1>
        <p>This account does not have the administrator role.</p>
        <Link to="/">Return to the public portal</Link>
      </main>
    );
  }
  return <AdminDashboardView />;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Backend-supported emergency, inventory, volunteer, and account pages. */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<DashboardView />} />
        <Route path="/report" element={<ReportEmergencyView />} />
        <Route path="/book-ambulance" element={<AmbulanceBookingView />} />
        <Route path="/admin/*" element={<AdminOnlyRoute />} />
        <Route path="/emergencies" element={<DispatchCenterView />} />
        <Route path="/resources" element={<ResourceInventoryView />} />
        <Route path="/volunteers" element={<VolunteerDirectoryView />} />
      </Route>

      <Route path="/login" element={<LoginPage />} />
      <Route path="/driver/*" element={<BackendFeatureUnavailable />} />
      <Route path="/ambulance-driver" element={<BackendFeatureUnavailable />} />
      <Route path="/settings" element={<Navigate to="/" replace />} />
      <Route path="/analytics" element={<Navigate to="/" replace />} />
      <Route path="/403" element={<BackendFeatureUnavailable />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
