import { db, logger, serverTimestamp } from '../../internals/firebase';
import { createStoryItemBase, EventType, GoalSource  } from '@strive/model'

export function addStoryItem(name: EventType, source: GoalSource, id?: string, date?: Date) {
  const item = createStoryItemBase({
    name,
    goalId: source.goal.id,
    userId: source.user?.uid,
    milestoneId: source.milestone?.id,
    postId: source.postId,
    date: date ? date : serverTimestamp() as any,
    createdAt: serverTimestamp() as any,
    updatedAt: serverTimestamp() as any
  })

  const goalId = source.goal.id
  if (id) {
    db.doc(`Goals/${goalId}/Story/${id}`).set(item)
  } else {
    db.collection(`Goals/${goalId}/Story`).add(item)
  }
}