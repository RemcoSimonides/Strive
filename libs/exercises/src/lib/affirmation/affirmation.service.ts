import { Injectable } from '@angular/core'
import { DocumentSnapshot, serverTimestamp } from 'firebase/firestore'
import { FireSubCollection } from 'ngfire'
import { toDate } from '@strive/utils/firebase'

import { Affirmations } from '@strive/model'

@Injectable({providedIn: 'root'})
export class AffirmationService extends FireSubCollection<Affirmations> {
  readonly path = 'Users/:uid/Exercises'
  override readonly memorize = true

  protected override async toFirestore(settings: Affirmations, actionType: 'add' | 'update'): Promise<Affirmations> {
    const timestamp = serverTimestamp() as any

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