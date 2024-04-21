import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { FormControl, ReactiveFormsModule } from '@angular/forms'
import { environment } from '@env'

import { IonCard, IonSearchbar, IonButton, IonIcon, IonInfiniteScroll, IonInfiniteScrollContent, IonSpinner, InfiniteScrollCustomEvent } from '@ionic/angular/standalone'
import { addIcons } from 'ionicons'
import { imagesOutline, checkmarkOutline } from 'ionicons/icons'

import { GoalForm } from '@strive/goal/forms/goal.form'
import { ImageSelectorComponent } from '@strive/media/components/image-selector/image-selector.component'
import { ErrorResponse, PhotosWithTotalResults, createClient } from 'pexels'
import { BehaviorSubject, debounceTime, delay } from 'rxjs'

interface Image {
  src: string
  selected: boolean
}

@Component({
  standalone: true,
  selector: '[goalId][form] strive-goal-images',
  templateUrl: './images.component.html',
  styleUrls: ['./images.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ImageSelectorComponent,
    IonCard,
    IonSearchbar,
    IonButton,
    IonIcon,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonSpinner
  ]
})
export class GoalImagesComponent implements OnInit, OnDestroy {
  @ViewChild(ImageSelectorComponent) imageSelector?: ImageSelectorComponent

  showImageSelector = false

  pexels = createClient(environment.pexels.apikey)
  images$ = new BehaviorSubject<Image[] | undefined>(undefined)
  done$ = new BehaviorSubject<boolean>(false)
  page$ = new BehaviorSubject<number>(1)

  queryFormControl = new FormControl('', { nonNullable: true })
  querySub = this.queryFormControl.valueChanges.pipe(
    debounceTime(1000)
  ).subscribe(async query => {
    this.page$.next(1)
    this.done$.next(false)

    const images = await this.search(query)
    this.images$.next(images)
  })

  @Input() goalId?: string
  @Input() form?: GoalForm

  constructor() {
    addIcons({ imagesOutline, checkmarkOutline });
  }

  ngOnInit() {
    if (!this.form) return

    if (this.form.image.value) {
      this.showImageSelector = true
    }
    this.search(this.form.title.value).then(images => this.images$.next(images))
  }

  ngOnDestroy() {
    this.querySub.unsubscribe()
  }

  toggleImageSelector() {
    this.showImageSelector = !this.showImageSelector

    if (this.showImageSelector) {
      this.imageSelector?.selectImage()
      // unselect all pexels images
      const images = this.images$.value ?? []
      images.forEach(i => i.selected = false)
    }
  }

  selectImage(image: string) {
    if (!this.form) return

    if (this.showImageSelector) {
      this.imageSelector?.remove()
      this.showImageSelector = false
    }

    const images = this.images$.value ?? []
    images.forEach(i => i.selected = false)

    if (this.form.value === image) {
      this.form.image.setValue('')
    } else {
      const toBeSelected = images.find(i => i.src === image)
      if (toBeSelected) toBeSelected.selected = true

      this.form.image.setValue(image)
    }

    this.form.image.markAsDirty()
    this.images$.next(images)
  }

  chooseImage(image: string) {
    if (!this.form) return
    this.form.image.setValue(image)
    this.form.image.markAsDirty()
  }

  async search(query: string) {
    if (!query) {
      this.done$.next(true)
      return []
    }

    const per_page = 18
    const page = this.page$.value

    const result = await this.pexels.photos.search({
      query,
      per_page,
      page
    })

    if (isErrorResponse(result)) throw new Error(result.error)

    const { total_results } = result
    const total_pages = Math.ceil(total_results / per_page)

    if (page >= total_pages) this.done$.next(true)

    return result.photos.map(p => ({
      src: p.src.large,
      selected: false
    }))
  }

  async more($event: InfiniteScrollCustomEvent) {
    this.page$.next(this.page$.value + 1)

    await Promise.race([
      delay(5000),
      this.search(this.queryFormControl.value).then(images => {
        const currentImages = this.images$.value ?? []
        this.images$.next([...currentImages, ...images])
      })
    ])

    $event.target.complete()
  }

  cropImage() {
    if (this.imageSelector?.step.value === 'crop') {
      this.imageSelector.cropIt()
    }
  }
}

function isErrorResponse(result: PhotosWithTotalResults | ErrorResponse): result is ErrorResponse {
  return (<ErrorResponse>result).error !== undefined;
}