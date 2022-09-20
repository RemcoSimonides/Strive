import { serverTimestamp, db } from '../../internals/firebase'
import { GoalSource, EventType, createGoalEvent } from '@strive/model'

export function addGoalEvent(name: EventType, source: GoalSource, id?: string) {
  const event = createGoalEvent({
    name,
    goalId: source.goalId,
    userId: source.userId,
    milestoneId: source.milestoneId,
    supportId: source.supportId,
    postId: source.postId,
    createdAt: serverTimestamp() as any,
    updatedAt: serverTimestamp() as any
  })

  if (id) {
    db.doc(`GoalEvents/${id}`).set(event)
  } else {
    db.collection('GoalEvents').add(event)
  }
}