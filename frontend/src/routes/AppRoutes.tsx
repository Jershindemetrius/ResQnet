import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layout Wrappers
import PublicLayout from '../layouts/PublicLayout';
import DriverLayout from '../layouts/DriverLayout';
import AdminLayout from '../layouts/AdminLayout';

// Route Guard & Auth
import ProtectedRoute from '../components/auth/ProtectedRoute';
import LoginPage from '../pages/auth/LoginPage';
import ForbiddenPage from '../pages/auth/ForbiddenPage';

// Public & Citizen Pages
import DashboardView from '../pages/DashboardView';
import ReportEmergencyView from '../pages/ReportEmergencyView';
import DispatchCenterView from '../pages/DispatchCenterView';
import ResourceInventoryView from '../pages/ResourceInventoryView';
import VolunteerDirectoryView from '../pages/VolunteerDirectoryView';

// Driver Pages (Role: DRIVER)
import AmbulanceDriverMDT from '../pages/AmbulanceDriverMDT';
import DriverNavigationPage from '../pages/driver/DriverNavigationPage';
import DriverTelemetryPage from '../pages/driver/DriverTelemetryPage';

// Admin Pages (Role: ADMIN, COORDINATOR)
import AdminView from '../pages/AdminView';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* ====================================================================
          1. PUBLIC CITIZEN PORTAL (Layout: PublicLayout)
          No admin or driver links visible anywhere.
          ==================================================================== */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<DashboardView />} />
        <Route path="/dashboard" element={<Navigate to="/" replace />} />
        <Route path="/report" element={<ReportEmergencyView />} />
        <Route path="/book-ambulance" element={<ReportEmergencyView />} />
        <Route path="/emergencies" element={<DispatchCenterView />} />
        <Route path="/dispatch" element={<Navigate to="/emergencies" replace />} />
        <Route path="/resources" element={<ResourceInventoryView />} />
        <Route path="/volunteers" element={<VolunteerDirectoryView />} />
      </Route>

      {/* ====================================================================
          AUTH & EXCEPTION ROUTES
          ==================================================================== */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/403" element={<ForbiddenPage />} />

      {/* ====================================================================
          2. DRIVER DISPATCH HUB (Layout: DriverLayout - Role: DRIVER)
          Strictly blocks access if user.role !== 'DRIVER'
          ==================================================================== */}
      <Route element={<ProtectedRoute allowedRoles={['DRIVER']} />}>
        <Route path="/driver" element={<DriverLayout />}>
          <Route index element={<Navigate to="/driver/console" replace />} />
          <Route path="console" element={<AmbulanceDriverMDT />} />
          <Route path="navigation" element={<DriverNavigationPage />} />
          <Route path="telemetry" element={<DriverTelemetryPage />} />
        </Route>
        {/* Legacy alias redirect */}
        <Route path="/ambulance-driver" element={<Navigate to="/driver/console" replace />} />
      </Route>

      {/* ====================================================================
          3. COORDINATOR / ADMIN CENTER (Layout: AdminLayout - Role: ADMIN, COORDINATOR)
          Strictly blocks access if user.role !== 'ADMIN' && user.role !== 'COORDINATOR'
          ==================================================================== */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'COORDINATOR']} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/overview" replace />} />
          <Route path="overview" element={<AdminView initialTab="overview" />} />
          <Route path="dispatches" element={<AdminView initialTab="orders" />} />
          <Route path="matcher" element={<DispatchCenterView />} />
          <Route path="fleet" element={<AdminView initialTab="incidents" />} />
          <Route path="hospitals" element={<ResourceInventoryView />} />
          <Route path="users" element={<AdminView initialTab="users" />} />
          <Route path="telematics" element={<DriverTelemetryPage />} />
          <Route path="config" element={<AdminView initialTab="config" />} />
          <Route path="audit" element={<AdminView initialTab="audit" />} />
        </Route>
        {/* Legacy aliases */}
        <Route path="/settings" element={<Navigate to="/admin/config" replace />} />
        <Route path="/analytics" element={<Navigate to="/admin/overview" replace />} />
      </Route>

      {/* Catch-all Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
