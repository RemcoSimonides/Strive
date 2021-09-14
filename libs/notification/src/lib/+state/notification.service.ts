import { Injectable } from '@angular/core';
// Interfaces
import {
  Notification,
  SupportDecisionMeta
} from './notification.firestore';
import { FireCollection } from '@strive/utils/services/collection.service';
import { Firestore, DocumentSnapshot } from '@angular/fire/firestore';
import { UserService } from '@strive/user/user/+state/user.service';
import { createSupportDecisionMeta } from './notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService extends FireCollection<Notification> {
  readonly path = `Users/:uid/Notifications`
  
  constructor(
    private user: UserService,
    db: Firestore
  ) { 
    super(db)
  }

  protected fromFirestore(snapshot: DocumentSnapshot<Notification>) {
    return snapshot.exists
      ? { ...snapshot.data(), id: snapshot.id, path: snapshot.ref.path }
      : undefined
  }

  finalizeDecision(notification: Notification<SupportDecisionMeta>) {

    // TODO CHECK THIS AGAIN - it's probably incorrect!

    const meta = createSupportDecisionMeta({
      status: 'finalized',
      supports: notification.meta.supports
    })

    // Update Notification to replace timer and buttons by status
    return this.upsert({ id: notification.id, needsDecision: false, meta }, { params: { uid: this.user.uid }});
  }

}
