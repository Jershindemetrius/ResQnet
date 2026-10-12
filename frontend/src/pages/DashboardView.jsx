import { useState, useEffect } from 'react';
import { getDashboard } from '../api/resqnetApi.js';
import StatCard from '../components/StatCard.jsx';
import DispatchMap from '../components/DispatchMap.jsx';

export default function DashboardView() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEmergency, setSelectedEmergency] = useState(null);

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
      // Use mock data for demo
      setDashboard({
        activeEmergencies: 12,
        criticalCount: 3,
        highCount: 4,
        mediumCount: 3,
        lowCount: 2,
        availableVolunteers: 18,
        availableResources: 6,
        resolvedToday: 27,
        recentEmergencies: [
          { id: 'ER102', type: 'Accident (High Priority)', location: 'Kovilpatti', status: 'PENDING', priority: 'HIGH' },
          { id: 'ER103', type: 'Fire (Trapped People)', location: 'North Sector', status: 'PENDING', priority: 'CRITICAL' },
          { id: 'ER104', type: 'Medical Emergency', location: 'South Block', status: 'RESPONDING', priority: 'MEDIUM' },
          { id: 'ER105', type: 'Road Obstruction', location: 'Highway 7', status: 'RESOLVED', priority: 'LOW' }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Emergency Coordinator Dashboard</h1>
      </header>

      {/* Stats Cards Row */}
      <div className="dashboard-stats">
        <div className="stat-card-large red">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <div className="stat-label">ACTIVE EMERGENCIES:</div>
            <div className="stat-value">{dashboard?.activeEmergencies || 12}</div>
            <div className="stat-breakdown">
              <span className="stat-tag critical">● {dashboard?.criticalCount || 3} Critical</span>
              <span className="stat-tag high">● {dashboard?.highCount || 4} High</span>
              <span className="stat-tag medium">● {dashboard?.mediumCount || 3} Medium</span>
              <span className="stat-tag low">● {dashboard?.lowCount || 2} Low</span>
            </div>
          </div>
        </div>

        <div className="stat-card-large blue">
          <div className="stat-icon">👷</div>
          <div className="stat-content">
            <div className="stat-label">AVAILABLE VOLUNTEERS:</div>
            <div className="stat-value">{dashboard?.availableVolunteers || 18}</div>
          </div>
        </div>

        <div className="stat-card-large green">
          <div className="stat-icon">🚗</div>
          <div className="stat-content">
            <div className="stat-label">AVAILABLE VEHICLES:</div>
            <div className="stat-value">{dashboard?.availableResources || 6}</div>
          </div>
        </div>

        <div className="stat-card-large teal">
          <div className="stat-icon">✓</div>
          <div className="stat-content">
            <div className="stat-label">RESOLVED TODAY:</div>
            <div className="stat-value">{dashboard?.resolvedToday || 27}</div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-grid">
        {/* Left: Map */}
        <div className="dashboard-map-section">
          <div className="section-header">
            <h2>INTERACTIVE DISPATCH MAP - KOVILPATTI REGION</h2>
          </div>
          <DispatchMap selectedEmergency={selectedEmergency} />
        </div>

        {/* Right: Auto Matching Engine */}
        <div className="dashboard-matching-section">
          <div className="section-header">
            <h2>AUTO MATCHING ENGINE (ER102)</h2>
          </div>
          <div className="matching-panel">
            <div className="matching-info">
              <p><strong>Recommend resources for</strong> <span className="highlight">Accident</span> at Kovilpatti</p>
              <p className="matching-required"><strong>Required:</strong></p>
              <ul>
                <li>• Ambulance + Medical Volunteer</li>
              </ul>
              <p className="matching-match"><strong>Match Recommendations:</strong></p>
              <ul>
                <li>• Ambulance A (1.5 km) - Available &</li>
                <li>• Volunteer V105 (Arun) - Available (First Aid)</li>
              </ul>
            </div>
            <button className="btn-approve">APPROVE & DISPATCH</button>
            
            {/* Status Timeline */}
            <div className="status-progress">
              <div className="progress-step active">
                <div className="progress-circle">●</div>
                <div className="progress-label">PENDING</div>
              </div>
              <div className="progress-line"></div>
              <div className="progress-step">
                <div className="progress-circle">●</div>
                <div className="progress-label">RESOURCE<br/>ASSIGNED</div>
              </div>
              <div className="progress-line"></div>
              <div className="progress-step">
                <div className="progress-circle">●</div>
                <div className="progress-label">RESPONDING</div>
              </div>
              <div className="progress-line"></div>
              <div className="progress-step">
                <div className="progress-circle">●</div>
                <div className="progress-label">ON-SITE</div>
              </div>
              <div className="progress-line"></div>
              <div className="progress-step">
                <div className="progress-circle">●</div>
                <div className="progress-label">RESOLVED</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Queue Table */}
      <div className="emergency-queue-section">
        <div className="section-header">
          <h2>EMERGENCY QUEUE (Priority-Based)</h2>
        </div>
        <table className="emergency-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>TYPE</th>
              <th>LOCATION</th>
              <th>PRIORITY</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {dashboard?.recentEmergencies?.map((emergency) => (
              <tr 
                key={emergency.id}
                onClick={() => setSelectedEmergency(emergency)}
                className={selectedEmergency?.id === emergency.id ? 'selected' : ''}
              >
                <td className="emergency-id">{emergency.id}</td>
                <td>{emergency.type}</td>
                <td>{emergency.location}</td>
                <td>
                  <span className={`priority-badge-table ${emergency.priority.toLowerCase()}`}>
                    {emergency.priority}
                  </span>
                </td>
                <td>
                  <span className={`status-badge-table ${emergency.status.toLowerCase()}`}>
                    {emergency.status}
                  </span>
                </td>
                <td className="actions-cell">
                  <button className="action-btn" title="View">📄</button>
                  <button className="action-btn" title="Edit">✏️</button>
                  <button className="action-btn" title="Delete">🗑️</button>
                  <button className="action-btn" title="More">⋯</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
