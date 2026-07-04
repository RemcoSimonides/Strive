import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, Input, OnInit, inject, signal } from '@angular/core'
import { FormControl, ReactiveFormsModule } from '@angular/forms'
import { IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, IonTitle, IonContent, IonFooter, IonSearchbar, IonList, IonItem, IonLabel, ModalController } from '@ionic/angular/standalone'
import { addIcons } from 'ionicons'
import { close, locationOutline } from 'ionicons/icons'
import type { Map as MaplibreMap, Marker } from 'maplibre-gl'
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators'
import { of } from 'rxjs'

import { GoalLocation } from '@strive/model'
import { MapComponent } from '../map.component'
import { GeocodeService, GeocodeResult } from '../geocode.service'

@Component({
    selector: 'strive-location-picker',
    templateUrl: './location-picker.component.html',
    styleUrls: ['./location-picker.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MapComponent,
        IonHeader,
        IonToolbar,
        IonButtons,
        IonButton,
        IonIcon,
        IonTitle,
        IonContent,
        IonFooter,
        IonSearchbar,
        IonList,
        IonItem,
        IonLabel
    ]
})
export class LocationPickerModalComponent implements OnInit {
  private geocode = inject(GeocodeService)
  private modalCtrl = inject(ModalController)

  @Input() goalLocation?: GoalLocation | null

  searchControl = new FormControl('', { nonNullable: true })
  results$ = this.searchControl.valueChanges.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    switchMap(query => query.trim().length >= 3 ? this.geocode.search(query) : of([]))
  )

  picked = signal<GoalLocation | undefined>(undefined)

  private map?: MaplibreMap
  private marker?: Marker

  constructor() {
    addIcons({ close, locationOutline })
  }

  cancel() {
    this.modalCtrl.dismiss()
  }

  ngOnInit() {
    if (this.goalLocation) this.picked.set(this.goalLocation)
  }

  async mapReady(map: MaplibreMap) {
    this.map = map

    if (this.goalLocation) {
      map.jumpTo({ center: [this.goalLocation.lng, this.goalLocation.lat], zoom: 12 })
      await this.setMarker(this.goalLocation.lat, this.goalLocation.lng)
    }

    map.on('click', ({ lngLat }) => this.pick(lngLat.lat, lngLat.lng))
  }

  async select(result: GeocodeResult) {
    this.picked.set({ lat: result.lat, lng: result.lng, name: result.name })
    this.searchControl.setValue('', { emitEvent: true })

    if (this.map) {
      await this.setMarker(result.lat, result.lng)
      this.map.flyTo({ center: [result.lng, result.lat], zoom: 12 })
    }
  }

  private async pick(lat: number, lng: number) {
    await this.setMarker(lat, lng)

    const previous = this.picked()
    this.picked.set({ lat, lng, name: previous?.name ?? '' })

    const result = await this.geocode.reverse(lat, lng)
    if (result?.name) this.picked.set({ lat, lng, name: result.name })
  }

  private async setMarker(lat: number, lng: number) {
    if (!this.map) return

    if (this.marker) {
      this.marker.setLngLat([lng, lat])
      return
    }

    const { Marker } = await import('maplibre-gl')
    this.marker = new Marker({ draggable: true, color: '#f9c711' })
      .setLngLat([lng, lat])
      .addTo(this.map)

    this.marker.on('dragend', () => {
      const lngLat = this.marker?.getLngLat()
      if (lngLat) this.pick(lngLat.lat, lngLat.lng)
    })
  }

  confirm() {
    const location = this.picked()
    if (!location) return
    this.modalCtrl.dismiss({ location })
  }

  remove() {
    this.modalCtrl.dismiss({ location: null })
  }
}
