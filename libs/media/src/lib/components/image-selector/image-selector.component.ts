import { ChangeDetectionStrategy, Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { FormControl } from '@angular/forms';
import { AngularFireStorage } from '@angular/fire/storage';

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

  @Input() form: FormControl;
  @Input() storagePath: string;

  @ViewChild('fileUploader') fileUploader: ElementRef<HTMLInputElement>;

  constructor(private afStorage: AngularFireStorage) { }

  ngOnInit() { }

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
    //   this.mediaService.generateImgIxUrl({
    //     ...this.metadata,
    //     storagePath: this.form.storagePath.value,
    //   }).then(previewUrl => {
    //     this.previewUrl$.next(previewUrl);
    //     this.nextStep('show');
    //   });
    } else {
      // const retrieved = this.uploaderService.retrieveFromQueue(this.storagePath, this.queueIndex);
      // if (!!retrieved) {
      //   this.step.next('show')
      // } else {
        this.step.next('drop')
      // };
    }
  }

  // crop
  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
  }

  // drop
  filesSelected(fileList: FileList) {
    this.file = fileList[0];

    if (this.file.type.split('/')[0] !== 'image') {
      console.error('unsupported file type')
      return
    }

    this.step.next('crop');
    this.fileUploader.nativeElement.value = null;
  }

  cropIt() {
    try {
      if (!this.croppedImage) {
        throw new Error('No image cropped yet')
      }
      if (!this.storagePath) {
        throw new Error('No path defined to upload to')
      }

      const blob = b64toBlob(this.croppedImage);
      const path = `${this.storagePath}/${this.file.name}`; 
      this.afStorage.upload(path, blob);
      this.form.setValue(path)
      this.step.next('show');

    } catch (err) {
      console.error(err);
    }
  }
}