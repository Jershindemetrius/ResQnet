import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Ambulance, ClipboardList, Users } from 'lucide-react';

const BackendFeatureUnavailable: React.FC = () => (
  <main className="backend-unavailable-page">
    <section className="backend-unavailable-card">
      <span className="backend-unavailable-icon"><Activity size={25} aria-hidden="true" /></span>
      <p className="account-brand-caption">LIVE BACKEND CAPABILITIES</p>
      <h1>This workspace is not connected</h1>
      <p>
        ResQNet currently stores emergency reports, resources, volunteers, and
        accounts, and enforces administrator roles on protected operations.
        It does not provide driver assignments, vehicle GPS or telemetry,
        hospital capacity, audit logs, or system configuration.
        Sample screens for those features have been disabled rather than showing
        invented operational data.
      </p>
      <nav aria-label="Available backend pages" className="backend-unavailable-links">
        <Link to="/emergencies"><ClipboardList size={17} /> Incident feed</Link>
        <Link to="/resources"><Ambulance size={17} /> Resource inventory</Link>
        <Link to="/volunteers"><Users size={17} /> Volunteer directory</Link>
      </nav>
    </section>
  </main>
);

export default BackendFeatureUnavailable;
