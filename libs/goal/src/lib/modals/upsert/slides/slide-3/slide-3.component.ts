import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, Output, ViewChild, EventEmitter } from '@angular/core'
import { FormControl } from '@angular/forms'
import { ErrorResponse, PhotosWithTotalResults, createClient } from 'pexels'
import { environment } from '@env'
import { BehaviorSubject, debounceTime } from 'rxjs'
import { GoalForm } from '@strive/goal/forms/goal.form'
import { ImageSelectorComponent } from '@strive/media/components/image-selector/image-selector.component'

interface Image {
  image: string
  selected: boolean
}

@Component({
  selector: '[form][goalId] strive-goal-slide-3',
  templateUrl: './slide-3.component.html',
  styleUrls: ['./slide-3.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Slide3Component {
  @ViewChild(ImageSelectorComponent) imageSelector?: ImageSelectorComponent

  @Input() form!: GoalForm
  @Input() goalId!: string
  @Input() set query(query: string) {
    this.queryCtrl.setValue(query)
  }

  @Output() stepper = new EventEmitter<'next' | 'previous'>()

  images$ = new BehaviorSubject<Image[] | undefined>(undefined)

  showImageSelector = false

  pexels = createClient(environment.pexels.apikey)
  queryCtrl = new FormControl('')

  constructor(
    private cdr: ChangeDetectorRef
  ) {
    this.queryCtrl.valueChanges.pipe(
      debounceTime(1000)
    ).subscribe(async query => {
      if (!query) return

      const result = await this.pexels.photos.search({
        query,
        orientation: 'square',
        per_page: 15,
      })

      if (isErrorResponse(result)) throw new Error(result.error)

      const images = result.photos.map(p => ({
        image: p.src.large,
        selected: false
      }))

      this.images$.next(images)
    })
  }

  upload() {
    if (this.showImageSelector) {
      this.showImageSelector = false
    } else {
      this.showImageSelector = true
      this.imageSelector?.selectImage()
    }
    this.cdr.markForCheck()
  }

  cropImage() {
    if (this.imageSelector?.step.value === 'crop') {
      this.imageSelector.cropIt()
    }
  }

  selectImage(image: string) {
    const images = this.images$.value ?? []
    const currentImage = images.find(i => i.selected)
    const currentImageSrc = currentImage?.image

    images.forEach(i => i.selected = false)
    if (currentImageSrc === image) return

    const selectedImage = images.find(i => i.image === image)
    if (selectedImage) selectedImage.selected = true

    this.images$.next(images)
  }

  chooseImage(image: string) {
    const control = this.form.get('image')
    if (control) {
      control.setValue(image)
      control.markAsDirty()
    }
    this.stepper.next('next')
  }
}

function isErrorResponse(result: PhotosWithTotalResults | ErrorResponse): result is ErrorResponse {
  return (<ErrorResponse>result).error !== undefined;
}