import { db, admin } from '@strive/api/firebase'
import { ScheduledTask } from './scheduled-task.interface'

function getTimestamp(performAt: ScheduledTask['performAt']) {
  if (typeof performAt === 'string' || typeof performAt === 'number') {
    const date = new Date(performAt)
    return admin.firestore.Timestamp.fromDate(date)
  }
  if (performAt instanceof Date) {
    return admin.firestore.Timestamp.fromDate(performAt)
  }
  return performAt
}

export async function upsertScheduledTask(id: string, scheduledTask: Partial<ScheduledTask>) {
  const scheduledTaskSnap = await db.doc(`ScheduledTasks/${id}`).get()

  return scheduledTaskSnap.exists
    ? updateScheduledTask(id, scheduledTask.performAt)
    : createScheduledTask(id, scheduledTask)
}

function createScheduledTask(id: string, scheduledTask: Partial<ScheduledTask>) {
  scheduledTask.performAt = getTimestamp(scheduledTask.performAt)
  return db.doc(`ScheduledTasks/${id}`).create({
    status: 'scheduled',
    ...scheduledTask,
  })
}

function updateScheduledTask(id: string, _performAt: string | FirebaseFirestore.FieldValue | Date) {
  const performAt = getTimestamp(_performAt)
  return db.doc(`ScheduledTasks/${id}`).update({ performAt })
}

export function deleteScheduledTask(id: string) {
  return db.doc(`ScheduledTasks/${id}`).delete()
}
