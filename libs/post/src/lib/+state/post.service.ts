import { Injectable } from '@angular/core';
// Services
import { Firestore, DocumentSnapshot } from '@angular/fire/firestore';
import { createUserLink } from '@strive/user/user/+state/user.firestore';
import { UserService } from '@strive/user/user/+state/user.service';
import { FireCollection } from '@strive/utils/services/collection.service';
// Interfaces
import { createPost, Post } from './post.firestore';

@Injectable({
  providedIn: 'root'
})
export class PostService extends FireCollection<Post> {
  readonly path = 'Goals/:goalId/Posts'

  constructor(
    public db: Firestore,
    private user: UserService
  ) {
    super(db)
  }

  protected fromFirestore(snapshot: DocumentSnapshot<Post>) {
    return snapshot.exists()
      ? createPost({ ...snapshot.data(), id: snapshot.id })
      : undefined
  }

  protected async toFirestore(post: Post): Promise<Post> {
    post.author = createUserLink(this.user.user)
    return post
  }

}
