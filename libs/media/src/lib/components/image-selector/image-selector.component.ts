import { ChangeDetectionStrategy, Component, ElementRef, HostListener, Input, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { AbstractControl } from '@angular/forms'
import { DomSanitizer, SafeUrl } from '@angular/platform-browser'
import { ToastController } from '@ionic/angular'

import { BehaviorSubject, Subscription } from 'rxjs'
import { filter } from 'rxjs/operators'

import { ImageCroppedEvent } from 'ngx-image-cropper'
import { deleteObject, getStorage, ref, StorageError, uploadBytes } from 'firebase/storage'
import { getImgIxResourceUrl, ImageParameters } from '../../directives/imgix-helpers'
import { isValidHttpUrl } from '@strive/utils/helpers'

import { Camera, CameraResultType } from '@capacitor/camera'
import { captureException, captureMessage } from '@sentry/capacitor'



type CropStep = 'drop' | 'crop' | 'hovering' | 'show'

@Component({
  selector: '[form][storagePath] strive-image-selector',
  templateUrl: 'image-selector.component.html',
  styleUrls: ['./image-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageSelectorComponent implements OnInit, OnDestroy {
  step = new BehaviorSubject<CropStep>('drop')
  private sub?: Subscription

  step$ = this.step.asObservable()
  accept = ['.jpg', '.jpeg', '.png', '.webp']
  file?: File
  croppedImage?: Blob | null
  previewUrl$ = new BehaviorSubject<string | SafeUrl>('')

  @Input() defaultImage?: 'goal.png' | 'profile.png'

  @Input() form!: AbstractControl<string> | null
  @Input() storagePath!: string

  @ViewChild('fileUploader') fileUploader?: ElementRef<HTMLInputElement>

  constructor(
    private sanitizer: DomSanitizer,
    private toast: ToastController
  ) {}

  ngOnInit() {
    this.resetState()

    if (!this.form) return
    this.sub = this.form.valueChanges.pipe(
      filter(value => isValidHttpUrl(value))
    ).subscribe(() => this.resetState())
  }

  ngOnDestroy() {
    this.sub?.unsubscribe()
  }

  @HostListener('drop', ['$event'])
  onDrop($event: DragEvent) {
    $event?.preventDefault()
    if ($event?.dataTransfer?.files.length) {
      this.filesSelected($event.dataTransfer.files)
    } else {
      this.resetState()
    }
  }

  @HostListener('dragover', ['$event'])
  onDragOver($event: DragEvent) {
    $event.preventDefault()
    this.step.next('hovering')
  }

  @HostListener('dragleave', ['$event'])
  onDragLeave($event: DragEvent) {
    $event.preventDefault()
    this.resetState()
  }

  private resetState() {
    if (!this.form) return
    if (this.form.value) {
      if (isValidHttpUrl(this.form.value)) {
        this.previewUrl$.next(this.form.value)
        this.step.next('show')
      } else {
        const params: ImageParameters = { w: 1024 }
        const previewUrl = getImgIxResourceUrl(this.form.value, params)
        this.previewUrl$.next(previewUrl)
        this.step.next('show')
      }
    } else {
      this.step.next('drop')
    }
  }

  imageCropped(event: ImageCroppedEvent) {
    if (!event.objectUrl || !event.blob) return
    this.croppedImage = event.blob
    this.previewUrl$.next(this.sanitizer.bypassSecurityTrustUrl(event.objectUrl))
  }

  async selectImage() {
    try {
      const image = await Camera.getPhoto({
        quality: 100,
        allowEditing: false,
        resultType: CameraResultType.DataUrl
      })

      if (image.dataUrl) {
        const file = dataUrlToFile(image.dataUrl, Date.now().toString())
        this.filesSelected(file)
      } else {
        this.toast.create({ message: 'Unsupported file type', duration: 3000 })
        captureMessage('Unsupported file type chosen')
        captureException(image)
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
    this.file = Array.isArray(file) ? file[0] : file

    if (this.file?.type?.split('/')[0] !== 'image') {
      this.toast.create({ message: 'Unsupported file type', duration: 3000 })
      return
    }

    this.step.next('crop')
    if (this.fileUploader) {
      this.fileUploader.nativeElement.value = ''
    }
  }

  remove() {
    if (!this.form?.value) return
    const isHttpUrl = isValidHttpUrl(this.form.value) // it's an http url if image is fetched from other website for Post in Story or from pexels

    if (!isHttpUrl) { // if its not an http url, its a reference path in storage
      deleteObject(ref(getStorage(), this.form.value))
      .catch((error: StorageError) => {
        if (error.code === 'storage/object-not-found') {
          // suppress
        }
        captureException(error)
      })
    }

    this.form.setValue('')
    this.form.markAsDirty()
    this.step.next('drop')
  }

  cropIt() {
    if (!this.form) return
    try {
      if (!this.croppedImage) {
        throw new Error('No image cropped yet')
      }
      if (!this.storagePath) {
        throw new Error('No path defined to upload to')
      }

      const blob = this.croppedImage
      const path = `${this.storagePath}/${this.file?.name}`
      uploadBytes(ref(getStorage(), path), blob)
      this.form.setValue(path)
      this.form.markAsDirty()
      this.step.next('show')

    } catch (err) {
      console.error(err)
    }
  }
}

function dataUrlToFile(dataUrl: string, fileName: string) {
  const arr = dataUrl.split(',')
  const mime = arr[0].match(/:(.*?);/)?.[1]
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }

    return new File([u8arr], fileName, { type: mime })
}