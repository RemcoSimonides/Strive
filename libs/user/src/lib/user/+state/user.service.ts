import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { FirestoreService } from '@strive/utils/services/firestore.service';
// Rxjs
import { Observable, of } from 'rxjs';
import { first, map, switchMap, take, tap } from 'rxjs/operators';
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
    private afAuth: AngularFireAuth,
    private db: FirestoreService
  ) {

    this.user$ = this.afAuth.authState.pipe(
      switchMap(user => user ? db.docWithId$(userPath(user.uid)) : of(null))
    )

    this.profile$ = this.afAuth.authState.pipe(
      switchMap(user => user ? db.docWithId$(profilePath(user.uid)) : of(null))
    )

    this.afAuth.authState.pipe(tap(user => this.uid = !!user ? user.uid : '' )).subscribe()
  }

  get isLoggedIn$() {
    return this.afAuth.authState.pipe(map(user => !!user))
  }

  async getUID(): Promise<string> {
    if (this.uid === undefined) {
      return await new Promise((resolve) => {
        this.afAuth.authState.pipe(take(1)).subscribe(user => resolve(user.uid))
      })
    } else {
      return this.uid
    }
  }

  async getUser(uid: string = this.uid) {
    return this.db.docWithId$<User>(userPath(uid)).pipe(first()).toPromise()
  }

  async getFirebaseUser() {
    return this.afAuth.currentUser
  }

  getProfile$(uid = this.uid) {
    return this.db.docWithId$<Profile>(profilePath(uid))
  }

  async getProfile(uid = this.uid) {
    return this.getProfile$(uid).pipe(first()).toPromise()
  }

  async upsertProfile(profile: Partial<Profile>, uid = this.uid) {
    this.db.upsert<Profile>(`Users/${uid}/Profile/${uid}`, profile);

    const currentUser = await this.afAuth.currentUser
    currentUser.updateProfile({
      displayName: profile.username ?? currentUser.displayName,
      photoURL: profile.photoURL ?? currentUser.photoURL
    })
  }

  createUser(uid: string, email: string) {
    return this.db.upsert(`Users/${uid}`, createUser({ id: uid, email }))
  }

  addFCMToken(token: string) {
    return this.upsertProfile({
      fcmTokens: this.db.getArrayUnion(token)
    })
  }

}
