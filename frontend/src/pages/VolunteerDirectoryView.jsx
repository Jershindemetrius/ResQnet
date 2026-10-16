import { useState, useEffect } from 'react';
import { getVolunteers, createVolunteer, updateVolunteerAvailability } from '../api/resqnetApi.js';

export default function VolunteerDirectoryView() {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterSkill, setFilterSkill] = useState('ALL');
  const [filterAvailability, setFilterAvailability] = useState('ALL');

  const [formData, setFormData] = useState({
    name: '',
    contactNumber: '',
    skills: 'FIRST_AID',
    location: ''
  });

  useEffect(() => {
    loadVolunteers();
  }, []);

  const loadVolunteers = async () => {
    try {
      setLoading(true);
      const data = await getVolunteers();
      setVolunteers(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createVolunteer(formData);
      await loadVolunteers();
      setShowAddForm(false);
      setFormData({
        name: '',
        contactNumber: '',
        skills: 'FIRST_AID',
        location: ''
      });
    } catch (err) {
      alert('Failed to register volunteer: ' + err.message);
    }
  };

  const toggleAvailability = async (id, currentStatus) => {
    try {
      await updateVolunteerAvailability(id, !currentStatus);
      await loadVolunteers();
    } catch (err) {
      alert('Failed to update availability: ' + err.message);
    }
  };

  const filteredVolunteers = volunteers.filter(volunteer => {
    const skillMatch = filterSkill === 'ALL' || volunteer.skills === filterSkill;
    const availMatch = filterAvailability === 'ALL' || 
                       (filterAvailability === 'AVAILABLE' && volunteer.available) ||
                       (filterAvailability === 'UNAVAILABLE' && !volunteer.available);
    return skillMatch && availMatch;
  });

  if (loading) {
    return (
      <section className="panel">
        <h1>👷 Volunteer Directory</h1>
        <div className="loading">Loading volunteers...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="panel">
        <h1>👷 Volunteer Directory</h1>
        <div className="error-message">⚠️ Failed to load volunteers: {error}</div>
        <button onClick={loadVolunteers} className="btn-primary">Retry</button>
      </section>
    );
  }

  return (
    <section>
      <div className="page-header">
        <h1>👷 Volunteer Directory</h1>
        <p className="subtitle">Manage and coordinate volunteer responders</p>
      </div>

      {/* Controls */}
      <div className="panel controls-panel">
        <div className="filters">
          <div className="filter-group">
            <label>Skill Set:</label>
            <select value={filterSkill} onChange={(e) => setFilterSkill(e.target.value)}>
              <option value="ALL">All Skills</option>
              <option value="FIRST_AID">🩹 First Aid</option>
              <option value="MEDICAL">🏥 Medical</option>
              <option value="FIREFIGHTING">🔥 Firefighting</option>
              <option value="RESCUE">⛑️ Rescue Operations</option>
              <option value="DRIVER">🚗 Driver</option>
              <option value="LOGISTICS">📦 Logistics</option>
              <option value="COMMUNICATION">📡 Communication</option>
              <option value="GENERAL">👤 General Support</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Availability:</label>
            <select value={filterAvailability} onChange={(e) => setFilterAvailability(e.target.value)}>
              <option value="ALL">All</option>
              <option value="AVAILABLE">Available</option>
              <option value="UNAVAILABLE">On Duty</option>
            </select>
          </div>
        </div>

        <button 
          className="btn-primary"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? 'Cancel' : '+ Register Volunteer'}
        </button>
      </div>

      {/* Add Volunteer Form */}
      {showAddForm && (
        <div className="panel">
          <h2>Register New Volunteer</h2>
          <form onSubmit={handleSubmit} className="volunteer-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter volunteer name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="contactNumber">Contact Number *</label>
                <input
                  type="tel"
                  id="contactNumber"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  required
                  placeholder="Enter contact number"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="skills">Primary Skill *</label>
                <select
                  id="skills"
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  required
                >
                  <option value="FIRST_AID">🩹 First Aid</option>
                  <option value="MEDICAL">🏥 Medical</option>
                  <option value="FIREFIGHTING">🔥 Firefighting</option>
                  <option value="RESCUE">⛑️ Rescue Operations</option>
                  <option value="DRIVER">🚗 Driver</option>
                  <option value="LOGISTICS">📦 Logistics</option>
                  <option value="COMMUNICATION">📡 Communication</option>
                  <option value="GENERAL">👤 General Support</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="location">Location *</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  placeholder="Enter location or area"
                />
              </div>
            </div>

            <button type="submit" className="btn-primary">Register Volunteer</button>
          </form>
        </div>
      )}

      {/* Volunteers Grid */}
      <div className="volunteers-grid">
        {filteredVolunteers.length === 0 ? (
          <div className="panel">
            <p className="empty-state">No volunteers found matching the filters</p>
          </div>
        ) : (
          filteredVolunteers.map((volunteer) => (
            <div key={volunteer.id} className="volunteer-card panel">
              <div className="volunteer-header">
                <div className="volunteer-name">
                  <span className="volunteer-avatar">
                    {volunteer.name.charAt(0).toUpperCase()}
                  </span>
                  <h3>{volunteer.name}</h3>
                </div>
                <span className={`availability-badge ${volunteer.available ? 'available' : 'unavailable'}`}>
                  {volunteer.available ? '✅ Available' : '🔴 On Duty'}
                </span>
              </div>

              <div className="volunteer-details">
                <div className="volunteer-detail-item">
                  <span className="detail-label">ID:</span>
                  <span className="detail-value">{volunteer.id}</span>
                </div>
                <div className="volunteer-detail-item">
                  <span className="detail-label">Contact:</span>
                  <span className="detail-value">📞 {volunteer.contactNumber}</span>
                </div>
                <div className="volunteer-detail-item">
                  <span className="detail-label">Skills:</span>
                  <span className="detail-value skill-badge">{volunteer.skills}</span>
                </div>
                <div className="volunteer-detail-item">
                  <span className="detail-label">Location:</span>
                  <span className="detail-value">📍 {volunteer.location}</span>
                </div>
                {volunteer.assignedEmergency && (
                  <div className="volunteer-detail-item">
                    <span className="detail-label">Assigned To:</span>
                    <span className="detail-value emergency-link">
                      Emergency #{volunteer.assignedEmergency}
                    </span>
                  </div>
                )}
              </div>

              <div className="volunteer-actions">
                <button
                  className={volunteer.available ? 'btn-secondary' : 'btn-primary'}
                  onClick={() => toggleAvailability(volunteer.id, volunteer.available)}
                >
                  Mark as {volunteer.available ? 'On Duty' : 'Available'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary Stats */}
      <div className="panel">
        <h3>Volunteer Summary</h3>
        <div className="summary-stats">
          <div className="summary-item">
            <span className="summary-label">Total Volunteers:</span>
            <span className="summary-value">{volunteers.length}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Available:</span>
            <span className="summary-value available">{volunteers.filter(v => v.available).length}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">On Duty:</span>
            <span className="summary-value unavailable">{volunteers.filter(v => !v.available).length}</span>
          </div>
        </div>
      </div>

      <div className="info-box">
        <h3>ℹ️ Volunteer Management</h3>
        <ul>
          <li>Volunteers are automatically matched to emergencies based on their skills and location</li>
          <li>Update availability status to indicate when volunteers are on duty or available</li>
          <li>The system prioritizes volunteers who are closest to the emergency location</li>
          <li>Volunteers with specialized skills are matched to appropriate emergency types</li>
        </ul>
      </div>
    </section>
  );
}
