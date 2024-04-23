import { Pipe, PipeTransform } from '@angular/core'
import { Media } from '@strive/model'


@Pipe({ name: 'mediaRef', standalone: true })
export class MediaRefPipe implements PipeTransform {
  transform(media: Media) {
    if (!media) return ''
    return `${media.storagePath}/${media.id}`
  }
}
