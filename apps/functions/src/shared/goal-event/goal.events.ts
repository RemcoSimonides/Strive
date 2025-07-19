import { serverTimestamp, db } from '@strive/api/firebase'
import { GoalSource, EventType, createGoalEvent } from '@strive/model'

export function addGoalEvent(name: EventType, source: GoalSource, id?: string) {
  const event = createGoalEvent({
    name,
    goalId: source.goalId,
    userId: source.userId,
    milestoneId: source.milestoneId,
    supportId: source.supportId,
    postId: source.postId,
    commentId: source.commentId,
    createdAt: serverTimestamp() as any,
    updatedAt: serverTimestamp() as any
  })

  if (id) {
    return db.doc(`GoalEvents/${id}`).set(event)
  } else {
    return db.collection('GoalEvents').add(event)
  }
}