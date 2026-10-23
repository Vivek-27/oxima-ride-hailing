import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Plus, Minus, Navigation } from 'lucide-react';

// Custom SVG Icons for all 6 Vehicle Categories
const getVehicleSvg = (type) => {
  switch (type) {
    case 'Moto':
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 text-white">
          <path d="M19 12c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm0 4.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 12c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm0 4.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM11.8 11.2l-1.9-4.7c-.2-.5-.8-.8-1.4-.6-.5.2-.8.8-.6 1.4l1.3 3.2C8.3 11 7.4 12 7.1 13.2L6 14.5l1.4 1.2 1.4-1.7c.6-.4 1.4-.7 2.2-.7h2.2l1.6-3.2c.2-.5 0-1.1-.5-1.3-.5-.2-1.1 0-1.3.5L13.1 11h-1.3zM16.5 6.5A1.5 1.5 0 1015 5a1.5 1.5 0 001.5 1.5z"/>
        </svg>
      `;
    case 'Auto':
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 text-amber-900">
          <path d="M18.5 7H16V5.5C16 4.67 15.33 4 14.5 4h-5C8.67 4 8 4.67 8 5.5V7H5.5C4.67 7 4 7.67 4 8.5v6c0 .83.67 1.5 1.5 1.5H6v1c0 .83.67 1.5 1.5 1.5h1c.83 0 1.5-.67 1.5-1.5v-1h4v1c0 .83.67 1.5 1.5 1.5h1c.83 0 1.5-.67 1.5-1.5v-1h.5c.83 0 1.5-.67 1.5-1.5v-6c0-.83-.67-1.5-1.5-1.5zM7.5 14.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm9 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3zM15 10H9V6h6v4z"/>
        </svg>
      `;
    case 'Mini':
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 text-white">
          <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
        </svg>
      `;
    case 'Sedan':
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 text-white">
          <path d="M20 10V8c0-.55-.45-1-1-1h-2.18c-.45-.6-1.15-1-1.94-1H9.12c-.79 0-1.49.4-1.94 1H5c-.55 0-1 .45-1 1v2c-1.1 0-2 .9-2 2v5c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h14v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-5c0-1.1-.9-2-2-2zM7.5 14c-.83 0-1.5-.67-1.5-1.5S6.67 11 7.5 11s1.5.67 1.5 1.5S8.33 14 7.5 14zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM6.5 9h11l1 2h-13l1-2z"/>
        </svg>
      `;
    case 'SUV':
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 text-white">
          <path d="M20 7h-2V5c0-.55-.45-1-1-1H7c-.55 0-1 .45-1 1v2H4c-.55 0-1 .45-1 1v7c0 1.1.9 2 2 2h1c.55 0 1-.45 1-1v-1h10v1c0 .55.45 1 1 1h1c1.1 0 2-.9 2-2V8c0-.55-.45-1-1-1zM7 6h10v1H7V6zm0 9c-.83 0-1.5-.67-1.5-1.5S6.17 12 7 12s1.5.67 1.5 1.5S7.83 15 7 15zm10 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 10l1-2h12l1 2H5z"/>
        </svg>
      `;
    case 'Electric':
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 text-white">
          <path d="M7 2v11h3v9l7-12h-4l3-8z"/>
        </svg>
      `;
    default:
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 text-white">
          <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99z"/>
        </svg>
      `;
  }
};

const VEHICLE_STYLES = {
  Moto: { bg: 'bg-amber-500', border: 'border-white', shadow: 'shadow-amber-500/40', badge: 'Moto' },
  Auto: { bg: 'bg-emerald-400', border: 'border-amber-400', shadow: 'shadow-emerald-500/40', badge: 'Auto' },
  Mini: { bg: 'bg-blue-600', border: 'border-white', shadow: 'shadow-blue-500/40', badge: 'Mini' },
  Sedan: { bg: 'bg-indigo-600', border: 'border-white', shadow: 'shadow-indigo-500/40', badge: 'Sedan' },
  SUV: { bg: 'bg-purple-600', border: 'border-white', shadow: 'shadow-purple-500/40', badge: 'SUV' },
  Electric: { bg: 'bg-teal-500', border: 'border-emerald-300', shadow: 'shadow-teal-500/40', badge: 'EV ⚡' }
};

export const createVehicleIcon = (heading = 0, vehicleType = 'Mini') => {
  const style = VEHICLE_STYLES[vehicleType] || VEHICLE_STYLES.Mini;
  const svg = getVehicleSvg(vehicleType);

  return L.divIcon({
    className: 'custom-vehicle-marker',
    html: `
      <div class="relative flex flex-col items-center group">
        <div style="transform: rotate(${heading}deg); transition: transform 0.3s ease-out;" class="w-8 h-8 rounded-full ${style.bg} ${style.shadow} shadow-lg border-2 ${style.border} flex items-center justify-center">
          ${svg}
        </div>
        <span class="absolute -bottom-3 px-1.5 py-0.2 bg-slate-900/90 text-white font-black text-[9px] rounded-full border border-white/40 shadow-sm whitespace-nowrap">
          ${style.badge}
        </span>
      </div>
    `,
    iconSize: [32, 40],
    iconAnchor: [16, 20]
  });
};

export const createPinIcon = (label = 'A', isPickup = true, isSearching = false) => {
  return L.divIcon({
    className: 'custom-pin-marker',
    html: `
      <div class="relative flex flex-col items-center">
        ${isSearching ? `
          <!-- Pulsing Radar Waves -->
          <div class="absolute -top-3 -left-3 w-13 h-13 rounded-full bg-blue-500/25 animate-ping pointer-events-none"></div>
          <div class="absolute -top-6 -left-6 w-19 h-19 rounded-full border border-blue-500/30 animate-pulse pointer-events-none"></div>
        ` : ''}
        <div class="w-7 h-7 rounded-full ${isPickup ? 'bg-emerald-500' : 'bg-rose-500'} text-white flex items-center justify-center shadow-lg border-2 border-white text-xs font-black relative z-10">
          ${label}
        </div>
        <div class="w-1.5 h-2 ${isPickup ? 'bg-emerald-600' : 'bg-rose-600'} rounded-b-full -mt-0.5 relative z-10"></div>
      </div>
    `,
    iconSize: [28, 34],
    iconAnchor: [14, 32]
  });
};

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      if (onMapClick) {
        onMapClick([e.latlng.lng, e.latlng.lat]);
      }
    }
  });
  return null;
}

function MapControls({ pickup, destination, driverLocation, routeCoordinates, pickupRouteCoordinates }) {
  const map = useMap();
  const initialFitDoneRef = useRef(false);

  const handleRecenter = () => {
    const points = [];
    if (pickup?.coordinates) points.push([pickup.coordinates[1], pickup.coordinates[0]]);
    if (destination?.coordinates) points.push([destination.coordinates[1], destination.coordinates[0]]);
    if (driverLocation?.coordinates) points.push([driverLocation.coordinates[1], driverLocation.coordinates[0]]);

    if (routeCoordinates && routeCoordinates.length > 0) {
      routeCoordinates.forEach(pt => points.push(pt));
    } else if (pickupRouteCoordinates && pickupRouteCoordinates.length > 0) {
      pickupRouteCoordinates.forEach(pt => points.push(pt));
    }

    if (points.length > 1) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16, animate: true });
    } else if (points.length === 1) {
      map.setView(points[0], 14, { animate: true });
    }
  };

  useEffect(() => {
    if (!initialFitDoneRef.current && (pickup?.coordinates || destination?.coordinates)) {
      handleRecenter();
      initialFitDoneRef.current = true;
    }
  }, [pickup, destination]);

  return (
    <div className="absolute top-4 right-4 z-40 flex flex-col gap-2">
      <button
        type="button"
        onClick={handleRecenter}
        title="Recenter Map"
        className="w-9 h-9 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 text-slate-700 hover:text-blue-600 hover:bg-slate-50 shadow-md flex items-center justify-center transition active:scale-95"
      >
        <Navigation className="w-4 h-4" />
      </button>

      <div className="flex flex-col bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-md overflow-hidden divide-y divide-slate-100">
        <button
          type="button"
          onClick={() => map.zoomIn()}
          title="Zoom In"
          className="w-9 h-9 text-slate-700 hover:text-blue-600 hover:bg-slate-50 flex items-center justify-center transition active:scale-95"
        >
          <Plus className="w-4 h-4 font-bold" />
        </button>
        <button
          type="button"
          onClick={() => map.zoomOut()}
          title="Zoom Out"
          className="w-9 h-9 text-slate-700 hover:text-blue-600 hover:bg-slate-50 flex items-center justify-center transition active:scale-95"
        >
          <Minus className="w-4 h-4 font-bold" />
        </button>
      </div>
    </div>
  );
}

export const MapView = ({
  center = [17.4504, 78.3772], // Default Hyderabad Cyber Towers
  zoom = 13,
  pickup = null,
  destination = null,
  driverLocation = null,
  nearbyDrivers = [],
  routeCoordinates = [],
  pickupRouteCoordinates = [],
  isSearching = false,
  onMapClick = null,
  interactive = true,
  height = '100%'
}) => {
  const initialCenter = pickup?.coordinates
    ? [pickup.coordinates[1], pickup.coordinates[0]]
    : [center[0], center[1]];

  return (
    <div style={{ height }} className="w-full relative z-0 overflow-hidden rounded-3xl border border-slate-200/90 shadow-sm bg-white">
      <MapContainer
        center={initialCenter}
        zoom={zoom}
        scrollWheelZoom={interactive}
        className="w-full h-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; CartoDB &copy; OpenStreetMap'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        <MapClickHandler onMapClick={onMapClick} />
        
        <MapControls
          pickup={pickup}
          destination={destination}
          driverLocation={driverLocation}
          routeCoordinates={routeCoordinates}
          pickupRouteCoordinates={pickupRouteCoordinates}
        />

        {/* Searching Radar Circle animation */}
        {isSearching && pickup?.coordinates && (
          <Circle
            center={[pickup.coordinates[1], pickup.coordinates[0]]}
            radius={800}
            pathOptions={{
              color: '#007AFF',
              fillColor: '#007AFF',
              fillOpacity: 0.12,
              weight: 1.5,
              dashArray: '4, 6'
            }}
          />
        )}

        {/* Pickup Pin */}
        {pickup?.coordinates && (
          <Marker
            position={[pickup.coordinates[1], pickup.coordinates[0]]}
            icon={createPinIcon('A', true, isSearching)}
          >
            <Popup>
              <div className="p-1 text-xs">
                <span className="font-bold text-emerald-600 uppercase block text-[10px]">Pickup Location</span>
                <span className="font-medium text-slate-900">{pickup.address || 'Pickup'}</span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Destination Pin */}
        {destination?.coordinates && (
          <Marker
            position={[destination.coordinates[1], destination.coordinates[0]]}
            icon={createPinIcon('B', false, false)}
          >
            <Popup>
              <div className="p-1 text-xs">
                <span className="font-bold text-rose-600 uppercase block text-[10px]">Destination</span>
                <span className="font-medium text-slate-900">{destination.address || 'Dropoff'}</span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Active Driver */}
        {driverLocation?.coordinates && (
          <Marker
            position={[driverLocation.coordinates[1], driverLocation.coordinates[0]]}
            icon={createVehicleIcon(driverLocation.heading || 0, driverLocation.vehicleType || 'Mini')}
          >
            <Popup>
              <div className="p-1 text-xs">
                <p className="font-bold text-blue-600">{driverLocation.name || 'Driver'}</p>
                <p className="text-slate-600 text-[11px] font-semibold">
                  {driverLocation.vehicleType || 'Mini'} • {driverLocation.vehicleModel || 'Vehicle'}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Nearby Available Drivers in 20 KM Pool */}
        {nearbyDrivers.map((d) => {
          const coords = d.currentLocation?.coordinates || d.coordinates;
          if (!coords) return null;
          const vType = d.vehicle?.type || 'Mini';

          return (
            <Marker
              key={d._id || d.driverId}
              position={[coords[1], coords[0]]}
              icon={createVehicleIcon(d.currentHeading || 0, vType)}
            >
              <Popup>
                <div className="p-1 text-xs">
                  <p className="font-semibold text-slate-900">{d.vehicle?.make} {d.vehicle?.model}</p>
                  <p className="text-blue-600 text-[11px] font-bold">
                    {vType} • {d.distanceKm ? `${d.distanceKm} km away` : 'Available'}
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Driver -> Pickup Route Polyline (Amber/Dashed) */}
        {pickupRouteCoordinates && pickupRouteCoordinates.length > 0 && (
          <Polyline
            positions={pickupRouteCoordinates}
            pathOptions={{ color: '#f59e0b', weight: 5, dashArray: '8, 8', opacity: 0.9, lineCap: 'round' }}
          />
        )}

        {/* Pickup -> Destination Trip Road Polyline (Apple Blue) */}
        {routeCoordinates && routeCoordinates.length > 0 && (
          <Polyline
            positions={routeCoordinates}
            pathOptions={{ color: '#007AFF', weight: 6, opacity: 0.95, lineCap: 'round', lineJoin: 'round' }}
          />
        )}
      </MapContainer>
    </div>
  );
};
