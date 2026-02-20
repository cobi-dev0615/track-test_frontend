import { useEffect, useRef } from 'react';
import L from 'leaflet';

// Fix default marker icon issue with bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const STOP_ICONS = {
  pickup: { color: '#10b981', icon: '📦', label: 'Pickup' },
  dropoff: { color: '#ef4444', icon: '🏁', label: 'Dropoff' },
  rest: { color: '#8b5cf6', icon: '🛏️', label: 'Rest Stop' },
  break: { color: '#f59e0b', icon: '☕', label: 'Break' },
  fuel: { color: '#06b6d4', icon: '⛽', label: 'Fuel Stop' },
};

function createCustomIcon(type) {
  const config = STOP_ICONS[type] || { color: '#6b7280', icon: '📍', label: 'Stop' };
  return L.divIcon({
    html: `<div style="
      background: ${config.color};
      width: 32px; height: 32px;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 16px;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    ">${config.icon}</div>`,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -20],
  });
}

function createLocationIcon(color, label) {
  return L.divIcon({
    html: `<div style="
      background: ${color};
      width: 14px; height: 14px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    "></div>`,
    className: '',
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -10],
  });
}

export default function RouteMap({ routeGeometry, locations, stops }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    if (mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
    }

    const map = L.map(mapRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
    });
    mapInstance.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map);

    const bounds = L.latLngBounds();

    // Draw route to pickup (blue)
    if (routeGeometry?.to_pickup?.length > 0) {
      const coords = routeGeometry.to_pickup.map(c => [c[1], c[0]]);
      L.polyline(coords, {
        color: '#3b82f6',
        weight: 4,
        opacity: 0.8,
        dashArray: '10, 5',
      }).addTo(map).bindPopup('Route to Pickup');
      coords.forEach(c => bounds.extend(c));
    }

    // Draw route to dropoff (green)
    if (routeGeometry?.to_dropoff?.length > 0) {
      const coords = routeGeometry.to_dropoff.map(c => [c[1], c[0]]);
      L.polyline(coords, {
        color: '#10b981',
        weight: 4,
        opacity: 0.8,
      }).addTo(map).bindPopup('Route to Dropoff');
      coords.forEach(c => bounds.extend(c));
    }

    // Add location markers
    if (locations?.current) {
      const { lat, lng, name } = locations.current;
      L.marker([lat, lng], { icon: createLocationIcon('#3b82f6', 'Start') })
        .addTo(map)
        .bindPopup(`<strong>Current Location</strong><br/>${name || ''}`);
      bounds.extend([lat, lng]);
    }

    if (locations?.pickup) {
      const { lat, lng, name } = locations.pickup;
      L.marker([lat, lng], { icon: createCustomIcon('pickup') })
        .addTo(map)
        .bindPopup(`<strong>Pickup</strong><br/>${name || ''}`);
      bounds.extend([lat, lng]);
    }

    if (locations?.dropoff) {
      const { lat, lng, name } = locations.dropoff;
      L.marker([lat, lng], { icon: createCustomIcon('dropoff') })
        .addTo(map)
        .bindPopup(`<strong>Dropoff</strong><br/>${name || ''}`);
      bounds.extend([lat, lng]);
    }

    // Add stop markers
    if (stops?.length > 0) {
      stops.forEach((stop) => {
        if (stop.location && stop.type !== 'pickup' && stop.type !== 'dropoff') {
          const { lat, lng } = stop.location;
          if (lat && lng) {
            const config = STOP_ICONS[stop.type] || STOP_ICONS.break;
            L.marker([lat, lng], { icon: createCustomIcon(stop.type) })
              .addTo(map)
              .bindPopup(`
                <strong>${config.label}</strong><br/>
                ${stop.reason}<br/>
                <small>Duration: ${stop.duration_hours}h</small>
              `);
            bounds.extend([lat, lng]);
          }
        }
      });
    }

    // Fit map to bounds
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50] });
    } else {
      map.setView([39.8283, -98.5795], 4); // Center of US
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [routeGeometry, locations, stops]);

  return <div ref={mapRef} className="w-full h-full" />;
}
