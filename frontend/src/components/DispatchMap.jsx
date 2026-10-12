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
                  <div className="marker-pin critical">📍</div>
                  <div className="marker-label">
                    {selectedEmergency.id}: {selectedEmergency.type} (Critical)
                  </div>
                </div>
                
                <div className="resource-marker" style={{ top: '48%', left: '35%' }}>
                  <div className="marker-pin available">🚑</div>
                  <div className="marker-label">Ambulance A (1.5 km)</div>
                  <div className="route-line"></div>
                </div>
                
                <div className="resource-marker" style={{ top: '25%', left: '55%' }}>
                  <div className="marker-pin available">👤</div>
                  <div className="marker-label">Volunteer X (1.2 km)</div>
                </div>
              </>
            )}
          </div>
        </div>
        
        <div className="map-controls">
          <button className="map-control-btn">🎯</button>
          <button className="map-control-btn">➕</button>
          <button className="map-control-btn">➖</button>
        </div>
        
        <div className="map-legend">
          <div className="legend-item">
            <span className="legend-marker emergency">📍</span>
            <span>Clear on-map tooltip</span>
          </div>
          <div className="legend-item">
            <span className="legend-line"></span>
            <span>Tracking lines</span>
          </div>
          <button className="legend-close">✕</button>
        </div>
      </div>
    </div>
  );
}
