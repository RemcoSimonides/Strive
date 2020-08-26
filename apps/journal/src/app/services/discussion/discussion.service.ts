import { Injectable } from '@angular/core';
import { FirestoreService } from '../firestore/firestore.service';
import { IComment } from 'apps/journal/src/app/interfaces/comment.interface';

@Injectable({
  providedIn: 'root'
})
export class DiscussionService {

  constructor(
    private db: FirestoreService
  ) { }

  get(path: string) {
    return this.db.colWithIds$(path)
  }

  async addReply(discussionId: string, comment: IComment): Promise<void> {
    await this.db.add<IComment>(`Discussions/${discussionId}/Comments`, comment)
  }

}
