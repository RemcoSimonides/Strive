import { Injectable } from '@angular/core'
import { DocumentSnapshot, getFirestore } from 'firebase/firestore'

import { FireCollection } from '@strive/utils/services/collection.service'
import { toDate } from 'ngfire'

import { createPost, Post } from '@strive/model'

@Injectable({
  providedIn: 'root'
})
export class PostService extends FireCollection<Post> {
  readonly path = 'Goals/:goalId/Posts'

  constructor() {
    super(getFirestore())
  }

  protected override fromFirestore(snapshot: DocumentSnapshot<Post>) {
    return snapshot.exists()
      ? createPost(toDate({ ...snapshot.data(), id: snapshot.id }))
      : undefined
  }
}
