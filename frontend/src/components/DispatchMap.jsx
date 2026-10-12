import { Icon } from '@iconify/react';

export default function DispatchMap({ selectedEmergency }) {
  return (
    <div className="dispatch-map">
      <div className="map-container">
        {/* Placeholder for map - in real implementation, use Leaflet or Google Maps */}
        <div className="map-placeholder">
          <div className="map-bg">
            {/* Simulated map with emergency marker */}
            {selectedEmergency && (
              <>
                <div className="emergency-marker" style={{ top: '35%', left: '45%' }}>
                  <div className="marker-pin critical">
                    <Icon icon="mdi:map-marker-alert" width="32" height="32" />
                  </div>
                  <div className="marker-label">
                    {selectedEmergency.id}: {selectedEmergency.type} (Critical)
                  </div>
                </div>
                
                <div className="resource-marker" style={{ top: '48%', left: '35%' }}>
                  <div className="marker-pin available">
                    <Icon icon="mdi:ambulance" width="28" height="28" />
                  </div>
                  <div className="marker-label">Ambulance A (1.5 km)</div>
                  <div className="route-line"></div>
                </div>
                
                <div className="resource-marker" style={{ top: '25%', left: '55%' }}>
                  <div className="marker-pin available">
                    <Icon icon="mdi:account-hard-hat" width="28" height="28" />
                  </div>
                  <div className="marker-label">Volunteer X (1.2 km)</div>
                </div>
              </>
            )}
          </div>
        </div>
        
        <div className="map-controls">
          <button className="map-control-btn">
            <Icon icon="mdi:crosshairs-gps" width="20" height="20" />
          </button>
          <button className="map-control-btn">
            <Icon icon="mdi:plus" width="20" height="20" />
          </button>
          <button className="map-control-btn">
            <Icon icon="mdi:minus" width="20" height="20" />
          </button>
        </div>
        
        <div className="map-legend">
          <div className="legend-item">
            <Icon icon="mdi:map-marker" className="legend-marker emergency" width="20" height="20" />
            <span>Clear on-map tooltip</span>
          </div>
          <div className="legend-item">
            <span className="legend-line"></span>
            <span>Tracking lines</span>
          </div>
          <button className="legend-close">
            <Icon icon="mdi:close" width="16" height="16" />
          </button>
        </div>
      </div>
    </div>
  );
}
