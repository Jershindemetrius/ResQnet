import { useState, useEffect } from 'react';
import {
  assignResources,
  getDashboard,
  getEmergencies,
  getMatchingSuggestions,
  getResources
} from '../api/resqnetApi.js';
import { Icon } from '@iconify/react';

export default function DashboardView() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [suggestions, setSuggestions] = useState(null);
  const [dispatching, setDispatching] = useState(false);
  const [error, setError] = useState('');
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
      setError('');
      const [counts, emergencies, resources] = await Promise.all([
        getDashboard(),
        getEmergencies(),
        getResources()
      ]);
      const data = {
        ...counts,
        availableResources: resources.filter(resource => resource.available).length,
        recentEmergencies: emergencies.slice(0, 8)
      };
      setDashboard(data);
      const selected = emergencies.find(item => item.id === selectedEmergency?.id) ?? emergencies[0] ?? null;
      setSelectedEmergency(selected);
      setSuggestions(selected && selected.status !== 'RESOLVED'
        ? await getMatchingSuggestions(selected.id)
        : null);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3800);
  };

  const handleApproveDispatch = async () => {
    if (!selectedEmergency || selectedEmergency.status !== 'PENDING') return;
    try {
      setDispatching(true);
      setError('');
      const result = await assignResources(selectedEmergency.id);
      if (!result.successful) {
        throw new Error('No compatible available resource or volunteer could be assigned.');
      }
      await loadDashboard();
      showToast(`Available units assigned to request #${selectedEmergency.id}.`);
    } catch (dispatchError) {
      setError(dispatchError.message);
    } finally {
      setDispatching(false);
    }
  };

  const handleSelectFromMapOrTable = async (item) => {
    setSelectedEmergency(item);
    setSuggestions(null);
    setError('');
    if (item.status === 'RESOLVED') return;
    try {
      setSuggestions(await getMatchingSuggestions(item.id));
    } catch (suggestionError) {
      setError(suggestionError.message);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-state-card">
          <Icon icon="mdi:loading" className="spin brand-spin-icon" width="40" height="40" />
          <div className="loading-state-title">Loading ResQNet data...</div>
          <p className="loading-state-sub">Retrieving emergency, volunteer, and resource records.</p>
        </div>
      </div>
    );
  }

  const activeTarget = selectedEmergency || dashboard?.recentEmergencies?.[0] || null;

  return (
    <div className="dashboard-container">
      {/* Toast Alert Feedback */}
      {toastMessage && (
        <div className="dash-floating-toast">
          <Icon icon="mdi:radio-tower" width="18" height="18" />
          <span>{toastMessage}</span>
        </div>
      )}
      {error && (
        <div role="alert" className="empty-state-card">
          <strong>Backend request failed</strong>
          <p>{error}</p>
          <button type="button" className="btn-header-refresh" onClick={loadDashboard}>Retry</button>
        </div>
      )}

      {/* Header with Live Stats & Telemetry Clock */}
      <header className="dashboard-header-premium">
        <div className="header-left-meta">
          <div className="telemetry-badge-row">
            <span className="live-cad-chip">
              <span className="cad-beacon-ping"></span>
              BACKEND CONNECTED
            </span>
            <span className="node-id-chip">NODE: TN-KOVILPATTI-01</span>
          </div>
          <h1 className="dashboard-main-title">Emergency Coordinator Command Console</h1>
          <p className="dashboard-main-subtitle">
            Emergency, volunteer, and resource totals from the ResQNet backend.
          </p>
        </div>

        <div className="header-right-clock">
          <div className="clock-digital-box">
            <Icon icon="mdi:clock-digital" width="22" height="22" className="clock-icon" />
            <span className="clock-time">{currentTime}</span>
          </div>
          <div className="clock-status-caption">LOCAL TIME</div>
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
            <span className="stat-val-number">{dashboard?.activeEmergencies ?? 0}</span>
            <span className="stat-trend-tag neutral">Current total</span>
          </div>
          <div className="stat-breakdown-pills">
            <span className="stat-pill-item critical">
              <span className="pill-dot"></span>
              {dashboard?.criticalCount ?? 0} Critical
            </span>
            <span className="stat-pill-item high">
              <span className="pill-dot"></span>
              {dashboard?.highCount ?? 0} High
            </span>
            <span className="stat-pill-item medium">
              <span className="pill-dot"></span>
              {dashboard?.mediumCount ?? 0} Medium
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
            <span className="stat-val-number">{dashboard?.availableVolunteers ?? 0}</span>
            <span className="stat-trend-tag good">
              <Icon icon="mdi:check-all" width="12" height="12" />
              Standby Ready
            </span>
          </div>
          <div className="stat-card-subinfo"><span>Marked available in the volunteer roster</span></div>
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
            <span className="stat-val-number">{dashboard?.availableResources ?? 0}</span>
            <span className="stat-trend-tag good">
              <Icon icon="mdi:radio-tower" width="12" height="12" />
              Available
            </span>
          </div>
          <div className="stat-card-subinfo"><span>Resources marked available in inventory</span></div>
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
            <span className="stat-val-number">{dashboard?.resolvedToday ?? 0}</span>
            <span className="stat-trend-tag neutral">
              <Icon icon="mdi:timer-outline" width="12" height="12" />
              Today
            </span>
          </div>
          <div className="stat-card-subinfo"><span>Based on recorded resolution timestamps</span></div>
        </div>
      </div>

      {/* Backend-backed incident selection and resource matching */}
      <div className="dashboard-grid-layout">
        <div className="dashboard-card-panel map-panel-wrap">
          <div className="panel-custom-header">
            <div className="panel-header-title">
              <Icon icon="mdi:map-marker-radius" width="18" height="18" className="header-icon-accent" />
              <span>EMERGENCY LOCATIONS</span>
            </div>
            <div className="panel-header-tools">
              <span className="panel-badge-live">BACKEND RECORDS</span>
            </div>
          </div>
          <div className="matching-panel-content">
            <p>Location descriptions from reports. GPS coordinates and live vehicle positions are not available in the backend.</p>
            {dashboard?.recentEmergencies?.length ? dashboard.recentEmergencies.map(emergency => (
              <button
                type="button"
                key={emergency.id}
                className="matched-candidate-card"
                onClick={() => handleSelectFromMapOrTable(emergency)}
              >
                <span className="candidate-title">#{emergency.id} · {emergency.location}</span>
                <span className="candidate-meta">{emergency.type} · {emergency.status.replace('_', ' ')}</span>
              </button>
            )) : <p>No emergency reports are available.</p>}
          </div>
        </div>

        <div className="dashboard-card-panel matching-panel-wrap">
          <div className="panel-custom-header">
            <div className="panel-header-title">
              <Icon icon="mdi:auto-fix" width="18" height="18" className="header-icon-accent" />
              <span>AVAILABLE MATCHES{activeTarget ? ` (#${activeTarget.id})` : ''}</span>
            </div>
          </div>

          <div className="matching-panel-content">
            {activeTarget ? (<>
              <div className="incident-target-banner">
              <div className="target-tag-row">
                <span className={`target-priority-badge ${activeTarget.priority.toLowerCase()}`}>
                  {activeTarget.priority} PRIORITY
                </span>
                <span className="target-id-chip">REQ #{activeTarget.id}</span>
              </div>
              <h3 className="target-incident-title">{activeTarget.type}</h3>
              <p className="target-incident-loc">
                <Icon icon="mdi:map-marker" width="15" height="15" />
                {activeTarget.location}
              </p>
            </div>
              <div className="matching-recommendations-list">
              <div className="spec-label">
                <Icon icon="mdi:navigation-variant" width="15" height="15" />
                <span>NEAREST AVAILABLE COMPATIBLE RESOURCE & VOLUNTEER</span>
              </div>
              {suggestions?.suggestedResources?.length ? suggestions.suggestedResources.map(match => (
                <div className="matched-candidate-card" key={match.id}>
                  <div className="candidate-avatar">
                    <Icon icon={match.kind === 'volunteer' ? 'mdi:account-hard-hat' : 'mdi:package-variant'} width="22" height="22" />
                  </div>
                  <div className="candidate-details">
                    <div className="candidate-title">{match.type}</div>
                    <div className="candidate-meta">{match.kind} · {match.location} · score {(match.score * 100).toFixed(0)}%</div>
                  </div>
                </div>
              )) : <p>{suggestions ? 'No compatible available units were found.' : 'Select an emergency to check current availability.'}</p>}
              </div>
            <button
              className="btn-approve-dispatch"
              onClick={handleApproveDispatch}
              disabled={!activeTarget || activeTarget.status !== 'PENDING' || dispatching || !suggestions?.successful}
            >
              {dispatching ? 'Assigning...' : activeTarget?.status === 'PENDING' ? 'Match and assign available units' : 'Only pending reports can be matched'}
            </button>
            </>) : <p>Select a pending report from the queue to view match suggestions.</p>}
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
              Showing {dashboard?.recentEmergencies?.length ?? 0} reports
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
                const isSelected = selectedEmergency?.id === emergency.id;
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
                    <td className="cell-time">—</td>
                    <td className="cell-people">
                      <span className="people-badge">
                        <Icon icon="mdi:account" width="13" height="13" />
                        {emergency.numberOfPeople}
                      </span>
                    </td>
                    <td className="cell-actions" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="btn-action-primary"
                        onClick={() => handleSelectFromMapOrTable(emergency)}
                        title="Select this report and load current match suggestions"
                      >
                        <Icon icon="mdi:crosshairs-gps" width="16" height="16" />
                        <span>Select</span>
                      </button>
                      <button
                        className="btn-action-secondary"
                        onClick={() => handleSelectFromMapOrTable(emergency)}
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
