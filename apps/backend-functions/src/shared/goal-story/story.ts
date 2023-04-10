import { db, serverTimestamp } from '@strive/api/firebase'
import { createStoryItemBase, EventType, GoalSource  } from '@strive/model'

export function addStoryItem(name: EventType, source: GoalSource, id?: string, date?: Date) {
  const { goalId, userId, milestoneId, postId } = source
  const item = createStoryItemBase({
    name,
    goalId,
    userId,
    milestoneId,
    postId,
    date: date ? date : serverTimestamp() as any,
    createdAt: serverTimestamp() as any,
    updatedAt: serverTimestamp() as any
  })

  if (id) {
    db.doc(`Goals/${goalId}/Story/${id}`).set(item)
  } else {
    db.collection(`Goals/${goalId}/Story`).add(item)
  }
}