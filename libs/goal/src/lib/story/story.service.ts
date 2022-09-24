import { Injectable } from '@angular/core'
import { DocumentSnapshot } from 'firebase/firestore'
import { toDate, FireSubCollection } from 'ngfire'

import { StoryItem } from '@strive/model'

@Injectable({ providedIn: 'root' })
export class StoryService extends FireSubCollection<StoryItem> {
  readonly path = 'Goals/:goalId/Story'
  override readonly memorize = true

  protected override fromFirestore(snapshot: DocumentSnapshot<StoryItem>) {
    return snapshot.exists()
      ? toDate<StoryItem>({ ...snapshot.data(), id: snapshot.id })
      : undefined
  }
}
