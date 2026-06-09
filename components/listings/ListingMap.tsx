'use client'
import { useEffect } from 'react'
import { MapContainer, TileLayer, Circle, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

function FitBounds({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView([lat, lng], 14)
  }, [map, lat, lng])
  return null
}

interface Props {
  lat: number
  lng: number
  neighborhood: string
}

export default function ListingMap({ lat, lng, neighborhood }: Props) {
  return (
    <div className="rounded-xl overflow-hidden border border-gray-100" style={{ height: 220 }}>
      <MapContainer
        center={[lat, lng]}
        zoom={14}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Circle
          center={[lat, lng]}
          radius={400}
          pathOptions={{ color: '#F97316', fillColor: '#F97316', fillOpacity: 0.15, weight: 2 }}
        />
        <FitBounds lat={lat} lng={lng} />
      </MapContainer>
      <p className="text-xs text-gray-400 text-center py-1.5 bg-gray-50 border-t border-gray-100">
        Localisation approximative — {neighborhood}
      </p>
    </div>
  )
}
