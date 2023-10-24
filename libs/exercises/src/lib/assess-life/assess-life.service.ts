import { Injectable } from '@angular/core'
import { AuthService } from '@strive/auth/auth.service'
import { AssessLifeEntry, AssessLifeSettings, createAssessLifeEntry, createAssessLifeSettings } from '@strive/model'
import { PersonalService } from '@strive/user/personal.service'
import { AES, enc } from 'crypto-js'
import { DocumentSnapshot, serverTimestamp } from 'firebase/firestore'
import { FireSubCollection, toDate } from 'ngfire'

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

  async decrypt(entries: AssessLifeEntry[]): Promise<AssessLifeEntry[]> {
    const encryptionKey = await this.personalService.getEncryptionKey()

    entries = entries.map(entry => {
      Object.keys(entry).forEach(key => {
        const typedKey = key as keyof AssessLifeEntry
        const excludedProperties = ['id', 'createdAt', 'updatedAt', 'interval']
        if (excludedProperties.includes(key)) return
        entry[typedKey] = _decrypt(entry[typedKey], encryptionKey)
      })
      return entry
    })

    return entries
  }

  private async encrypt(entry: AssessLifeEntry): Promise<AssessLifeEntry> {
    const encryptionKey = await this.personalService.getEncryptionKey()

    Object.keys(entry).forEach(key => {
      const typedKey = key as keyof AssessLifeEntry
      const excludedProperties = ['id', 'createdAt', 'updatedAt', 'interval']
      if (excludedProperties.includes(key)) return
      entry[typedKey] = _encrypt(entry[typedKey], encryptionKey)
    })

    return entry
  }
}

function _decrypt(object: any, decryptKey: string) {
  Object.keys(object).forEach(key => {
    if (typeof object[key] === 'object') {
      _decrypt(object[key], decryptKey)
    } else if (Array.isArray(object[key])) {
      object[key] = object[key].map((v: string) =>  +AES.decrypt(v.toString(), decryptKey).toString(enc.Utf8))
    } else if (typeof object[key] === 'string') {
      object[key] = AES.decrypt(object[key], decryptKey).toString(enc.Utf8)
    }
  })

  return object
}

function _encrypt(object: any, encryptKey: string) {
  const encrypt = (value: string) => value ? AES.encrypt(value, encryptKey).toString() : ''

  Object.keys(object).forEach(key => {
    if (typeof object[key] === 'object') {
      _encrypt(object[key], encryptKey)
    } else if (Array.isArray(object[key])) {
      object[key] = object[key].map(encrypt)
    } else if (typeof object[key] === 'string') {
      object[key] = encrypt(object[key])
    }
  })

  return object
}