import { Injectable } from '@angular/core';
import { DocumentSnapshot, Firestore } from '@angular/fire/firestore';

// Strive
import { FireCollection } from '@strive/utils/services/collection.service';
import { Affirmations } from '@strive/model'
import { toDate } from '@strive/utils/helpers';

@Injectable({providedIn: 'root'})
export class AffirmationService extends FireCollection<Affirmations> {
  readonly path = 'Users/:uid/Exercises'

  constructor(db: Firestore) {
    super(db)
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