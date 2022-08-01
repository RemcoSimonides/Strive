import * as admin from 'firebase-admin';
import { GoalEvent, enumEvent, GoalSource } from '@strive/model'

const db = admin.firestore()
const { serverTimestamp } = admin.firestore.FieldValue

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