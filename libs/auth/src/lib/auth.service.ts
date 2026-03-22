import { inject, Injectable, OnDestroy, signal } from '@angular/core'
import { doc, getDoc } from 'firebase/firestore'
import { User } from 'firebase/auth'
import { FIRESTORE, AUTH } from '@strive/utils/firebase-init'
import { createConverter, docData } from '@strive/utils/firebase'

import { createUser, User as StriveUser } from '@strive/model'

import { shareReplay, switchMap } from 'rxjs/operators'
import { of, ReplaySubject } from 'rxjs'

const converter = createConverter<StriveUser>(createUser, 'uid')

@Injectable({ providedIn: 'root' })
export class AuthService implements OnDestroy {
  private _auth = inject(AUTH)
  private firestore = inject(FIRESTORE)

  user = signal<User | null>(this._auth.currentUser)
  private _user$ = new ReplaySubject<User | null>(1)
  user$ = this._user$.asObservable()

  uid = signal<string | undefined>(this._auth.currentUser?.uid)
  private _uid$ = new ReplaySubject<string | undefined>(1)
  uid$ = this._uid$.asObservable()

  isLoggedIn = signal<boolean | undefined>(undefined)

  profile = signal<StriveUser | undefined>(undefined)
  profile$ = this.uid$.pipe(
    switchMap(uid => {
      if (uid) {
        const profileRef = doc(this.firestore, `Users/${uid}`).withConverter(converter)
        return docData(profileRef)
      } else {
        return of(undefined)
      }
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  )

  private authStateChangeUnsubscribe = this._auth.onAuthStateChanged((user) => {
    this.isLoggedIn.set(!!user)
    this.user.set(user)
    this._user$.next(user)
    this.uid.set(user?.uid)
    this._uid$.next(user?.uid)
  })

  ngOnDestroy() {
    this.authStateChangeUnsubscribe()
  }

  authStateReady(): Promise<void> {
    return this._auth.authStateReady()
  }

  async getUID(): Promise<string> {
    await this._auth.authStateReady()
    return this._auth.currentUser ? this._auth.currentUser.uid : '';
  }

  async getUser(): Promise<User | null> {
    await this._auth.authStateReady()
    return this._auth.currentUser
  }

  signout() {
    return this._auth.signOut()
  }

  async isStriveAdmin(uid: string) {
    const ref = doc(this.firestore, `striveAdmin/${uid}`)
    const snap = await getDoc(ref)
    return snap.exists()
  }
}
