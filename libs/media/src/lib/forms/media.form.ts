import { FormControl, FormGroup } from '@angular/forms'
import { Media, MediaType } from '@strive/model'
import { getImageUrl } from '../directives/image-helpers'

export interface EditMedia {
  id: string
  preview: string
  delete?: boolean
  file?: File
  type?: MediaType
}

export function mediaToEditMedia(media: Media): EditMedia {
  const getPreview = () => {
    if (media.storagePath && media.id) {
      const path = `${media.storagePath}/${media.id}`
      // a video has a poster frame next to it, made by the videoUploadedHandler function
      return getImageUrl(media.fileType === 'video' ? `${path}.jpg` : path, { w: 1024 })
    }
    return ''
  }

  return {
    id: media.id ?? '',
    preview: getPreview(),
    type: media.fileType,
    delete: false
  }
}

export function createEditMedia(params: Partial<EditMedia> = {}): EditMedia {
  return {
    id: params.id ?? '',
    preview: params.preview ?? '',
    file: params.file ?? undefined,
    type: params.type ?? undefined,
    delete: params.delete ?? false
  }
}

function createEditMediaFormControl(params: Partial<EditMedia> = {}) {
  const editMedia = createEditMedia(params)

  return {
    delete: new FormControl<boolean>(editMedia.delete ?? false, { nonNullable: true }),
    preview: new FormControl<string>(editMedia.preview, { nonNullable: true }),
    file: new FormControl<File | undefined>(editMedia.file, { nonNullable: true }),
    type: new FormControl<MediaType | undefined>(editMedia.type, { nonNullable: true }),
    id: new FormControl<string>(editMedia.id ?? '', { nonNullable: true })
  }
}

export type MediaFormControl = ReturnType<typeof createEditMediaFormControl>

export class EditMediaForm extends FormGroup<MediaFormControl> {
  constructor(editMedia: Partial<EditMedia> = {}) {
    super(createEditMediaFormControl(editMedia))
  }

  get delete() { return this.controls.delete }
  get preview() { return this.controls.preview }
  get file() { return this.controls.file }
  get type() { return this.controls.type }
  get id() { return this.controls.id }
}