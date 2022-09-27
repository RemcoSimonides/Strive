import { Injectable } from '@angular/core'
import { DocumentSnapshot, serverTimestamp } from 'firebase/firestore'
import { toDate, FireCollection } from 'ngfire'

import { createGoalEvent, GoalEvent } from '@strive/model'

@Injectable({ providedIn: 'root' })
export class GoalEventService extends FireCollection<GoalEvent> {
  readonly path = `GoalEvents`
  override readonly memorize = true

  protected override toFirestore(event: GoalEvent, actionType: 'add' | 'update'): GoalEvent {
    const timestamp = serverTimestamp() as any

    if (actionType === 'add') event.createdAt = timestamp
    event.updatedAt = timestamp

    return event
  }

  protected override fromFirestore(snapshot: DocumentSnapshot<GoalEvent>) {
    return snapshot.exists()
      ? createGoalEvent(toDate({ ...snapshot.data(), id: snapshot.id }))
      : undefined
  }
}
