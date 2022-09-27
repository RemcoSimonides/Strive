import { Injectable } from '@angular/core'
import { DocumentSnapshot, serverTimestamp } from 'firebase/firestore'

import { toDate, FireSubCollection } from 'ngfire'

import { createPost, Post } from '@strive/model'

@Injectable({
  providedIn: 'root'
})
export class PostService extends FireSubCollection<Post> {
  readonly path = 'Goals/:goalId/Posts'
  override readonly memorize = true

  protected override toFirestore(post: Post, actionType: 'add' | 'update'): Post {
    const timestamp = serverTimestamp() as any

    if (actionType === 'add') post.createdAt = timestamp
    post.updatedAt = timestamp

    return post
  }

  protected override fromFirestore(snapshot: DocumentSnapshot<Post>) {
    return snapshot.exists()
      ? createPost(toDate({ ...snapshot.data(), [this.idKey]: snapshot.id }))
      : undefined
  }
}
