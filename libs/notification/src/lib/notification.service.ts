import { Injectable } from '@angular/core'
import { DocumentSnapshot, getFirestore, limit, where } from 'firebase/firestore'

import { of, switchMap, shareReplay, map } from 'rxjs'

import { FireCollection } from '@strive/utils/services/collection.service'
import { createNotification, Notification, notificationEvents } from '@strive/model'
import { toDate } from '@strive/utils/helpers'
import { PersonalService } from '@strive/user/personal/personal.service'

@Injectable({
  providedIn: 'root'
})
export class NotificationService extends FireCollection<Notification> {
  readonly path = `Users/:uid/Notifications`

  hasUnreadNotification$ = this.personal.personal$.pipe(
    switchMap(personal => {
      if (!personal) return of(false)

      const query = [where('createdAt', '>', personal.lastCheckedNotifications), limit(1)]
      return this.valueChanges(query, { uid: personal.uid }).pipe(
        map(notifications => notifications.filter(n => notificationEvents.includes(n.event))),
        map(notifications => !!notifications.length)
      )
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  )
  
  constructor(private personal: PersonalService) { 
    super(getFirestore())
  }

  protected override fromFirestore(snapshot: DocumentSnapshot<Notification>) {
    return snapshot.exists()
      ? createNotification(toDate({ ...snapshot.data(), id: snapshot.id, path: snapshot.ref.path }))
      : undefined
  }
}
