import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, OnDestroy, Output, ViewChild, afterNextRender } from '@angular/core'
import type { Map as MaplibreMap } from 'maplibre-gl'

@Component({
    selector: 'strive-map',
    template: `<div #container class="map-container"></div>`,
    styles: [`
      :host { display: block; width: 100%; height: 100%; border-radius: inherit; }
      .map-container { width: 100%; height: 100%; border-radius: inherit; }
    `],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapComponent implements OnDestroy {

  @ViewChild('container', { static: true }) container?: ElementRef<HTMLDivElement>

  @Input() center: { lat: number, lng: number } = { lat: 30, lng: 0 }
  @Input() zoom = 1.5
  @Input() styleUrl = 'https://tiles.openfreemap.org/styles/liberty'

  @Output() ready = new EventEmitter<MaplibreMap>()

  private map?: MaplibreMap

  constructor() {
    afterNextRender(async () => {
      if (!this.container) return
      const { Map } = await import('maplibre-gl')
      this.map = new Map({
        container: this.container.nativeElement,
        style: this.styleUrl,
        center: [this.center.lng, this.center.lat],
        zoom: this.zoom,
        attributionControl: { compact: true }
      })
      this.map.once('load', () => {
        if (this.map) this.ready.emit(this.map)
      })
    })
  }

  ngOnDestroy() {
    this.map?.remove()
  }
}
