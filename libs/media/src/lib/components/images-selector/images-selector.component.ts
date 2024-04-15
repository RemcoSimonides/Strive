import { CUSTOM_ELEMENTS_SCHEMA, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostListener, Input, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormArray } from '@angular/forms'
import { SafeUrl } from '@angular/platform-browser'
import { IonIcon, PopoverController, ToastController } from '@ionic/angular/standalone'
import { addIcons } from 'ionicons'
import { imagesOutline } from 'ionicons/icons'
import { SwiperContainer } from 'swiper/swiper-element'

import { BehaviorSubject, Subscription } from 'rxjs'

import { Camera, GalleryPhoto } from '@capacitor/camera'
import { captureException, captureMessage } from '@sentry/capacitor'
import { EditMediaForm } from '@strive/media/forms/media.form'
import { delay } from '@strive/utils/helpers'
import { ImageOptionsPopoverComponent } from './popover/options.component'

type CropStep = 'drop' | 'hovering'

@Component({
  standalone: true,
  imports: [
    CommonModule,
    ImageOptionsPopoverComponent,
    IonIcon
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: '[form] strive-images-selector',
  templateUrl: 'images-selector.component.html',
  styleUrls: ['./images-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom
})
export class ImagesSelectorComponent implements OnInit, OnDestroy {

  step = new BehaviorSubject<CropStep>('drop')

  accept = ['.jpg', '.jpeg', '.png', '.webp']
  previewUrl$ = new BehaviorSubject<string | SafeUrl>('')

  sub?: Subscription

  @Input() form!: FormArray<EditMediaForm>

  @ViewChild('fileUploader') fileUploader?: ElementRef<HTMLInputElement>
  @ViewChild('swiper') swiper?: ElementRef<SwiperContainer>;

  constructor(
    private cdr: ChangeDetectorRef,
    private popoverCtrl: PopoverController,
    private toast: ToastController
  ) {
    addIcons({ imagesOutline })
  }

  ngOnInit() {
    this.sub = this.form.valueChanges.subscribe(() => {
      this.cdr.markForCheck()
    })
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe()
  }

  @HostListener('drop', ['$event'])
  onDrop($event: DragEvent) {
    $event?.preventDefault()
    if ($event?.dataTransfer?.files.length) {
      this.filesSelected($event.dataTransfer.files)
    }
    this.step.next('drop')
  }

  @HostListener('dragover', ['$event'])
  onDragOver($event: DragEvent) {
      $event.preventDefault()
    this.step.next('hovering')
  }

  @HostListener('dragleave', ['$event'])
  onDragLeave($event: DragEvent) {
    $event.preventDefault()
    this.step.next('drop')
  }

  async selectImages() {
    try {
      const images = await Camera.pickImages({ quality: 100 })
      for (const image of images.photos) {
        const file = await getFileFromGalleryPhoto(image)
        if (file) {
          this.filesSelected(file)
        } else {
          this.toast.create({ message: 'Something went wrong', duration: 3000 })
          captureMessage('Unsupported file type chosen')
          captureException(image)
        }
      }
    } catch (err) {
      this.fileUploader?.nativeElement.click()
    }
  }

  inputChange(event: any) {
    const files = event.target.files
    this.filesSelected(files)
  }

  filesSelected(file: FileList | File) {
    const files = isFileList(file) ? Array.from(file) : [file]

    for (const file of files) {
      if (file.type?.split('/')[0] !== 'image') {
        this.toast.create({ message: 'Unsupported file type', duration: 3000 }).then(toast => toast.present())
        return
      }

      const preview = URL.createObjectURL(file)
      const mediaForm = new EditMediaForm({ id: '', preview, file })
      this.form.push(mediaForm)
      this.form.markAsDirty()
    }

    this.cdr.markForCheck()
    this.step.next('drop')

    if (this.fileUploader) {
      this.fileUploader.nativeElement.value = ''
    }
    if (this.swiper) {
      const swiper = this.swiper.nativeElement.swiper
      delay(200).then(() => {
        swiper.slideTo(this.form.length + 1)
      })
    }
  }

  async openPopover(event: Event, index: number) {
    const popover = await this.popoverCtrl.create({
      component: ImageOptionsPopoverComponent,
      componentProps: { form: this.form, index },
      event
    })

    popover.onDidDismiss().then(dismiss => {
      const { data } = dismiss
      if (data === 'remove') {
        this.form.removeAt(index)
        this.form.markAsDirty()
      }
    })

    popover.present()
  }
}

function isFileList(file: FileList | File): file is FileList {
  return (file as FileList).item !== undefined
}


async function getFileFromGalleryPhoto(photo: GalleryPhoto): Promise<File | undefined> {
  try {
    const response = await fetch(photo.webPath);
    const blob = await response.blob();
    const name = photo.webPath.split('/').pop();
    const fileName = `${name}.${photo.format}`
    const file = new File([blob], fileName, { type: blob.type });
    return file;
  } catch (error) {
    console.error("Error fetching blob data:", error);
    return;
  }
}
