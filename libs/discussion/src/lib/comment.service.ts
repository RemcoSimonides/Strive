import { Injectable } from '@angular/core';
import { FireCollection } from '@strive/utils/services/collection.service';
import { DocumentSnapshot, getFirestore, QueryDocumentSnapshot } from 'firebase/firestore';
import { Comment, createComment } from '@strive/model';
import { toDate } from 'ngfire';

@Injectable({
  providedIn: 'root'
})
export class CommentService extends FireCollection<Comment> {
  readonly path = `Goals/:goalId/Comments`

  constructor() {
    super(getFirestore())
  }

  protected override fromFirestore(snapshot: DocumentSnapshot<Comment> | QueryDocumentSnapshot<Comment>): Comment | undefined {
    return snapshot.exists()
      ? createComment(toDate({ ...snapshot.data(), id: snapshot.id }))
      : undefined
  }

}
