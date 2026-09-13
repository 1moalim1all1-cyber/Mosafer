import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'

export function LiveMapViewport({ points }: { points: [number, number][] }) {
  const map = useMap()

  useEffect(() => {
    if (points.length === 0) return
    if (points.length === 1) {
      map.panTo(points[0], { animate: true, duration: 0.8 })
      return
    }
    map.fitBounds(L.latLngBounds(points), { padding: [48, 48], maxZoom: 16, animate: true, duration: 0.8 })
  }, [map, points])

  return null
}
