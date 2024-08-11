import { Pipe, PipeTransform } from '@angular/core'
import { Media } from '@strive/model'
import { environment } from '@env'

@Pipe({ name: 'mediaRef', standalone: true })
export class MediaRefPipe implements PipeTransform {
  transform(media: Media) {
    if (!media) return ''
    return `${media.storagePath}/${media.id}`
  }
}

@Pipe({ name: 'videoUrl', standalone: true })
export class VideoUrlPipe implements PipeTransform {
  transform(storagePath: string) {
    if (!storagePath) return ''
    return `https://${environment.firebase.options.projectId}.imgix.net/${encodeURI(storagePath)}?fm=hls`
  }
}