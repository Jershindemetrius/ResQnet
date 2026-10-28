import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Ambulance, Layers, Users } from 'lucide-react';

const BackendFeatureUnavailable: React.FC = () => (
  <main className="backend-unavailable-page">
    <section className="backend-unavailable-card">
      <span className="backend-unavailable-icon"><Activity size={25} aria-hidden="true" /></span>
      <h1>Feature unavailable</h1>
      <p>This feature is not available yet.</p>
      <nav aria-label="Available backend pages" className="backend-unavailable-links">
        <Link to="/"><Layers size={17} /> Citizen overview</Link>
        <Link to="/resources"><Ambulance size={17} /> Resource inventory</Link>
        <Link to="/volunteers"><Users size={17} /> Volunteer directory</Link>
      </nav>
    </section>
  </main>
);

export default BackendFeatureUnavailable;
