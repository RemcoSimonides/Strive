import { Injectable } from '@angular/core'
import { limit, where } from 'firebase/firestore'
import { Firestore, DocumentSnapshot } from '@angular/fire/firestore'

import { of, switchMap, shareReplay, tap } from 'rxjs'

import { FireCollection } from '@strive/utils/services/collection.service'
import { createNotification, Notification } from '@strive/model'
import { toDate } from '@strive/utils/helpers'
import { PersonalService } from '@strive/user/user/personal.service'

@Injectable({
  providedIn: 'root'
})
export class NotificationService extends FireCollection<Notification> {
  readonly path = `Users/:uid/Notifications`

  hasUnreadNotification$ = this.personal.personal$.pipe(
    switchMap(personal => personal
      ? this.valueChanges([where('createdAt', '>', personal.lastCheckedNotifications), limit(1)], { uid: personal.uid })
      : of(false)
    ),
    shareReplay({ bufferSize: 1, refCount: true })
  )
  
  constructor(db: Firestore, private personal: PersonalService) { 
    super(db)
  }

  protected fromFirestore(snapshot: DocumentSnapshot<Notification>) {
    return snapshot.exists()
      ? createNotification(toDate({ ...snapshot.data(), id: snapshot.id, path: snapshot.ref.path }))
      : undefined
  }
}
