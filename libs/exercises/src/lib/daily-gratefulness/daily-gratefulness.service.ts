import { Injectable } from '@angular/core'
import { DocumentSnapshot, serverTimestamp } from 'firebase/firestore'
import { toDate, FireSubCollection } from 'ngfire'
import { firstValueFrom, Observable } from 'rxjs'

import { AES, enc } from 'crypto-js'

import { DailyGratefulness, DailyGratefulnessItem } from '@strive/model'

import { PersonalService } from '@strive/user/personal/personal.service'
import { createRandomString } from '@strive/utils/helpers'


@Injectable({
  providedIn: 'root'
})
export class DailyGratefulnessService extends FireSubCollection<DailyGratefulness> {
  readonly path = 'Users/:uid/Exercises'
  override readonly memorize = true

  protected override toFirestore(settings: DailyGratefulness, actionType: 'add' | 'update'): DailyGratefulness {
    const timestamp = serverTimestamp() as any

    if (actionType === 'add') settings.createdAt = timestamp
    settings.updatedAt = timestamp
    
    return settings
  }

  protected override fromFirestore(snapshot: DocumentSnapshot<DailyGratefulness>): DailyGratefulness | undefined {
    if (!snapshot.exists()) return
    return toDate<DailyGratefulness>({ ...snapshot.data(), id: snapshot.id })
  }

  getSettings$(uid: string): Observable<DailyGratefulness | undefined> {
    return this.valueChanges('DailyGratefulness', { uid })
  }

  getDailyGratefulnessSettings(uid: string): Promise<DailyGratefulness | undefined> {
    return this.getValue('DailyGratefulness', { uid })
  }

  save(uid: string, dailyGratefulnessSettings: Partial<DailyGratefulness>) {
    return this.upsert({ ...dailyGratefulnessSettings, id: 'DailyGratefulness' }, { params: { uid }})
  }
}

@Injectable({
  providedIn: 'root'
})
export class DailyGratefulnessItemService extends FireSubCollection<DailyGratefulnessItem> {
  readonly path = 'Users/:uid/Exercises/DailyGratefulness/Items'

  constructor(private personalService: PersonalService) {
    super()
  }

  protected override toFirestore(item: DailyGratefulnessItem, actionType: 'add' | 'update'): DailyGratefulnessItem {
    const timestamp = serverTimestamp() as any

    if (actionType === 'add') item.createdAt = timestamp
    item.updatedAt = timestamp
    
    return item
  }

  protected override fromFirestore(snapshot: DocumentSnapshot<DailyGratefulnessItem>): DailyGratefulnessItem | undefined {
    if (!snapshot.exists()) return
    return toDate<DailyGratefulnessItem>({ ...snapshot.data(), id: snapshot.id })
  }

  async decrypt(cards: DailyGratefulnessItem[]) {
    const personal = await firstValueFrom(this.personalService.personal$)
    if (!personal) return []

    for (const card of cards) {
      card.items = card.items.map(item => {
        return AES.decrypt(item, personal.key).toString(enc.Utf8)
      })
    }
 
    return cards
  }

  async save(data: DailyGratefulnessItem) {
    const personal = await firstValueFrom(this.personalService.personal$)
    if (!personal) return

    let key = personal.key
    
    if (!key) {
      key = createRandomString(32)
      this.personalService.update({
        uid: personal.uid,
        key
      }, { params: { uid: personal.uid }})
    }

    data.items = data.items.map(item => AES.encrypt(item, key).toString())

    this.upsert(data, { params: { uid: personal.uid }})
  }

}