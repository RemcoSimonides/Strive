import { AbstractControl, FormControl, FormGroup } from '@angular/forms'
import { Media } from '@strive/model'
import { getImgIxResourceUrl } from '../directives/imgix-helpers'

interface EditMedia {
  id: string
  preview: string
  delete?: boolean
  file?: File
}

export function mediaToEditMedia(media: Media): EditMedia {
  const getPreview = () => {
    if (media.storagePath && media.id) {
      const path = `${media.storagePath}/${media.id}`
      return getImgIxResourceUrl(path, { w: 1024 })
    }
    return ''
  }

  return {
    id: media.id ?? '',
    preview: getPreview(),
    delete: false
  }
}

export function createEditMedia(params: Partial<EditMedia> = {}): EditMedia {
  return {
    id: params.id ?? '',
    preview: params.preview ?? '',
    file: params.file ?? undefined,
    delete: params.delete ?? false
  }
}

function createEditMediaFormControl(params: Partial<EditMedia> = {}) {
  const editMedia = createEditMedia(params)
  console.log('edit media created: ', editMedia)

  return {
    delete: new FormControl<boolean>(editMedia.delete ?? false, { nonNullable: true }),
    preview: new FormControl<string>(editMedia.preview, { nonNullable: true }),
    file: new FormControl<File | undefined>(editMedia.file, { nonNullable: true }),
    id: new FormControl<string>(editMedia.id ?? '', { nonNullable: true })
  }
}

export type MediaFormControl = ReturnType<typeof createEditMediaFormControl>

export class EditMediaForm extends FormGroup<MediaFormControl> {
  constructor(editMedia: Partial<EditMedia> = {}) {
    super(createEditMediaFormControl(editMedia))
  }

  get delete() { return this.get('delete') as AbstractControl<boolean> }
  get preview() { return this.get('preview') as AbstractControl<string> }
  get file() { return this.get('file') as AbstractControl<File | undefined> }
  get id() { return this.get('id') as AbstractControl<string> }
}