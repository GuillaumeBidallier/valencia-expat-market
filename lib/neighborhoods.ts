export const neighborhoods = [
  'Bruxelles-Ville', 'Ixelles', 'Schaerbeek', 'Uccle',
  'Anderlecht', 'Etterbeek', 'Woluwe-Saint-Pierre', 'Saint-Gilles', 'Molenbeek-Saint-Jean',
  'Lasne',
]

export const neighborhoodCoords: Record<string, { lat: number; lng: number }> = {
  'Bruxelles-Ville':      { lat: 50.8503, lng: 4.3517 },
  'Ixelles':              { lat: 50.8333, lng: 4.3667 },
  'Schaerbeek':           { lat: 50.8676, lng: 4.3737 },
  'Uccle':                { lat: 50.8014, lng: 4.3378 },
  'Anderlecht':           { lat: 50.8379, lng: 4.3080 },
  'Etterbeek':            { lat: 50.8371, lng: 4.3897 },
  'Woluwe-Saint-Pierre':  { lat: 50.8298, lng: 4.4331 },
  'Saint-Gilles':         { lat: 50.8263, lng: 4.3459 },
  'Molenbeek-Saint-Jean': { lat: 50.8547, lng: 4.3272 },
  'Lasne':                { lat: 50.6667, lng: 4.4333 },
}

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function boundingBox(lat: number, lng: number, radiusKm: number) {
  const latDelta = radiusKm / 111
  const lngDelta = radiusKm / (111 * Math.cos(lat * Math.PI / 180))
  return {
    latMin: lat - latDelta, latMax: lat + latDelta,
    lngMin: lng - lngDelta, lngMax: lng + lngDelta,
  }
}
