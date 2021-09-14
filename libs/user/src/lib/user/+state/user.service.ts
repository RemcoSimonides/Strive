import { Injectable } from '@angular/core';
import { Auth, user, updateProfile } from '@angular/fire/auth';
import { arrayUnion } from '@angular/fire/firestore';
import { FirestoreService } from '@strive/utils/services/firestore.service';
// Rxjs
import { Observable, of } from 'rxjs';
import { distinctUntilChanged, first, map, switchMap, take, tap } from 'rxjs/operators';
// Interfaces
import { createUser, Profile, User } from './user.firestore';

const userPath = (uid: string) => `Users/${uid}`
const profilePath = (uid: string) => `Users/${uid}/Profile/${uid}`

@Injectable({ providedIn: 'root' })
export class UserService {

  user$: Observable<User>
  profile$: Observable<Profile>
  uid: string = undefined

  constructor(
    private auth: Auth,
    private db: FirestoreService
  ) {

    this.user$ = user(this.auth).pipe(
      switchMap(user => user ? db.docWithId$(userPath(user.uid)) : of (null))
    )

    this.profile$ = user(this.auth).pipe(
      switchMap(user => user ? db.docWithId$(profilePath(user.uid)) : of(null)),
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
    )

    user(this.auth).pipe(tap(user => this.uid = !!user ? user.uid : '' )).subscribe()
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

  async getUser(uid: string = this.uid) {
    return this.db.docWithId$<User>(userPath(uid)).pipe(first()).toPromise()
  }

  async getFirebaseUser() {
    return await user(this.auth).pipe(take(1)).toPromise();
  }

  getProfile$(uid = this.uid) {
    return this.db.docWithId$<Profile>(profilePath(uid))
  }

  async getProfile(uid = this.uid) {
    return this.getProfile$(uid).pipe(first()).toPromise()
  }

  async upsertProfile(profile: Partial<Profile>, uid = this.uid) {
    this.db.upsert<Profile>(`Users/${uid}/Profile/${uid}`, profile);
    const _user = await this.getFirebaseUser()

    if (profile.username || profile.photoURL) {
      // should be this.auth insted of _user?
      updateProfile(_user, {
        displayName: profile.username ?? _user.displayName,
        photoURL: profile.photoURL ?? _user.photoURL
      })
    }
  }

  createUser(uid: string, email: string) {
    const user = createUser({ id: uid, email });
    return this.db.set(`Users/${uid}`, user);
  }

  addFCMToken(token: string) {
    return this.upsertProfile({
      fcmTokens: arrayUnion(token) as any
    })
  }

}
