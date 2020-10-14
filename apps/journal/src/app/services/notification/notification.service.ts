import { Injectable } from '@angular/core';
// Services
import { AngularFireAuth } from '@angular/fire/auth';
import { FirestoreService } from '../firestore/firestore.service';
// Interfaces
import {
  enumNotificationType,
  INotificationWithPostAndSupports,
  INotification
} from '@strive/interfaces';
import { Profile } from '@strive/user/user/+state/user.firestore'

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(
    private afAuth: AngularFireAuth,
    private db: FirestoreService,
  ) { }

  async finalizeDecision(notification: INotificationWithPostAndSupports): Promise<void> {

    const data = {
      notificationType: enumNotificationType.evidence_finalized,
      supports: notification.supports
    }

    const { uid } = await this.afAuth.currentUser;

    // Update Notification to replace timer and buttons by status
    await this.db.upsert<INotificationWithPostAndSupports>(`Users/${uid}/Notifications/${notification.id}`, data)

  }

  async resetNumberOfUnreadNotifications(): Promise<void> {
    
    const { uid } = await this.afAuth.currentUser;
    await this.db.upsert<Profile>(`Users/${uid}/Profile/${uid}`, {
      numberOfUnreadNotifications: 0
    })
  }

  async upsert(uid: string, notificationId: string, notification: Partial<INotification>): Promise<void> {
    await this.db.upsert(`Users/${uid}/Notifications/${notificationId}`, notification)
  }

  async delete(reference: string): Promise<void> {

    await this.db.doc(reference).delete()

  }
}
