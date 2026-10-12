import { useState, useEffect } from 'react';
import { getDashboard } from '../api/resqnetApi.js';
import StatCard from '../components/StatCard.jsx';
import PriorityBadge from '../components/PriorityBadge.jsx';

export default function DashboardView() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await getDashboard();
      setDashboard(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section>
        <h1>📊 Response Dashboard</h1>
        <div className="loading">Loading dashboard...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <h1>📊 Response Dashboard</h1>
        <div className="error-message">
          ⚠️ Failed to load dashboard: {error}
        </div>
        <button onClick={loadDashboard} className="btn-primary">
          Retry
        </button>
      </section>
    );
  }

  return (
    <section>
      <div className="page-header">
        <h1>📊 ResQNet Dashboard</h1>
        <p className="subtitle">Real-time Emergency Response Overview</p>
      </div>

      <div className="stats-grid">
        <StatCard 
          label="🚨 Active Emergencies" 
          value={dashboard?.activeEmergencies || 0}
          color="red"
        />
        <StatCard 
          label="🚑 Available Resources" 
          value={dashboard?.availableResources || 0}
          color="green"
        />
        <StatCard 
          label="👷 On-Duty Volunteers" 
          value={dashboard?.availableVolunteers || 0}
          color="blue"
        />
        <StatCard 
          label="✅ Resolved Today" 
          value={dashboard?.resolvedToday || 0}
          color="purple"
        />
      </div>

      <div className="dashboard-sections">
        {/* Priority Breakdown */}
        <div className="panel">
          <h2>Emergency Priority Breakdown</h2>
          <div className="priority-stats">
            <div className="priority-item">
              <PriorityBadge priority="CRITICAL" />
              <span className="priority-count">{dashboard?.criticalCount || 0}</span>
            </div>
            <div className="priority-item">
              <PriorityBadge priority="HIGH" />
              <span className="priority-count">{dashboard?.highCount || 0}</span>
            </div>
            <div className="priority-item">
              <PriorityBadge priority="MEDIUM" />
              <span className="priority-count">{dashboard?.mediumCount || 0}</span>
            </div>
            <div className="priority-item">
              <PriorityBadge priority="LOW" />
              <span className="priority-count">{dashboard?.lowCount || 0}</span>
            </div>
          </div>
        </div>

        {/* Recent Emergencies */}
        <div className="panel">
          <h2>Recent Emergency Requests</h2>
          {dashboard?.recentEmergencies && dashboard.recentEmergencies.length > 0 ? (
            <div className="emergency-list">
              {dashboard.recentEmergencies.map((emergency) => (
                <div key={emergency.id} className="emergency-item">
                  <div className="emergency-header">
                    <span className="emergency-id">#{emergency.id}</span>
                    <PriorityBadge priority={emergency.priority} />
                  </div>
                  <div className="emergency-info">
                    <strong>{emergency.type}</strong>
                    <span className="emergency-location">📍 {emergency.location}</span>
                  </div>
                  <div className="emergency-status">
                    Status: <span className="status-badge">{emergency.status}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">No recent emergencies</p>
          )}
        </div>

        {/* System Status */}
        <div className="panel">
          <h2>System Status</h2>
          <div className="status-indicators">
            <div className="status-item">
              <span className="status-dot active"></span>
              <span>API Server: Online</span>
            </div>
            <div className="status-item">
              <span className="status-dot active"></span>
              <span>Matching Engine: Active</span>
            </div>
            <div className="status-item">
              <span className="status-dot active"></span>
              <span>Real-time Updates: Enabled</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
