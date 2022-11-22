import { Injectable } from '@angular/core'
import { DocumentSnapshot, serverTimestamp } from 'firebase/firestore'
import { toDate, FireSubCollection } from 'ngfire'
import { Observable } from 'rxjs'

import { AES, enc } from 'crypto-js'

import { WheelOfLifeEntry, WheelOfLifeSettings } from '@strive/model'

import { PersonalService } from '@strive/user/personal/personal.service'
import { AuthService } from '@strive/user/auth/auth.service'


@Injectable({
  providedIn: 'root'
})
export class WheelOfLifeService extends FireSubCollection<WheelOfLifeSettings> {
  readonly path = 'Users/:uid/Exercises'
  override readonly memorize = true

  protected override toFirestore(settings: WheelOfLifeSettings, actionType: 'add' | 'update'): WheelOfLifeSettings {
    const timestamp = serverTimestamp() as any

    if (actionType === 'add') settings.createdAt = timestamp
    settings.updatedAt = timestamp
    
    return settings
  }

  protected override fromFirestore(snapshot: DocumentSnapshot<WheelOfLifeSettings>): WheelOfLifeSettings | undefined {
    if (!snapshot.exists()) return
    return toDate<WheelOfLifeSettings>({ ...snapshot.data(), id: snapshot.id })
  }

  getSettings$(uid: string): Observable<WheelOfLifeSettings | undefined> {
    return this.valueChanges('WheelOfLife', { uid })
  }

  getSettings(uid: string): Promise<WheelOfLifeSettings | undefined> {
    return this.getValue('WheelOfLife', { uid })
  }

  save(uid: string, settings: Partial<WheelOfLifeSettings>) {
    return this.upsert({ ...settings, id: 'WheelOfLife' }, { params: { uid }})
  }
}

@Injectable({
  providedIn: 'root'
})
export class WheelOfLifeEntryService extends FireSubCollection<WheelOfLifeEntry<string>> {
  readonly path = 'Users/:uid/Exercises/WheelOfLife/Entries'

  constructor(
    private auth: AuthService,
    private personalService: PersonalService
  ) {
    super()
  }

  protected override toFirestore(item: WheelOfLifeEntry<string>, actionType: 'add' | 'update'): WheelOfLifeEntry<string> {
    const timestamp = serverTimestamp() as any

    if (actionType === 'add') item.createdAt = timestamp
    item.updatedAt = timestamp
    
    return item
  }

  protected override fromFirestore(snapshot: DocumentSnapshot<WheelOfLifeEntry<string>>): WheelOfLifeEntry<string> | undefined {
    if (!snapshot.exists()) return
    return toDate<WheelOfLifeEntry<string>>({ ...snapshot.data(), id: snapshot.id })
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
    if (!this.auth.uid) throw new Error('uid should be defined when saving wheel of life entries')
    this.upsert(entry, { params: { uid: this.auth.uid }})
  }

}