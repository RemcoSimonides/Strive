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

  async createPost(postSource: enumPostSource, goalId: string, post: Partial<Post>, newPostId?: string): Promise<void> {
    switch (postSource) {
      case enumPostSource.goal:
        delete post.milestone

        break
      case enumPostSource.milestone:

        break
    }

    if (!newPostId) {
      newPostId = await this.db.getNewId()
    }

    //Prepare object
    const currentUser = await this.afAuth.currentUser;
    post.author = {
      id: currentUser.uid,
      profileImage: currentUser.photoURL,
      username: currentUser.displayName
    }
    post.goal.id = goalId
    
    if (!post.content.mediaURL) delete post.content.mediaURL
    delete post.id

    await this.db.set(`Goals/${goalId}/Posts/${newPostId}`, post) 
  }
}
