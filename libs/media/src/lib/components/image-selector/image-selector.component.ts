import { ChangeDetectionStrategy, Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { FormControl } from '@angular/forms';
import { Storage, deleteObject, ref, uploadBytes } from '@angular/fire/storage';
import { getImgIxResourceUrl, ImageParameters } from '../../directives/imgix-helpers';
import { SafeUrl } from '@angular/platform-browser';
import { Platform } from '@ionic/angular';

import { Camera, CameraResultType } from '@capacitor/camera';

/** Convert base64 from ngx-image-cropper to blob for uploading in firebase */
function b64toBlob(data: string) {
  const [metadata, content] = data.split(',');
  const byteString = atob(content);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);

  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  const type = metadata.split(';')[0].split(':')[1];
  return new Blob([ab], { type });
}

type CropStep = 'drop' | 'crop' | 'hovering' | 'show';

@Component({
  selector: '[form][storagePath] media-image-selector',
  templateUrl: 'image-selector.component.html',
  styleUrls: ['./image-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageSelectorComponent implements OnInit {

  private step: BehaviorSubject<CropStep> = new BehaviorSubject('drop');

  step$ = this.step.asObservable();
  accept = ['.jpg', '.jpeg', '.png', '.webp'];
  file: File;
  croppedImage: string;
  previewUrl$ = new BehaviorSubject<string | SafeUrl>('');

  @Input() defaultImage: 'goal.jpg' | 'collective-goal.jpg' | 'profile.png'

  @Input() form: FormControl;
  @Input() storagePath: string;

  @ViewChild('fileUploader') fileUploader: ElementRef<HTMLInputElement>;

  constructor(
    private afStorage: Storage,
    public platform: Platform
  ) { }

  ngOnInit() {
    this.resetState();
  }

  @HostListener('drop', ['$event'])
  onDrop($event: DragEvent) {
    $event.preventDefault();
    if (!!$event.dataTransfer.files.length) {
      this.filesSelected($event.dataTransfer.files);
    } else {
      this.resetState();
    }
  }

  @HostListener('dragover', ['$event'])
  onDragOver($event: DragEvent) {
    $event.preventDefault();
    this.step.next('hovering');
  }

  @HostListener('dragleave', ['$event'])
  onDragLeave($event: DragEvent) {
    $event.preventDefault();
    this.resetState();
  }

  private resetState() {
    if (!!this.form.value) {
      const params: ImageParameters = { w: 1024 }
      const previewUrl = getImgIxResourceUrl(this.form.value, params)
      this.previewUrl$.next(previewUrl)
      this.step.next('show')
    } else {
      this.step.next('drop')
    }
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
  }

  async selectImage() {
    try {
      const image = await Camera.getPhoto({
        quality: 100,
        allowEditing: false,
        resultType: CameraResultType.DataUrl
      })

      if (!!image.dataUrl) {
        const file = dataUrlToFile(image.dataUrl, Date.now().toString())
        this.filesSelected(file)
      }
    } catch (err) {
      this.fileUploader.nativeElement.click()
    }
  }

  filesSelected(file: FileList | File) {
    this.file = Array.isArray(file) ? file[0] : file;

    if (this.file.type.split('/')[0] !== 'image') {
      console.error('unsupported file type')
      return
    }

    this.step.next('crop');
    this.fileUploader.nativeElement.value = null;
  }

  remove() {
    try {
      deleteObject(ref(this.afStorage, this.form.value))
    } catch (err) { console.error(err) }
    this.form.setValue('');
    this.step.next('drop')
  }

  cropIt() {
    try {
      if (!this.croppedImage) {
        throw new Error('No image cropped yet')
      }
      if (!this.storagePath) {
        throw new Error('No path defined to upload to')
      }

      const blob = b64toBlob(this.croppedImage)
      const path = `${this.storagePath}/${this.file.name}`
      uploadBytes(ref(this.afStorage, path), blob)
      this.form.setValue(path)
      this.form.markAsDirty()
      this.step.next('show')

    } catch (err) {
      console.error(err);
    }
  }
}

function dataUrlToFile(dataUrl: string, fileName: string) {
  var arr = dataUrl.split(','),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], fileName, { type: mime });
}