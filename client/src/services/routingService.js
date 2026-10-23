// Real OSRM Road Navigation and Polyline Routing Service

export const fetchRoadRoute = async (startCoords, endCoords) => {
  if (!startCoords || !endCoords) return null;

  const [startLng, startLat] = startCoords;
  const [endLng, endLat] = endCoords;

  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Routing service response error');

    const data = await res.json();
    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
      const primaryRoute = data.routes[0];
      // OSRM returns GeoJSON coordinates in [lng, lat] format -> convert to Leaflet [lat, lng]
      const polyline = primaryRoute.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
      const distanceKm = Number((primaryRoute.distance / 1000).toFixed(2));
      const durationMins = Math.max(Math.round(primaryRoute.duration / 60), 2);

      return {
        polyline,
        distanceKm,
        durationMins
      };
    }
  } catch (error) {
    console.warn('OSRM routing fallback to interpolated polyline:', error.message);
  }

  // Resilient fallback: 20-step curved path if external API times out
  const steps = 20;
  const fallbackPolyline = [];
  for (let i = 0; i <= steps; i++) {
    const fraction = i / steps;
    const lng = startLng + (endLng - startLng) * fraction;
    const lat = startLat + (endLat - startLat) * fraction;
    fallbackPolyline.push([lat, lng]);
  }

  const dx = endLng - startLng;
  const dy = endLat - startLat;
  const roughDist = Number((Math.sqrt(dx * dx + dy * dy) * 111).toFixed(2));

  return {
    polyline: fallbackPolyline,
    distanceKm: roughDist,
    durationMins: Math.max(Math.round((roughDist / 30) * 60), 3)
  };
};
