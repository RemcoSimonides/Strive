import { Injectable, inject } from '@angular/core'
import { DocumentSnapshot, limit, QueryConstraint, serverTimestamp, where } from 'firebase/firestore'
import { toDate, FireSubCollection } from 'ngfire'

import { of, switchMap, shareReplay, map } from 'rxjs'

import { createNotificationBase, NotificationBase, notificationEvents } from '@strive/model'
import { PersonalService } from '@strive/user/personal.service'

@Injectable({
  providedIn: 'root'
})
export class NotificationService extends FireSubCollection<NotificationBase> {
  private personal = inject(PersonalService);

  readonly path = `Users/:uid/Notifications`
  override readonly memorize = true

  hasUnreadNotification$ = this.personal.personal$.pipe(
    switchMap(personal => {
      if (!personal) return of(false)

      const query: QueryConstraint[] = [limit(1)]
      if (personal.lastCheckedNotifications) query.push(where('createdAt', '>', personal.lastCheckedNotifications))
      return this.valueChanges(query, { uid: personal.uid }).pipe(
        map(notifications => notifications.filter(n => notificationEvents.includes(n.event))),
        map(notifications => !!notifications.length)
      )
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  )

  constructor() {
    super()
  }

  protected override toFirestore(notification: NotificationBase, actionType: 'add' | 'update'): NotificationBase {
    const timestamp = serverTimestamp() as any

    if (actionType === 'add') notification.createdAt = timestamp
    notification.updatedAt = timestamp

    return notification
  }

  protected override fromFirestore(snapshot: DocumentSnapshot<NotificationBase>) {
    return snapshot.exists()
      ? createNotificationBase(toDate({ ...snapshot.data(), id: snapshot.id, path: snapshot.ref.path }))
      : undefined
  }
}
