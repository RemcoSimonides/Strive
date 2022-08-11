import { Injectable } from '@angular/core'
import { DocumentSnapshot, getFirestore } from 'firebase/firestore'
import { toDate } from 'ngfire'

import { FireCollection } from '@strive/utils/services/collection.service'

import { StoryItem } from '@strive/model'

@Injectable({ providedIn: 'root' })
export class StoryService extends FireCollection<StoryItem> {
  readonly path = 'Goals/:goalId/Story'

  constructor() {
    super(getFirestore())
  }

  protected override fromFirestore(snapshot: DocumentSnapshot<StoryItem>) {
    return snapshot.exists()
      ? toDate<StoryItem>({ ...snapshot.data(), id: snapshot.id })
      : undefined
  }
}
