import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import './AmbulanceDriverView.css';
import {
  getStoredOrders,
  driverTakeOrder,
  updateOrderStatus,
  driverProfile
} from '../data/ambulanceOrderStore.js';

export default function AmbulanceDriverView() {
  const [profile, setProfile] = useState(driverProfile);
  const [orders, setOrders] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);

  // Sync orders from storage and listen to live events
  useEffect(() => {
    const sync = () => {
      setOrders(getStoredOrders());
    };
    sync();

    const handleStorageChange = () => sync();
    window.addEventListener('resqnet:orders-changed', handleStorageChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('resqnet:orders-changed', handleStorageChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Active in-progress trip for this driver
  const activeTrip = orders.find(
    o => o.assignedDriver?.driverId === profile.driverId &&
         ['TAKEN', 'EN_ROUTE', 'ARRIVED', 'IN_TRANSIT'].includes(o.status)
  );

  // Available incoming orders awaiting a driver
  const incomingOrders = orders.filter(o => o.status === 'PENDING');

  // Completed trips by this driver
  const completedTrips = orders.filter(
    o => o.assignedDriver?.driverId === profile.driverId && o.status === 'COMPLETED'
  );

  // Take an incoming order
  const handleTakeOrder = (orderId) => {
    const updated = driverTakeOrder(orderId, profile);
    showToast(`🚨 Order ${orderId} accepted! Dispatching ambulance immediately.`);
  };

  // Advance active trip stage
  const handleAdvanceTripStage = (orderId, currentStatus) => {
    const stageMap = {
      TAKEN: 'EN_ROUTE',
      EN_ROUTE: 'ARRIVED',
      ARRIVED: 'IN_TRANSIT',
      IN_TRANSIT: 'COMPLETED'
    };
    const nextStatus = stageMap[currentStatus];
    if (nextStatus) {
      updateOrderStatus(orderId, nextStatus);
      const stageLabels = {
        EN_ROUTE: 'Ambulance is now En Route to Patient location',
        ARRIVED: 'Arrived at patient location. Commencing field triage.',
        IN_TRANSIT: 'Patient onboard. In transit to destination hospital.',
        COMPLETED: 'Trip completed! Patient safely handed over to ER.'
      };
      showToast(stageLabels[nextStatus]);
    }
  };

  return (
    <div className="driver-page">
      {/* --------------------------------------------------------------------
          DRIVER IDENTITY & OPERATIONAL STATUS HEADER
          -------------------------------------------------------------------- */}
      <section className="driver-header-bar">
        <div className="driver-identity">
          <div className="driver-avatar-badge">
            <Icon icon="mdi:ambulance" width="36" height="36" />
          </div>
          <div className="driver-info">
            <h1>
              {profile.driverName}
              <span className="vehicle-tag">{profile.vehicleNumber}</span>
            </h1>
            <p className="driver-subinfo">
              <span>{profile.vehicleType}</span>
              <span>&bull;</span>
              <span><Icon icon="mdi:map-marker" width="14" height="14" style={{ verticalAlign: 'middle' }} /> {profile.currentLocationName}</span>
              <span>&bull;</span>
              <span>⭐ {profile.rating} Rating</span>
            </p>
          </div>
        </div>

        <div className="driver-controls">
          <div className="duty-status-card">
            <span style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: 600 }}>DUTY STATUS:</span>
            <button
              className={`duty-toggle-btn ${profile.isOnline ? 'online' : 'offline'}`}
              onClick={() => {
                const next = !profile.isOnline;
                setProfile({ ...profile, isOnline: next });
                showToast(next ? 'You are now ONLINE & ready for incoming ambulance calls.' : 'You are now OFFLINE.');
              }}
            >
              <Icon icon={profile.isOnline ? 'mdi:radio-tower' : 'mdi:power'} width="16" height="16" />
              {profile.isOnline ? 'ON DUTY (LIVE RADAR)' : 'OFF DUTY'}
            </button>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          SHIFT KPI METRICS
          -------------------------------------------------------------------- */}
      <div className="driver-stats-grid">
        <div className="driver-stat-card">
          <div className="driver-stat-icon red">
            <Icon icon="mdi:bell-ring" width="24" height="24" />
          </div>
          <div>
            <div className="driver-stat-label">Pending Requests</div>
            <div className="driver-stat-value">{incomingOrders.length} Available</div>
          </div>
        </div>

        <div className="driver-stat-card">
          <div className="driver-stat-icon green">
            <Icon icon="mdi:check-decagram" width="24" height="24" />
          </div>
          <div>
            <div className="driver-stat-label">Trips Completed Today</div>
            <div className="driver-stat-value">{completedTrips.length + profile.todayTrips}</div>
          </div>
        </div>

        <div className="driver-stat-card">
          <div className="driver-stat-icon blue">
            <Icon icon="mdi:speedometer" width="24" height="24" />
          </div>
          <div>
            <div className="driver-stat-label">Avg Pickup Time</div>
            <div className="driver-stat-value">3.2 Mins</div>
          </div>
        </div>

        <div className="driver-stat-card">
          <div className="driver-stat-icon amber">
            <Icon icon="mdi:gas-station" width="24" height="24" />
          </div>
          <div>
            <div className="driver-stat-label">Oxygen Tank Status</div>
            <div className="driver-stat-value">94% Ready</div>
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------------------
          ACTIVE TRIP IN-PROGRESS DISPATCH CONSOLE
          -------------------------------------------------------------------- */}
      {activeTrip && (
        <section className="active-trip-panel">
          <div className="active-trip-header">
            <div className="active-trip-title">
              <span className="active-trip-pulse"></span>
              <span>ACTIVE DISPATCH IN PROGRESS: {activeTrip.orderId}</span>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <a
                href={`tel:${activeTrip.contactNumber}`}
                className="btn-call-direct"
                title="Call citizen phone straightly"
              >
                <Icon icon="mdi:phone-in-talk" width="18" height="18" />
                Call Patient Straightly ({activeTrip.contactNumber})
              </a>
              <a
                href="tel:108"
                className="btn-call-direct"
                style={{ background: '#3b82f6' }}
                title="Call emergency ER desk"
              >
                <Icon icon="mdi:hospital-building" width="18" height="18" />
                Call Hospital ER (108)
              </a>
            </div>
          </div>

          {/* Stepper */}
          <div className="trip-stepper">
            {[
              { id: 'TAKEN', label: '1. Order Accepted' },
              { id: 'EN_ROUTE', label: '2. En Route to Patient' },
              { id: 'ARRIVED', label: '3. Arrived at Site' },
              { id: 'IN_TRANSIT', label: '4. Heading to Hospital' },
              { id: 'COMPLETED', label: '5. Patient Handover' }
            ].map((step, idx) => {
              const statusOrder = ['TAKEN', 'EN_ROUTE', 'ARRIVED', 'IN_TRANSIT', 'COMPLETED'];
              const currentIdx = statusOrder.indexOf(activeTrip.status);
              const isCompleted = currentIdx > idx;
              const isActive = activeTrip.status === step.id;

              return (
                <div
                  key={step.id}
                  className={`stepper-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}
                >
                  <div className="stepper-circle">
                    {isCompleted ? <Icon icon="mdi:check" width="18" height="18" /> : idx + 1}
                  </div>
                  <span className="stepper-label">{step.label}</span>
                </div>
              );
            })}
          </div>

          {/* Patient Details & Requirements */}
          <div className="active-trip-grid">
            <div className="active-info-block">
              <div className="active-block-title">Patient Profile &amp; Location</div>
              <div className="patient-highlight-name">
                {activeTrip.patientName}
                <span className="patient-age-badge">
                  Age: {activeTrip.patientAge} ({activeTrip.ageCategory})
                </span>
              </div>
              <div style={{ fontSize: '13px', color: '#cbd5e1', marginTop: '6px' }}>
                <div><strong>📍 Pickup:</strong> {activeTrip.pickupLocation}</div>
                {activeTrip.landmark && <div><strong>🏷️ Landmark:</strong> {activeTrip.landmark}</div>}
                <div style={{ marginTop: '4px' }}><strong>🏥 Destination:</strong> {activeTrip.destinationHospital}</div>
              </div>
            </div>

            <div className="active-info-block">
              <div className="active-block-title">Required Medical Equipment &amp; Triage</div>
              <div style={{ fontSize: '13px', color: '#f87171', fontWeight: 600 }}>
                Notes: {activeTrip.notes}
              </div>
              <div className="requirements-pills-wrap">
                {activeTrip.requirements?.map((req, i) => (
                  <span key={i} className="req-pill">
                    <Icon icon="mdi:check-circle" width="13" height="13" style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                    {req}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Stage Progression Action */}
          <div className="active-trip-actions">
            {activeTrip.status === 'TAKEN' && (
              <button
                className="btn-trip-stage"
                onClick={() => handleAdvanceTripStage(activeTrip.orderId, 'TAKEN')}
              >
                <Icon icon="mdi:steering" width="20" height="20" />
                Start Drive: Mark En Route to Patient
              </button>
            )}

            {activeTrip.status === 'EN_ROUTE' && (
              <button
                className="btn-trip-stage"
                onClick={() => handleAdvanceTripStage(activeTrip.orderId, 'EN_ROUTE')}
              >
                <Icon icon="mdi:map-marker-check" width="20" height="20" />
                Arrived on Site: Mark at Patient Location
              </button>
            )}

            {activeTrip.status === 'ARRIVED' && (
              <button
                className="btn-trip-stage"
                onClick={() => handleAdvanceTripStage(activeTrip.orderId, 'ARRIVED')}
              >
                <Icon icon="mdi:hospital-box" width="20" height="20" />
                Patient Onboard: Head to {activeTrip.destinationHospital}
              </button>
            )}

            {activeTrip.status === 'IN_TRANSIT' && (
              <button
                className="btn-trip-stage"
                style={{ background: '#10b981' }}
                onClick={() => handleAdvanceTripStage(activeTrip.orderId, 'IN_TRANSIT')}
              >
                <Icon icon="mdi:check-all" width="20" height="20" />
                Reached ER: Handover Patient &amp; Complete Trip
              </button>
            )}
          </div>
        </section>
      )}

      {/* --------------------------------------------------------------------
          INCOMING EMERGENCY ORDERS RADAR (NEARBY BOOKINGS)
          -------------------------------------------------------------------- */}
      <section className="radar-panel-card">
        <div className="radar-header">
          <h2>
            <Icon icon="mdi:radar" width="24" height="24" color="#e74c3c" />
            Nearby Emergency Orders Radar
            <span className="radar-count-badge">
              {incomingOrders.length} New Citizen Bookings
            </span>
          </h2>
          <span style={{ fontSize: '12px', color: '#64748b' }}>
            Coverage Zone: Kovilpatti Sector &bull; Search Radius: 15 km
          </span>
        </div>

        {incomingOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
            <Icon icon="mdi:ambulance" width="48" height="48" color="#94a3b8" />
            <h3 style={{ margin: '12px 0 4px', color: '#334155' }}>No Pending Ambulance Orders</h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
              Your radar is actively listening for incoming citizen emergency bookings in Kovilpatti.
            </p>
          </div>
        ) : (
          <div className="order-cards-stack">
            {incomingOrders.map(order => (
              <div
                key={order.orderId}
                className={`driver-order-card priority-${order.priority.toLowerCase()}`}
              >
                <div className="order-card-top">
                  <div className="order-card-id-wrap">
                    <span className="order-id-chip">{order.orderId}</span>
                    <span style={{ fontWeight: 800, color: order.priority === 'CRITICAL' ? '#dc2626' : '#d97706', fontSize: '13px' }}>
                      ● {order.priority} PRIORITY
                    </span>
                    <span className="order-time-ago">&bull; Booked {order.bookedAt}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', background: '#f1f5f9', padding: '3px 8px', borderRadius: '4px', fontWeight: 600 }}>
                      Distance: ~1.4 km (ETA 3 mins)
                    </span>
                  </div>
                </div>

                <div>
                  <div className="order-patient-name">
                    {order.patientName}
                    <span className="order-patient-age">
                      Age: {order.patientAge} Years ({order.ageCategory})
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#475569', marginTop: '4px' }}>
                    {order.notes}
                  </div>
                </div>

                <div className="order-card-details-grid">
                  <div className="order-detail-item">
                    <Icon icon="mdi:map-marker-radius" width="18" height="18" color="#e74c3c" />
                    <div>
                      <strong>Pickup Location:</strong>
                      <div>{order.pickupLocation}</div>
                      {order.landmark && <div style={{ fontSize: '11.5px', color: '#64748b' }}>Near {order.landmark}</div>}
                    </div>
                  </div>

                  <div className="order-detail-item">
                    <Icon icon="mdi:hospital-building" width="18" height="18" color="#3b82f6" />
                    <div>
                      <strong>Destination Hospital:</strong>
                      <div>{order.destinationHospital}</div>
                    </div>
                  </div>

                  <div className="order-detail-item">
                    <Icon icon="mdi:phone" width="18" height="18" color="#059669" />
                    <div>
                      <strong>Citizen Phone:</strong>
                      <div>{order.contactNumber} ({order.callerType})</div>
                    </div>
                  </div>
                </div>

                <div className="order-requirements-bar">
                  <span className="order-req-label">Required Equipment:</span>
                  {order.requirements?.map((req, i) => (
                    <span key={i} className="req-pill" style={{ background: '#fee2e2', color: '#991b1b', borderColor: '#fca5a5' }}>
                      {req}
                    </span>
                  ))}
                </div>

                <div className="order-actions-bar">
                  <a
                    href={`tel:${order.contactNumber}`}
                    className="btn-call-direct"
                    title="Call patient straightaway"
                  >
                    <Icon icon="mdi:phone-in-talk" width="18" height="18" />
                    Call Patient Straightaway ({order.contactNumber})
                  </a>

                  <button
                    className="btn-take-order"
                    onClick={() => handleTakeOrder(order.orderId)}
                  >
                    <Icon icon="mdi:steering" width="18" height="18" />
                    Accept &amp; Take Order Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* --------------------------------------------------------------------
          COMPLETED SHIFT RUNS
          -------------------------------------------------------------------- */}
      <section className="radar-panel-card">
        <h2 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 16px', color: '#0f172a' }}>
          <Icon icon="mdi:history" width="20" height="20" color="#059669" style={{ verticalAlign: 'middle', marginRight: '6px' }} />
          Shift Completed Runs ({completedTrips.length})
        </h2>

        {completedTrips.length === 0 ? (
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>No completed runs recorded yet this shift.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '10px 14px' }}>Order ID</th>
                  <th style={{ padding: '10px 14px' }}>Patient</th>
                  <th style={{ padding: '10px 14px' }}>Age</th>
                  <th style={{ padding: '10px 14px' }}>Pickup Location</th>
                  <th style={{ padding: '10px 14px' }}>Hospital Delivered</th>
                  <th style={{ padding: '10px 14px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {completedTrips.map(t => (
                  <tr key={t.orderId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 700 }}>{t.orderId}</td>
                    <td style={{ padding: '12px 14px' }}>{t.patientName}</td>
                    <td style={{ padding: '12px 14px' }}>{t.patientAge} yrs</td>
                    <td style={{ padding: '12px 14px' }}>{t.pickupLocation}</td>
                    <td style={{ padding: '12px 14px' }}>{t.destinationHospital}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ background: '#d1fae5', color: '#065f46', padding: '3px 8px', borderRadius: '4px', fontWeight: 700, fontSize: '11px' }}>
                        COMPLETED
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Floating Toast Feedback */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: '#0f172a',
          color: 'white',
          padding: '14px 20px',
          borderRadius: '10px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          zIndex: 3000,
          borderLeft: '4px solid #e74c3c',
          fontSize: '13.5px',
          fontWeight: 600
        }}>
          <Icon icon="mdi:information" width="20" height="20" color="#f87171" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
