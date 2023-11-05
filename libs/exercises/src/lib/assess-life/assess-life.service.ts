import { Injectable } from '@angular/core'
import { AuthService } from '@strive/auth/auth.service'
import { AssessLifeEntry, AssessLifeInterval, AssessLifeSettings, createAssessLifeEntry, createAssessLifeSettings } from '@strive/model'
import { PersonalService } from '@strive/user/personal.service'
import { AES, enc } from 'crypto-js'
import { DocumentSnapshot, limit, orderBy, serverTimestamp, where } from 'firebase/firestore'
import { FireSubCollection, toDate } from 'ngfire'
import { firstValueFrom, map, switchMap, take } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class AssessLifeSettingsService extends FireSubCollection<AssessLifeSettings> {
  readonly path = 'Users/:uid/Exercises'
  override readonly memorize = true

  protected override toFirestore(settings: AssessLifeSettings, actionType: 'add' | 'update'): AssessLifeSettings {
    const timestamp = serverTimestamp() as any

    if (actionType === 'add') settings.createdAt = timestamp
    settings.updatedAt = timestamp

    return settings
  }

  protected override fromFirestore(snapshot: DocumentSnapshot<AssessLifeSettings>): AssessLifeSettings | undefined {
    if (!snapshot.exists()) return createAssessLifeSettings()
    return createAssessLifeSettings(toDate({ ...snapshot.data(), id: snapshot.id }))
  }

  getSettings(uid: string): Promise<AssessLifeSettings | undefined> {
    return this.getValue('AssessLife', { uid })
  }

  getSettings$(uid: string) {
    return this.valueChanges('AssessLife', { uid })
  }

  save(uid: string, settings: Partial<AssessLifeSettings>) {
    return this.upsert({ ...settings, id: 'AssessLife' }, { params: { uid }})
  }
}

@Injectable({
  providedIn: 'root'
})
export class AssessLifeEntryService extends FireSubCollection<AssessLifeEntry> {
  readonly path = 'Users/:uid/Exercises/AssessLife/Entries'

  constructor(
    private auth: AuthService,
    private personalService: PersonalService
  ) {
    super()
  }

  protected override toFirestore(item: AssessLifeEntry, actionType: 'add' | 'update'): AssessLifeEntry {
    const timestamp = serverTimestamp() as any

    if (actionType === 'add') item.createdAt = timestamp
    item.updatedAt = timestamp

    return item
  }

  protected override fromFirestore(snapshot: DocumentSnapshot<AssessLifeEntry>): AssessLifeEntry | undefined {
    if (!snapshot.exists()) return
    return createAssessLifeEntry(toDate({ ...snapshot.data(), id: snapshot.id }))
  }

  async save(entry: AssessLifeEntry) {
    if (!this.auth.uid) throw new Error('uid should be defined when saving wheel of life entries')
    const encryptedEntry = await this.encrypt(entry)
    return this.upsert(encryptedEntry, { params: { uid: this.auth.uid }})
  }

  getPreviousEntry(uid: string, interval: AssessLifeInterval): Promise<AssessLifeEntry | undefined> {
    const query = [where('interval', '==', interval), orderBy('createdAt', 'desc'), limit(1)]
    const obs = this.valueChanges(query, { uid }).pipe(
      take(1),
      switchMap(entries => this.decrypt(entries)),
      map(entries => entries.length ? entries[0] : undefined),
    )
    return firstValueFrom(obs)
  }

  async decrypt(entries: AssessLifeEntry[]): Promise<AssessLifeEntry[]> {
    const encryptionKey = await this.personalService.getEncryptionKey()
    return entries.map(entry => _decrypt(entry, encryptionKey))
  }

  private async encrypt(entry: AssessLifeEntry): Promise<AssessLifeEntry> {
    const encryptionKey = await this.personalService.getEncryptionKey()
    return _encrypt(entry, encryptionKey)
  }
}

function _decrypt(object: any, decryptKey: string) {
  const decrypt = (value: string) => value ? AES.decrypt(value, decryptKey).toString(enc.Utf8) : ''
  const excludedProperties = ['id', 'createdAt', 'updatedAt', 'interval', 'priorities', 'config']

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
  const excludedProperties = ['id', 'createdAt', 'updatedAt', 'interval', 'priorities', 'config']

  Object.keys(object).forEach(key => {
    if (excludedProperties.includes(key)) return

    if (Array.isArray(object[key])) {
      object[key] = object[key].map(encrypt)
    } else if (typeof object[key] === 'object') {
      _encrypt(object[key], encryptKey)
    } else if (typeof object[key] === 'string') {
      object[key] = encrypt(object[key])
    }
  })

  return object
}