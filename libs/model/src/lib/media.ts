const mediaTypes = [
  'image',
  'video',
  'youtube'
] as const;
type MediaType = typeof mediaTypes[number];

type MediaUploadStatus = 'uploading' | 'uploaded' | 'error';

export interface Media {
  id?: string
  fileName: string
  fileType: MediaType
  status: MediaUploadStatus
  storagePath: string
  updatedAt?: Date
  createdAt?: Date
}

/** A factory function that creates a MediaDocument. */
export function createMedia(params: Partial<Media> = {}): Media {
  return {
    id: '',
    fileName: '',
    fileType: 'image',
    status: 'uploading',
    storagePath: '',
    ...params
  }
}