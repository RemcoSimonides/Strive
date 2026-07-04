import { Injectable } from '@angular/core'

export interface GeocodeResult {
  lat: number
  lng: number
  name: string
}

interface PhotonFeature {
  geometry: { coordinates: [number, number] }
  properties: { name?: string, city?: string, state?: string, country?: string }
}

function toGeocodeResult(feature: PhotonFeature): GeocodeResult {
  const { name, city, country } = feature.properties
  return {
    lng: feature.geometry.coordinates[0],
    lat: feature.geometry.coordinates[1],
    name: [name, city, country].filter(Boolean).join(', ')
  }
}

@Injectable({ providedIn: 'root' })
export class GeocodeService {

  async search(query: string, limit = 5): Promise<GeocodeResult[]> {
    try {
      const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=${limit}`)
      if (!res.ok) return []
      const { features } = await res.json() as { features: PhotonFeature[] }
      return features.map(toGeocodeResult)
    } catch {
      return []
    }
  }

  async reverse(lat: number, lng: number): Promise<GeocodeResult | undefined> {
    try {
      const res = await fetch(`https://photon.komoot.io/reverse?lon=${lng}&lat=${lat}`)
      if (!res.ok) return undefined
      const { features } = await res.json() as { features: PhotonFeature[] }
      return features.length ? toGeocodeResult(features[0]) : undefined
    } catch {
      return undefined
    }
  }
}
