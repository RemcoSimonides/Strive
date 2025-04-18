import { Injectable } from '@angular/core'
import { DocumentSnapshot, serverTimestamp } from 'firebase/firestore'

import { toDate, FireSubCollection } from 'ngfire'

import { createMedia, Media } from '@strive/model'
import { getStorage, ref, uploadBytes } from 'firebase/storage'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { captureException } from '@sentry/angular'

@Injectable({
  providedIn: 'root'
})
export class MediaService extends FireSubCollection<Media> {
  readonly path = 'Goals/:goalId/Media'
  override readonly memorize = true

  protected override toFirestore(media: Media, actionType: 'add' | 'update'): Media {
    const timestamp = serverTimestamp() as any

    if (actionType === 'add') media.createdAt = timestamp
    media.updatedAt = timestamp

    return media
  }

  protected override fromFirestore(snapshot: DocumentSnapshot<Media>) {
    return snapshot.exists()
      ? createMedia(toDate({ ...snapshot.data(), [this.idKey]: snapshot.id }))
      : undefined
  }

  async upload(file: File, storagePath: string, goalId: string) {
    const start = file.type.split('/')[0]
    const fileType = start === 'image' ? 'image' : 'video'

    const media = createMedia({
      fileName: file.name,
      fileType,
      storagePath
    })
    const mediaId = await this.add(media, { params: { goalId }})

    const path = `${storagePath}/${mediaId}`
    const storageRef = ref(getStorage(), path)
    const metadata = { contentType: file.type, customMetadata: { mediaId }}
    uploadBytes(storageRef, file, metadata)
    return mediaId
  }

  async uploadFromURL(url: string, storagePath: string, goalId: string) {
    const fileName = url.split('/').pop() ?? ''
    const media = createMedia({
      fileName,
      fileType: 'image',
      storagePath
    })
    const mediaId = await this.add(media, { params: { goalId }})

    const path = `${storagePath}/${mediaId}`

    const downloadImageFromURL = httpsCallable(getFunctions(), 'downloadImageFromURL')
    const response = await downloadImageFromURL({ url, storagePath: path })
    const { error, result } = response.data as { error: string, result: any }

    if (error) {
      console.error(result)
      captureException(result)
    }

    return mediaId
  }
}
