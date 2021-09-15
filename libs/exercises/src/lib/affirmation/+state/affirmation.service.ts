import { Injectable } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';

// Strive
import { FireCollection } from '@strive/utils/services/collection.service';
import { Affirmations } from './affirmation.firestore';

@Injectable({providedIn: 'root'})
export class AffirmationService extends FireCollection<Affirmations> {
  readonly path = 'Users/:uid/Exercises'

  constructor(db: Firestore) {
    super(db)
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