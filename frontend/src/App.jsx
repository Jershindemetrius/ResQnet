import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import DashboardView from './pages/DashboardView.jsx';
import ReportEmergencyView from './pages/ReportEmergencyView.jsx';
import DispatchCenterView from './pages/DispatchCenterView.jsx';
import ResourceInventoryView from './pages/ResourceInventoryView.jsx';
import VolunteerDirectoryView from './pages/VolunteerDirectoryView.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="page">
        <Routes>
          <Route path="/" element={<DashboardView />} />
          <Route path="/report" element={<ReportEmergencyView />} />
          <Route path="/dispatch" element={<DispatchCenterView />} />
          <Route path="/resources" element={<ResourceInventoryView />} />
          <Route path="/volunteers" element={<VolunteerDirectoryView />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
