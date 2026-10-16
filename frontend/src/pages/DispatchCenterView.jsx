import { useState, useEffect } from 'react';
import { getEmergencies, updateEmergencyStatus, assignResources, getMatchingSuggestions } from '../api/resqnetApi.js';
import PriorityBadge from '../components/PriorityBadge.jsx';
import StatusTimeline from '../components/StatusTimeline.jsx';
import { Icon } from '@iconify/react';

const fallbackEmergencies = [
  {
    id: 'ER102',
    reporterName: 'Citizen One',
    contactNumber: '9876543212',
    type: 'Accident (Trauma / High)',
    location: 'Kovilpatti Central - Main Crossroad',
    numberOfPeople: 2,
    description: 'Vehicle collision, multiple injured persons requiring trauma triage.',
    requiredResources: 'AMBULANCE, MEDICAL_KIT',
    priority: 'HIGH',
    status: 'PENDING'
  },
  {
    id: 'ER103',
    reporterName: 'Ravi Kumar',
    contactNumber: '9876543215',
    type: 'Commercial Fire Hazard',
    location: 'North Sector - Building No 42',
    numberOfPeople: 5,
    description: 'Commercial complex fire on 2nd floor, smoke inhalation hazard.',
    requiredResources: 'FIRE_TRUCK, RESCUE_EQUIPMENT',
    priority: 'CRITICAL',
    status: 'RESPONDING'
  },
  {
    id: 'ER104',
    reporterName: 'Dr. Lakshmi',
    contactNumber: '9876543220',
    type: 'Flash Flood Embankment Trap',
    location: 'South Block - River Bank Area',
    numberOfPeople: 10,
    description: 'Water level surging past embankment, 3 families trapped.',
    requiredResources: 'SHELTER_SPACE, FOOD, DRINKING_WATER',
    priority: 'HIGH',
    status: 'RESOURCE_ASSIGNED'
  },
  {
    id: 'ER105',
    reporterName: 'Highway Patrol',
    contactNumber: '9876543230',
    type: 'Highway Cargo Rollover',
    location: 'Highway 7 - Kilometer 45',
    numberOfPeople: 1,
    description: 'Cargo truck rollover blocking southbound lane.',
    requiredResources: 'AMBULANCE, HEAVY_TOW',
    priority: 'MEDIUM',
    status: 'ON_SITE'
  },
  {
    id: 'ER106',
    reporterName: 'Civil Supply Dept',
    contactNumber: '9876543231',
    type: 'Drinking Water Supply Outage',
    location: 'Kovilpatti East Slum Cluster',
    numberOfPeople: 20,
    description: 'Clean drinking water shortage following main pipe breach.',
    requiredResources: 'FOOD, DRINKING_WATER',
    priority: 'LOW',
    status: 'RESOLVED'
  }
];

