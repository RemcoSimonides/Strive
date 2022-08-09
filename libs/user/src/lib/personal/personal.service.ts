import { Injectable } from '@angular/core';
import { arrayUnion, DocumentSnapshot, Firestore, serverTimestamp } from '@angular/fire/firestore';
import { Auth, user } from '@angular/fire/auth';
// Services
import { FireCollection } from '@strive/utils/services/collection.service';
import { UserService } from '../user/user.service';
// Interfaces
import { Personal } from '@strive/model';
import { Observable, of, switchMap, shareReplay } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PersonalService extends FireCollection<Personal> {
  readonly path = 'Users/:uid/Personal'
  override readonly idKey = 'uid'

  personal$: Observable<Personal | undefined> = user(this.auth).pipe(
    switchMap(user => user ? this.valueChanges(user.uid, { uid: user.uid }) : of(undefined)),
    shareReplay({ bufferSize: 1, refCount: true })
  )

  constructor(db: Firestore, private auth: Auth, private userService: UserService) {
    super(db)
  }

  protected override fromFirestore(snapshot: DocumentSnapshot<Personal>) {
    return snapshot.exists()
      ? { ...snapshot.data(), uid: snapshot.id }
      : undefined
  }

  updateLastCheckedNotification() {
    if (this.userService.uid) {
      this.update(this.userService.uid, {
        lastCheckedNotifications: serverTimestamp() as any
      }, { params: { uid: this.userService.uid }})
    }
  }

  addFCMToken(token: string) {
    if (token && this.userService.uid) {
      this.update(this.userService.uid, {
        fcmTokens: arrayUnion(token) as any
      }, { params: { uid: this.userService.uid }})
    }
  }
}
