'use client'
import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

/* Fix Leaflet default icon missing in Next.js */
const icon = L.divIcon({
  html: `<div style="
    width:36px;height:36px;border-radius:50% 50% 50% 0;
    background:linear-gradient(135deg,#E8571A,#f97316);
    border:3px solid white;
    box-shadow:0 2px 8px rgba(0,0,0,0.3);
    transform:rotate(-45deg);
    display:flex;align-items:center;justify-content:center;
  "><div style="transform:rotate(45deg);width:8px;height:8px;background:white;border-radius:50%;margin:auto;margin-top:10px;"></div></div>`,
  className: '',
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -38],
})

function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()
  useEffect(() => { map.setView([lat, lng], 13) }, [map, lat, lng])
  return null
}

interface Props {
  lat: number
  lng: number
  name: string
  city: string
  zones: string[]
}

export default function ProMap({ lat, lng, name, city, zones }: Props) {
  return (
    <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
      <div style={{ height: 280 }}>
        <MapContainer
          center={[lat, lng]}
          zoom={13}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[lat, lng]} icon={icon}>
            <Popup>
              <strong className="text-navy">{name}</strong><br />
              <span className="text-gray-500 text-xs">{city}</span>
            </Popup>
          </Marker>
          <Recenter lat={lat} lng={lng} />
        </MapContainer>
      </div>
      {zones.length > 0 && (
        <div className="bg-gray-50 border-t border-gray-100 px-4 py-2.5 flex flex-wrap gap-1.5 items-center">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mr-1">Zones</span>
          {zones.map(z => (
            <span key={z} className="text-xs bg-white border border-gray-200 text-gray-600 px-2.5 py-0.5 rounded-full">{z}</span>
          ))}
        </div>
      )}
    </div>
  )
}
