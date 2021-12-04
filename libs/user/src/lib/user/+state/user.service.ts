import { Injectable } from '@angular/core';
import { Auth, user } from '@angular/fire/auth';
import { arrayUnion, doc, DocumentSnapshot, Firestore, getDoc } from '@angular/fire/firestore';
import { FireCollection } from '@strive/utils/services/collection.service';
// Rxjs
import { Observable, of } from 'rxjs';
import { distinctUntilChanged, map, switchMap, take, tap } from 'rxjs/operators';
import { ProfileService } from './profile.service';
// Interfaces
import { Profile, User } from './user.firestore';

@Injectable({ providedIn: 'root' })
export class UserService extends FireCollection<User> {
  readonly path = 'Users'
  readonly idKey = 'uid'

  user$: Observable<User>
  profile$: Observable<Profile>
  uid: string = undefined

  constructor(db: Firestore, private auth: Auth, private profile: ProfileService) {
    super(db)

    this.user$ = user(this.auth).pipe(
      switchMap(user => user ? this.valueChanges(user.uid) : of(null))
    )

    this.profile$ = user(this.auth).pipe(
      switchMap(user => user ? this.profile.valueChanges(user.uid, { uid: user.uid }) : of(null)),
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
    )

    user(this.auth).pipe(
      tap(user => this.uid = !!user ? user.uid : '' )
    ).subscribe()
  }

  protected fromFirestore(snapshot: DocumentSnapshot<User>) {
    return snapshot.exists()
      ? { ...snapshot.data(), uid: snapshot.id }
      : undefined
  }

  get isLoggedIn$() {
    return user(this.auth).pipe(map(user => !!user))
  }

  async getUID(): Promise<string> {
    if (this.uid === undefined) {
      return await new Promise((resolve) => {
        user(this.auth).pipe(take(1)).subscribe(user => resolve(user.uid))
      })
    } else {
      return this.uid
    }
  }

  async getFirebaseUser() {
    return await user(this.auth).pipe(take(1)).toPromise();
  }

  async isStriveAdmin(uid: string) {
    const snap = await getDoc(doc(this.db, `striveAdmin/${uid}`))
    return snap.exists()
  }

  upsertProfile(profile: Partial<Profile>, uid = this.uid) {
    return this.profile.upsert({ ...profile, uid }, { params: { uid }})
  }

  addFCMToken(token: string) {
    // TODO move FCMtokens to User doc
    if (token) {
      this.profile.upsert({
        uid: this.uid,
        fcmTokens: arrayUnion(token) as any
      }, { params: { uid: this.uid }})
    }
  }

}
