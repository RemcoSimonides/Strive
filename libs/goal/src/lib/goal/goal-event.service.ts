import { Injectable } from '@angular/core'
import { DocumentSnapshot } from 'firebase/firestore'
import { toDate, FireCollection } from 'ngfire'

import { createGoalEvent, GoalEvent } from '@strive/model'

@Injectable({ providedIn: 'root' })
export class GoalEventService extends FireCollection<GoalEvent> {
  readonly path = `GoalEvents`
  override readonly memorize = true

  protected override fromFirestore(snapshot: DocumentSnapshot<GoalEvent>) {
    return snapshot.exists()
      ? createGoalEvent(toDate({ ...snapshot.data(), id: snapshot.id }))
      : undefined
  }
}
