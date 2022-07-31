import { Notification, createNotificationSource } from './notification.firestore';

export function createNotification(params: Partial<Notification> = {}): Notification {
  return {
    event: 0,
    ...params,
    source: createNotificationSource(params.source),
  }
}