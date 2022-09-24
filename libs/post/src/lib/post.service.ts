import { Injectable } from '@angular/core'
import { DocumentSnapshot } from 'firebase/firestore'

import { toDate, FireSubCollection } from 'ngfire'

import { createPost, Post } from '@strive/model'

@Injectable({
  providedIn: 'root'
})
export class PostService extends FireSubCollection<Post> {
  readonly path = 'Goals/:goalId/Posts'
  override readonly memorize = true

  protected override fromFirestore(snapshot: DocumentSnapshot<Post>) {
    return snapshot.exists()
      ? createPost(toDate({ ...snapshot.data(), id: snapshot.id }))
      : undefined
  }
}
