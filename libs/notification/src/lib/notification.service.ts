import { Injectable } from '@angular/core';
// Interfaces
import { createNotification, Notification } from '@strive/model';
import { FireCollection } from '@strive/utils/services/collection.service';
import { Firestore, DocumentSnapshot } from '@angular/fire/firestore';
import { toDate } from '@strive/utils/helpers';

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
