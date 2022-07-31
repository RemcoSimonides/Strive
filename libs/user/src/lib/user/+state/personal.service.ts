import { Injectable } from '@angular/core';
import { arrayUnion, DocumentSnapshot, Firestore, serverTimestamp } from '@angular/fire/firestore';
// Services
import { FireCollection } from '@strive/utils/services/collection.service';
import { UserService } from './user.service';
// Interfaces
import { Personal } from './user.firestore';

@Injectable({ providedIn: 'root' })
export class PersonalService extends FireCollection<Personal> {
  readonly path = 'Users/:uid/Personal'
  readonly idKey = 'uid'

  constructor(db: Firestore, private user: UserService) {
    super(db)
  }

  protected fromFirestore(snapshot: DocumentSnapshot<Personal>) {
    return snapshot.exists()
      ? { ...snapshot.data(), uid: snapshot.id }
      : undefined
  }

  updateLastCheckedNotification() {
    if (this.user.uid) {
      this.update(this.user.uid, {
        lastCheckedNotifications: serverTimestamp() as any
      }, { params: { uid: this.user.uid }})
    }
  }

  addFCMToken(token: string) {
    if (token && this.user.uid) {
      this.update(this.user.uid, {
        fcmTokens: arrayUnion(token) as any
      }, { params: { uid: this.user.uid }})
    }
  }
}
