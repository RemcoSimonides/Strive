import { Injectable } from '@angular/core'
import { DocumentSnapshot, serverTimestamp } from 'firebase/firestore'
import { toDate, FireSubCollection } from 'ngfire'

import { Affirmations } from '@strive/model'
import { PersonalService } from '@strive/user/personal/personal.service'
import { AES } from 'crypto-js'

@Injectable({providedIn: 'root'})
export class AffirmationService extends FireSubCollection<Affirmations> {
  readonly path = 'Users/:uid/Exercises'
  override readonly memorize = true

  constructor(private personalService: PersonalService) {
    super()
  }

  protected override async toFirestore(settings: Affirmations, actionType: 'add' | 'update'): Promise<Affirmations> {
    const timestamp = serverTimestamp() as any

    const key = await this.personalService.getEncryptionKey()
    settings.affirmations = settings.affirmations.map(affirmation => AES.encrypt(affirmation, key).toString())

    if (actionType === 'add') settings.createdAt = timestamp
    settings.updatedAt = timestamp

    return settings
  }

  protected override fromFirestore(snapshot: DocumentSnapshot<Affirmations>) {
    if (!snapshot.exists()) return
    return toDate<Affirmations>({ ...snapshot.data(), id: snapshot.id })
  }

  getAffirmations$(uid: string) {
    return this.valueChanges('Affirmations', { uid })
  }

  getAffirmations(uid: string) {
    return this.getValue('Affirmations', { uid })
  }

  saveAffirmations(uid: string, affirmations: Affirmations) {
    return this.upsert({ ...affirmations, id: 'Affirmations' }, { params: { uid }})
  }
}