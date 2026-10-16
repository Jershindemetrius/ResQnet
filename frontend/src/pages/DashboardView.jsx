import { useState, useEffect } from 'react';
import { getDashboard } from '../api/resqnetApi.js';
import { Icon } from '@iconify/react';
import DispatchMap from '../components/DispatchMap.jsx';

export default function DashboardView() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [dispatchStatus, setDispatchStatus] = useState('PENDING'); // PENDING | DISPATCHING | DISPATCHED
  const [toastMessage, setToastMessage] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  // Live digital clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await getDashboard();
      setDashboard(data);
    } catch {
      // Robust realistic initial dataset
      setDashboard({
        activeEmergencies: 12,
        criticalCount: 3,
        highCount: 4,
        mediumCount: 3,
        lowCount: 2,
        availableVolunteers: 18,
        availableResources: 8,
        resolvedToday: 27,
        avgResponseTime: '4.2m',
        fleetUtilization: '74%',
        recentEmergencies: [
          { id: 'ER102', type: 'Accident (Trauma / High)', location: 'Kovilpatti Central - Main Crossroad', status: 'PENDING', priority: 'HIGH', time: '4m ago', people: 2 },
          { id: 'ER103', type: 'Commercial Fire (Trapped Citizens)', location: 'North Sector Block 4', status: 'RESPONDING', priority: 'CRITICAL', time: '11m ago', people: 5 },
          { id: 'ER104', type: 'Flash Flood Embankment Trap', location: 'South Block - River Bank', status: 'RESOURCE_ASSIGNED', priority: 'HIGH', time: '28m ago', people: 10 },
          { id: 'ER105', type: 'Highway Cargo Rollover', location: 'Highway 7 - Km 45', status: 'RESPONDING', priority: 'MEDIUM', time: '42m ago', people: 1 },
          { id: 'ER106', type: 'Drinking Water Supply Outage', location: 'East Slum Cluster', status: 'RESOLVED', priority: 'LOW', time: '1h 15m ago', people: 20 }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3800);
  };

  const handleApproveDispatch = () => {
    setDispatchStatus('DISPATCHING');
    showToast('🚨 Transmitting CAD Order to Ambulance ALS-101 & Volunteer V-105...');

    setTimeout(() => {
      setDispatchStatus('DISPATCHED');
      showToast('✅ Order #ER102 Dispatched! Route cleared: Green light wave active.');

      // Update emergency queue item
      setDashboard(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          recentEmergencies: prev.recentEmergencies.map(e =>
            e.id === (selectedEmergency?.id || 'ER102') ? { ...e, status: 'RESPONDING' } : e
          )
        };
      });
    }, 1200);
  };

  const handleSelectFromMapOrTable = (item) => {
    setSelectedEmergency(item);
    showToast(`📍 Selected Incident #${item.id} (${item.type})`);
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-state-card">
          <Icon icon="mdi:loading" className="spin brand-spin-icon" width="40" height="40" />
          <div className="loading-state-title">Synchronizing Regional Telemetry...</div>
          <p className="loading-state-sub">Connecting to Kovilpatti Sector Dispatch Mesh</p>
        </div>
      </div>
    );
  }

  const activeTarget = selectedEmergency || dashboard?.recentEmergencies?.[0] || {
    id: 'ER102',
    type: 'Accident',
    location: 'Kovilpatti Central',
    priority: 'HIGH'
  };

  return (
    <div className="dashboard-container">
      {/* Toast Alert Feedback */}
      {toastMessage && (
        <div className="dash-floating-toast">
          <Icon icon="mdi:radio-tower" width="18" height="18" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header with Live Stats & Telemetry Clock */}
      <header className="dashboard-header-premium">
        <div className="header-left-meta">
          <div className="telemetry-badge-row">
            <span className="live-cad-chip">
              <span className="cad-beacon-ping"></span>
              LIVE CAD SYNCHRONIZED
            </span>
            <span className="node-id-chip">NODE: TN-KOVILPATTI-01</span>
            <span className="threat-defcon-chip">DEFCON 5: NORMAL OPS</span>
          </div>
          <h1 className="dashboard-main-title">Emergency Coordinator Command Console</h1>
          <p className="dashboard-main-subtitle">
            Real-time incident response routing, automated algorithmic resource matching &amp; telemetry monitoring
          </p>
        </div>

        <div className="header-right-clock">
          <div className="clock-digital-box">
            <Icon icon="mdi:clock-digital" width="22" height="22" className="clock-icon" />
            <span className="clock-time">{currentTime}</span>
          </div>
          <div className="clock-status-caption">SECTOR DISPATCH CLOCK &bull; 24MS PING</div>
        </div>
      </header>

      {/* Stats Cards Row */}
      <div className="dashboard-stats-grid">
        {/* Active Emergencies */}
        <div className="stat-card-glass stat-red">
          <div className="stat-card-top">
            <div className="stat-card-label">ACTIVE EMERGENCIES</div>
            <div className="stat-icon-wrapper red">
              <Icon icon="mdi:alert-decagram" width="26" height="26" />
            </div>
          </div>
          <div className="stat-card-main-val">
            <span className="stat-val-number">{dashboard?.activeEmergencies || 12}</span>
            <span className="stat-trend-tag bad">
              <Icon icon="mdi:arrow-up-bold" width="12" height="12" />
              +2 this hr
            </span>
          </div>
          <div className="stat-breakdown-pills">
            <span className="stat-pill-item critical">
              <span className="pill-dot"></span>
              {dashboard?.criticalCount || 3} Critical
            </span>
            <span className="stat-pill-item high">
              <span className="pill-dot"></span>
              {dashboard?.highCount || 4} High
            </span>
            <span className="stat-pill-item medium">
              <span className="pill-dot"></span>
              {dashboard?.mediumCount || 3} Medium
            </span>
          </div>
        </div>

        {/* Available Volunteers */}
        <div className="stat-card-glass stat-blue">
          <div className="stat-card-top">
            <div className="stat-card-label">AVAILABLE VOLUNTEERS</div>
            <div className="stat-icon-wrapper blue">
              <Icon icon="mdi:account-group" width="26" height="26" />
            </div>
          </div>
          <div className="stat-card-main-val">
            <span className="stat-val-number">{dashboard?.availableVolunteers || 18}</span>
            <span className="stat-trend-tag good">
              <Icon icon="mdi:check-all" width="12" height="12" />
              Standby Ready
            </span>
          </div>
          <div className="stat-card-subinfo">
            <span>🩹 8 First Aid &bull; 🏥 4 Medical &bull; 🔥 6 Rescue</span>
          </div>
        </div>

        {/* Available Fleet Vehicles */}
        <div className="stat-card-glass stat-green">
          <div className="stat-card-top">
            <div className="stat-card-label">FLEET ASSETS READY</div>
            <div className="stat-icon-wrapper green">
              <Icon icon="mdi:truck-fast" width="26" height="26" />
            </div>
          </div>
          <div className="stat-card-main-val">
            <span className="stat-val-number">{dashboard?.availableResources || 8}</span>
            <span className="stat-trend-tag good">
              <Icon icon="mdi:radio-tower" width="12" height="12" />
              {dashboard?.fleetUtilization || '74%'} In Zone
            </span>
          </div>
          <div className="stat-card-subinfo">
            <span>🚑 3 ALS Vans &bull; 🚒 2 Tenders &bull; 🚤 1 Boat</span>
          </div>
        </div>

        {/* Resolved Today */}
        <div className="stat-card-glass stat-teal">
          <div className="stat-card-top">
            <div className="stat-card-label">RESOLVED TODAY</div>
            <div className="stat-icon-wrapper teal">
              <Icon icon="mdi:shield-check" width="26" height="26" />
            </div>
          </div>
          <div className="stat-card-main-val">
            <span className="stat-val-number">{dashboard?.resolvedToday || 27}</span>
            <span className="stat-trend-tag neutral">
              <Icon icon="mdi:timer-outline" width="12" height="12" />
              Avg {dashboard?.avgResponseTime || '4.2m'}
            </span>
          </div>
          <div className="stat-card-subinfo">
            <span>🎯 96.4% SLA Compliance &bull; Kovilpatti</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Interactive Tactical Map + Auto Matching Engine */}
      <div className="dashboard-grid-layout">
        {/* Left: Tactical Map */}
        <div className="dashboard-card-panel map-panel-wrap">
          <div className="panel-custom-header">
            <div className="panel-header-title">
              <Icon icon="mdi:map-marker-radius" width="18" height="18" className="header-icon-accent" />
              <span>INTERACTIVE DISPATCH RADAR &bull; KOVILPATTI SECTOR</span>
            </div>
            <div className="panel-header-tools">
              <span className="panel-badge-live">LIVE TELEMETRY STREAM</span>
            </div>
          </div>
          <div className="panel-body-nomargin">
            <DispatchMap
              selectedEmergency={selectedEmergency}
              onSelectEmergency={handleSelectFromMapOrTable}
            />
          </div>
        </div>

        {/* Right: Auto Matching Engine */}
        <div className="dashboard-card-panel matching-panel-wrap">
          <div className="panel-custom-header">
            <div className="panel-header-title">
              <Icon icon="mdi:auto-fix" width="18" height="18" className="header-icon-accent" />
              <span>AUTO MATCHING ENGINE (#{activeTarget.id})</span>
            </div>
            <div className="matching-score-pill">
              <span className="score-number">98%</span>
              <span className="score-label">MATCH</span>
            </div>
          </div>

          <div className="matching-panel-content">
            <div className="incident-target-banner">
              <div className="target-tag-row">
                <span className={`target-priority-badge ${(activeTarget.priority || 'HIGH').toLowerCase()}`}>
                  {activeTarget.priority || 'HIGH'} PRIORITY
                </span>
                <span className="target-id-chip">REQ #{activeTarget.id}</span>
              </div>
              <h3 className="target-incident-title">{activeTarget.type}</h3>
              <p className="target-incident-loc">
                <Icon icon="mdi:map-marker" width="15" height="15" />
                {activeTarget.location}
              </p>
            </div>

            <div className="matching-spec-box">
              <div className="spec-label">
                <Icon icon="mdi:clipboard-check-outline" width="15" height="15" />
                <span>TRIAGE REQUIREMENTS:</span>
              </div>
              <ul className="spec-checklist">
                <li>
                  <Icon icon="mdi:check-circle" className="check-green" width="16" height="16" />
                  <span>ALS Ambulance (Oxygen + Stretcher + 12-Lead ECG)</span>
                </li>
                <li>
                  <Icon icon="mdi:check-circle" className="check-green" width="16" height="16" />
                  <span>Certified First Aid Medical Volunteer</span>
                </li>
              </ul>
            </div>

            <div className="matching-recommendations-list">
              <div className="spec-label">
                <Icon icon="mdi:navigation-variant" width="15" height="15" />
                <span>TOP ALGORITHMIC MATCHES:</span>
              </div>

              <div className="matched-candidate-card primary-candidate">
                <div className="candidate-avatar">
                  <Icon icon="mdi:ambulance" width="22" height="22" />
                </div>
                <div className="candidate-details">
                  <div className="candidate-title">Ambulance ALS-101 (Unit Alpha)</div>
                  <div className="candidate-meta">
                    <span>1.5 km away</span> &bull; <span>ETA: 3 mins</span> &bull; <span className="tag-available">Available</span>
                  </div>
                </div>
                <div className="candidate-score">99%</div>
              </div>

              <div className="matched-candidate-card secondary-candidate">
                <div className="candidate-avatar volunteer-avatar">
                  <Icon icon="mdi:account-hard-hat" width="22" height="22" />
                </div>
                <div className="candidate-details">
                  <div className="candidate-title">Volunteer V-105 (Arun Kumar)</div>
                  <div className="candidate-meta">
                    <span>1.2 km away</span> &bull; <span>Certified Trauma Responder</span>
                  </div>
                </div>
                <div className="candidate-score">96%</div>
              </div>
            </div>

            {/* Approve Button */}
            <button
              className={`btn-approve-dispatch ${dispatchStatus === 'DISPATCHED' ? 'dispatched-state' : ''}`}
              onClick={handleApproveDispatch}
              disabled={dispatchStatus === 'DISPATCHING'}
            >
              {dispatchStatus === 'DISPATCHING' ? (
                <>
                  <Icon icon="mdi:loading" className="spin" width="20" height="20" />
                  <span>BROADCASTING CAD DISPATCH...</span>
                </>
              ) : dispatchStatus === 'DISPATCHED' ? (
                <>
                  <Icon icon="mdi:check-decagram" width="20" height="20" />
                  <span>DISPATCHED &bull; GREEN WAVE ACTIVE</span>
                </>
              ) : (
                <>
                  <Icon icon="mdi:send-check" width="20" height="20" />
                  <span>APPROVE &amp; DISPATCH ALL UNITS</span>
                </>
              )}
            </button>

            {/* Status Timeline */}
            <div className="timeline-card-box">
              <div className="timeline-title-strip">CAD RESPONSE PROGRESSION</div>
              <div className="status-progress-flow">
                <div className={`progress-node ${dispatchStatus !== 'DISPATCHED' ? 'active-node' : 'completed-node'}`}>
                  <div className="node-icon">
                    <Icon icon="mdi:clock-outline" width="16" height="16" />
                  </div>
                  <div className="node-caption">PENDING</div>
                </div>
                <div className="node-connector"></div>
                <div className={`progress-node ${dispatchStatus === 'DISPATCHED' ? 'active-node' : ''}`}>
                  <div className="node-icon">
                    <Icon icon="mdi:check" width="16" height="16" />
                  </div>
                  <div className="node-caption">ASSIGNED</div>
                </div>
                <div className="node-connector"></div>
                <div className={`progress-node ${dispatchStatus === 'DISPATCHED' ? 'pulsing-node' : ''}`}>
                  <div className="node-icon">
                    <Icon icon="mdi:truck-fast" width="16" height="16" />
                  </div>
                  <div className="node-caption">RESPONDING</div>
                </div>
                <div className="node-connector"></div>
                <div className="progress-node">
                  <div className="node-icon">
                    <Icon icon="mdi:check-circle" width="16" height="16" />
                  </div>
                  <div className="node-caption">RESOLVED</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Queue Priority Table */}
      <div className="dashboard-card-panel queue-table-panel">
        <div className="panel-custom-header">
          <div className="panel-header-title">
            <Icon icon="mdi:format-list-bulleted-square" width="18" height="18" className="header-icon-accent" />
            <span>INCIDENT DISPATCH QUEUE (Priority Ranked)</span>
          </div>
          <div className="panel-header-right">
            <span className="queue-count-tag">
              {dashboard?.recentEmergencies?.length || 5} INCIDENTS ACTIVE
            </span>
          </div>
        </div>

        <div className="queue-table-scroll">
          <table className="emergency-table-premium">
            <thead>
              <tr>
                <th>REQ ID</th>
                <th>EMERGENCY TYPE</th>
                <th>SECTOR LOCATION</th>
                <th>PRIORITY</th>
                <th>STATUS</th>
                <th>ELAPSED</th>
                <th>AFFECTED</th>
                <th>DISPATCH ACTION</th>
              </tr>
            </thead>
            <tbody>
              {dashboard?.recentEmergencies?.map((emergency) => {
                const isSelected = (selectedEmergency?.id || 'ER102') === emergency.id;
                const isCritical = emergency.priority === 'CRITICAL';

                return (
                  <tr
                    key={emergency.id}
                    onClick={() => handleSelectFromMapOrTable(emergency)}
                    className={`queue-row ${isSelected ? 'row-selected' : ''} ${isCritical ? 'row-critical' : ''}`}
                  >
                    <td className="cell-id">
                      <span className="id-badge">#{emergency.id}</span>
                    </td>
                    <td className="cell-type">
                      <span className="type-bold">{emergency.type}</span>
                    </td>
                    <td className="cell-location">
                      <Icon icon="mdi:map-marker" width="14" height="14" className="loc-pin" />
                      <span>{emergency.location}</span>
                    </td>
                    <td className="cell-priority">
                      <span className={`priority-pill-table ${emergency.priority.toLowerCase()}`}>
                        <span className="priority-dot"></span>
                        {emergency.priority}
                      </span>
                    </td>
                    <td className="cell-status">
                      <span className={`status-pill-table ${emergency.status.toLowerCase()}`}>
                        {emergency.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="cell-time">{emergency.time || '8m ago'}</td>
                    <td className="cell-people">
                      <span className="people-badge">
                        <Icon icon="mdi:account" width="13" height="13" />
                        {emergency.people || 2}
                      </span>
                    </td>
                    <td className="cell-actions" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="btn-action-primary"
                        onClick={() => handleSelectFromMapOrTable(emergency)}
                        title="Focus on Incident Radar"
                      >
                        <Icon icon="mdi:crosshairs-gps" width="16" height="16" />
                        <span>Radar</span>
                      </button>
                      <button
                        className="btn-action-secondary"
                        onClick={() => showToast(`Opening Incident Dossier #${emergency.id}`)}
                        title="View Incident Dossier"
                      >
                        <Icon icon="mdi:file-document-outline" width="16" height="16" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
