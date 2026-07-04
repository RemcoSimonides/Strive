import { Injectable } from '@angular/core'

export interface GeocodeResult {
  lat: number
  lng: number
  name: string
}

interface PhotonFeature {
  geometry: { coordinates: [number, number] }
  properties: { name?: string, housenumber?: string, street?: string, city?: string, state?: string, country?: string }
}

function toGeocodeResult(feature: PhotonFeature): GeocodeResult {
  const { name, housenumber, street, city, country } = feature.properties
  // street and house number results have no name of their own
  const title = name ?? (street ? [street, housenumber].filter(Boolean).join(' ') : undefined)
  return {
    lng: feature.geometry.coordinates[0],
    lat: feature.geometry.coordinates[1],
    name: [title, city, country].filter(Boolean).join(', ')
  }
}

@Injectable({ providedIn: 'root' })
export class GeocodeService {

  async search(query: string, limit = 5): Promise<GeocodeResult[]> {
    try {
      const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=${limit * 2}`)
      if (!res.ok) return []
      const { features } = await res.json() as { features: PhotonFeature[] }
      const results = features.map(toGeocodeResult)
      // photon returns a result per street segment - dedupe identical names
      const unique = results.filter((result, index) => results.findIndex(other => other.name === result.name) === index)
      return unique.slice(0, limit)
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
