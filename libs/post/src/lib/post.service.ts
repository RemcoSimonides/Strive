import { Injectable } from '@angular/core';

import { Firestore, DocumentSnapshot } from '@angular/fire/firestore';
import { FireCollection } from '@strive/utils/services/collection.service';

import { createPost, Post } from '@strive/model';
import { toDate } from '@strive/utils/helpers';

@Injectable({
  providedIn: 'root'
})
export class PostService extends FireCollection<Post> {
  readonly path = 'Goals/:goalId/Posts'

  constructor(public override db: Firestore) {
    super(db)
  }

  protected override fromFirestore(snapshot: DocumentSnapshot<Post>) {
    return snapshot.exists()
      ? createPost(toDate({ ...snapshot.data(), id: snapshot.id }))
      : undefined
  }
}
