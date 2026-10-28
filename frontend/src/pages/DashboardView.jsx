import { useState, useEffect } from 'react';
import {
  assignResources,
  getDashboard,
  getEmergencies,
  getMatchingSuggestions,
} from '../api/resqnetApi.js';
import { Icon } from '@iconify/react';
import DispatchMap from '../components/DispatchMap.jsx';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function DashboardView() {
  const { isAdmin } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [suggestions, setSuggestions] = useState(null);
  const [dispatching, setDispatching] = useState(false);
  const [error, setError] = useState('');
  const [suggestionError, setSuggestionError] = useState('');
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
  }, [isAdmin]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const [counts, emergencies] = await Promise.all([
        getDashboard(),
        getEmergencies({ limit: 8, offset: 0 })
      ]);
      const data = {
        ...counts,
        recentEmergencies: emergencies
      };
      setDashboard(data);
      const selected = emergencies.find(item => item.id === selectedEmergency?.id) ?? emergencies[0] ?? null;
      setSelectedEmergency(selected);
      setSuggestions(null);
      setSuggestionError('');
      if (isAdmin && selected && selected.status !== 'RESOLVED') {
        try {
          setSuggestions(await getMatchingSuggestions(selected.id));
        } catch (suggestionError) {
          setSuggestionError(suggestionError.message);
        }
      }
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
    if (!isAdmin || !selectedEmergency || selectedEmergency.status !== 'PENDING') return;
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
    setSuggestionError('');
    setError('');
    if (!isAdmin || item.status === 'RESOLVED') return;
    try {
      setSuggestions(await getMatchingSuggestions(item.id));
    } catch (suggestionError) {
      setSuggestionError(suggestionError.message);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-state-card">
          <Icon icon="mdi:loading" className="spin brand-spin-icon" width="40" height="40" />
          <div className="loading-state-title">Loading ResQNet data...</div>
        </div>
      </div>
    );
  }

  if (error && !dashboard) {
    return (
      <div className="dashboard-container">
        <div role="alert" className="empty-state-card">
          <p>{error}</p>
          <button type="button" className="btn-header-refresh" onClick={loadDashboard}>Retry</button>
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
          <p>{error}</p>
          <button type="button" className="btn-header-refresh" onClick={loadDashboard}>Retry</button>
        </div>
      )}

      {/* Header with Live Stats & Telemetry Clock */}
      <header className="dashboard-header-premium">
        <div className="header-left-meta">
          <h1 className="dashboard-main-title">Community emergency dashboard</h1>
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
          </div>
        </div>

        {/* Available Fleet Vehicles */}
        <div className="stat-card-glass stat-green">
          <div className="stat-card-top">
            <div className="stat-card-label">AVAILABLE RESOURCES</div>
            <div className="stat-icon-wrapper green">
              <Icon icon="mdi:truck-fast" width="26" height="26" />
            </div>
          </div>
          <div className="stat-card-main-val">
            <span className="stat-val-number">{dashboard?.availableResources ?? 0}</span>
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
            <span className="stat-val-number">{dashboard?.resolvedToday ?? 0}</span>
            <span className="stat-trend-tag neutral">
              <Icon icon="mdi:timer-outline" width="12" height="12" />
              Today
            </span>
          </div>
        </div>
      </div>

      {/* Backend-backed incident selection and resource matching */}
      <div className="dashboard-grid-layout">
        <div className="dashboard-card-panel map-panel-wrap">
          <div className="panel-custom-header">
            <div className="panel-header-title">
              <Icon icon="mdi:map-marker-radius" width="18" height="18" className="header-icon-accent" />
              <span>INCIDENT MAP</span>
            </div>
          </div>
          <div className="matching-panel-content">
            <DispatchMap
              emergencies={dashboard?.recentEmergencies ?? []}
              onSelectEmergency={handleSelectFromMapOrTable}
              selectedEmergency={selectedEmergency}
            />
          </div>
        </div>

        <div className="dashboard-card-panel matching-panel-wrap">
          <div className="panel-custom-header">
            <div className="panel-header-title">
              <Icon icon="mdi:auto-fix" width="18" height="18" className="header-icon-accent" />
              <span>{isAdmin ? `AVAILABLE MATCHES${activeTarget ? ` (#${activeTarget.id})` : ''}` : 'DISPATCH ACCESS'}</span>
            </div>
          </div>

          <div className="matching-panel-content">
            {isAdmin ? activeTarget ? (<>
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
                <span>RECOMMENDED UNITS</span>
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
              {suggestionError && <p className="matching-warning" role="status">Match suggestions are unavailable: {suggestionError}</p>}
              </div>
            <button
              className="btn-approve-dispatch"
              onClick={handleApproveDispatch}
              disabled={!activeTarget || activeTarget.status !== 'PENDING' || dispatching || !suggestions?.successful}
            >
              {dispatching ? 'Assigning...' : activeTarget?.status === 'PENDING' ? 'Match and assign available units' : 'Only pending reports can be matched'}
            </button>
            </>) : <p>Select a report to view matches.</p> : (
              <p>Administrator sign-in is required to match and assign units. <Link to="/login">Sign in</Link>.</p>
            )}
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
                        title="Select this report"
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
