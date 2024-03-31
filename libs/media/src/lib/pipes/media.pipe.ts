import { NgModule, Pipe, PipeTransform } from '@angular/core'
import { Media } from '@strive/model'


@Pipe({ name: 'mediaRef' })
export class MediaRefPipe implements PipeTransform {
  transform(media: Media) {
    if (!media) return ''
    return `${media.storagePath}/${media.id}`
  }
}

@NgModule({
  exports: [MediaRefPipe],
  declarations: [MediaRefPipe]
})
export class MediaPipeModule { }