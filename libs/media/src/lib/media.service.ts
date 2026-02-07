import { Injectable, inject } from '@angular/core'
import { Firestore, addDoc, collectionData as _collectionData } from '@angular/fire/firestore'
import { collection, doc, query, where } from 'firebase/firestore'
import { createConverter } from '@strive/utils/firebase'
import { Observable, of } from 'rxjs'

import { createMedia, Media } from '@strive/model'
import { getStorage, ref, uploadBytes } from 'firebase/storage'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { captureException } from '@sentry/angular'

const converter = createConverter<Media>(createMedia)

@Injectable({
  providedIn: 'root'
})
export class MediaService {
  private firestore = inject(Firestore)

  collectionData(mediaIds: string[], options: { goalId: string }): Observable<Media[]> {
    if (!mediaIds.length) return of([])
    const colRef = collection(this.firestore, `Goals/${options.goalId}/Media`).withConverter(converter)
    const q = query(colRef, where('__name__', 'in', mediaIds))
    return _collectionData(q, { idField: 'id' })
  }

  private async add(media: Media, options: { goalId: string }): Promise<string> {
    const colRef = collection(this.firestore, `Goals/${options.goalId}/Media`).withConverter(converter)
    const docRef = await addDoc(colRef, media)
    return docRef.id
  }

  async upload(file: File, storagePath: string, goalId: string) {
    const start = file.type.split('/')[0]
    const fileType = start === 'image' ? 'image' : 'video'

    const media = createMedia({
      fileName: file.name,
      fileType,
      storagePath
    })
    const mediaId = await this.add(media, { goalId })

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
    const mediaId = await this.add(media, { goalId })

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
