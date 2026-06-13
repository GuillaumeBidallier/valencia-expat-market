'use client'
import dynamic from 'next/dynamic'

const ProMap = dynamic(() => import('@/components/pros/ProMap'), {
  ssr: false,
  loading: () => <div className="h-[280px] rounded-2xl bg-gray-100 animate-pulse" />,
})

interface Props {
  lat: number
  lng: number
  name: string
  city: string
  zones: string[]
}

export default function ProMapClient(props: Props) {
  return <ProMap {...props} />
}
