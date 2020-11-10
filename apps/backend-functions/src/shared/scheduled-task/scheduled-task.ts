import { db, admin } from '../../internals/firebase';
import { IScheduledTask, enumTaskStatus } from './scheduled-task.interface';

export async function upsertScheduledTask(
  id: string,
  scheduledTask: IScheduledTask
): Promise<void> {
  const scheduledTaskSnap = await db.doc(`ScheduledTasks/${id}`).get();

  scheduledTaskSnap.exists
    ? await updateScheduledTask(id, scheduledTask.performAt)
    : await createScheduledTask(id, scheduledTask);
}

async function createScheduledTask(
  id: string,
  scheduledTask: IScheduledTask
): Promise<void> {
  if (typeof scheduledTask.performAt === 'string') {
    scheduledTask.performAt = admin.firestore.Timestamp.fromDate(
      new Date(scheduledTask.performAt)
    );
  }

  await db.doc(`ScheduledTasks/${id}`).create({
    status: enumTaskStatus.scheduled,
    ...scheduledTask,
  });
}

async function updateScheduledTask(
  id: string,
  performAt: string | FirebaseFirestore.FieldValue
): Promise<void> {
  let performAtTime = performAt;

  if (typeof performAt === 'string') {
    performAtTime = admin.firestore.Timestamp.fromDate(new Date(performAt));
  }

  await db.doc(`ScheduledTasks/${id}`).update({
    performAt: performAtTime,
  });
}

export async function deleteScheduledTask(id: string): Promise<void> {
  await db.doc(`ScheduledTasks/${id}`).delete();
}
