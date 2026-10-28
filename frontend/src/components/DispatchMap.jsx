import { useState } from 'react';
import { Icon } from '@iconify/react';

export default function DispatchMap({ selectedEmergency, onSelectEmergency }) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showRadar, setShowRadar] = useState(true);
  const [showUnits, setShowUnits] = useState(true);
  const [showHospitals, setShowHospitals] = useState(true);
  const [activeTooltip, setActiveTooltip] = useState(null);

  // Default active incident if none selected
  const activeIncident = selectedEmergency || {
    id: 'ER102',
    type: 'Accident (High Priority)',
    location: 'Kovilpatti Central - Main Crossroad',
    priority: 'HIGH',
    status: 'PENDING'
  };

  const incidents = [
    {
      id: 'ER102',
      type: 'Accident / Trauma',
      priority: 'HIGH',
      location: 'Kovilpatti Central',
      top: '42%',
      left: '46%',
      eta: '3 mins',
      assigned: 'Ambulance ALS-101 & Vol V105'
    },
    {
      id: 'ER103',
      type: 'Commercial Fire Hazard',
      priority: 'CRITICAL',
      location: 'North Sector Block 4',
      top: '22%',
      left: '68%',
      eta: '5 mins',
      assigned: 'Fire Tender T-02'
    },
    {
      id: 'ER104',
      type: 'Flash Flood Trap',
      priority: 'MEDIUM',
      location: 'South Embankment',
      top: '74%',
      left: '32%',
      eta: '8 mins',
      assigned: 'Rescue Boat Unit Z-09'
    }
  ];

  const units = [
    {
      id: 'ALS-101',
      name: 'Ambulance ALS-101',
      type: 'ambulance',
      status: 'RESPONDING (Code 3)',
      top: '56%',
      left: '36%',
      speed: '58 km/h',
      corridorArmed: true
    },
    {
      id: 'V-105',
      name: 'Volunteer V105 (Arun)',
      type: 'volunteer',
      status: 'ON ROUTE (First Aid)',
      top: '30%',
      left: '52%',
      speed: '32 km/h'
    },
    {
      id: 'BLS-104',
      name: 'Ambulance BLS-104',
      type: 'ambulance',
      status: 'PATROLLING',
      top: '68%',
      left: '70%',
      speed: '40 km/h'
    }
  ];

  const hospitals = [
    {
      id: 'HOSP-1',
      name: 'Kovilpatti Govt Headquarters Hospital',
      bedsAvailable: '14 ICU / 38 General',
      top: '38%',
      left: '24%'
    }
  ];

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.15, 1.45));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.15, 0.85));
  const handleResetZoom = () => setZoomLevel(1);

  return (
    <div className="dispatch-map-wrapper">
      {/* Tactical HUD Header Bar */}
      <div className="map-hud-bar">
        <div className="hud-left">
          <span className="hud-radar-badge">
            <span className="hud-beacon-dot"></span>
            TACTICAL CAD RADAR
          </span>
          <span className="hud-sector-text">SECTOR: KOVILPATTI CENTRAL &bull; GRID TN-88</span>
        </div>
        <div className="hud-coords-stream">
          <Icon icon="mdi:crosshairs-gps" width="14" height="14" />
          <span>9.1726&deg; N, 77.8687&deg; E</span>
          <span className="hud-mesh-status">5G MESH LOCKED</span>
        </div>
        <div className="hud-layer-toggles">
          <button
            className={`layer-chip ${showRadar ? 'active' : ''}`}
            onClick={() => setShowRadar(!showRadar)}
            title="Toggle Radar Sweep Effect"
          >
            <Icon icon="mdi:radar" width="14" height="14" />
            Radar Sweep
          </button>
          <button
            className={`layer-chip ${showUnits ? 'active' : ''}`}
            onClick={() => setShowUnits(!showUnits)}
            title="Toggle Units Layer"
          >
            <Icon icon="mdi:ambulance" width="14" height="14" />
            Units
          </button>
          <button
            className={`layer-chip ${showHospitals ? 'active' : ''}`}
            onClick={() => setShowHospitals(!showHospitals)}
            title="Toggle Facilities Layer"
          >
            <Icon icon="mdi:hospital-building" width="14" height="14" />
            Hospitals
          </button>
        </div>
      </div>

      <div className="dispatch-map">
        <div className="map-container">
          <div
            className="tactical-map-viewport"
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
          >
            {/* SVG Tactical Grid and Coordinate Lines */}
            <svg className="tactical-grid-overlay" viewBox="0 0 1000 600" preserveAspectRatio="none">
              <defs>
                <pattern id="radarGrid" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(56, 189, 248, 0.08)" strokeWidth="1" />
                </pattern>
                <linearGradient id="corridorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.9" />
                  <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0.9" />
                </linearGradient>
              </defs>

              {/* Grid Background */}
              <rect width="100%" height="100%" fill="url(#radarGrid)" />

              {/* Concentric Distance Rings around Active Incident */}
              <circle cx="460" cy="252" r="75" fill="none" stroke="rgba(56, 189, 248, 0.16)" strokeWidth="1" strokeDasharray="4 4" />
              <circle cx="460" cy="252" r="150" fill="none" stroke="rgba(56, 189, 248, 0.12)" strokeWidth="1" strokeDasharray="6 6" />
              <circle cx="460" cy="252" r="230" fill="none" stroke="rgba(56, 189, 248, 0.08)" strokeWidth="1" strokeDasharray="8 8" />

              {/* Range labels */}
              <text x="540" y="248" fill="rgba(56, 189, 248, 0.5)" fontSize="10" fontFamily="JetBrains Mono">1.5 KM</text>
              <text x="615" y="248" fill="rgba(56, 189, 248, 0.4)" fontSize="10" fontFamily="JetBrains Mono">3.0 KM</text>
              <text x="695" y="248" fill="rgba(56, 189, 248, 0.3)" fontSize="10" fontFamily="JetBrains Mono">5.0 KM</text>

              {/* Animated Route Corridor from Ambulance ALS-101 (360, 336) to Incident ER102 (460, 252) */}
              <path
                d="M 360 336 Q 400 310, 460 252"
                fill="none"
                stroke="url(#corridorGrad)"
                strokeWidth="3.5"
                strokeDasharray="6 4"
                className="animated-corridor-flow"
              />

              {/* Secondary Volunteer Vector to ER102 */}
              <path
                d="M 520 180 Q 490 210, 460 252"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2"
                strokeDasharray="4 4"
                strokeOpacity="0.7"
              />
            </svg>

            {/* Radar Pulse Sweep Effect */}
            {showRadar && (
              <div className="radar-sweep-center" style={{ top: '42%', left: '46%' }}>
                <div className="radar-scanner"></div>
                <div className="radar-shockwave ring-1"></div>
                <div className="radar-shockwave ring-2"></div>
              </div>
            )}

            {/* 1. Regional Incidents Markers */}
            {incidents.map((incident) => {
              const isSelected = activeIncident.id === incident.id;
              const isCritical = incident.priority === 'CRITICAL';

              return (
                <div
                  key={incident.id}
                  className={`tactical-marker incident-marker ${isCritical ? 'critical' : 'high'} ${isSelected ? 'active-selection' : ''}`}
                  style={{ top: incident.top, left: incident.left }}
                  onClick={() => {
                    if (onSelectEmergency) onSelectEmergency(incident);
                    setActiveTooltip(incident.id);
                  }}
                  onMouseEnter={() => setActiveTooltip(incident.id)}
                  onMouseLeave={() => setActiveTooltip(null)}
                >
                  <div className="marker-pin-body">
                    <div className="marker-ping-glow"></div>
                    <Icon
                      icon={isCritical ? 'mdi:fire-alert' : 'mdi:alert-octagon'}
                      width="20"
                      height="20"
                      className="marker-icon"
                    />
                  </div>
                  <div className="marker-tag">
                    <span className="marker-tag-id">{incident.id}</span>
                    <span className="marker-tag-type">{incident.type.split('/')[0]}</span>
                  </div>

                  {/* Interactive Details Tooltip */}
                  {(activeTooltip === incident.id || isSelected) && (
                    <div className="marker-intel-tooltip">
                      <div className="tooltip-header">
                        <span className="tooltip-id">#{incident.id} &bull; {incident.priority}</span>
                        <span className="tooltip-eta">ETA: {incident.eta}</span>
                      </div>
                      <div className="tooltip-loc">📍 {incident.location}</div>
                      <div className="tooltip-assigned">
                        <Icon icon="mdi:shield-check" width="12" height="12" />
                        <span>{incident.assigned}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* 2. Units Layer (Ambulances & Volunteers) */}
            {showUnits &&
              units.map((unit) => (
                <div
                  key={unit.id}
                  className={`tactical-marker unit-marker ${unit.type}`}
                  style={{ top: unit.top, left: unit.left }}
                  onMouseEnter={() => setActiveTooltip(unit.id)}
                  onMouseLeave={() => setActiveTooltip(null)}
                >
                  <div className="unit-pin-box">
                    <Icon
                      icon={unit.type === 'ambulance' ? 'mdi:ambulance' : 'mdi:account-hard-hat'}
                      width="18"
                      height="18"
                    />
                    {unit.corridorArmed && <span className="corridor-indicator" title="Green Light Wave Armed"></span>}
                  </div>
                  <div className="unit-tag">
                    <span className="unit-tag-id">{unit.id}</span>
                    <span className="unit-tag-speed">{unit.speed}</span>
                  </div>

                  {activeTooltip === unit.id && (
                    <div className="marker-intel-tooltip unit-tooltip">
                      <div className="tooltip-header">
                        <span className="tooltip-id">{unit.name}</span>
                      </div>
                      <div className="tooltip-loc">Status: {unit.status}</div>
                      <div className="tooltip-assigned">Telemetry: 5G Telematics Active &bull; {unit.speed}</div>
                    </div>
                  )}
                </div>
              ))}

            {/* 3. Facilities Layer (Hospitals & Trauma Hubs) */}
            {showHospitals &&
              hospitals.map((hosp) => (
                <div
                  key={hosp.id}
                  className="tactical-marker hospital-marker"
                  style={{ top: hosp.top, left: hosp.left }}
                  onMouseEnter={() => setActiveTooltip(hosp.id)}
                  onMouseLeave={() => setActiveTooltip(null)}
                >
                  <div className="hospital-pin-box">
                    <Icon icon="mdi:hospital-building" width="18" height="18" />
                  </div>
                  <div className="hospital-tag">
                    <span>KOVILPATTI GH</span>
                  </div>

                  {activeTooltip === hosp.id && (
                    <div className="marker-intel-tooltip hospital-tooltip">
                      <div className="tooltip-header">
                        <span className="tooltip-id">{hosp.name}</span>
                      </div>
                      <div className="tooltip-loc">Triage Center: Level 2 Trauma Lab</div>
                      <div className="tooltip-assigned">Capacity: {hosp.bedsAvailable}</div>
                    </div>
                  )}
                </div>
              ))}
          </div>

          {/* Interactive Tactical Controls */}
          <div className="tactical-map-controls">
            <button className="tactical-ctrl-btn" onClick={handleResetZoom} title="Reset GPS Recenter">
              <Icon icon="mdi:crosshairs-gps" width="18" height="18" />
            </button>
            <button className="tactical-ctrl-btn" onClick={handleZoomIn} title="Zoom In Tactical Grid">
              <Icon icon="mdi:plus" width="18" height="18" />
            </button>
            <button className="tactical-ctrl-btn" onClick={handleZoomOut} title="Zoom Out Tactical Grid">
              <Icon icon="mdi:minus" width="18" height="18" />
            </button>
          </div>

          {/* Modern Tactical Legend */}
          <div className="tactical-map-legend">
            <div className="legend-entry">
              <span className="legend-indicator dot-red"></span>
              <span>Active P1/Critical</span>
            </div>
            <div className="legend-entry">
              <span className="legend-indicator dot-green"></span>
              <span>ALS Ambulance</span>
            </div>
            <div className="legend-entry">
              <span className="legend-indicator dot-blue"></span>
              <span>Volunteer Responder</span>
            </div>
            <div className="legend-entry">
              <span className="legend-corridor-line"></span>
              <span>Green Light Corridor</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
