import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, Input, OnDestroy, inject, signal } from '@angular/core'
import { RouterModule } from '@angular/router'
import type { GeoJSONSource, Map as MaplibreMap } from 'maplibre-gl'
import { Subscription } from 'rxjs'

import { AlgoliaGoal } from '@strive/model'
import { AlgoliaService } from '@strive/utils/services/algolia.service'
import { ThemeService } from '@strive/utils/services/theme.service'

import { MapComponent } from '../map.component'
import { SmallThumbnailComponent } from '../../thumbnail/components/small/small-thumbnail.component'

@Component({
    selector: 'strive-goals-map',
    templateUrl: './goals-map.component.html',
    styleUrls: ['./goals-map.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        RouterModule,
        MapComponent,
        SmallThumbnailComponent
    ]
})
export class GoalsMapComponent implements OnDestroy {
  private algolia = inject(AlgoliaService)
  private theme = inject(ThemeService)

  @Input() center: { lat: number, lng: number } = { lat: 30, lng: 0 }
  @Input() zoom = 1.5

  /**
   * Static mode: show only these goals instead of querying Algolia by
   * map bounds, and fit the initial view to contain all pins
   */
  @Input() set goals(goals: AlgoliaGoal[] | undefined) {
    this.staticGoals = goals
    if (this.map && goals) this.renderGoals(this.map, goals, true)
  }
  private staticGoals?: AlgoliaGoal[]
  private map?: MaplibreMap

  selectedGoals = signal<AlgoliaGoal[]>([])
  private goalsSub?: Subscription

  // style is set at map init only - switching styles at runtime would drop the goals source and layer
  get styleUrl() {
    return this.theme.theme === 'dark'
      ? 'https://tiles.openfreemap.org/styles/dark'
      : 'https://tiles.openfreemap.org/styles/liberty'
  }

  initMap(map: MaplibreMap) {
    this.map = map
    const clusterMaxZoom = 14

    map.addSource('goals', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] },
      cluster: true,
      clusterMaxZoom,
      clusterRadius: 50
    })
    map.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'goals',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': '#F7941D',
        'circle-radius': ['step', ['get', 'point_count'], 16, 10, 22, 25, 28],
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff'
      }
    })
    map.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'goals',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': ['get', 'point_count_abbreviated'],
        'text-font': ['Noto Sans Bold'],
        'text-size': 13
      },
      paint: { 'text-color': '#ffffff' }
    })
    map.addLayer({
      id: 'goals',
      type: 'circle',
      source: 'goals',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-radius': 8,
        'circle-color': '#F7941D',
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff'
      }
    })

    if (this.staticGoals) {
      this.renderGoals(map, this.staticGoals, true)
    } else {
      this.goalsSub = this.algolia.mapGoals$.subscribe(goals => this.renderGoals(map, goals, false))

      const queryBounds = () => {
        const bounds = map.getBounds()
        const north = Math.min(bounds.getNorth(), 90)
        const south = Math.max(bounds.getSouth(), -90)

        // maplibre longitudes are unwrapped and can exceed [-180, 180] which Algolia rejects
        if (bounds.getEast() - bounds.getWest() >= 360) {
          this.algolia.searchGoalsByBounds([north, 180, south, -180])
        } else {
          const wrap = (lng: number) => ((lng + 180) % 360 + 360) % 360 - 180
          this.algolia.searchGoalsByBounds([north, wrap(bounds.getEast()), south, wrap(bounds.getWest())])
        }
      }
      queryBounds()

      let debounce: ReturnType<typeof setTimeout>
      map.on('moveend', () => {
        clearTimeout(debounce)
        debounce = setTimeout(queryBounds, 300)
      })
    }

    map.on('click', 'goals', event => {
      const properties = event.features?.[0]?.properties
      if (properties) this.selectedGoals.set([properties as AlgoliaGoal])
    })
    map.on('click', 'clusters', async event => {
      const feature = event.features?.[0]
      const clusterId = feature?.properties?.['cluster_id']
      const source = map.getSource<GeoJSONSource>('goals')
      if (clusterId === undefined || !feature || !source) return

      const { coordinates } = feature.geometry as { coordinates: [number, number] }
      const zoom = await source.getClusterExpansionZoom(clusterId)

      if (zoom <= clusterMaxZoom) {
        // cluster splits up when zooming in
        map.easeTo({ center: coordinates, zoom: zoom + 0.5 })
      } else {
        // goals share (almost) the same location - list them all
        const leaves = await source.getClusterLeaves(clusterId, feature.properties['point_count'], 0)
        this.selectedGoals.set(leaves.map(leaf => leaf.properties as AlgoliaGoal))
        map.easeTo({ center: coordinates })
      }
    })
    map.on('click', event => {
      const features = map.queryRenderedFeatures(event.point, { layers: ['goals', 'clusters'] })
      if (!features.length) this.selectedGoals.set([])
    })
    for (const layer of ['goals', 'clusters']) {
      map.on('mouseenter', layer, () => map.getCanvas().style.cursor = 'pointer')
      map.on('mouseleave', layer, () => map.getCanvas().style.cursor = '')
    }
  }

  private renderGoals(map: MaplibreMap, goals: AlgoliaGoal[], fitBounds: boolean) {
    const located = goals.filter(goal => goal._geoloc)
    const features = located.map(goal => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [goal._geoloc!.lng, goal._geoloc!.lat] },
      properties: {
        id: goal.id,
        title: goal.title,
        image: goal.image,
        locationName: goal.locationName ?? ''
      }
    }))
    const source = map.getSource<GeoJSONSource>('goals')
    source?.setData({ type: 'FeatureCollection', features })

    if (fitBounds && located.length) {
      const lngs = located.map(goal => goal._geoloc!.lng)
      const lats = located.map(goal => goal._geoloc!.lat)
      map.fitBounds(
        [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]],
        { padding: 60, maxZoom: 12, animate: false }
      )
    }
  }

  ngOnDestroy() {
    this.goalsSub?.unsubscribe()
  }
}
