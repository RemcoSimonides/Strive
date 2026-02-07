import { Injectable, inject } from '@angular/core'
import { collectionData as _collectionData, collection, doc, docData as _docData, Firestore, getDoc, query, QueryConstraint, setDoc } from '@angular/fire/firestore'
import { createConverter } from '@strive/utils/firebase'
import { Observable } from 'rxjs'

import { AES, enc } from 'crypto-js'

import { WheelOfLifeEntry, WheelOfLifeSettings } from '@strive/model'

import { PersonalService } from '@strive/user/personal.service'
import { AuthService } from '@strive/auth/auth.service'

const settingsFactory = (data: any): WheelOfLifeSettings => ({
  id: data.id ?? '',
  interval: data.interval ?? 'monthly',
  createdAt: data.createdAt ?? new Date(),
  updatedAt: data.updatedAt ?? new Date()
})

const settingsConverter = createConverter<WheelOfLifeSettings>(settingsFactory)

const entryFactory = (data: any): WheelOfLifeEntry<string> => ({
  id: data.id ?? '',
  career: data.career ?? '',
  development: data.development ?? '',
  environment: data.environment ?? '',
  family: data.family ?? '',
  friends: data.friends ?? '',
  fun: data.fun ?? '',
  health: data.health ?? '',
  love: data.love ?? '',
  money: data.money ?? '',
  spirituality: data.spirituality ?? '',
  desired_career: data.desired_career ?? '',
  desired_development: data.desired_development ?? '',
  desired_environment: data.desired_environment ?? '',
  desired_family: data.desired_family ?? '',
  desired_friends: data.desired_friends ?? '',
  desired_fun: data.desired_fun ?? '',
  desired_health: data.desired_health ?? '',
  desired_love: data.desired_love ?? '',
  desired_money: data.desired_money ?? '',
  desired_spirituality: data.desired_spirituality ?? '',
  createdAt: data.createdAt ?? new Date(),
  updatedAt: data.updatedAt ?? new Date()
})

const entryConverter = createConverter<WheelOfLifeEntry<string>>(entryFactory)


@Injectable({
  providedIn: 'root'
})
export class WheelOfLifeService {
  private firestore = inject(Firestore)

  getSettings$(uid: string): Observable<WheelOfLifeSettings | undefined> {
    const docRef = doc(this.firestore, `Users/${uid}/Exercises/WheelOfLife`).withConverter(settingsConverter)
    return _docData(docRef)
  }

  getSettings(uid: string): Promise<WheelOfLifeSettings | undefined> {
    const docRef = doc(this.firestore, `Users/${uid}/Exercises/WheelOfLife`).withConverter(settingsConverter)
    return getDoc(docRef).then(snapshot => snapshot.data())
  }

  save(uid: string, settings: Partial<WheelOfLifeSettings>) {
    const docRef = doc(this.firestore, `Users/${uid}/Exercises/WheelOfLife`).withConverter(settingsConverter)
    return setDoc(docRef, settings as WheelOfLifeSettings, { merge: true })
  }
}

@Injectable({
  providedIn: 'root'
})
export class WheelOfLifeEntryService {
  private firestore = inject(Firestore)
  private auth = inject(AuthService)
  private personalService = inject(PersonalService)

  collectionData(constraints: QueryConstraint[], options: { uid: string }): Observable<WheelOfLifeEntry<string>[]> {
    const colRef = collection(this.firestore, `Users/${options.uid}/Exercises/WheelOfLife/Entries`).withConverter(entryConverter)
    const q = query(colRef, ...constraints)
    return _collectionData(q, { idField: 'id' })
  }

  async decrypt(entries: WheelOfLifeEntry<string>[]): Promise<WheelOfLifeEntry<number>[]> {
    const key = await this.personalService.getEncryptionKey()

    const results = entries.map(entry => {
      const result: WheelOfLifeEntry<number> = {
        ...entry,
        career: +AES.decrypt(`${entry['career']}`, key).toString(enc.Utf8),
        development: +AES.decrypt(`${entry['development']}`, key).toString(enc.Utf8),
        environment: +AES.decrypt(`${entry['environment']}`, key).toString(enc.Utf8),
        family: +AES.decrypt(`${entry['family']}`, key).toString(enc.Utf8),
        friends: +AES.decrypt(`${entry['friends']}`, key).toString(enc.Utf8),
        fun: +AES.decrypt(`${entry['fun']}`, key).toString(enc.Utf8),
        health: +AES.decrypt(`${entry['health']}`, key).toString(enc.Utf8),
        love: +AES.decrypt(`${entry['love']}`, key).toString(enc.Utf8),
        money: +AES.decrypt(`${entry['money']}`, key).toString(enc.Utf8),
        spirituality: +AES.decrypt(`${entry['spirituality']}`, key).toString(enc.Utf8),
        desired_career: +AES.decrypt(`${entry['desired_career']}`, key).toString(enc.Utf8),
        desired_development: +AES.decrypt(`${entry['desired_development']}`, key).toString(enc.Utf8),
        desired_environment: +AES.decrypt(`${entry['desired_environment']}`, key).toString(enc.Utf8),
        desired_family: +AES.decrypt(`${entry['desired_family']}`, key).toString(enc.Utf8),
        desired_friends: +AES.decrypt(`${entry['desired_friends']}`, key).toString(enc.Utf8),
        desired_fun: +AES.decrypt(`${entry['desired_fun']}`, key).toString(enc.Utf8),
        desired_health: +AES.decrypt(`${entry['desired_health']}`, key).toString(enc.Utf8),
        desired_love: +AES.decrypt(`${entry['desired_love']}`, key).toString(enc.Utf8),
        desired_money: +AES.decrypt(`${entry['desired_money']}`, key).toString(enc.Utf8),
        desired_spirituality: +AES.decrypt(`${entry['desired_spirituality']}`, key).toString(enc.Utf8)
      }

      return result
    })

    return results
  }

  async save(entry: WheelOfLifeEntry<string>) {
    const uid = this.auth.uid()
    if (!uid) throw new Error('uid should be defined when saving wheel of life entries')

    const docRef = doc(this.firestore, `Users/${uid}/Exercises/WheelOfLife/Entries/${entry.id}`).withConverter(entryConverter)
    return setDoc(docRef, entry, { merge: true })
  }
}
