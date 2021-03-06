import { Injectable } from '@angular/core';
// Services
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, DocumentSnapshot } from '@angular/fire/firestore';
import { createProfileLink } from '@strive/user/user/+state/user.firestore';
import { FireCollection } from '@strive/utils/services/collection.service';
// Interfaces
import { createPost, Post } from './post.firestore';

@Injectable({
  providedIn: 'root'
})
export class PostService extends FireCollection<Post> {
  readonly path = 'Goals/:goalId/Posts'

  constructor(
    public db: AngularFirestore,
    private afAuth: AngularFireAuth
  ) {
    super(db)
  }

  protected fromFirestore(snapshot: DocumentSnapshot<Post>) {
    return snapshot.exists
      ? createPost({ ...snapshot.data(), id: snapshot.id })
      : undefined
  }

  protected async toFirestore(post: Post): Promise<Post> {
    const { uid, photoURL, displayName } = await this.afAuth.currentUser;
    post.author = createProfileLink({ uid, photoURL, username: displayName });
    return post
  }

}
