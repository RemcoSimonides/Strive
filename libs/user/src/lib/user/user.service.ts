import { Injectable } from '@angular/core'
import { DocumentSnapshot, getDoc, getFirestore, doc } from 'firebase/firestore'
import { getAuth, updateProfile } from 'firebase/auth'
import { setUser } from '@sentry/angular'
import { user } from 'rxfire/auth'
import { toDate } from 'ngfire'

import { FireCollection } from '@strive/utils/services/collection.service'

import { createUser, User } from '@strive/model';

import { map, switchMap, take, tap } from 'rxjs/operators'
import { BehaviorSubject, Observable, of, shareReplay } from 'rxjs'

@Injectable({ providedIn: 'root' })
export class UserService extends FireCollection<User> {
  readonly path = 'Users'
  override readonly idKey = 'uid'

  user$: Observable<User | undefined>
  user?: User
  uid: string | undefined = undefined
  private _uid = new BehaviorSubject<string | undefined>(undefined)
  uid$ = this._uid.asObservable()

  isLoggedIn$ = user(getAuth()).pipe(map(user => !!user))

  constructor() {
    super(getFirestore())

    this.user$ = user(getAuth()).pipe(
      switchMap(user => user ? this.valueChanges(user.uid) : of(undefined)),
      tap(user => {
        this.user = createUser(user)
        this.uid = user ? user.uid : ''
        this._uid.next(this.uid)
        user ? setUser({ id: user.uid, username: user.username }) : setUser(null)
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    )

    this.user$.subscribe()
  }

  protected override fromFirestore(snapshot: DocumentSnapshot<User>) {
    return snapshot.exists()
      ? createUser(toDate({ ...snapshot.data(), uid: snapshot.id }))
      : undefined
  }

  override async onUpdate(profile: User) {
    const _user = await user(getAuth()).pipe(take(1)).toPromise()
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
        user(getAuth()).pipe(take(1)).subscribe(user =>resolve(user?.uid ?? ''))
      })
    } else {
      return this.uid
    }
  }

  async isStriveAdmin(uid: string) {
    const ref = doc(getFirestore(), `striveAdmin/${uid}`)
    const snap = await getDoc(ref)
    return snap.exists()
  }
}
