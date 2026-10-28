import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

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

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Backend-supported emergency, inventory, volunteer, and account pages. */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<DashboardView />} />
        <Route path="/report" element={<ReportEmergencyView />} />
        <Route path="/book-ambulance" element={<ReportEmergencyView />} />
        <Route path="/emergencies" element={<DispatchCenterView />} />
        <Route path="/resources" element={<ResourceInventoryView />} />
        <Route path="/volunteers" element={<VolunteerDirectoryView />} />
      </Route>

      <Route path="/login" element={<LoginPage />} />
      <Route path="/admin/*" element={<BackendFeatureUnavailable />} />
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
