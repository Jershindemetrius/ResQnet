import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import DashboardView from './pages/DashboardView.jsx';
import ReportEmergencyView from './pages/ReportEmergencyView.jsx';
import DispatchCenterView from './pages/DispatchCenterView.jsx';
import ResourceInventoryView from './pages/ResourceInventoryView.jsx';
import VolunteerDirectoryView from './pages/VolunteerDirectoryView.jsx';
import AdminView from './pages/AdminView.jsx';
import AmbulanceDriverView from './pages/AmbulanceDriverView.jsx';

function AppLayout() {
  const location = useLocation();
  const isDriverRoute = location.pathname === '/driver' || location.pathname === '/ambulance-driver';

  return (
    <div className={`app-layout ${isDriverRoute ? 'layout-driver-mode' : ''}`}>
      <Sidebar />
      <main className={`main-content ${isDriverRoute ? 'driver-main-override' : ''}`}>
        <Routes>
          <Route path="/" element={<DashboardView />} />
          <Route path="/report" element={<ReportEmergencyView />} />
          <Route path="/book-ambulance" element={<ReportEmergencyView />} />
          <Route path="/driver" element={<AmbulanceDriverView />} />
          <Route path="/ambulance-driver" element={<AmbulanceDriverView />} />
          <Route path="/emergencies" element={<DispatchCenterView />} />
          <Route path="/dispatch" element={<DispatchCenterView />} />
          <Route path="/resources" element={<ResourceInventoryView />} />
          <Route path="/volunteers" element={<VolunteerDirectoryView />} />
          <Route path="/matcher" element={<DispatchCenterView />} />
          <Route path="/analytics" element={<AdminView initialTab="overview" />} />
          <Route path="/admin" element={<AdminView initialTab="overview" />} />
          <Route path="/settings" element={<AdminView initialTab="config" />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
