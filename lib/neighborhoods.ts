export const neighborhoodCoords: Record<string, { lat: number; lng: number }> = {
  'Valencia':      { lat: 39.4699, lng: -0.3763 },
  'Ruzafa':        { lat: 39.4622, lng: -0.3772 },
  'Benimaclet':    { lat: 39.4820, lng: -0.3630 },
  'Campanar':      { lat: 39.4810, lng: -0.4000 },
  'Paterna':       { lat: 39.5037, lng: -0.4400 },
  'Alboraya':      { lat: 39.5087, lng: -0.3540 },
  'El Carmen':     { lat: 39.4750, lng: -0.3780 },
  'Eixample':      { lat: 39.4643, lng: -0.3783 },
  'La Malva-rosa': { lat: 39.4780, lng: -0.3340 },
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
