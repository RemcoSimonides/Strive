import { CUSTOM_ELEMENTS_SCHEMA, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostListener, Input, OnDestroy, OnInit, ViewChild, ViewEncapsulation, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormArray } from '@angular/forms'
import { SafeUrl } from '@angular/platform-browser'
import { AlertController, IonIcon, PopoverController, ToastController } from '@ionic/angular/standalone'
import { addIcons } from 'ionicons'
import { imagesOutline } from 'ionicons/icons'
import type { SwiperContainer } from 'swiper/element'
import 'swiper/element/bundle'

import { BehaviorSubject, Subscription } from 'rxjs'

import { FilePicker } from '@capawesome/capacitor-file-picker'

import { captureException, captureMessage } from '@sentry/angular'
import { EditMediaForm } from '@strive/media/forms/media.form'
import { delay } from '@strive/utils/helpers'
import { ImageOptionsPopoverComponent } from './popover/options.component'

type CropStep = 'drop' | 'hovering'

@Component({
    selector: '[form] strive-images-selector',
    templateUrl: 'images-selector.component.html',
    styleUrls: ['./images-selector.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.ShadowDom,
    imports: [
        CommonModule,
        IonIcon
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ImagesSelectorComponent implements OnInit, OnDestroy {
  private alertCtrl = inject(AlertController);
  private cdr = inject(ChangeDetectorRef);
  private popoverCtrl = inject(PopoverController);
  private toast = inject(ToastController);


  step = new BehaviorSubject<CropStep>('drop')

  accept = ['image/*','video/*']
  maxVideoLength = 10
  previewUrl$ = new BehaviorSubject<string | SafeUrl>('')

  sub?: Subscription

  @Input() form!: FormArray<EditMediaForm>

  @ViewChild('fileUploader') fileUploader?: ElementRef<HTMLInputElement>
  @ViewChild('swiper') swiper?: ElementRef<SwiperContainer>;

  constructor() {
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
      const { files } = await FilePicker.pickMedia({ readData: true })

      for (const file of files) {
        if (file.data) {
          const converted = base64ToFile(file.data, file.name, file.mimeType)
          if (!converted) throw new Error('Something went wrong convert Blob to File')

          this.filesSelected(converted)
        } else {
          this.toast.create({ message: 'Something went wrong', duration: 3000 }).then(toast => toast.present())
          captureMessage('Unsupported file type chosen')
          captureException(file)
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
      const type = file.type?.split('/')[0]
      if (type !== 'image' && type !== 'video') {
        this.toast.create({ message: 'Unsupported file type', duration: 3000 }).then(toast => toast.present())
        return
      }

      const preview = URL.createObjectURL(file)
      const mediaForm = new EditMediaForm({ id: '', preview, file, type })
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
    const canMoveLeft = index > 0
    const canMoveRight = index < this.form.length - 1
    const ctrl = this.form.at(index)
    const type = ctrl.type.value
    const popover = await this.popoverCtrl.create({
      component: ImageOptionsPopoverComponent,
      componentProps: { type, canMoveLeft, canMoveRight },
      event
    })

    popover.onDidDismiss().then(dismiss => {
      const { data } = dismiss
      if (data == 'right') {
        const next = this.form.at(index + 1)
        this.form.setControl(index, next)
        this.form.setControl(index + 1, ctrl)
        this.form.markAsDirty()
      }

      if (data == 'left') {
        const prev = this.form.at(index - 1)
        this.form.setControl(index, prev)
        this.form.setControl(index - 1, ctrl)
        this.form.markAsDirty()
      }

      if (data === 'remove') {
        this.form.removeAt(index)
        this.form.markAsDirty()
      }
    })

    popover.present()
  }

  checkDuration(event: any, index: number) {
    const duration = event.target.duration
    if (duration > this.maxVideoLength) {
      this.form.removeAt(index)
      this.alertCtrl.create({
        subHeader: `Video cannot be longer than ${this.maxVideoLength} seconds`,
        buttons: [{ text: 'Ok', role: 'cancel' }]
      }).then(alert => alert.present())
    }
  }
}

function isFileList(file: FileList | File): file is FileList {
  return (file as FileList).item !== undefined
}

function base64ToFile(base64String: string, fileName: string, mimeType?: string): File | null {
  try {
    const binaryData = atob(base64String);
    const arrayBuffer = new ArrayBuffer(binaryData.length);
    const uint8Array = new Uint8Array(arrayBuffer);

    for (let i = 0; i < binaryData.length; i++) {
      uint8Array[i] = binaryData.charCodeAt(i);
    }

    const blob = new Blob([arrayBuffer], { type: mimeType });
    return new File([blob], fileName, { type: mimeType });
  } catch (error) {
    console.error('Error converting base64 to File:', error);
    return null;
  }
}
