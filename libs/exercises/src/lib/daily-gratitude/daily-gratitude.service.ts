import { Injectable, inject } from '@angular/core'
import { DocumentSnapshot, serverTimestamp } from 'firebase/firestore'
import { toDate, FireSubCollection } from 'ngfire'
import { Observable } from 'rxjs'

import { AES, enc } from 'crypto-js'

import { DailyGratitude, DailyGratitudeEntry } from '@strive/model'

import { PersonalService } from '@strive/user/personal.service'
import { AuthService } from '@strive/auth/auth.service'


@Injectable({
  providedIn: 'root'
})
export class DailyGratitudeService extends FireSubCollection<DailyGratitude> {
  readonly path = 'Users/:uid/Exercises'
  override readonly memorize = true

  protected override toFirestore(settings: DailyGratitude, actionType: 'add' | 'update'): DailyGratitude {
    const timestamp = serverTimestamp() as any

    if (actionType === 'add') settings.createdAt = timestamp
    settings.updatedAt = timestamp

    return settings
  }

  protected override fromFirestore(snapshot: DocumentSnapshot<DailyGratitude>): DailyGratitude | undefined {
    if (!snapshot.exists()) return
    return toDate<DailyGratitude>({ ...snapshot.data(), id: snapshot.id })
  }

  getSettings$(uid: string): Observable<DailyGratitude | undefined> {
    return this.valueChanges('DailyGratitude', { uid })
  }

  getDailyGratitudeSettings(uid: string): Promise<DailyGratitude | undefined> {
    return this.getValue('DailyGratitude', { uid })
  }

  save(uid: string, dailyGratitudeSettings: Partial<DailyGratitude>) {
    return this.upsert({ ...dailyGratitudeSettings, id: 'DailyGratitude' }, { params: { uid }})
  }
}

@Injectable({
  providedIn: 'root'
})
export class DailyGratitudeEntryService extends FireSubCollection<DailyGratitudeEntry> {
  private auth = inject(AuthService);
  private personalService = inject(PersonalService);

  readonly path = 'Users/:uid/Exercises/DailyGratitude/Entries'

  constructor() {
    super()
  }

  protected override toFirestore(item: DailyGratitudeEntry, actionType: 'add' | 'update'): DailyGratitudeEntry {
    const timestamp = serverTimestamp() as any

    if (actionType === 'add') item.createdAt = timestamp
    item.updatedAt = timestamp

    return item
  }

  protected override fromFirestore(snapshot: DocumentSnapshot<DailyGratitudeEntry>): DailyGratitudeEntry | undefined {
    if (!snapshot.exists()) return
    return toDate<DailyGratitudeEntry>({ ...snapshot.data(), id: snapshot.id })
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
    if (!this.auth.uid) throw new Error('uid should be defined when saving daily gratitude entries')
    const key = await this.personalService.getEncryptionKey()
    data.items = data.items.map(item => AES.encrypt(item, key).toString())

    this.upsert(data, { params: { uid: this.auth.uid }})
  }

}