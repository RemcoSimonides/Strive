import { Injectable } from '@angular/core'
import { DocumentSnapshot, Firestore } from '@angular/fire/firestore'

import { FireCollection } from '@strive/utils/services/collection.service'

import { StoryItem } from '@strive/model'
import { toDate } from '@strive/utils/helpers'

@Injectable({ providedIn: 'root' })
export class StoryService extends FireCollection<StoryItem> {
  readonly path = 'Goals/:goalId/Story'

  constructor(db: Firestore) {
    super(db)
  }

  protected override fromFirestore(snapshot: DocumentSnapshot<StoryItem>) {
    return snapshot.exists()
      ? toDate<StoryItem>({ ...snapshot.data(), id: snapshot.id, path: snapshot.ref.path })
      : undefined
  }
}
