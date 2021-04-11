import { AngularFirestore } from '@angular/fire/firestore';
import { Injectable } from '@angular/core';
// Strive
import { BucketList } from './bucket-list.firestore';
import { FireCollection } from '@strive/utils/services/collection.service';

@Injectable({providedIn: 'root'})
export class BucketListService extends FireCollection<BucketList> {
  readonly path = 'Users/:uid/Exercises'

  constructor(db: AngularFirestore) {
    super(db)
  }

}