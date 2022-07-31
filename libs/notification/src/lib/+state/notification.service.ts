import { Injectable } from '@angular/core';
// Interfaces
import { Notification } from './notification.firestore';
import { FireCollection } from '@strive/utils/services/collection.service';
import { Firestore, DocumentSnapshot } from '@angular/fire/firestore';
import { toDate } from '@strive/utils/helpers';
import { createNotification } from './notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService extends FireCollection<Notification> {
  readonly path = `Users/:uid/Notifications`
  
  constructor(db: Firestore) { 
    super(db)
  }

  protected fromFirestore(snapshot: DocumentSnapshot<Notification>) {
    return snapshot.exists()
      ? createNotification(toDate({ ...snapshot.data(), id: snapshot.id, path: snapshot.ref.path }))
      : undefined
  }
}
