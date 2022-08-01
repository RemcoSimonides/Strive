import { Injectable } from '@angular/core';
import { Auth, updateProfile, user } from '@angular/fire/auth';
import { doc, DocumentSnapshot, Firestore, getDoc } from '@angular/fire/firestore';
// Services
import { FireCollection } from '@strive/utils/services/collection.service';
// Interfaces
import { createUser, User } from '@strive/model';
// Rxjs
import { map, switchMap, take, tap } from 'rxjs/operators';
import { BehaviorSubject, Observable, of, shareReplay } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService extends FireCollection<User> {
  readonly path = 'Users'
  readonly idKey = 'uid'

  user$: Observable<User>
  user: User
  uid: string = undefined
  private _uid = new BehaviorSubject(undefined)
  uid$ = this._uid.asObservable()

  isLoggedIn$ = user(this.auth).pipe(map(user => !!user))

  constructor(db: Firestore, private auth: Auth) {
    super(db)

    this.user$ = user(this.auth).pipe(
      switchMap(user => user ? this.valueChanges(user.uid) : of(undefined)),
      tap(user => {
        this.user = createUser(user)
        this.uid = user ? user.uid : ''
        this._uid.next(this.uid)
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    )

    this.user$.subscribe()
  }

  protected fromFirestore(snapshot: DocumentSnapshot<User>) {
    return snapshot.exists()
      ? { ...snapshot.data(), uid: snapshot.id }
      : undefined
  }

  async onUpdate(profile: User) {
    const _user = await user(this.auth).pipe(take(1)).toPromise()
    if (_user && (profile.username || profile.photoURL)) {
      updateProfile(_user, {
        displayName: profile.username ?? _user.displayName,
        photoURL: profile.photoURL ?? _user.photoURL
      })
    }
  }

  async getUID(): Promise<string> {
    if (this.uid === undefined) {
      return await new Promise((resolve) => {
        user(this.auth).pipe(take(1)).subscribe(user =>resolve(user?.uid ?? ''))
      })
    } else {
      return this.uid
    }
  }

  async isStriveAdmin(uid: string) {
    const snap = await getDoc(doc(this.db, `striveAdmin/${uid}`))
    return snap.exists()
  }
}
