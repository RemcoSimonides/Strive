import { Injectable } from '@angular/core'
import { DocumentSnapshot, QueryDocumentSnapshot } from 'firebase/firestore'
import { toDate, FireSubCollection } from 'ngfire'

import { Comment, createComment } from '@strive/model'

@Injectable({
  providedIn: 'root'
})
export class CommentService extends FireSubCollection<Comment> {
  readonly path = `Goals/:goalId/Comments`

  protected override fromFirestore(snapshot: DocumentSnapshot<Comment> | QueryDocumentSnapshot<Comment>): Comment | undefined {
    return snapshot.exists()
      ? createComment(toDate({ ...snapshot.data(), id: snapshot.id }))
      : undefined
  }

}
