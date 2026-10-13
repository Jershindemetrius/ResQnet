import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import './AmbulanceDriverView.css';
import CADSidebar from '../components/CADSidebar.jsx';
import CADTopNav from '../components/CADTopNav.jsx';

export default function AmbulanceDriverView() {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isOrderAccepted, setIsOrderAccepted] = useState(false);
  const [countdown, setCountdown] = useState(40);
  const [vitalsTransmitted, setVitalsTransmitted] = useState(false);

  // Countdown timer simulation for P1 broadcast
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleToggleAudio = () => {
    setIsPlayingAudio(!isPlayingAudio);
  };

  const handleAcceptOrder = () => {
    setIsOrderAccepted(true);
    alert('🚨 CAD ORDER #ER-2024-8841 ACCEPTED!\nRoute clearance armed: Green light wave enabled for Ambulance ALS-101.');
  };

  const handleTransmitVitals = () => {
    setVitalsTransmitted(true);
    alert('📡 TELEMETRY TRANSMITTED: 12-Lead ECG & Patient vitals relayed to Kovilpatti GH Cath Lab.');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header matching reference layout */}
      <CADTopNav />

      <div className="driver-hub-container">
        {/* Left MDT Navigation Rails */}
        <CADSidebar />

        {/* Main Content Area */}
        <main className="driver-hub-main">
          {/* ----------------------------------------------------------------
              1. UNIT STATUS & CREW TELEMETRY CARD
              ---------------------------------------------------------------- */}
          <section className="driver-unit-card">
            <div className="driver-unit-left">
              <div className="driver-unit-badge-box">
                <Icon icon="mdi:ambulance" width="30" height="30" />
                <span className="driver-notif-dot">1</span>
              </div>
              <div className="driver-unit-meta">
                <div className="driver-unit-callsign-strip">
                  <span className="driver-callsign-tag">CALLSIGN ALS-101</span>
                  <span className="driver-callsign-tag">SECTOR 4 KOVILPATTI</span>
                  <span className="driver-geofence-tag">
                    <Icon icon="mdi:target" width="10" height="10" style={{ verticalAlign: 'middle', marginRight: '2px' }} />
                    LIVE GEOFENCE LOCKED
                  </span>
                </div>
                <h2 className="driver-crew-names">Officer Raman &amp; EMT Arun Verma</h2>
                <p className="driver-vehicle-specs">
                  Unit: Advanced Cardiac Life Support Ambulance #12 &bull; Reg: TN-69-EM-8841
                </p>
              </div>
            </div>

            <div className="driver-unit-telemetry">
              <div className="driver-telem-box">
                <div className="telem-box-label">O₂ Payload</div>
                <div className="telem-box-val blue">98%</div>
                <div className="telem-box-sub">Pressure Safe</div>
              </div>

              <div className="driver-telem-box">
                <div className="telem-box-label">Fuel Range</div>
                <div className="telem-box-val">84%</div>
                <div className="telem-box-sub">280 km left</div>
              </div>

              <div className="driver-telem-box">
                <div className="telem-box-label">Telemetry</div>
                <div className="telem-box-val">0 <span style={{ fontSize: '11px' }}>km/h</span></div>
                <div className="telem-box-sub">Standby Idle</div>
              </div>

              <div className="driver-telem-box">
                <div className="telem-box-label">Defib Unit</div>
                <div className="telem-box-val green">READY</div>
                <div className="telem-box-sub">Biphasic Self-Test OK</div>
              </div>

              <div>
                <div style={{ fontSize: '8.5px', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', marginBottom: '2px' }}>
                  Unit State Control
                </div>
                <button className="driver-state-dropdown">
                  <Icon icon="mdi:radiobox-marked" width="14" height="14" />
                  ONLINE &amp; PATROLLING
                  <Icon icon="mdi:chevron-down" width="14" height="14" />
                </button>
              </div>
            </div>
          </section>

          {/* ----------------------------------------------------------------
              2. PRIORITY-1 BROADCAST RECEIVED BANNER
              ---------------------------------------------------------------- */}
          <section className="driver-p1-broadcast-bar">
            <div className="p1-left">
              <Icon icon="mdi:broadcast" width="18" height="18" />
              <span>PRIORITY-1 BROADCAST RECEIVED</span>
              <span className="p1-distance-badge">1.2 KM AWAY</span>
            </div>
            <div className="p1-timer-box">
              <span>Auto-Rerouting fallback in:</span>
              <span className="p1-timer-badge">
                <Icon icon="mdi:timer-outline" width="15" height="15" />
                {countdown} s
              </span>
            </div>
          </section>

          {/* ----------------------------------------------------------------
              3. ACTIVE CAD EMERGENCY ORDER CARD (#ER-2024-8841)
              ---------------------------------------------------------------- */}
          <section className="driver-dispatch-card">
            <div>
              <div className="cad-badge-row">
                <span className="badge-code-red">CODE 2 RED</span>
                <span className="cad-order-id-label">CAD ORDER #ER-2024-8841</span>
              </div>

              <h1 className="cad-incident-title">
                Severe Cardiac Distress + Head Injury
              </h1>

              <div className="est-travel-time-pill">
                <span className="est-time-label">Estimated Travel Time</span>
                <span className="est-time-val">3 min 15 sec</span>
              </div>

              {/* 3 Columns Subject / Reporter / Location */}
              <div className="incident-details-3col">
                <div className="detail-col-item">
                  <span className="detail-col-header">Subject</span>
                  <span className="detail-col-val">58 yrs &bull; Male</span>
                  <span className="detail-col-sub">Unconscious &bull; Diaphoretic</span>
                </div>

                <div className="detail-col-item">
                  <span className="detail-col-header">Reported By</span>
                  <span className="detail-col-val">Family Member (Son)</span>
                  <span className="detail-col-sub">Incident Onset: ~7 mins ago</span>
                </div>

                <div className="detail-col-item">
                  <span className="detail-col-header">Incident Location</span>
                  <span className="detail-col-val">14/B Gandhi Rd</span>
                  <span className="detail-col-sub">Near Old Bus Stand</span>
                </div>
              </div>

              {/* Protocols requested */}
              <div className="protocols-heading">Mandatory Kit &amp; Clinical Protocols Requested</div>
              <div className="protocols-grid">
                <div className="protocol-chip">
                  <Icon icon="mdi:gas-cylinder" width="16" height="16" color="#dc2626" />
                  High-Flow O₂ Support
                </div>
                <div className="protocol-chip">
                  <Icon icon="mdi:bed-empty" width="16" height="16" color="#0284c7" />
                  Hydraulic Stretcher
                </div>
                <div className="protocol-chip">
                  <Icon icon="mdi:medical-bag" width="16" height="16" color="#dc2626" />
                  Cervical Trauma Kit
                </div>
                <div className="protocol-chip">
                  <Icon icon="mdi:hospital-building" width="16" height="16" color="#2563eb" />
                  ICU Pre-Alert ER
                </div>
              </div>

              {/* Audio Briefing Player */}
              <div className="audio-briefing-bar">
                <button
                  className="audio-play-btn"
                  onClick={handleToggleAudio}
                  title="Listen to caller briefing"
                >
                  <Icon icon={isPlayingAudio ? 'mdi:pause' : 'mdi:play'} width="18" height="18" />
                </button>
                <div className="audio-info-col">
                  <div className="audio-header-line">
                    <span>Caller 12s Audio Briefing</span>
                    <span style={{ color: '#64748b', fontSize: '10px' }}>00:12</span>
                  </div>
                  <p className="audio-transcript-quote">
                    &ldquo;Father collapsed in hall, breathing heavily, please hurry...&rdquo;
                  </p>
                </div>
                <div className="audio-radio-tag">
                  <Icon icon="mdi:radio-handheld" width="14" height="14" color="#0284c7" />
                  VHF CH 4: ACTIVE MONITOR
                </div>
              </div>
            </div>

            {/* Quick Dispatch Decision Right Box */}
            <div className="dispatch-decision-box">
              <div>
                <div className="decision-box-top-label">
                  <span>Quick Dispatch Decision</span>
                  <span>ALS-101 Primary Lock</span>
                </div>

                <div className="target-hospital-panel">
                  <span className="target-hosp-label">Target Hospital</span>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 className="target-hosp-name">Govt Hospital Kovilpatti</h4>
                    <span style={{ fontSize: '10px', background: '#e0f2fe', color: '#0369a1', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>
                      6 ICU Beds Free
                    </span>
                  </div>
                  <div className="target-hosp-meta">
                    3.4 km from incident &bull; Trauma Level 2 Active
                  </div>
                </div>
              </div>

              <div>
                <button
                  className="btn-accept-order"
                  onClick={handleAcceptOrder}
                  style={{ background: isOrderAccepted ? '#15803d' : '#b91c1c' }}
                >
                  <Icon icon={isOrderAccepted ? 'mdi:check-circle' : 'mdi:steering'} width="18" height="18" />
                  {isOrderAccepted ? 'ORDER ACCEPTED • EN ROUTE' : 'ACCEPT ORDER & START ROUTE ➔'}
                </button>

                <a
                  href="tel:+919442188301"
                  className="btn-call-citizen"
                  title="Call citizen phone straightly"
                >
                  <Icon icon="mdi:phone-in-talk" width="16" height="16" />
                  DIRECT CALL CITIZEN (+91 94421 88301)
                </a>

                <button
                  className="btn-decline-order"
                  onClick={() => alert('Order rerouted to secondary backup unit ALS-104.')}
                >
                  <Icon icon="mdi:arrow-u-left-top" width="14" height="14" />
                  DECLINE / PASS TO BACKUP UNIT (ALS-104)
                </button>
              </div>
            </div>
          </section>

          {/* ----------------------------------------------------------------
              4. MIDDLE: GIS ROUTING (LEFT) & HOSPITAL HANDOFF (RIGHT)
              ---------------------------------------------------------------- */}
          <div className="driver-mid-grid">
            {/* GIS Routing Left Card */}
            <section className="gis-routing-card">
              <div className="gis-card-header">
                <div className="gis-header-title">
                  <span className="gis-subtag">GIS Telemetry Routing &bull; Real-time GPS Feed</span>
                  <h3>Route Navigation to 14/B Gandhi Rd</h3>
                </div>
                <button
                  className="btn-decline-order"
                  style={{ padding: '4px 10px', fontSize: '11px', color: '#0284c7' }}
                  onClick={() => alert('Corridor cleared via police dispatch')}
                >
                  <Icon icon="mdi:shield-check" width="14" height="14" />
                  CLEAR CORRIDOR VIA MAIN BYPASS
                </button>
              </div>

              {/* Turn instruction banner */}
              <div className="turn-instruction-box">
                <div className="turn-icon-wrap">
                  <Icon icon="mdi:arrow-top-right" width="22" height="22" />
                </div>
                <div>
                  <div className="turn-dist-lead">IN 240 METERS</div>
                  <div className="turn-street-name">Turn right onto Gandhi Main Road</div>
                  <div className="turn-beacon-note">Bypass police barricade (Emergency beacon priority granted)</div>
                </div>
              </div>

              {/* Graphical Canvas / Route Illustration */}
              <div className="gis-route-map-canvas">
                <svg className="gis-map-svg" viewBox="0 0 500 180">
                  {/* Grid background lines */}
                  <line x1="0" y1="40" x2="500" y2="40" stroke="#dbeafe" strokeWidth="1" strokeDasharray="4 4" />
                  <line x1="0" y1="90" x2="500" y2="90" stroke="#dbeafe" strokeWidth="1" strokeDasharray="4 4" />
                  <line x1="0" y1="140" x2="500" y2="140" stroke="#dbeafe" strokeWidth="1" strokeDasharray="4 4" />
                  <line x1="120" y1="0" x2="120" y2="180" stroke="#dbeafe" strokeWidth="1" strokeDasharray="4 4" />
                  <line x1="280" y1="0" x2="280" y2="180" stroke="#dbeafe" strokeWidth="1" strokeDasharray="4 4" />
                  <line x1="420" y1="0" x2="420" y2="180" stroke="#dbeafe" strokeWidth="1" strokeDasharray="4 4" />

                  {/* Route corridor glow */}
                  <path
                    d="M 60 140 C 140 130, 200 100, 260 70 C 320 40, 390 50, 440 60"
                    fill="none"
                    stroke="#fee2e2"
                    strokeWidth="12"
                    strokeLinecap="round"
                  />
                  {/* Active route line */}
                  <path
                    d="M 60 140 C 140 130, 200 100, 260 70 C 320 40, 390 50, 440 60"
                    fill="none"
                    stroke="#dc2626"
                    strokeWidth="4"
                    strokeDasharray="6 3"
                    strokeLinecap="round"
                  />

                  {/* Ambulance starting point marker */}
                  <circle cx="60" cy="140" r="10" fill="#0284c7" />
                  <circle cx="60" cy="140" r="5" fill="#ffffff" />
                  <text x="60" y="165" fontSize="10" fontWeight="bold" fill="#0369a1" textAnchor="middle">ALS-101</text>

                  {/* Patient target pin */}
                  <circle cx="440" cy="60" r="10" fill="#dc2626" />
                  <circle cx="440" cy="60" r="4" fill="#ffffff" />
                  <text x="440" y="80" fontSize="10" fontWeight="bold" fill="#b91c1c" textAnchor="middle">PATIENT (14/B GANDHI RD)</text>
                </svg>

                <div className="gis-map-hud-overlay">
                  <div className="hud-item">
                    <span>REMAINING</span>
                    <strong>1.2 km (800m via Bypass)</strong>
                  </div>
                  <div className="hud-item">
                    <span>TARGET SPEED</span>
                    <strong style={{ color: '#0284c7' }}>42-55 km/h recommended</strong>
                  </div>
                </div>

                <div className="green-wave-tag">
                  <Icon icon="mdi:traffic-light" width="14" height="14" />
                  TRAFFIC LIGHT GREEN WAVE ARMED
                </div>
              </div>

              {/* 3 Stage Step Progress */}
              <div className="gis-stages-row">
                <div className="stage-node-box">
                  <Icon icon="mdi:play-circle-outline" width="18" height="18" color="#64748b" />
                  <div>
                    <strong>Dispatch Point</strong>
                    <div style={{ fontSize: '9px', color: '#64748b' }}>Sector 4 Kovilpatti Base</div>
                  </div>
                </div>

                <div className="stage-node-box active">
                  <Icon icon="mdi:account-arrow-right" width="18" height="18" color="#dc2626" />
                  <div>
                    <strong style={{ color: '#b91c1c' }}>Step 1: Patient Extrication</strong>
                    <div style={{ fontSize: '9px', color: '#64748b' }}>14/B Gandhi Rd (ETA 3m 15s)</div>
                  </div>
                </div>

                <div className="stage-node-box">
                  <Icon icon="mdi:hospital-box-outline" width="18" height="18" color="#64748b" />
                  <div>
                    <strong>Step 2: Transfer to Hospital</strong>
                    <div style={{ fontSize: '9px', color: '#64748b' }}>Kovilpatti GH (Pre-Alerted ICU Bed #4)</div>
                  </div>
                </div>
              </div>
            </section>

            {/* Hospital Handoff Right Card */}
            <section className="hospital-handoff-card">
              <div className="handoff-header">
                <h3>Hospital Handoff</h3>
                <span style={{ fontSize: '9.5px', background: '#eff6ff', color: '#1d4ed8', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>
                  CAD VERIFIED
                </span>
              </div>

              <div className="handoff-photo-wrap">
                <img
                  src="/images/hospital_kovilpatti.jpg"
                  alt="Govt Hospital Kovilpatti"
                  className="handoff-photo"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '9px', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>
                  Pre-Allocated Facility
                </span>
                <span style={{ fontSize: '10px', color: '#059669', fontWeight: 800 }}>Dist: 3.4 KM</span>
              </div>

              <h4 className="handoff-facility-name">Govt Hospital Kovilpatti (GH)</h4>
              <p className="handoff-address">Main Bypass Junction, Kovilpatti, TN</p>

              <div className="handoff-stats-2col">
                <div className="handoff-stat-tile">
                  <div className="label">Free ICU Beds</div>
                  <div className="val">06</div>
                </div>
                <div className="handoff-stat-tile">
                  <div className="label">Cardiologist on Duty</div>
                  <div className="val" style={{ fontSize: '13px', color: '#0f172a' }}>Dr. S. Kabilan</div>
                </div>
              </div>

              <div className="radio-protocol-card">
                <strong>ER Radio Protocol:</strong> ICU team alerted via CAD. Cath lab on standby for acute myocardial infarction protocol upon our signal.
              </div>

              <button
                className="btn-transmit-vitals"
                onClick={handleTransmitVitals}
                style={{ background: vitalsTransmitted ? '#15803d' : '#0284c7' }}
              >
                <Icon icon={vitalsTransmitted ? 'mdi:check-all' : 'mdi:send'} width="16" height="16" />
                {vitalsTransmitted ? 'PATIENT VITALS TRANSMITTED' : 'TRANSMIT PATIENT VITALS TO GH'}
              </button>

              <div className="handoff-shift-footer">
                <span>Shift Duration: <strong>06h 42m</strong></span>
                <span>Logged as <strong>EMT Arun</strong></span>
              </div>
            </section>
          </div>

          {/* ----------------------------------------------------------------
              5. BOTTOM SECTION: PERFORMANCE LOGS
              ---------------------------------------------------------------- */}
          <section className="driver-performance-card">
            <div className="perf-header-strip">
              <div className="perf-title-group">
                <span style={{ fontSize: '9px', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  PERFORMANCE LOGS &bull; Duty Shift #1
                </span>
                <h3>My Accepted Trips Today (4 Orders Fulfilled)</h3>
              </div>

              <div className="perf-badges-group">
                <div className="perf-badge-item">
                  <span style={{ fontSize: '8.5px', color: '#64748b', display: 'block' }}>AVG RESPONSE TIME</span>
                  <span style={{ color: '#0284c7', fontSize: '13px' }}>4.2 mins</span>
                </div>
                <div className="perf-badge-item">
                  <span style={{ fontSize: '8.5px', color: '#64748b', display: 'block' }}>LIVES TRANSPORTED</span>
                  <span style={{ fontSize: '13px' }}>4 Patients</span>
                </div>
                <div className="perf-badge-item">
                  <span style={{ fontSize: '8.5px', color: '#64748b', display: 'block' }}>TELEMETRY AUDIT</span>
                  <span style={{ color: '#16a34a', fontSize: '13px' }}>100% Pass</span>
                </div>
              </div>
            </div>

            <div className="perf-table-wrap">
              <table className="perf-table">
                <thead>
                  <tr>
                    <th>CAD Order ID</th>
                    <th>Patient Profile</th>
                    <th>Emergency Nature</th>
                    <th>Time to Scene</th>
                    <th>Drop Destination</th>
                    <th>CAD Status</th>
                    <th style={{ textAlign: 'right' }}>Log / Audio</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 800, color: '#0284c7' }}>#ER-102</td>
                    <td>
                      <strong>Muthu Krishnan (72M)</strong>
                      <div style={{ fontSize: '10px', color: '#64748b' }}>Pickup: Pasuvanthanai Rd</div>
                    </td>
                    <td>
                      <span style={{ background: '#fee2e2', color: '#991b1b', fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>
                        Acute Stroke / FAST+
                      </span>
                    </td>
                    <td style={{ fontWeight: 800 }}>3 min 40 sec</td>
                    <td>Govt Hospital Kovilpatti</td>
                    <td>
                      <span className="status-badge-delivered">DELIVERED &bull; CLOSED</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn-decline-order" style={{ padding: '3px 8px', fontSize: '10px', marginLeft: 'auto' }}>
                        <Icon icon="mdi:headphones" width="12" height="12" /> Call Rec (22s)
                      </button>
                    </td>
                  </tr>

                  <tr>
                    <td style={{ fontWeight: 800, color: '#0284c7' }}>#ER-098</td>
                    <td>
                      <strong>Priya Selvam (31F)</strong>
                      <div style={{ fontSize: '10px', color: '#64748b' }}>Pickup: Kadambur Bypass</div>
                    </td>
                    <td>
                      <span style={{ background: '#f1f5f9', color: '#334155', fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>
                        Road Trauma / Fracture
                      </span>
                    </td>
                    <td style={{ fontWeight: 800 }}>4 min 12 sec</td>
                    <td>Apollo Reach Specialty</td>
                    <td>
                      <span className="status-badge-delivered">DELIVERED &bull; CLOSED</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn-decline-order" style={{ padding: '3px 8px', fontSize: '10px', marginLeft: 'auto' }}>
                        <Icon icon="mdi:headphones" width="12" height="12" /> Call Rec (18s)
                      </button>
                    </td>
                  </tr>

                  <tr>
                    <td style={{ fontWeight: 800, color: '#0284c7' }}>#ER-091</td>
                    <td>
                      <strong>Ananya R. (8F)</strong>
                      <div style={{ fontSize: '10px', color: '#64748b' }}>Pickup: Lakshmi Mills qtrs</div>
                    </td>
                    <td>
                      <span style={{ background: '#eff6ff', color: '#1d4ed8', fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>
                        Pediatric Anaphylaxis
                      </span>
                    </td>
                    <td style={{ fontWeight: 800 }}>4 min 50 sec</td>
                    <td>Govt Hospital Kovilpatti</td>
                    <td>
                      <span className="status-badge-delivered">DELIVERED &bull; CLOSED</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn-decline-order" style={{ padding: '3px 8px', fontSize: '10px', marginLeft: 'auto' }}>
                        <Icon icon="mdi:headphones" width="12" height="12" /> Call Rec (35s)
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
