import { db, serverTimestamp } from '../../internals/firebase';
import { EventType, GoalSource, StoryItem  } from '@strive/model'

export function addStoryItem(name: EventType, source: GoalSource, id?: string, date?: Date) {
  const item: StoryItem = {
    name,
    source,
    date: date ? date : serverTimestamp() as any,
    createdAt: serverTimestamp() as any,
    updatedAt: serverTimestamp() as any
  }

  const goalId = source.goal.id
  if (id) {
    db.doc(`Goals/${goalId}/Story/${id}`).set(item)
  } else {
    db.collection(`Goals/${goalId}/Story`).add(item)
  }
}