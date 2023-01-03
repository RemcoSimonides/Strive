import { Injectable } from '@angular/core'
import { DocumentSnapshot, serverTimestamp } from 'firebase/firestore'
import { toDate, FireSubCollection } from 'ngfire'

import { StoryItem } from '@strive/model'

@Injectable({ providedIn: 'root' })
export class StoryService extends FireSubCollection<StoryItem> {
  readonly path = 'Goals/:goalId/Story'
  override readonly memorize = true

  protected override toFirestore(item: StoryItem, actionType: 'add' | 'update'): StoryItem {
    const timestamp = serverTimestamp() as any

    if (actionType === 'add') item.createdAt = timestamp
    item.updatedAt = timestamp

    return item
  }

  protected override fromFirestore(snapshot: DocumentSnapshot<StoryItem>) {
    return snapshot.exists()
      ? toDate<StoryItem>({ ...snapshot.data(), [this.idKey]: snapshot.id })
      : undefined
  }
}
