import { Injectable } from '@angular/core';
import { FirestoreService } from '@strive/utils/services/firestore.service';
import { IComment } from '@strive/interfaces';

@Injectable({
  providedIn: 'root'
})
export class DiscussionService {

  constructor(private db: FirestoreService) { }

  get(path: string) {
    return this.db.colWithIds$(path)
  }

  async addReply(discussionId: string, comment: IComment) {
    await this.db.add<IComment>(`Discussions/${discussionId}/Comments`, comment)
  }

}
