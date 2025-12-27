import { Injectable } from '@angular/core'
import { DocumentSnapshot, QueryDocumentSnapshot, serverTimestamp } from 'firebase/firestore'
import { FireSubCollection } from 'ngfire'
import { toDate } from '@strive/utils/firebase'

import { Comment, createComment } from '@strive/model'

@Injectable({
  providedIn: 'root'
})
export class CommentService extends FireSubCollection<Comment> {
  readonly path = `Goals/:goalId/Comments`
  override readonly memorize = true

  protected override toFirestore(comment: Comment, actionType: 'add' | 'update'): Comment {
    const timestamp = serverTimestamp() as any

    if (actionType === 'add') comment.createdAt = timestamp
    comment.updatedAt = timestamp

    return comment
  }

  protected override fromFirestore(snapshot: DocumentSnapshot<Comment> | QueryDocumentSnapshot<Comment>): Comment | undefined {
    return snapshot.exists()
      ? createComment(toDate({ ...snapshot.data(), id: snapshot.id }))
      : undefined
  }

}
