import { useEffect } from 'react';
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet';
import { MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import './DispatchMap.css';

const DEFAULT_CENTER = [9.1726, 77.8687];
const TILE_URL = import.meta.env.VITE_MAP_TILE_URL
  || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const TILE_ATTRIBUTION = import.meta.env.VITE_MAP_ATTRIBUTION
  || '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

function MapCenterUpdater({ center }) {
  const map = useMap();
  const latitude = center[0];
  const longitude = center[1];
  useEffect(() => {
    map.setView(center);
  }, [latitude, longitude, map]);
  return null;
}

function coordinatesFromLocation(location) {
  if (typeof location !== 'string') return null;
  const coordinatePair = /(-?\d{1,2}(?:\.\d+)?)\s*,\s*(-?\d{1,3}(?:\.\d+)?)/;
  const match = location.match(new RegExp(`\\(\\s*${coordinatePair.source}\\s*\\)`))
    ?? location.trim().match(new RegExp(`^${coordinatePair.source}$`));
  if (!match) return null;
  const latitude = Number(match[1]);
  const longitude = Number(match[2]);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)
      || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return null;
  return [latitude, longitude];
}

export default function DispatchMap({ emergencies = [], selectedEmergency, onSelectEmergency }) {
  const mappedEmergencies = emergencies
    .map((emergency) => ({ emergency, coordinates: coordinatesFromLocation(emergency.location) }))
    .filter((item) => item.coordinates);
  const selectedCoordinates = selectedEmergency
    ? coordinatesFromLocation(selectedEmergency.location)
    : null;
  const center = selectedCoordinates ?? mappedEmergencies[0]?.coordinates ?? DEFAULT_CENTER;

  return (
    <section className="dispatch-map-card" aria-label="Emergency report map">
      <div className="dispatch-map-heading">
        <div>
          <strong>Emergency reports</strong>
          <span>
            {mappedEmergencies.length} of {emergencies.length} loaded reports include GPS coordinates
          </span>
        </div>
        <span className="dispatch-map-source"><MapPin size={14} /> OpenStreetMap</span>
      </div>

      <MapContainer
        center={center}
        className="dispatch-leaflet-map"
        scrollWheelZoom={false}
        zoom={12}
      >
        <TileLayer attribution={TILE_ATTRIBUTION} url={TILE_URL} />
        <MapCenterUpdater center={center} />
        {mappedEmergencies.map(({ emergency, coordinates }) => {
          const selected = emergency.id === selectedEmergency?.id;
          return (
            <CircleMarker
              center={coordinates}
              eventHandlers={{
                click: () => onSelectEmergency?.(emergency),
              }}
              key={emergency.id}
              pathOptions={{
                color: selected ? '#be123c' : '#fff',
                fillColor: emergency.priority === 'CRITICAL' ? '#e11d48' : '#2563eb',
                fillOpacity: 0.9,
                weight: selected ? 4 : 2,
              }}
              radius={selected ? 10 : 7}
            >
              <Popup>
                <strong>#{emergency.id} · {emergency.type}</strong>
                <br />
                {emergency.location}
                <br />
                {emergency.priority} · {emergency.status.replaceAll('_', ' ')}
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      <p className="dispatch-map-footnote">
        {mappedEmergencies.length
          ? 'Markers use GPS coordinates saved with backend reports.'
          : 'No GPS coordinates in the loaded reports yet. Reports with an attached GPS location will appear here.'}
      </p>
    </section>
  );
}
