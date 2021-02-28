import { Injectable } from '@angular/core';
import { FirestoreService } from '@strive/utils/services/firestore.service';
import { Comment } from '@strive/discussion/+state/comment.firestore';

@Injectable({
  providedIn: 'root'
})
export class DiscussionService {

  constructor(private db: FirestoreService) { }

  get(path: string) {
    return this.db.colWithIds$(path)
  }

  async addReply(discussionId: string, comment: Comment) {
    await this.db.add<Comment>(`Discussions/${discussionId}/Comments`, comment)
  }
}
