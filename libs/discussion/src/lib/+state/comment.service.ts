import { Injectable } from '@angular/core';
import { Comment } from './comment.firestore';
import { FireCollection } from '@strive/utils/services/collection.service';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class CommentService extends FireCollection<Comment> {
  readonly path = `Discussions/:discussionId/Comments`

  constructor(
    db: AngularFirestore
  ) {
    super(db)
  }

}
