import { Injectable } from '@angular/core';
// Interfaces
import { Notification } from './notification.firestore';
import { FireCollection } from '@strive/utils/services/collection.service';
import { Firestore, DocumentSnapshot } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class GoalNotificationService extends FireCollection<Notification> {
  readonly path = `Goals/:goalId/Notifications`
  
  constructor(db: Firestore) { 
    super(db)
  }

  protected fromFirestore(snapshot: DocumentSnapshot<Notification>) {
    return snapshot.exists()
      ? { ...snapshot.data(), id: snapshot.id, path: snapshot.ref.path }
      : undefined
  }

}
