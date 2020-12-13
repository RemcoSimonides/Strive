import { Injectable } from '@angular/core';
// Services
import { AngularFireAuth } from '@angular/fire/auth';
import { FirestoreService } from 'apps/journal/src/app/services/firestore/firestore.service';
// Interfaces
import {
  enumNotificationType,
  Notification,
  PostMeta
} from './notification.firestore';
import { Profile } from '@strive/user/user/+state/user.firestore'

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(
    private afAuth: AngularFireAuth,
    private db: FirestoreService,
  ) { }

  async finalizeDecision(notification: Notification<PostMeta>): Promise<void> {

    // TODO CHECK THIS AGAIN - it's probably incorrect!

    const data = {
      notificationType: enumNotificationType.evidence_finalized,
      supports: notification.meta.supports
    }

    const { uid } = await this.afAuth.currentUser;

    // Update Notification to replace timer and buttons by status
    await this.db.upsert<Notification<PostMeta>>(`Users/${uid}/Notifications/${notification.id}`, data)

  }

  async resetNumberOfUnreadNotifications(): Promise<void> {
    
    const { uid } = await this.afAuth.currentUser;
    await this.db.upsert<Profile>(`Users/${uid}/Profile/${uid}`, {
      numberOfUnreadNotifications: 0
    })
  }

  async upsert(uid: string, notificationId: string, notification: Partial<Notification>) {
    await this.db.upsert(`Users/${uid}/Notifications/${notificationId}`, notification)
  }

  async delete(reference: string): Promise<void> {

    await this.db.doc(reference).delete()

  }
}
