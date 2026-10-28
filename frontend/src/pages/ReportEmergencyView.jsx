import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Crosshair, LifeBuoy, MapPin, ShieldCheck } from 'lucide-react';
import { createEmergency } from '../api/resqnetApi.js';
import './EmergencyReport.css';

const initialForm = {
  reporterName: '',
  contact: '',
  type: 'MEDICAL',
  location: '',
  affectedPeopleCount: '1',
  description: '',
  priority: 'MEDIUM',
  requiredResourceType: 'AMBULANCE',
};

export default function ReportEmergencyView() {
  const [form, setForm] = useState(initialForm);
  const [coordinates, setCoordinates] = useState(null);
  const [gpsError, setGpsError] = useState('');
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [createdEmergency, setCreatedEmergency] = useState(null);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    if (name === 'location') setCoordinates(null);
  };

  const detectLocation = () => {
    setGpsError('');
    setCoordinates(null);
    if (!navigator.geolocation) {
      setGpsError('This browser does not support location access. Enter a location manually.');
      return;
    }

    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords: position }) => {
        setCoordinates({
          latitude: position.latitude,
          longitude: position.longitude,
        });
        setLoadingLocation(false);
      },
      (locationError) => {
        setGpsError(locationError.message || 'Location access was not available. Enter a location manually.');
        setLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 },
    );
  };

  const submitReport = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    const coordinateText = coordinates
      ? ` (${coordinates.latitude.toFixed(6)}, ${coordinates.longitude.toFixed(6)})`
      : '';
    try {
      const report = await createEmergency({
        ...form,
        contact: form.contact.trim(),
        location: `${form.location.trim()}${coordinateText}`,
        affectedPeopleCount: Number(form.affectedPeopleCount),
      });
      setCreatedEmergency(report);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to submit the emergency report.');
    } finally {
      setSubmitting(false);
    }
  };

  if (createdEmergency) {
    return (
      <div className="emergency-report-page">
        <section className="report-success-card" role="status">
          <span className="report-success-icon"><ShieldCheck size={30} aria-hidden="true" /></span>
          <p className="report-eyebrow">REPORT SAVED</p>
          <h1>Emergency report received</h1>
          <p>
            Report <strong>#{createdEmergency.id}</strong> was saved by the ResQNet backend.
            Dispatch status: <strong>{createdEmergency.status.replaceAll('_', ' ')}</strong>.
          </p>
          <div className="report-success-actions">
            <Link className="report-primary-button" to="/emergencies">View incident feed</Link>
            <button
              className="report-secondary-button"
              onClick={() => {
                setForm(initialForm);
                setCoordinates(null);
                setCreatedEmergency(null);
              }}
              type="button"
            >
              Submit another report
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="emergency-report-page">
      <header className="report-page-heading">
        <span className="report-heading-icon"><LifeBuoy size={22} aria-hidden="true" /></span>
        <div>
          <p className="report-eyebrow">RESQNET EMERGENCY RESPONSE</p>
          <h1>Report an emergency</h1>
          <p>Submit a report directly to the live ResQNet backend.</p>
        </div>
      </header>

      <form className="report-form-card" onSubmit={submitReport}>
        {error && <div className="report-error" role="alert">{error}</div>}

        <div className="report-form-grid">
          <label className="report-field">
            <span>Reporter name</span>
            <input autoComplete="name" maxLength={120} name="reporterName" onChange={updateField}
              placeholder="Your full name" required value={form.reporterName} />
          </label>
          <label className="report-field">
            <span>Contact number</span>
            <input autoComplete="tel" maxLength={40} name="contact" onChange={updateField}
              placeholder="Phone number for a callback" required value={form.contact} />
          </label>
          <label className="report-field">
            <span>Emergency type</span>
            <select name="type" onChange={updateField} value={form.type}>
              <option value="MEDICAL">Medical</option>
              <option value="ACCIDENT">Accident</option>
              <option value="FIRE">Fire</option>
              <option value="FLOOD">Flood</option>
              <option value="EARTHQUAKE">Earthquake</option>
            </select>
          </label>
          <label className="report-field">
            <span>People affected</span>
            <input min="1" name="affectedPeopleCount" onChange={updateField}
              required type="number" value={form.affectedPeopleCount} />
          </label>
          <label className="report-field report-field-wide">
            <span>Location or landmark</span>
            <span className="report-location-input">
              <MapPin size={17} aria-hidden="true" />
              <input autoComplete="street-address" maxLength={300} name="location" onChange={updateField}
                placeholder="Street, area, town, or nearby landmark" required value={form.location} />
            </span>
            <button className="report-location-button" disabled={loadingLocation} onClick={detectLocation} type="button">
              <Crosshair size={15} aria-hidden="true" />
              {loadingLocation ? 'Getting location…' : 'Attach my current GPS location'}
            </button>
            {coordinates && (
              <span className="report-field-hint">
                GPS attached: {coordinates.latitude.toFixed(5)}, {coordinates.longitude.toFixed(5)}
              </span>
            )}
            {gpsError && <span className="report-field-error" role="status">{gpsError}</span>}
          </label>
          <label className="report-field">
            <span>Urgency</span>
            <select name="priority" onChange={updateField} value={form.priority}>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </label>
          <label className="report-field">
            <span>Required resource</span>
            <select name="requiredResourceType" onChange={updateField} value={form.requiredResourceType}>
              <option value="AMBULANCE">Ambulance</option>
              <option value="MEDICAL_KIT">Medical kit</option>
              <option value="MEDICINE">Medicine</option>
              <option value="VEHICLE">Vehicle</option>
              <option value="RESCUE_EQUIPMENT">Rescue equipment</option>
              <option value="SHELTER">Shelter</option>
              <option value="FOOD">Food</option>
              <option value="WATER">Water</option>
            </select>
          </label>
          <label className="report-field report-field-wide">
            <span>What happened?</span>
            <textarea maxLength={2000} name="description" onChange={updateField}
              placeholder="Describe the situation and any immediate safety concerns." rows={5}
              value={form.description} />
          </label>
        </div>

        <div className="report-form-footer">
          <p>Your report is sent to the backend and stored with the emergency records.</p>
          <button className="report-primary-button" disabled={submitting} type="submit">
            {submitting ? 'Submitting report…' : 'Submit emergency report'}
          </button>
        </div>
      </form>
    </div>
  );
}
