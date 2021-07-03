import { db, admin } from '../../internals/firebase';
import { ScheduledTask } from './scheduled-task.interface';

export async function upsertScheduledTask(id: string, scheduledTask: Partial<ScheduledTask>) {
  const scheduledTaskSnap = await db.doc(`ScheduledTasks/${id}`).get();

  return scheduledTaskSnap.exists
    ? updateScheduledTask(id, scheduledTask.performAt)
    : createScheduledTask(id, scheduledTask);
}

function createScheduledTask(id: string, scheduledTask: Partial<ScheduledTask>) {
  if (typeof scheduledTask.performAt === 'string') {
    scheduledTask.performAt = admin.firestore.Timestamp.fromDate(
      new Date(scheduledTask.performAt)
    );
  }

  return db.doc(`ScheduledTasks/${id}`).create({
    status: 'scheduled',
    ...scheduledTask,
  });
}

function updateScheduledTask(id: string, _performAt: string | FirebaseFirestore.FieldValue) {
  const performAt = typeof _performAt === 'string' ? admin.firestore.Timestamp.fromDate(new Date(_performAt)) : _performAt
  return db.doc(`ScheduledTasks/${id}`).update({ performAt });
}

export function deleteScheduledTask(id: string) {
  return db.doc(`ScheduledTasks/${id}`).delete();
}
