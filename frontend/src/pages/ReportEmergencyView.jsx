import { useState } from 'react';
import { createEmergency } from '../api/resqnetApi.js';
import { useNavigate } from 'react-router-dom';

export default function ReportEmergencyView() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    reporterName: '',
    contactNumber: '',
    emergencyType: 'MEDICAL_EMERGENCY',
    location: '',
    numberOfPeople: 1,
    description: '',
    priority: 'MEDIUM',
    requiredResources: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      await createEmergency(formData);
      setSuccess(true);
      
      // Reset form
      setFormData({
        reporterName: '',
        contactNumber: '',
        emergencyType: 'MEDICAL_EMERGENCY',
        location: '',
        numberOfPeople: 1,
        description: '',
        priority: 'MEDIUM',
        requiredResources: ''
      });
      
      // Navigate to dispatch center after 2 seconds
      setTimeout(() => {
        navigate('/dispatch');
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <section className="panel">
        <div className="success-message">
          <h2>✅ Emergency Reported Successfully</h2>
          <p>Your emergency request has been submitted. Our system is now matching available resources...</p>
          <p>Redirecting to Dispatch Center...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="panel">
      <h1>🚨 Report an Emergency</h1>
      <p className="subtitle">Fill out the form below to submit an emergency request</p>

      {error && (
        <div className="error-message">
          ⚠️ Error: {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="emergency-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="reporterName">Reporter Name *</label>
            <input
              type="text"
              id="reporterName"
              name="reporterName"
              value={formData.reporterName}
              onChange={handleChange}
              required
              placeholder="Enter your name"
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
            <label htmlFor="emergencyType">Emergency Type *</label>
            <select
              id="emergencyType"
              name="emergencyType"
              value={formData.emergencyType}
              onChange={handleChange}
              required
            >
              <option value="MEDICAL_EMERGENCY">🏥 Medical Emergency</option>
              <option value="FIRE">🔥 Fire</option>
              <option value="FLOOD">🌊 Flood</option>
              <option value="ACCIDENT">🚗 Accident</option>
              <option value="EARTHQUAKE">🏚️ Earthquake</option>
              <option value="NATURAL_DISASTER">🌪️ Natural Disaster</option>
              <option value="OTHER">❓ Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="priority">Priority Level *</label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              required
            >
              <option value="CRITICAL">🔴 Critical</option>
              <option value="HIGH">🟠 High</option>
              <option value="MEDIUM">🟡 Medium</option>
              <option value="LOW">🟢 Low</option>
            </select>
          </div>
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
            placeholder="Enter exact location or address"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="numberOfPeople">Number of People Affected *</label>
            <input
              type="number"
              id="numberOfPeople"
              name="numberOfPeople"
              value={formData.numberOfPeople}
              onChange={handleChange}
              required
              min="1"
            />
          </div>

          <div className="form-group">
            <label htmlFor="requiredResources">Required Resources</label>
            <input
              type="text"
              id="requiredResources"
              name="requiredResources"
              value={formData.requiredResources}
              onChange={handleChange}
              placeholder="e.g., Ambulance, Fire Truck, Medical Kit"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="4"
            placeholder="Provide detailed description of the emergency situation..."
          />
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="btn-primary btn-large"
            disabled={loading}
          >
            {loading ? 'Submitting...' : '🚨 Submit Emergency Request'}
          </button>
          <button 
            type="button" 
            className="btn-secondary"
            onClick={() => navigate('/')}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>

      <div className="info-box">
        <h3>ℹ️ What happens next?</h3>
        <ol>
          <li>Your emergency request is submitted to the system</li>
          <li>Priority level is automatically assessed</li>
          <li>System searches for available resources and volunteers</li>
          <li>Best matching resources are identified based on location and availability</li>
          <li>Resources are assigned and dispatched to your location</li>
          <li>You can track the status in real-time from the Dispatch Center</li>
        </ol>
      </div>
    </section>
  );
}
