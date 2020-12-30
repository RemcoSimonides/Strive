import { Injectable } from '@angular/core';
// Services
import { AngularFireAuth } from '@angular/fire/auth';
import { FirestoreService } from 'apps/journal/src/app/services/firestore/firestore.service';
// Interfaces
import { Post, enumPostSource } from './post.firestore';

@Injectable({
  providedIn: 'root'
})
export class PostService {

  constructor(
    private afAuth: AngularFireAuth,
    private db: FirestoreService,
  ) { }

  async createPost(postSource: enumPostSource, post: Partial<Post>, newPostId?: string) {

    //Prepare object
    const currentUser = await this.afAuth.currentUser;
    post.author = {
      id: currentUser.uid,
      profileImage: currentUser.photoURL,
      username: currentUser.displayName
    }

    if (!!newPostId) {
      await this.db.set(`Goals/${post.goal.id}/Posts/${newPostId}`, post)       
    } else {
      await this.db.add(`Goals/${post.goal.id}/Posts`, post)
    }

  }
}
