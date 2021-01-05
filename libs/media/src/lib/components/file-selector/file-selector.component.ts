import { Component, OnInit, Input } from '@angular/core';
import { ImageService } from 'apps/journal/src/app/services/image/image.service';
import { Platform } from '@ionic/angular';

import { Plugins, CameraResultType, CameraSource } from '@capacitor/core';
const { Camera } = Plugins;

@Component({
  selector: 'media-file-selector',
  templateUrl: './file-selector.component.html',
  styleUrls: ['./file-selector.component.scss'],
})
export class FileSelectorComponent implements OnInit {
  enumCameraSource = CameraSource

  _androidORios: boolean = false
  _androidORiosANDmobileweb: boolean = false
  _NOandroidORios: boolean = false

  public _isHovering: boolean = false
  public _image: string | ArrayBuffer

  @Input() defaultImagePath: string
  @Input() currentImage: string

  constructor(
    private imageService: ImageService,
    public _platform: Platform
  ) { }

  async ngOnInit() {
    if (this.currentImage) {
      this.imageService.fallbackImage = this.currentImage
      this._image = this.currentImage
    } else {
      this.imageService.fallbackImage = this.defaultImagePath
    }

    // determining platform
    if ((this._platform.is('android') || this._platform.is('ios'))) {
      if (this._platform.is('mobileweb')) {
        this._androidORiosANDmobileweb = true
      } else {
        this._androidORios = true
      }
    } else {
      this._NOandroidORios = true
    }

  }

  toggleHover(event: boolean) {
    this._isHovering = event
  }

  handleDrop(event: FileList) {

    const file = event.item(0)

    if (file.type.split('/')[0] !== 'image') {
      console.error('unsupported file type')
      return
    }

    this.imageService.image = file
    this.setPreviewImage(file)

  }

  async takeImage(): Promise<void> {

    const image = await Camera.getPhoto({
      quality: 100,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
    });

    if (image.dataUrl) {

      const imageFile = this.imageService.setDataUrlImage(image.dataUrl, Date.now().toString())
      this.imageService.image = imageFile
      this.setPreviewImage(imageFile)

    }

  }

  private setPreviewImage(file: File) {

    const reader = new FileReader()

    reader.onload = (e) => {
      this._image = reader.result
    }
    reader.readAsDataURL(file)

  }

}
