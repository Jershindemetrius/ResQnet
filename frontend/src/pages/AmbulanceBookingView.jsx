import { useCallback, useEffect, useState } from 'react';
import { Ambulance, CheckCircle2, Crosshair, MapPin, PhoneCall, RefreshCw } from 'lucide-react';
import { createEmergency, getAmbulanceInventory } from '../api/resqnetApi.js';
import usePolling from '../hooks/usePolling.js';
import './AmbulanceBookingView.css';

const initialForm = {
  reporterName: '',
  contact: '',
  location: '',
  affectedPeopleCount: '1',
  description: '',
  priority: 'HIGH',
};
const PAGE_SIZE = 12;

export default function AmbulanceBookingView() {
  const [inventory, setInventory] = useState(null);
  const [inventoryOffset, setInventoryOffset] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [coordinates, setCoordinates] = useState(null);
  const [loadingInventory, setLoadingInventory] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [inventoryError, setInventoryError] = useState('');
  const [report, setReport] = useState(null);

  const refreshInventory = useCallback(async (offset = inventoryOffset, background = false) => {
    if (!background) {
      setLoadingInventory(true);
      setInventoryError('');
    }
    try {
      setInventory(await getAmbulanceInventory({ limit: PAGE_SIZE, offset }));
    } catch (requestError) {
      setInventoryError(requestError instanceof Error ? requestError.message : 'Unable to load ambulance inventory.');
    } finally {
      if (!background) setLoadingInventory(false);
    }
  }, [inventoryOffset]);

  useEffect(() => {
    refreshInventory();
  }, [refreshInventory]);
  usePolling(() => refreshInventory(inventoryOffset, true));

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setError('Location access is unavailable in this browser. Enter a nearby street or landmark instead.');
      return;
    }
    setError('');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => setCoordinates({ latitude: coords.latitude, longitude: coords.longitude }),
      () => setError('Could not access your location. Enter a nearby street or landmark instead.'),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 },
    );
  };

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    if (name === 'location') setCoordinates(null);
  };

  const submitRequest = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    const gpsSuffix = coordinates ? ` (${coordinates.latitude.toFixed(6)}, ${coordinates.longitude.toFixed(6)})` : '';
    try {
      const created = await createEmergency({
        reporterName: form.reporterName.trim(),
        contact: form.contact.trim(),
        type: 'MEDICAL',
        location: `${form.location.trim()}${gpsSuffix}`,
        affectedPeopleCount: Number(form.affectedPeopleCount),
        description: form.description.trim() || 'Ambulance requested through the public booking page.',
        priority: form.priority,
        requiredResourceType: 'AMBULANCE',
      });
      setReport(created);
      refreshInventory();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to send the ambulance request.');
    } finally {
      setSubmitting(false);
    }
  };

  if (report) {
    return (
      <div className="ambulance-page">
        <section className="ambulance-success" role="status">
          <span className="ambulance-success-icon"><CheckCircle2 size={30} aria-hidden="true" /></span>
          <p className="ambulance-eyebrow">REQUEST RECEIVED</p>
          <h1>Request sent to ResQNet</h1>
          <p>Request <strong>#{report.id}</strong> · <strong>{report.status?.toLowerCase().replaceAll('_', ' ')}</strong></p>
          <p className="ambulance-not-guaranteed">This is not a confirmed ambulance reservation. A dispatcher must assign an available unit. For immediate life-threatening danger, call 112.</p>
          <div className="ambulance-success-actions">
            <button
              type="button"
              className="ambulance-primary-button"
              onClick={() => { setReport(null); setForm(initialForm); setCoordinates(null); }}
            >
              Send another request
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="ambulance-page">
      <header className="ambulance-heading">
        <div className="ambulance-heading-icon"><Ambulance size={25} aria-hidden="true" /></div>
        <div>
          <h1>Request an ambulance</h1>
        </div>
      </header>

      <div className="ambulance-emergency-notice" role="note">
        <PhoneCall size={20} aria-hidden="true" />
        <p><strong>Need immediate help?</strong> Call <a href="tel:112">112</a>. Submitting this form does not place a phone call or guarantee a unit.</p>
      </div>

      <div className="ambulance-layout">
        <section className="ambulance-form-card">
          <h2>Emergency details</h2>
          {error && <div className="ambulance-error" role="alert">{error}</div>}
          <form onSubmit={submitRequest}>
            <label>
              <span>Your name</span>
              <input autoComplete="name" maxLength={120} name="reporterName" onChange={updateField} required value={form.reporterName} />
            </label>
            <label>
              <span>Callback number</span>
              <input autoComplete="tel" maxLength={40} name="contact" onChange={updateField} required type="tel" value={form.contact} />
            </label>
            <label>
              <span>Pickup location or landmark</span>
              <span className="ambulance-location-input"><MapPin size={17} aria-hidden="true" /><input autoComplete="street-address" maxLength={300} name="location" onChange={updateField} required value={form.location} /></span>
            </label>
            <button className="ambulance-gps-button" type="button" onClick={detectLocation}>
              <Crosshair size={16} aria-hidden="true" /> Attach current GPS location
            </button>
            {coordinates && <p className="ambulance-gps-confirmation">GPS attached: {coordinates.latitude.toFixed(5)}, {coordinates.longitude.toFixed(5)}</p>}
            <label>
              <span>People needing assistance</span>
              <input min="1" max="1000" name="affectedPeopleCount" onChange={updateField} required type="number" value={form.affectedPeopleCount} />
            </label>
            <label>
              <span>Urgency</span>
              <select name="priority" onChange={updateField} value={form.priority}>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </label>
            <label>
              <span>Additional medical information <small>(optional)</small></span>
              <textarea maxLength={1000} name="description" onChange={updateField} rows="3" value={form.description} />
            </label>
            <button className="ambulance-submit" disabled={submitting} type="submit">
              <Ambulance size={18} aria-hidden="true" /> {submitting ? 'Sending request…' : 'Send ambulance request'}
            </button>
          </form>
        </section>

        <aside className="ambulance-inventory-card">
          <div className="ambulance-inventory-heading">
            <div><span className="ambulance-inventory-icon"><Ambulance size={18} /></span><div><h2>Ambulance inventory</h2></div></div>
            <button type="button" onClick={refreshInventory} disabled={loadingInventory} aria-label="Refresh ambulance inventory">
              <RefreshCw size={17} className={loadingInventory ? 'ambulance-refresh-spinning' : ''} />
            </button>
          </div>
          {inventoryError ? (
            <div className="ambulance-inventory-error" role="alert">
              <p>{inventoryError}</p><button type="button" onClick={refreshInventory}>Retry</button>
            </div>
          ) : loadingInventory && !inventory ? (
            <p className="ambulance-inventory-empty">Loading inventory…</p>
          ) : inventory ? (
            <>
              <div className="ambulance-inventory-totals">
                <div><strong>{inventory.availableUnits}</strong><span>available units</span></div>
                <div><strong>{inventory.totalUnits}</strong><span>listed units</span></div>
              </div>
              {inventory.ambulances.length ? (
                <ul className="ambulance-unit-list">
                  {inventory.ambulances.map((unit) => (
                    <li key={unit.id}>
                      <span className={`ambulance-unit-dot ${unit.available ? 'is-available' : ''}`} aria-hidden="true" />
                      <span className="ambulance-unit-details"><strong>{unit.name}</strong><small>{unit.location}</small></span>
                      <span className={`ambulance-unit-status ${unit.available ? 'is-available' : ''}`}>{unit.available ? 'Available' : 'Unavailable'}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="ambulance-inventory-empty">No ambulance resources are registered in the database.</p>
              )}
              {inventory.totalResources > inventory.ambulances.length && (
                <div className="ambulance-inventory-pagination">
                  <span>Showing {inventoryOffset + 1}–{Math.min(inventoryOffset + inventory.ambulances.length, inventory.totalResources)} of {inventory.totalResources} resources</span>
                  <div>
                    <button disabled={inventoryOffset === 0 || loadingInventory} onClick={() => setInventoryOffset(Math.max(0, inventoryOffset - PAGE_SIZE))} type="button">Previous</button>
                    <button disabled={inventoryOffset + inventory.ambulances.length >= inventory.totalResources || loadingInventory} onClick={() => setInventoryOffset(inventoryOffset + PAGE_SIZE)} type="button">Next</button>
                  </div>
                </div>
              )}
            </>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
