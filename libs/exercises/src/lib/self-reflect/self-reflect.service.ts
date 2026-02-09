import { Injectable, inject } from '@angular/core'
import { AuthService } from '@strive/auth/auth.service'
import { SelfReflectEntry, SelfReflectFrequency, SelfReflectSettings, createSelfReflectEntry, createSelfReflectSettings } from '@strive/model'
import { PersonalService } from '@strive/user/personal.service'
import { AES, enc } from 'crypto-js'
import { FIRESTORE } from '@strive/utils/firebase-init'
import { setDoc, collection, doc, getDoc, query, QueryConstraint, limit, orderBy, where, DocumentData, FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions } from 'firebase/firestore'
import { toDate, collectionData, docData } from '@strive/utils/firebase'
import { firstValueFrom, map, Observable, switchMap, take } from 'rxjs'

const settingsConverter: FirestoreDataConverter<SelfReflectSettings | undefined> = {
  toFirestore: (payload: SelfReflectSettings) => {
    const data = { ...payload } as DocumentData
    delete data['id']
    return data
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot, options: SnapshotOptions) => {
    if (!snapshot.exists()) return createSelfReflectSettings()
    return createSelfReflectSettings(toDate({ ...snapshot.data(options), id: snapshot.id }))
  }
}

const entryConverter: FirestoreDataConverter<SelfReflectEntry | undefined> = {
  toFirestore: (payload: SelfReflectEntry) => {
    const data = { ...payload } as DocumentData
    delete data['id']
    return data
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot, options: SnapshotOptions) => {
    if (!snapshot.exists()) return undefined
    return createSelfReflectEntry(toDate({ ...snapshot.data(options), id: snapshot.id }))
  }
}

@Injectable({
  providedIn: 'root'
})
export class SelfReflectSettingsService {
  private firestore = inject(FIRESTORE)


  docData(uid: string): Observable<SelfReflectSettings | undefined> {
    const docRef = doc(this.firestore, `Users/${uid}/Exercises/SelfReflect`).withConverter(settingsConverter)
    return docData(docRef)
  }

  getSettings(uid: string): Promise<SelfReflectSettings | undefined> {
    const docRef = doc(this.firestore, `Users/${uid}/Exercises/SelfReflect`).withConverter(settingsConverter)
    return getDoc(docRef).then(snapshot => snapshot.data())
  }

  getSettings$(uid: string): Observable<SelfReflectSettings | undefined> {
    return this.docData(uid)
  }

  save(uid: string, settings: Partial<SelfReflectSettings>) {
    const docRef = doc(this.firestore, `Users/${uid}/Exercises/SelfReflect`).withConverter(settingsConverter)
    return setDoc(docRef, settings as SelfReflectSettings, { merge: true })
  }
}

@Injectable({
  providedIn: 'root'
})
export class SelfReflectEntryService {
  private firestore = inject(FIRESTORE)

  private auth = inject(AuthService)
  private personalService = inject(PersonalService)

  collectionData(constraints: QueryConstraint[], options: { uid: string }): Observable<SelfReflectEntry[]> {
    const colRef = collection(this.firestore, `Users/${options.uid}/Exercises/SelfReflect/Entries`).withConverter(entryConverter)
    const q = query(colRef, ...constraints)
    return collectionData(q, { idField: 'id' })
  }

  async save(entry: SelfReflectEntry) {
    const uid = this.auth.uid()
    if (!uid) throw new Error('uid should be defined when saving wheel of life entries')
    const encryptedEntry = await this.encrypt(entry)

    const docRef = doc(this.firestore, `Users/${uid}/Exercises/SelfReflect/Entries/${encryptedEntry.id}`).withConverter(entryConverter)
    return setDoc(docRef, encryptedEntry, { merge: true })
  }

  getPreviousEntry(uid: string, frequency: SelfReflectFrequency): Promise<SelfReflectEntry | undefined> {
    const constraints = [where('frequency', '==', frequency), orderBy('createdAt', 'desc'), limit(1)]
    const obs = this.collectionData(constraints, { uid }).pipe(
      take(1),
      switchMap(entries => this.decrypt(entries)),
      map(entries => entries.length ? entries[0] : undefined),
    )
    return firstValueFrom(obs)
  }

  async decrypt(entries: SelfReflectEntry[]): Promise<SelfReflectEntry[]> {
    const encryptionKey = await this.personalService.getEncryptionKey()
    return entries.map(entry => _decrypt(entry, encryptionKey))
  }

  private async encrypt(entry: SelfReflectEntry): Promise<SelfReflectEntry> {
    const encryptionKey = await this.personalService.getEncryptionKey()
    return _encrypt(entry, encryptionKey)
  }
}

function _decrypt(object: any, decryptKey: string) {
  const decrypt = (value: string) => value ? AES.decrypt(value, decryptKey).toString(enc.Utf8) : ''
  const excludedProperties = ['id', 'createdAt', 'updatedAt', 'frequency', 'prioritizeGoals', 'config']

  Object.keys(object).forEach(key => {
    if (excludedProperties.includes(key)) return
    if (Array.isArray(object[key])) {
      object[key] = object[key].map(decrypt)
    } else if (typeof object[key] === 'object') {
      _decrypt(object[key], decryptKey)
    } else if (typeof object[key] === 'string') {
      object[key] = decrypt(object[key])
    }
  })

  return object
}

function _encrypt(object: any, encryptKey: string) {
  const encrypt = (value: string) => value ? AES.encrypt(value, encryptKey).toString() : ''
  const excludedProperties = ['id', 'createdAt', 'updatedAt', 'frequency', 'prioritizeGoals', 'config']

  Object.keys(object).forEach(key => {
    if (excludedProperties.includes(key)) return

    if (Array.isArray(object[key])) {
      object[key] = object[key].map(encrypt)
    } else if (typeof object[key] === 'object') {
      _encrypt(object[key], encryptKey)
    } else if (typeof object[key] === 'string') {
      object[key] = encrypt(object[key])
    } else if (typeof object[key] === 'number') {
      object[key] = encrypt(object[key].toString())
    }
  })

  return object
}
