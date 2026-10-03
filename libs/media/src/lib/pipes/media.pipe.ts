import { Pipe, PipeTransform } from '@angular/core'
import { Media } from '@strive/model'
import { environment } from '@env'
import { getImageUrl } from '../directives/image-helpers'

@Pipe({ name: 'mediaRef', standalone: true })
export class MediaRefPipe implements PipeTransform {
  transform(media: Media) {
    if (!media) return ''
    return `${media.storagePath}/${media.id}`
  }
}

/** The H.264 MP4 the videoUploadedHandler function makes of an uploaded video */
@Pipe({ name: 'videoUrl', standalone: true })
export class VideoUrlPipe implements PipeTransform {
  transform(storagePath: string) {
    if (!storagePath) return ''
    return `${environment.videos.baseUrl}/${encodeURI(storagePath)}.mp4`
  }
}

/** The poster frame made next to that MP4 */
@Pipe({ name: 'videoPoster', standalone: true })
export class VideoPosterPipe implements PipeTransform {
  transform(storagePath: string) {
    if (!storagePath) return ''
    return getImageUrl(`${storagePath}.jpg`, { w: 1024 })
  }
}
