import { serverTimestamp, db } from '../../internals/firebase'
import { GoalEvent, enumEvent, GoalSource } from '@strive/model'

export function addGoalEvent(name: enumEvent, source: GoalSource, id?: string) {
  const event: GoalEvent = {
    name,
    source,
    createdAt: serverTimestamp() as any,
    updatedAt: serverTimestamp() as any
  }

  if (id) {
    db.doc(`GoalEvents/${id}`).set(event)
  } else {
    db.collection('GoalEvents').add(event)
  }
}