import { db, admin } from '../../internals/firebase';
import { IScheduledTask, enumTaskStatus } from './scheduled-task.interface';

export async function upsertScheduledTask(id: string, scheduledTask: IScheduledTask) {
  const scheduledTaskSnap = await db.doc(`ScheduledTasks/${id}`).get();

  return scheduledTaskSnap.exists
    ? updateScheduledTask(id, scheduledTask.performAt)
    : createScheduledTask(id, scheduledTask);
}

function createScheduledTask(id: string, scheduledTask: IScheduledTask) {
  if (typeof scheduledTask.performAt === 'string') {
    scheduledTask.performAt = admin.firestore.Timestamp.fromDate(
      new Date(scheduledTask.performAt)
    );
  }

  return db.doc(`ScheduledTasks/${id}`).create({
    status: enumTaskStatus.scheduled,
    ...scheduledTask,
  });
}

function updateScheduledTask(id: string, performAt: string | FirebaseFirestore.FieldValue) {
  let performAtTime = performAt;

  if (typeof performAt === 'string') {
    performAtTime = admin.firestore.Timestamp.fromDate(new Date(performAt));
  }

  return db.doc(`ScheduledTasks/${id}`).update({ performAt: performAtTime, });
}

export function deleteScheduledTask(id: string) {
  return db.doc(`ScheduledTasks/${id}`).delete();
}
