import { useState, useEffect } from 'react';
import { getResources, createResource, updateResourceAvailability } from '../api/resqnetApi.js';

export default function ResourceInventoryView() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterType, setFilterType] = useState('ALL');
  const [filterAvailability, setFilterAvailability] = useState('ALL');

  const [formData, setFormData] = useState({
    type: 'AMBULANCE',
    location: '',
    quantity: 1,
    provider: ''
  });

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      setLoading(true);
      const data = await getResources();
      setResources(data);
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
      await createResource(formData);
      await loadResources();
      setShowAddForm(false);
      setFormData({
        type: 'AMBULANCE',
        location: '',
        quantity: 1,
        provider: ''
      });
    } catch (err) {
      alert('Failed to add resource: ' + err.message);
    }
  };

  const toggleAvailability = async (id, currentStatus) => {
    try {
      await updateResourceAvailability(id, !currentStatus);
      await loadResources();
    } catch (err) {
      alert('Failed to update availability: ' + err.message);
    }
  };

  const filteredResources = resources.filter(resource => {
    const typeMatch = filterType === 'ALL' || resource.type === filterType;
    const availMatch = filterAvailability === 'ALL' || 
                       (filterAvailability === 'AVAILABLE' && resource.available) ||
                       (filterAvailability === 'UNAVAILABLE' && !resource.available);
    return typeMatch && availMatch;
  });

  if (loading) {
    return (
      <section className="panel">
        <h1>📦 Resource Inventory</h1>
        <div className="loading">Loading resources...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="panel">
        <h1>📦 Resource Inventory</h1>
        <div className="error-message">⚠️ Failed to load resources: {error}</div>
        <button onClick={loadResources} className="btn-primary">Retry</button>
      </section>
    );
  }

  return (
    <section>
      <div className="page-header">
        <h1>📦 Resource Inventory</h1>
        <p className="subtitle">Manage emergency response resources and equipment</p>
      </div>

      {/* Controls */}
      <div className="panel controls-panel">
        <div className="filters">
          <div className="filter-group">
            <label>Resource Type:</label>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="ALL">All Types</option>
              <option value="AMBULANCE">🚑 Ambulance</option>
              <option value="FIRE_TRUCK">🚒 Fire Truck</option>
              <option value="MEDICAL_KIT">🏥 Medical Kit</option>
              <option value="FOOD">🍲 Food</option>
              <option value="WATER">💧 Water</option>
              <option value="SHELTER">🏠 Shelter</option>
              <option value="RESCUE_EQUIPMENT">⛑️ Rescue Equipment</option>
              <option value="VEHICLE">🚗 Vehicle</option>
              <option value="OTHER">📦 Other</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Availability:</label>
            <select value={filterAvailability} onChange={(e) => setFilterAvailability(e.target.value)}>
              <option value="ALL">All</option>
              <option value="AVAILABLE">Available</option>
              <option value="UNAVAILABLE">In Use</option>
            </select>
          </div>
        </div>

        <button 
          className="btn-primary"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? 'Cancel' : '+ Add Resource'}
        </button>
      </div>

      {/* Add Resource Form */}
      {showAddForm && (
        <div className="panel">
          <h2>Add New Resource</h2>
          <form onSubmit={handleSubmit} className="resource-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="type">Resource Type *</label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                >
                  <option value="AMBULANCE">🚑 Ambulance</option>
                  <option value="FIRE_TRUCK">🚒 Fire Truck</option>
                  <option value="MEDICAL_KIT">🏥 Medical Kit</option>
                  <option value="FOOD">🍲 Food</option>
                  <option value="WATER">💧 Water</option>
                  <option value="SHELTER">🏠 Shelter</option>
                  <option value="RESCUE_EQUIPMENT">⛑️ Rescue Equipment</option>
                  <option value="VEHICLE">🚗 Vehicle</option>
                  <option value="OTHER">📦 Other</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="quantity">Quantity *</label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                  min="1"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="location">Location *</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  placeholder="Enter resource location"
                />
              </div>

              <div className="form-group">
                <label htmlFor="provider">Provider *</label>
                <input
                  type="text"
                  id="provider"
                  name="provider"
                  value={formData.provider}
                  onChange={handleChange}
                  required
                  placeholder="Organization or person providing"
                />
              </div>
            </div>

            <button type="submit" className="btn-primary">Add Resource</button>
          </form>
        </div>
      )}

      {/* Resources Grid */}
      <div className="resources-grid">
        {filteredResources.length === 0 ? (
          <div className="panel">
            <p className="empty-state">No resources found matching the filters</p>
          </div>
        ) : (
          filteredResources.map((resource) => (
            <div key={resource.id} className="resource-card panel">
              <div className="resource-header">
                <h3>{resource.type}</h3>
                <span className={`availability-badge ${resource.available ? 'available' : 'unavailable'}`}>
                  {resource.available ? '✅ Available' : '🔴 In Use'}
                </span>
              </div>

              <div className="resource-details">
                <div className="resource-detail-item">
                  <span className="detail-label">ID:</span>
                  <span className="detail-value">{resource.id}</span>
                </div>
                <div className="resource-detail-item">
                  <span className="detail-label">Location:</span>
                  <span className="detail-value">📍 {resource.location}</span>
                </div>
                <div className="resource-detail-item">
                  <span className="detail-label">Quantity:</span>
                  <span className="detail-value">{resource.quantity}</span>
                </div>
                <div className="resource-detail-item">
                  <span className="detail-label">Provider:</span>
                  <span className="detail-value">{resource.provider}</span>
                </div>
              </div>

              <div className="resource-actions">
                <button
                  className={resource.available ? 'btn-secondary' : 'btn-primary'}
                  onClick={() => toggleAvailability(resource.id, resource.available)}
                >
                  Mark as {resource.available ? 'In Use' : 'Available'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary Stats */}
      <div className="panel">
        <h3>Inventory Summary</h3>
        <div className="summary-stats">
          <div className="summary-item">
            <span className="summary-label">Total Resources:</span>
            <span className="summary-value">{resources.length}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Available:</span>
            <span className="summary-value available">{resources.filter(r => r.available).length}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">In Use:</span>
            <span className="summary-value unavailable">{resources.filter(r => !r.available).length}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
