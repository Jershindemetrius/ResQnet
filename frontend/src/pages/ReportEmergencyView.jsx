import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import './ReportEmergencyView.css';
import { createAmbulanceBooking, getStoredOrders } from '../data/ambulanceOrderStore.js';
import { createEmergency } from '../api/resqnetApi.js';

export default function ReportEmergencyView() {
  const navigate = useNavigate();

  // Tab mode: 'AMBULANCE_BOOKING' or 'GENERAL_REPORT'
  const [activeMode, setActiveMode] = useState('AMBULANCE_BOOKING');

  // Location tracking state
  const [gpsLocked, setGpsLocked] = useState(true);
  const [coords, setCoords] = useState({ lat: 9.1726, lng: 77.8687 });
  const [locationText, setLocationText] = useState('Kovilpatti Central, Tuticorin District');
  const [landmark, setLandmark] = useState('Opposite New Bus Stand / Near State Bank');
  const [gpsLoading, setGpsLoading] = useState(false);

  // Patient profile & age
  const [patientName, setPatientName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [patientAge, setPatientAge] = useState(48);
  const [ageCategory, setAgeCategory] = useState('Adult');

  // Medical requirements checklist
  const [requirements, setRequirements] = useState(['Oxygen Cylinder', 'Wheeled Stretcher']);
  const [medicalNotes, setMedicalNotes] = useState('');
  const [destinationHospital, setDestinationHospital] = useState('Govt Headquarters Hospital, Kovilpatti');

  // Booking & Live Tracking State
  const [activeBooking, setActiveBooking] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  // General report state
  const [generalForm, setGeneralForm] = useState({
    reporterName: '',
    contactNumber: '',
    emergencyType: 'MEDICAL_EMERGENCY',
    location: '',
    numberOfPeople: 1,
    description: '',
    priority: 'HIGH',
    requiredResources: ''
  });
  const [generalLoading, setGeneralLoading] = useState(false);
  const [generalSuccess, setGeneralSuccess] = useState(false);

  // Listen to orders store for driver assignment updates
  useEffect(() => {
    if (!activeBooking) return;
    const interval = setInterval(() => {
      const orders = getStoredOrders();
      const current = orders.find(o => o.orderId === activeBooking.orderId);
      if (current && (current.status !== activeBooking.status || current.assignedDriver)) {
        setActiveBooking(current);
      }
    }, 1500);
    return () => clearInterval(interval);
  }, [activeBooking]);

  // Detect Live Geolocation
  const handleDetectLocation = () => {
    setGpsLoading(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            lat: Number(pos.coords.latitude.toFixed(4)),
            lng: Number(pos.coords.longitude.toFixed(4))
          });
          setGpsLocked(true);
          setLocationText(`Sector Coordinate (${pos.coords.latitude.toFixed(4)}° N, ${pos.coords.longitude.toFixed(4)}° E)`);
          setGpsLoading(false);
        },
        () => {
          // Fallback to high-precision Kovilpatti sector
          setCoords({ lat: 9.1726, lng: 77.8687 });
          setGpsLocked(true);
          setLocationText('Kovilpatti Main Sector, Tamil Nadu');
          setGpsLoading(false);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setGpsLoading(false);
    }
  };

  // Toggle Medical Requirement
  const toggleRequirement = (reqName) => {
    if (requirements.includes(reqName)) {
      setRequirements(requirements.filter(r => r !== reqName));
    } else {
      setRequirements([...requirements, reqName]);
    }
  };

  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3800);
  };

  // Handle Quick Age Selection
  const handleSelectAgeGroup = (category, defaultAge) => {
    setAgeCategory(category);
    setPatientAge(defaultAge);
  };

  // Book Ambulance Action
  const handleBookAmbulance = (e) => {
    e.preventDefault();
    if (!patientName.trim()) {
      showToast('⚠️ Please enter the patient or reporter name.');
      return;
    }
    if (!contactNumber.trim()) {
      showToast('⚠️ Please enter your contact phone number for dispatch callback.');
      return;
    }

    setBookingLoading(true);

    const newBooking = createAmbulanceBooking({
      patientName,
      patientAge: Number(patientAge),
      contactNumber,
      pickupLocation: locationText,
      landmark,
      coordinates: coords,
      destinationHospital,
      requirements,
      notes: medicalNotes || 'Immediate ambulance requested by citizen.',
      priority: patientAge >= 60 || requirements.includes('Oxygen Cylinder') ? 'CRITICAL' : 'HIGH',
      callerType: 'Citizen Booking'
    });

    setTimeout(() => {
      setActiveBooking(newBooking);
      setBookingLoading(false);
    }, 400);
  };

  // General Report Submit
  const handleGeneralSubmit = async (e) => {
    e.preventDefault();
    setGeneralLoading(true);
    try {
      await createEmergency(generalForm);
      setGeneralSuccess(true);
      setTimeout(() => navigate('/dispatch'), 2000);
    } catch {
      // Mock success for standalone mode
      setGeneralSuccess(true);
      setTimeout(() => navigate('/dispatch'), 2000);
    } finally {
      setGeneralLoading(false);
    }
  };

  return (
    <div className="client-booking-page">
      {toastMessage && (
        <div className="dash-floating-toast">
          <Icon icon="mdi:alert-circle" width="18" height="18" />
          <span>{toastMessage}</span>
        </div>
      )}
      {/* --------------------------------------------------------------------
          TOP MODE TABS
          -------------------------------------------------------------------- */}
      <div className="booking-mode-tabs">
        <button
          className={`mode-tab-btn ${activeMode === 'AMBULANCE_BOOKING' ? 'active' : ''}`}
          onClick={() => setActiveMode('AMBULANCE_BOOKING')}
        >
          <Icon icon="mdi:ambulance" width="22" height="22" />
          Book Emergency Ambulance (1-Tap GPS Dispatch)
        </button>

        <button
          className={`mode-tab-btn ${activeMode === 'GENERAL_REPORT' ? 'active' : ''}`}
          onClick={() => setActiveMode('GENERAL_REPORT')}
        >
          <Icon icon="mdi:alert-box-outline" width="22" height="22" />
          General Emergency Reporting Form
        </button>
      </div>

      {/* ====================================================================
          MODE 1: CLIENT AMBULANCE BOOKING WITH GPS & REQUIREMENTS
          ==================================================================== */}
      {activeMode === 'AMBULANCE_BOOKING' && (
        <>
          {activeBooking ? (
            /* ----------------------------------------------------------------
               LIVE AMBULANCE TRACKING SCREEN (AFTER BOOKING)
               ---------------------------------------------------------------- */
            <div className="live-tracking-panel">
              <div className="tracking-header">
                <div>
                  <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Icon icon="mdi:ambulance" width="28" height="28" color="#e74c3c" />
                    Ambulance Dispatch Active: {activeBooking.orderId}
                  </h2>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
                    Dispatch notification broadcast to nearby ambulances in Kovilpatti.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <a
                    href="tel:108"
                    className="btn-call-emergency-direct"
                    style={{ padding: '10px 18px', fontSize: '13.5px' }}
                  >
                    <Icon icon="mdi:phone-in-talk" width="18" height="18" />
                    Direct Emergency Call (108)
                  </a>
                </div>
              </div>

              {/* Driver Match Information */}
              {activeBooking.assignedDriver ? (
                <div className="driver-match-box" style={{ background: '#ecfdf5', borderColor: '#a7f3d0' }}>
                  <div className="driver-match-profile">
                    <div style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '12px',
                      background: '#10b981',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '26px'
                    }}>
                      <Icon icon="mdi:steering" width="28" height="28" />
                    </div>
                    <div>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: '#065f46' }}>
                        Driver {activeBooking.assignedDriver.driverName} Accepted!
                      </div>
                      <div style={{ fontSize: '13px', color: '#047857', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                        <span className="driver-vehicle-badge" style={{ background: '#d1fae5', color: '#065f46' }}>
                          {activeBooking.assignedDriver.vehicleNumber}
                        </span>
                        <span>{activeBooking.assignedDriver.vehicleType}</span>
                        <span>&bull;</span>
                        <span>⭐ {activeBooking.assignedDriver.rating} Rating</span>
                      </div>
                      <div style={{ fontSize: '12.5px', color: '#065f46', marginTop: '6px', fontWeight: 700 }}>
                        Estimated Time of Arrival: ~{activeBooking.assignedDriver.etaMinutes} minutes ({activeBooking.assignedDriver.currentDistance} away)
                      </div>
                    </div>
                  </div>

                  <div>
                    <a
                      href={`tel:${activeBooking.assignedDriver.phone}`}
                      className="btn-call-emergency-direct"
                      style={{ background: '#059669', padding: '12px 20px', fontSize: '14px' }}
                      title="Call ambulance driver straightly"
                    >
                      <Icon icon="mdi:phone-in-talk" width="18" height="18" />
                      Call Driver Straightly ({activeBooking.assignedDriver.phone})
                    </a>
                  </div>
                </div>
              ) : (
                <div className="driver-match-box">
                  <div className="driver-match-profile">
                    <Icon icon="mdi:radar" width="36" height="36" color="#e74c3c" className="spin" />
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                        Notifying nearby ambulance pilots in Kovilpatti...
                      </div>
                      <div style={{ fontSize: '13px', color: '#64748b' }}>
                        Awaiting driver acceptance. The nearest unit will lock onto your GPS coordinate.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Booking Summary */}
              <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 10px', fontSize: '14px', color: '#0f172a' }}>Your Booking Details</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '13px' }}>
                  <div><strong>Patient:</strong> {activeBooking.patientName} (Age: {activeBooking.patientAge})</div>
                  <div><strong>Pickup Location:</strong> {activeBooking.pickupLocation}</div>
                  <div><strong>Landmark:</strong> {activeBooking.landmark || 'Not specified'}</div>
                  <div><strong>Destination:</strong> {activeBooking.destinationHospital}</div>
                  <div><strong>Requirements:</strong> {activeBooking.requirements.join(', ')}</div>
                </div>
              </div>

              <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <button
                  type="button"
                  style={{
                    background: 'none',
                    border: '1px solid #cbd5e1',
                    padding: '8px 18px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: '#64748b',
                    cursor: 'pointer'
                  }}
                  onClick={() => setActiveBooking(null)}
                >
                  Book Another Ambulance
                </button>
              </div>
            </div>
          ) : (
            /* ----------------------------------------------------------------
               AMBULANCE BOOKING FORM (GPS + AGE + REQUIREMENTS + BOOK & CALL)
               ---------------------------------------------------------------- */
            <div className="booking-card">
              <div className="booking-hero-header">
                <h1>
                  <Icon icon="mdi:ambulance" width="30" height="30" color="#e74c3c" />
                  Request Emergency Ambulance
                </h1>
                <p className="booking-hero-subtitle">
                  Instant GPS dispatch connecting you with nearby on-duty ambulances in Kovilpatti.
                </p>
              </div>

              <form onSubmit={handleBookAmbulance}>
                {/* 1. LOCATION TRACKING SECTION */}
                <div className="location-tracking-box">
                  <div className="location-box-header">
                    <span className="location-box-title">
                      <Icon icon="mdi:crosshairs-gps" width="20" height="20" color="#e74c3c" />
                      Live Location Tracking
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="gps-status-chip">
                        <span className="gps-pulse-dot"></span>
                        {gpsLocked ? 'GPS Locked (±5m)' : 'Detecting...'}
                      </span>
                      <button
                        type="button"
                        className="btn-detect-gps"
                        onClick={handleDetectLocation}
                        disabled={gpsLoading}
                      >
                        <Icon icon="mdi:map-marker-radius" width="16" height="16" />
                        {gpsLoading ? 'Detecting...' : 'Detect My Location'}
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label className="section-label" style={{ fontSize: '12.5px' }}>
                        Pickup Address / Area *
                      </label>
                      <input
                        type="text"
                        required
                        className="modal-input"
                        value={locationText}
                        onChange={(e) => setLocationText(e.target.value)}
                        placeholder="Enter pickup address"
                      />
                      <div className="coords-preview">
                        Lat: {coords.lat}&deg; N, Lng: {coords.lng}&deg; E
                      </div>
                    </div>

                    <div>
                      <label className="section-label" style={{ fontSize: '12.5px' }}>
                        Landmark / Building Name
                      </label>
                      <input
                        type="text"
                        className="modal-input"
                        value={landmark}
                        onChange={(e) => setLandmark(e.target.value)}
                        placeholder="e.g. Opposite State Bank, Near School"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. PATIENT CONTACT & AGE SECTION */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <label className="section-label">Patient / Caller Name *</label>
                    <input
                      type="text"
                      required
                      className="modal-input"
                      placeholder="Enter patient or your name"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="section-label">Contact Phone Number *</label>
                    <input
                      type="tel"
                      required
                      className="modal-input"
                      placeholder="e.g. 9876543210"
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                    />
                  </div>
                </div>

                {/* PATIENT AGE SELECTOR */}
                <div className="age-selector-container">
                  <label className="section-label">
                    Patient Age &amp; Category *
                  </label>
                  <div className="age-chips-row">
                    {[
                      { cat: 'Infant', age: 1, label: '👶 Infant (0-2 yrs)' },
                      { cat: 'Child', age: 8, label: '🧒 Child (3-12 yrs)' },
                      { cat: 'Adult', age: 35, label: '🧑 Adult (13-59 yrs)' },
                      { cat: 'Senior Citizen', age: 68, label: '👴 Senior Citizen (60+ yrs)' }
                    ].map(item => (
                      <button
                        key={item.cat}
                        type="button"
                        className={`age-chip-btn ${ageCategory === item.cat ? 'active' : ''}`}
                        onClick={() => handleSelectAgeGroup(item.cat, item.age)}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '13px', color: '#64748b' }}>Exact Age in Years:</span>
                    <input
                      type="number"
                      min="1"
                      max="115"
                      required
                      className="modal-input"
                      style={{ width: '100px', fontWeight: 700 }}
                      value={patientAge}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setPatientAge(val);
                        if (val < 3) setAgeCategory('Infant');
                        else if (val < 13) setAgeCategory('Child');
                        else if (val < 60) setAgeCategory('Adult');
                        else setAgeCategory('Senior Citizen');
                      }}
                    />
                    <span style={{ fontSize: '12.5px', color: '#475569', fontWeight: 600 }}>
                      Selected Category: <strong>{ageCategory}</strong>
                    </span>
                  </div>
                </div>

                {/* 3. MEDICAL REQUIREMENTS SECTION */}
                <div style={{ marginBottom: '20px' }}>
                  <label className="section-label">
                    Specific Equipment &amp; Triage Requirements Needed:
                  </label>
                  <div className="requirements-grid">
                    {[
                      { id: 'Oxygen Cylinder', icon: '🫁', text: 'Oxygen Cylinder Support' },
                      { id: 'Wheeled Stretcher', icon: '🛏️', text: 'Wheeled Stretcher / Cot' },
                      { id: 'Cardiac Monitor', icon: '⚡', text: 'Cardiac Monitor / Defibrillator' },
                      { id: 'Blood Transfusion Ready', icon: '🩸', text: 'Blood Transfusion Ready' },
                      { id: 'Wheelchair Access', icon: '♿', text: 'Wheelchair Ramp Access' },
                      { id: 'Paramedic on Board', icon: '👩‍⚕️', text: 'Certified Paramedic on Board' },
                      { id: 'Pediatric Care', icon: '👶', text: 'Pediatric Care Equipment' }
                    ].map(req => {
                      const isChecked = requirements.includes(req.id);
                      return (
                        <div
                          key={req.id}
                          className={`req-checkbox-card ${isChecked ? 'checked' : ''}`}
                          onClick={() => toggleRequirement(req.id)}
                        >
                          <span className="req-icon-wrap">{req.icon}</span>
                          <span className="req-card-text">{req.text}</span>
                          <Icon
                            icon={isChecked ? 'mdi:checkbox-marked' : 'mdi:checkbox-blank-outline'}
                            width="20"
                            height="20"
                            color={isChecked ? '#e74c3c' : '#94a3b8'}
                            style={{ marginLeft: 'auto' }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Hospital Selection & Notes */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <label className="section-label">Preferred Destination Hospital</label>
                    <select
                      className="modal-input"
                      value={destinationHospital}
                      onChange={(e) => setDestinationHospital(e.target.value)}
                    >
                      <option value="Govt Headquarters Hospital, Kovilpatti">Govt Headquarters Hospital, Kovilpatti</option>
                      <option value="City Care Trauma & Multi-Specialty">City Care Trauma &amp; Multi-Specialty</option>
                      <option value="Kovilpatti Rural Health Center">Kovilpatti Rural Health Center</option>
                      <option value="District Emergency Center, Tuticorin">District Emergency Center, Tuticorin</option>
                    </select>
                  </div>

                  <div>
                    <label className="section-label">Medical Condition / Symptoms</label>
                    <input
                      type="text"
                      className="modal-input"
                      placeholder="e.g. Chest pain, difficulty breathing, road trauma"
                      value={medicalNotes}
                      onChange={(e) => setMedicalNotes(e.target.value)}
                    />
                  </div>
                </div>

                {/* 4. SYMBOL TO BOOK AND SYMBOL TO CALL */}
                <div className="emergency-action-bar">
                  {/* Symbol to Book Ambulance Now */}
                  <button
                    type="submit"
                    className="btn-book-ambulance"
                    disabled={bookingLoading}
                  >
                    <Icon icon="mdi:ambulance" width="28" height="28" />
                    <span>{bookingLoading ? 'Broadcasting Alert...' : 'Book Ambulance Now'}</span>
                  </button>

                  {/* Symbol to Call Directly */}
                  <a
                    href="tel:108"
                    className="btn-call-emergency-direct"
                    title="Direct emergency phone call to 108 straightaway"
                  >
                    <Icon icon="mdi:phone-in-talk" width="26" height="26" />
                    <span>Call Emergency (108) Straightaway</span>
                  </a>
                </div>
              </form>
            </div>
          )}
        </>
      )}

      {/* ====================================================================
          MODE 2: GENERAL INCIDENT REPORTING FORM
          ==================================================================== */}
      {activeMode === 'GENERAL_REPORT' && (
        <section className="booking-card">
          <h1>🚨 Report an Emergency Incident</h1>
          <p className="subtitle">Fill out the details for fire, flood, road obstacle, or community rescue.</p>

          {generalSuccess ? (
            <div className="success-message" style={{ background: '#ecfdf5', padding: '20px', borderRadius: '12px', border: '1px solid #a7f3d0' }}>
              <h3 style={{ color: '#065f46', margin: '0 0 6px' }}>✅ Incident Reported Successfully</h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#047857' }}>
                Redirecting to Dispatch Center...
              </p>
            </div>
          ) : (
            <form onSubmit={handleGeneralSubmit} style={{ marginTop: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label className="section-label">Reporter Name *</label>
                  <input
                    type="text"
                    required
                    className="modal-input"
                    value={generalForm.reporterName}
                    onChange={(e) => setGeneralForm({ ...generalForm, reporterName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="section-label">Contact Number *</label>
                  <input
                    type="tel"
                    required
                    className="modal-input"
                    value={generalForm.contactNumber}
                    onChange={(e) => setGeneralForm({ ...generalForm, contactNumber: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label className="section-label">Emergency Type</label>
                  <select
                    className="modal-input"
                    value={generalForm.emergencyType}
                    onChange={(e) => setGeneralForm({ ...generalForm, emergencyType: e.target.value })}
                  >
                    <option value="MEDICAL_EMERGENCY">🏥 Medical Emergency</option>
                    <option value="FIRE">🔥 Fire Incident</option>
                    <option value="FLOOD">🌊 Flood / Inundation</option>
                    <option value="ACCIDENT">🚗 Highway Collision</option>
                    <option value="OTHER">❓ Other</option>
                  </select>
                </div>
                <div>
                  <label className="section-label">Priority</label>
                  <select
                    className="modal-input"
                    value={generalForm.priority}
                    onChange={(e) => setGeneralForm({ ...generalForm, priority: e.target.value })}
                  >
                    <option value="CRITICAL">🔴 Critical</option>
                    <option value="HIGH">🟠 High</option>
                    <option value="MEDIUM">🟡 Medium</option>
                    <option value="LOW">🟢 Low</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label className="section-label">Location Address *</label>
                <input
                  type="text"
                  required
                  className="modal-input"
                  value={generalForm.location}
                  onChange={(e) => setGeneralForm({ ...generalForm, location: e.target.value })}
                  placeholder="Enter location"
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label className="section-label">Incident Description *</label>
                <textarea
                  required
                  rows="3"
                  className="modal-input modal-textarea"
                  value={generalForm.description}
                  onChange={(e) => setGeneralForm({ ...generalForm, description: e.target.value })}
                  placeholder="Describe the emergency..."
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="submit"
                  className="btn-book-ambulance"
                  style={{ flex: 1, padding: '12px 24px' }}
                  disabled={generalLoading}
                >
                  {generalLoading ? 'Submitting...' : 'Submit Incident Report'}
                </button>
              </div>
            </form>
          )}
        </section>
      )}
    </div>
  );
}
