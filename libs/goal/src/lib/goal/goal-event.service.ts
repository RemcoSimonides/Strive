import { Injectable } from '@angular/core'
import { DocumentSnapshot, getFirestore } from 'firebase/firestore'
import { toDate } from 'ngfire'

import { createGoalEvent, GoalEvent } from '@strive/model'
import { FireCollection } from '@strive/utils/services/collection.service'

@Injectable({ providedIn: 'root' })
export class GoalEventService extends FireCollection<GoalEvent> {
  readonly path = `GoalEvents`

  constructor() { 
    super(getFirestore())
  }

  protected override fromFirestore(snapshot: DocumentSnapshot<GoalEvent>) {
    return snapshot.exists()
      ? createGoalEvent(toDate({ ...snapshot.data(), id: snapshot.id }))
      : undefined
  }
}
