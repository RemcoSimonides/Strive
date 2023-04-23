import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { FormControl, ReactiveFormsModule } from '@angular/forms'
import { environment } from '@env'
import { IonicModule } from '@ionic/angular'
import { GoalForm } from '@strive/goal/forms/goal.form'
import { ImageSelectorComponent } from '@strive/media/components/image-selector/image-selector.component'
import { ImageSelectorModule } from '@strive/media/components/image-selector/image-selector.module'
import { ErrorResponse, PhotosWithTotalResults, createClient } from 'pexels'
import { BehaviorSubject, debounceTime } from 'rxjs'

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
    IonicModule,
    ReactiveFormsModule,
    ImageSelectorModule
  ]
})
export class GoalImagesComponent implements OnInit, OnDestroy {
  @ViewChild(ImageSelectorComponent) imageSelector?: ImageSelectorComponent

  showImageSelector = false

  pexels = createClient(environment.pexels.apikey)
  images$ = new BehaviorSubject<Image[] | undefined>(undefined)
  queryFormControl = new FormControl()
  querySub = this.queryFormControl.valueChanges.pipe(
    debounceTime(1000)
  ).subscribe(async query => this.search(query))

  @Input() goalId?: string
  @Input() form?: GoalForm

  ngOnInit() {
    if (!this.form) return

    if (this.form.image.value) {
      this.showImageSelector = true
      this.queryFormControl.setValue('')
    } else {
      this.queryFormControl.setValue(this.form.title.value)
    }
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
      this.images$.next([])
      return
    }

    const result = await this.pexels.photos.search({
      query,
      orientation: 'square',
      per_page: 15,
    })

    if (isErrorResponse(result)) throw new Error(result.error)

    const images = result.photos.map(p => ({
      src: p.src.large,
      selected: false
    }))

    this.images$.next(images)
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