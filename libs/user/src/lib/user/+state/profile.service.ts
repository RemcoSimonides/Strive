import { Injectable } from '@angular/core';
import { FireCollection } from '@strive/utils/services/collection.service';
// Interfaces
import { Profile } from './user.firestore';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class ProfileService extends FireCollection<Profile> {
  readonly path = 'Users/:uid/Profile'
  readonly idKey = 'uid'

  constructor(db: AngularFirestore) {
    super(db)
  }

}
