import { Injectable, inject } from '@angular/core'
import { collectionData as _collectionData, collection, doc, docData as _docData, Firestore, getDoc, query, QueryConstraint, setDoc } from '@angular/fire/firestore'
import { createConverter } from '@strive/utils/firebase'
import { Observable } from 'rxjs'

import { AES, enc } from 'crypto-js'

import { DailyGratitude, DailyGratitudeEntry } from '@strive/model'

import { PersonalService } from '@strive/user/personal.service'
import { AuthService } from '@strive/auth/auth.service'

const settingsFactory = (data: any): DailyGratitude => ({
  id: data.id ?? '',
  on: data.on ?? false,
  time: data.time ?? new Date(),
  createdAt: data.createdAt ?? new Date(),
  updatedAt: data.updatedAt ?? new Date()
})

const settingsConverter = createConverter<DailyGratitude>(settingsFactory)

const entryFactory = (data: any): DailyGratitudeEntry => ({
  id: data.id ?? '',
  items: data.items ?? [],
  createdAt: data.createdAt ?? new Date(),
  updatedAt: data.updatedAt ?? new Date()
})

const entryConverter = createConverter<DailyGratitudeEntry>(entryFactory)


@Injectable({
  providedIn: 'root'
})
export class DailyGratitudeService {
  private firestore = inject(Firestore)

  getSettings$(uid: string): Observable<DailyGratitude | undefined> {
    const docRef = doc(this.firestore, `Users/${uid}/Exercises/DailyGratitude`).withConverter(settingsConverter)
    return _docData(docRef)
  }

  getDailyGratitudeSettings(uid: string): Promise<DailyGratitude | undefined> {
    const docRef = doc(this.firestore, `Users/${uid}/Exercises/DailyGratitude`).withConverter(settingsConverter)
    return getDoc(docRef).then(snapshot => snapshot.data())
  }

  save(uid: string, dailyGratitudeSettings: Partial<DailyGratitude>) {
    const docRef = doc(this.firestore, `Users/${uid}/Exercises/DailyGratitude`).withConverter(settingsConverter)
    return setDoc(docRef, dailyGratitudeSettings as DailyGratitude, { merge: true })
  }
}

@Injectable({
  providedIn: 'root'
})
export class DailyGratitudeEntryService {
  private firestore = inject(Firestore)
  private auth = inject(AuthService)
  private personalService = inject(PersonalService)

  collectionData(constraints: QueryConstraint[], options: { uid: string }): Observable<DailyGratitudeEntry[]> {
    const colRef = collection(this.firestore, `Users/${options.uid}/Exercises/DailyGratitude/Entries`).withConverter(entryConverter)
    const q = query(colRef, ...constraints)
    return _collectionData(q, { idField: 'id' })
  }

  async decrypt(cards: DailyGratitudeEntry[]) {
    const key = await this.personalService.getEncryptionKey()

    for (const card of cards) {
      card.items = card.items.map(item => {
        return AES.decrypt(item, key).toString(enc.Utf8)
      })
    }

    return cards
  }

  async save(data: DailyGratitudeEntry) {
    const uid = this.auth.uid()
    if (!uid) throw new Error('uid should be defined when saving daily gratitude entries')
    const key = await this.personalService.getEncryptionKey()
    data.items = data.items.map(item => AES.encrypt(item, key).toString())

    const docRef = doc(this.firestore, `Users/${uid}/Exercises/DailyGratitude/Entries/${data.id}`).withConverter(entryConverter)
    return setDoc(docRef, data, { merge: true })
  }
}
