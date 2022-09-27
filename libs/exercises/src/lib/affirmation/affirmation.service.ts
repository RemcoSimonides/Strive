import { Injectable } from '@angular/core'
import { DocumentSnapshot, serverTimestamp } from 'firebase/firestore'
import { toDate, FireSubCollection } from 'ngfire'

import { Affirmations } from '@strive/model'

@Injectable({providedIn: 'root'})
export class AffirmationService extends FireSubCollection<Affirmations> {
  readonly path = 'Users/:uid/Exercises'
  override readonly memorize = true

  protected override toFirestore(affirmations: Affirmations, actionType: 'add' | 'update'): Affirmations {
    const timestamp = serverTimestamp() as any

    if (actionType === 'add') affirmations.createdAt = timestamp
    affirmations.updatedAt = timestamp

    return affirmations
  }

  protected override fromFirestore(snapshot: DocumentSnapshot<Affirmations>) {
    return snapshot.exists()
      ? toDate<Affirmations>({ ...snapshot.data(), id: snapshot.id })
      : undefined
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