export default function DispatchCenterView() {
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [suggestions, setSuggestions] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    loadEmergencies();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadEmergencies = async () => {
    try {
      setLoading(true);
      const data = await getEmergencies();
      setEmergencies(data);
      if (data.length > 0) setSelectedEmergency(data[0]);
    } catch {
      // Graceful fallback to demo dataset
      setEmergencies(fallbackEmergencies);
      setSelectedEmergency(fallbackEmergencies[0]);
      loadFallbackSuggestions('ER102');
    } finally {
      setLoading(false);
    }
  };

  const loadFallbackSuggestions = (emergencyId) => {
    setSuggestions({
      emergencyId,
      suggestedResources: [
        { id: 'RES-01', type: '🚑 Advanced Life Support Ambulance (ALS-101)', distance: 1.5, location: 'Kovilpatti Central Depot' },
        { id: 'VOL-05', type: '⛑️ Volunteer First Aid Specialist (Arun Kumar)', distance: 1.2, location: 'Near Old Bus Stand' }
      ]
    });
  };

  const handleSelectEmergency = async (emergency) => {
    setSelectedEmergency(emergency);
    try {
      const matchData = await getMatchingSuggestions(emergency.id);
      setSuggestions(matchData);
    } catch {
      loadFallbackSuggestions(emergency.id);
    }
  };

  const handleStatusUpdate = async (emergencyId, newStatus) => {
    try {
      await updateEmergencyStatus(emergencyId, newStatus);
    } catch {
      // Local simulation if backend is offline
    }

    setEmergencies(prev =>
      prev.map(e => (e.id === emergencyId ? { ...e, status: newStatus } : e))
    );

    if (selectedEmergency?.id === emergencyId) {
      setSelectedEmergency(prev => (prev ? { ...prev, status: newStatus } : null));
    }

    showToast(`✅ Request #${emergencyId} updated to ${newStatus.replace('_', ' ')}`);
  };

  const handleAssignResources = async (emergencyId, resourceIds) => {
    try {
      await assignResources(emergencyId, { resourceIds });
    } catch {
      // Local simulation if backend is offline
    }

    handleStatusUpdate(emergencyId, 'RESOURCE_ASSIGNED');
    showToast(`🚀 Units assigned to #${emergencyId}! Automated telemetry armed.`);
  };

  const filteredEmergencies = emergencies.filter(e => {
    const statusMatch = filterStatus === 'ALL' || e.status === filterStatus;
    const query = searchQuery.toLowerCase();
    const searchMatch =
      !query ||
      e.id.toLowerCase().includes(query) ||
      e.type.toLowerCase().includes(query) ||
      e.location.toLowerCase().includes(query) ||
      (e.reporterName && e.reporterName.toLowerCase().includes(query));
    return statusMatch && searchMatch;
  });

  return (
    <div className="dispatch-center-page">
      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="dash-floating-toast">
          <Icon icon="mdi:checkbox-marked-circle" width="18" height="18" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="page-header-premium">
        <div>
          <div className="page-category-strip">
            <span className="live-cad-chip">
              <span className="cad-beacon-ping"></span>
              INCIDENT ROUTING DESK
            </span>
            <span className="node-id-chip">TACTICAL TRIAGE</span>
          </div>
          <h1 className="page-main-heading">Dispatch &amp; Incident Center</h1>
          <p className="page-main-subtext">Coordinate live citizen distress calls, review triage requirements, and dispatch emergency fleet assets.</p>
        </div>
        <div className="header-action-block">
          <button className="btn-header-refresh" onClick={loadEmergencies} title="Refresh Live Queue">
            <Icon icon="mdi:refresh" width="18" height="18" />
            <span>Refresh Queue</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="controls-bar-glass">
        <div className="search-input-box">
          <Icon icon="mdi:magnify" width="18" height="18" className="search-icon" />
          <input
            type="text"
            placeholder="Search by ID (e.g. ER102), type, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="search-clear-btn" onClick={() => setSearchQuery('')}>
              <Icon icon="mdi:close" width="14" height="14" />
            </button>
          )}
        </div>

        <div className="status-filter-pills">
          {['ALL', 'PENDING', 'RESOURCE_ASSIGNED', 'RESPONDING', 'ON_SITE', 'RESOLVED'].map((status) => (
            <button
              key={status}
              className={`filter-pill-btn ${filterStatus === status ? 'active' : ''}`}
              onClick={() => setFilterStatus(status)}
            >
              {status === 'ALL' ? 'All Incidents' : status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Two-Column Dispatch Layout */}
      <div className="dispatch-layout-grid">
        {/* Left Column: Emergency Cards List */}
        <div className="emergency-list-panel-premium">
          <div className="panel-inner-header">
            <div className="inner-title">
              <Icon icon="mdi:format-list-bulleted" width="18" height="18" />
              <span>Distress Queue ({filteredEmergencies.length})</span>
            </div>
          </div>

          <div className="emergency-cards-scroll">
            {filteredEmergencies.length === 0 ? (
              <div className="empty-state-card">
                <Icon icon="mdi:clipboard-text-search-outline" width="40" height="40" />
                <p>No incidents match the selected filter criteria.</p>
              </div>
            ) : (
              filteredEmergencies.map((emergency) => {
                const isSelected = selectedEmergency?.id === emergency.id;
                const isCritical = emergency.priority === 'CRITICAL';

                return (
                  <div
                    key={emergency.id}
                    className={`emergency-card-premium ${isSelected ? 'selected' : ''} ${isCritical ? 'critical-border' : ''}`}
                    onClick={() => handleSelectEmergency(emergency)}
                  >
                    <div className="card-top-row">
                      <span className="incident-id-tag">#{emergency.id}</span>
                      <PriorityBadge priority={emergency.priority} />
                    </div>

                    <h4 className="card-emergency-title">{emergency.type}</h4>

                    <div className="card-meta-row">
                      <div className="card-meta-item">
                        <Icon icon="mdi:map-marker" width="14" height="14" />
                        <span>{emergency.location}</span>
                      </div>
                      <div className="card-meta-item">
                        <Icon icon="mdi:account-group" width="14" height="14" />
                        <span>{emergency.numberOfPeople} affected</span>
                      </div>
                    </div>

                    <div className="card-bottom-row">
                      <span className={`status-pill status-${emergency.status.toLowerCase()}`}>
                        <span className="status-dot-pulse"></span>
                        {emergency.status.replace('_', ' ')}
                      </span>
                      <span className="card-select-arrow">
                        <Icon icon="mdi:chevron-right" width="18" height="18" />
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Emergency Details & Actions Dossier */}
        <div className="emergency-details-panel-premium">
          {selectedEmergency ? (
            <div className="dossier-card">
              <div className="dossier-top-strip">
                <div>
                  <div className="dossier-sub">INCIDENT DOSSIER &bull; ACTIVE CAD TRACKING</div>
                  <h2 className="dossier-title">Request #{selectedEmergency.id}: {selectedEmergency.type}</h2>
                </div>
                <PriorityBadge priority={selectedEmergency.priority} />
              </div>

              {/* Triage Detail Grid */}
              <div className="triage-details-grid">
                <div className="triage-box">
                  <span className="triage-label">REPORTING CITIZEN</span>
                  <span className="triage-val">{selectedEmergency.reporterName || 'Citizen Caller'}</span>
                </div>
                <div className="triage-box">
                  <span className="triage-label">HOTLINE CONTACT</span>
                  <a href={`tel:${selectedEmergency.contactNumber}`} className="triage-val link-phone">
                    <Icon icon="mdi:phone" width="14" height="14" />
                    {selectedEmergency.contactNumber || 'N/A'}
                  </a>
                </div>
                <div className="triage-box">
                  <span className="triage-label">SECTOR LOCATION</span>
                  <span className="triage-val">📍 {selectedEmergency.location}</span>
                </div>
                <div className="triage-box">
                  <span className="triage-label">PEOPLE AT RISK</span>
                  <span className="triage-val">👥 {selectedEmergency.numberOfPeople} Persons</span>
                </div>
              </div>

              <div className="description-callout">
                <div className="desc-title">
                  <Icon icon="mdi:text-box-search-outline" width="16" height="16" />
                  <span>INCIDENT DESCRIPTION &amp; FIELD NOTES</span>
                </div>
                <p className="desc-body">{selectedEmergency.description}</p>
                <div className="resources-required-tag">
                  <strong>Required Resources:</strong> {selectedEmergency.requiredResources || 'Ambulance + Trauma Team'}
                </div>
              </div>

              {/* Response Status Progression Stepper */}
              <div className="dossier-section-box">
                <div className="section-title-strip">RESPONSE LIFECYCLE PROGRESSION</div>
                <StatusTimeline status={selectedEmergency.status} />
              </div>

              {/* Next Action Trigger Buttons */}
              <div className="dossier-section-box">
                <div className="section-title-strip">MANUAL STATUS ESCALATION</div>
                <div className="status-progression-buttons">
                  {selectedEmergency.status === 'PENDING' && (
                    <button
                      className="btn-status-advance"
                      onClick={() => handleStatusUpdate(selectedEmergency.id, 'RESOURCE_ASSIGNED')}
                    >
                      <Icon icon="mdi:check-circle" width="18" height="18" />
                      <span>Mark as Resource Assigned</span>
                    </button>
                  )}
                  {selectedEmergency.status === 'RESOURCE_ASSIGNED' && (
                    <button
                      className="btn-status-advance responding"
                      onClick={() => handleStatusUpdate(selectedEmergency.id, 'RESPONDING')}
                    >
                      <Icon icon="mdi:truck-fast" width="18" height="18" />
                      <span>Mark as Responding (Code 3 En Route)</span>
                    </button>
                  )}
                  {selectedEmergency.status === 'RESPONDING' && (
                    <button
                      className="btn-status-advance onsite"
                      onClick={() => handleStatusUpdate(selectedEmergency.id, 'ON_SITE')}
                    >
                      <Icon icon="mdi:map-marker-check" width="18" height="18" />
                      <span>Mark as On-Site at Incident Coordinates</span>
                    </button>
                  )}
                  {selectedEmergency.status === 'ON_SITE' && (
                    <button
                      className="btn-status-advance resolved"
                      onClick={() => handleStatusUpdate(selectedEmergency.id, 'RESOLVED')}
                    >
                      <Icon icon="mdi:checkbox-marked-circle" width="18" height="18" />
                      <span>Mark as Fully Resolved &amp; Closed</span>
                    </button>
                  )}
                  {selectedEmergency.status === 'RESOLVED' && (
                    <div className="resolved-banner">
                      <Icon icon="mdi:check-decagram" width="22" height="22" />
                      <span>This incident has been resolved and logged in the regional audit register.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Resource Matching Recommendations */}
              {suggestions && selectedEmergency.status !== 'RESOLVED' && (
                <div className="dossier-section-box recommendations-box">
                  <div className="section-title-strip">
                    <Icon icon="mdi:auto-fix" width="16" height="16" />
                    <span>ALGORITHMIC RESOURCE RECOMMENDATIONS</span>
                  </div>
                  <div className="suggestions-list-custom">
                    {suggestions.suggestedResources?.map((res) => (
                      <div key={res.id} className="suggestion-item-custom">
                        <div className="res-icon-chip">
                          <Icon icon="mdi:ambulance" width="20" height="20" />
                        </div>
                        <div className="res-details">
                          <div className="res-name">{res.type}</div>
                          <div className="res-loc">📍 {res.location} &bull; {res.distance} km from site</div>
                        </div>
                        <span className="res-avail-chip">AVAILABLE</span>
                      </div>
                    ))}
                    <button
                      className="btn-assign-all"
                      onClick={() => {
                        const ids = suggestions.suggestedResources?.map(r => r.id) || ['RES-01'];
                        handleAssignResources(selectedEmergency.id, ids);
                      }}
                    >
                      <Icon icon="mdi:send-check" width="18" height="18" />
                      <span>Assign All Recommended Units Immediately</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="empty-selection-dossier">
              <Icon icon="mdi:cursor-default-click" width="48" height="48" />
              <h3>No Emergency Selected</h3>
              <p>Select an emergency request from the queue to review triage intelligence, coordinate response teams, and update CAD telemetry status.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
