import { Injectable, inject } from '@angular/core'
import { Firestore, collectionData as _collectionData } from '@angular/fire/firestore'
import { collection, limit, query, QueryConstraint, where } from 'firebase/firestore'
import { createConverter } from '@strive/utils/firebase'

import { of, switchMap, shareReplay, map, Observable } from 'rxjs'

import { createNotificationBase, NotificationBase, notificationEvents } from '@strive/model'
import { PersonalService } from '@strive/user/personal.service'

const converter = createConverter<NotificationBase>(createNotificationBase)

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private firestore = inject(Firestore);
  private personal = inject(PersonalService);

  hasUnreadNotification$ = this.personal.personal$.pipe(
    switchMap(personal => {
      if (!personal) return of(false)

      const query: QueryConstraint[] = [limit(1)]
      if (personal.lastCheckedNotifications) query.push(where('createdAt', '>', personal.lastCheckedNotifications))
      return this.collectionData(query, { uid: personal.uid }).pipe(
        map(notifications => notifications.filter(n => notificationEvents.includes(n.event))),
        map(notifications => !!notifications.length)
      )
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  )

  collectionData(constraints: QueryConstraint[], options: { uid: string }): Observable<NotificationBase[]> {
    const colPath = `Users/${options.uid}/Notifications`
    const colRef = collection(this.firestore, colPath).withConverter(converter)
    const q = query(colRef, ...constraints)
    return _collectionData(q, { idField: 'id' })
  }
}
