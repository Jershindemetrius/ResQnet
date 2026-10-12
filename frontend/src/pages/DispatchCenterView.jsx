import { useState, useEffect } from 'react';
import { getEmergencies, updateEmergencyStatus, assignResources, getMatchingSuggestions } from '../api/resqnetApi.js';
import PriorityBadge from '../components/PriorityBadge.jsx';
import StatusTimeline from '../components/StatusTimeline.jsx';

export default function DispatchCenterView() {
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [suggestions, setSuggestions] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    loadEmergencies();
  }, []);

  const loadEmergencies = async () => {
    try {
      setLoading(true);
      const data = await getEmergencies();
      setEmergencies(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEmergency = async (emergency) => {
    setSelectedEmergency(emergency);
    
    // Load matching suggestions if emergency is pending
    if (emergency.status === 'PENDING') {
      try {
        const matchData = await getMatchingSuggestions(emergency.id);
        setSuggestions(matchData);
      } catch (err) {
        console.error('Failed to load suggestions:', err);
      }
    }
  };

  const handleStatusUpdate = async (emergencyId, newStatus) => {
    try {
      await updateEmergencyStatus(emergencyId, newStatus);
      await loadEmergencies();
      
      // Update selected emergency
      if (selectedEmergency?.id === emergencyId) {
        const updated = emergencies.find(e => e.id === emergencyId);
        if (updated) {
          setSelectedEmergency({ ...updated, status: newStatus });
        }
      }
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const handleAssignResources = async (emergencyId, resourceIds) => {
    try {
      await assignResources(emergencyId, { resourceIds });
      await loadEmergencies();
      alert('Resources assigned successfully!');
      setSuggestions(null);
    } catch (err) {
      alert('Failed to assign resources: ' + err.message);
    }
  };

  const filteredEmergencies = filterStatus === 'ALL' 
    ? emergencies 
    : emergencies.filter(e => e.status === filterStatus);

  if (loading) {
    return (
      <section className="panel">
        <h1>🎯 Dispatch Center</h1>
        <div className="loading">Loading emergencies...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="panel">
        <h1>🎯 Dispatch Center</h1>
        <div className="error-message">⚠️ Failed to load emergencies: {error}</div>
        <button onClick={loadEmergencies} className="btn-primary">Retry</button>
      </section>
    );
  }

  return (
    <section>
      <div className="page-header">
        <h1>🎯 Dispatch Center</h1>
        <p className="subtitle">Manage and coordinate emergency responses</p>
      </div>

      <div className="dispatch-layout">
        {/* Emergency List */}
        <div className="emergency-list-panel panel">
          <div className="panel-header">
            <h2>Emergency Requests</h2>
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="RESOURCE_ASSIGNED">Resource Assigned</option>
              <option value="RESPONDING">Responding</option>
              <option value="ON_SITE">On Site</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>

          {filteredEmergencies.length === 0 ? (
            <p className="empty-state">No emergencies found</p>
          ) : (
            <div className="emergency-cards">
              {filteredEmergencies.map((emergency) => (
                <div
                  key={emergency.id}
                  className={`emergency-card ${selectedEmergency?.id === emergency.id ? 'selected' : ''}`}
                  onClick={() => handleSelectEmergency(emergency)}
                >
                  <div className="emergency-card-header">
                    <span className="emergency-id">#{emergency.id}</span>
                    <PriorityBadge priority={emergency.priority} />
                  </div>
                  <div className="emergency-type">{emergency.type}</div>
                  <div className="emergency-location">📍 {emergency.location}</div>
                  <div className="emergency-footer">
                    <span className="status-badge status-{emergency.status.toLowerCase()}">
                      {emergency.status.replace('_', ' ')}
                    </span>
                    <span className="people-count">👥 {emergency.numberOfPeople}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Emergency Details */}
        <div className="emergency-details-panel panel">
          {selectedEmergency ? (
            <>
              <h2>Emergency Details</h2>
              
              <div className="detail-section">
                <div className="detail-header">
                  <h3>Request #{selectedEmergency.id}</h3>
                  <PriorityBadge priority={selectedEmergency.priority} />
                </div>

                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Reporter:</span>
                    <span className="detail-value">{selectedEmergency.reporterName}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Contact:</span>
                    <span className="detail-value">{selectedEmergency.contactNumber}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Type:</span>
                    <span className="detail-value">{selectedEmergency.type}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Location:</span>
                    <span className="detail-value">{selectedEmergency.location}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">People Affected:</span>
                    <span className="detail-value">{selectedEmergency.numberOfPeople}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Required Resources:</span>
                    <span className="detail-value">{selectedEmergency.requiredResources || 'N/A'}</span>
                  </div>
                </div>

                <div className="detail-item full-width">
                  <span className="detail-label">Description:</span>
                  <p className="detail-description">{selectedEmergency.description}</p>
                </div>
              </div>

              {/* Status Timeline */}
              <div className="detail-section">
                <h3>Response Status</h3>
                <StatusTimeline status={selectedEmergency.status} />
              </div>

              {/* Status Actions */}
              <div className="detail-section">
                <h3>Update Status</h3>
                <div className="status-actions">
                  {selectedEmergency.status === 'PENDING' && (
                    <button 
                      className="btn-primary"
                      onClick={() => handleStatusUpdate(selectedEmergency.id, 'RESOURCE_ASSIGNED')}
                    >
                      Mark as Resource Assigned
                    </button>
                  )}
                  {selectedEmergency.status === 'RESOURCE_ASSIGNED' && (
                    <button 
                      className="btn-primary"
                      onClick={() => handleStatusUpdate(selectedEmergency.id, 'RESPONDING')}
                    >
                      Mark as Responding
                    </button>
                  )}
                  {selectedEmergency.status === 'RESPONDING' && (
                    <button 
                      className="btn-primary"
                      onClick={() => handleStatusUpdate(selectedEmergency.id, 'ON_SITE')}
                    >
                      Mark as On Site
                    </button>
                  )}
                  {selectedEmergency.status === 'ON_SITE' && (
                    <button 
                      className="btn-success"
                      onClick={() => handleStatusUpdate(selectedEmergency.id, 'RESOLVED')}
                    >
                      Mark as Resolved
                    </button>
                  )}
                </div>
              </div>

              {/* Resource Matching Suggestions */}
              {suggestions && (
                <div className="detail-section">
                  <h3>🎯 Recommended Resources</h3>
                  <p className="suggestion-info">
                    System has identified the following resources based on proximity, availability, and emergency type:
                  </p>
                  {suggestions.suggestedResources && suggestions.suggestedResources.length > 0 ? (
                    <div className="suggestions-list">
                      {suggestions.suggestedResources.map((resource) => (
                        <div key={resource.id} className="suggestion-item">
                          <div className="suggestion-info-row">
                            <strong>{resource.type}</strong>
                            <span className="distance">📍 {resource.distance} km away</span>
                          </div>
                          <div className="suggestion-detail">
                            Location: {resource.location}
                          </div>
                        </div>
                      ))}
                      <button 
                        className="btn-primary btn-large"
                        onClick={() => {
                          const ids = suggestions.suggestedResources.map(r => r.id);
                          handleAssignResources(selectedEmergency.id, ids);
                        }}
                      >
                        Assign All Recommended Resources
                      </button>
                    </div>
                  ) : (
                    <p className="empty-state">No matching resources found</p>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="empty-selection">
              <p>👈 Select an emergency from the list to view details</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
