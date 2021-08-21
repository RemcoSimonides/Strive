import { Injectable } from '@angular/core';
import { Discussion} from './discussion.firestore'
import { FireCollection } from '@strive/utils/services/collection.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { CommentService } from './comment.service';

@Injectable({
  providedIn: 'root'
})
export class DiscussionService extends FireCollection<Discussion> {
  readonly path = `Discussions`

  constructor(
    db: AngularFirestore,
    public comment: CommentService
  ) {
    super(db)
  }
}
