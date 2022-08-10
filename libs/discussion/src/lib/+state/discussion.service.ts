import { Injectable } from '@angular/core';
import { Discussion} from './discussion.firestore'
import { FireCollection } from '@strive/utils/services/collection.service';
import { getFirestore } from 'firebase/firestore';
import { CommentService } from './comment.service';

@Injectable({
  providedIn: 'root'
})
export class DiscussionService extends FireCollection<Discussion> {
  readonly path = `Discussions`

  constructor(public comment: CommentService) {
    super(getFirestore())
  }
}
