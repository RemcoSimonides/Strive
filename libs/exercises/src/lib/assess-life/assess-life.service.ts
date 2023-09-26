import { Injectable } from '@angular/core'
import { AuthService } from '@strive/auth/auth.service'
import { AssessLifeEntry, AssessLifeSettings } from '@strive/model'
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
    if (!snapshot.exists()) return
    return toDate<AssessLifeSettings>({ ...snapshot.data(), id: snapshot.id })
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
    return toDate<AssessLifeEntry>({ ...snapshot.data(), id: snapshot.id })
  }

  async decrypt(entries: AssessLifeEntry[]): Promise<AssessLifeEntry[]> {
    const encryptionKey = await this.personalService.getEncryptionKey()

    for (const entry of entries) {
      entry.timeManagement.past.entries = entry.timeManagement.past.entries.map(v => AES.decrypt(v, encryptionKey).toString(enc.Utf8))
      entry.timeManagement.future.entries = entry.timeManagement.future.entries.map(v => AES.decrypt(v, encryptionKey).toString(enc.Utf8))
    }

    return entries
  }

  save(entry: AssessLifeEntry) {
    if (!this.auth.uid) throw new Error('uid should be defined when saving wheel of life entries')
    this.upsert(entry, { params: { uid: this.auth.uid }})
  }
}