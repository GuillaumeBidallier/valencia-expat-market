import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const neighborhoodCoords: Record<string, { lat: number; lng: number }> = {
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

async function main() {
  const sql = neon(process.env.DIRECT_URL!)

  const rows = await sql`SELECT id, neighborhood FROM "Listing" WHERE lat IS NULL` as { id: string; neighborhood: string }[]

  console.log(`Found ${rows.length} listings without coordinates`)
  if (rows.length === 0) { console.log('Nothing to do.'); return }

  for (const row of rows) {
    const coords = neighborhoodCoords[row.neighborhood] ?? neighborhoodCoords['Valencia']
    await sql`UPDATE "Listing" SET lat = ${coords.lat}, lng = ${coords.lng} WHERE id = ${row.id}`
  }

  console.log(`Updated ${rows.length} listings`)
}

main().catch(e => { console.error(e); process.exit(1) })
