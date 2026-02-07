import { inject, Injectable, OnDestroy, signal } from '@angular/core'
import { getDoc, docSnapshots } from '@angular/fire/firestore'
import { getFirestore, doc, serverTimestamp, WithFieldValue, FirestoreDataConverter, DocumentData, QueryDocumentSnapshot, SnapshotOptions } from 'firebase/firestore'
import { toDate } from '@strive/utils/firebase'
import { toObservable } from '@angular/core/rxjs-interop';

import { createUser, User as StriveUser } from '@strive/model'

import { distinctUntilChanged, map, switchMap, tap } from 'rxjs/operators'
import { Auth, User } from '@angular/fire/auth'

const converter: FirestoreDataConverter<StriveUser> = {
  toFirestore: (profile: WithFieldValue<StriveUser>) => {
    const actionType = profile.uid ? 'update' : 'add'
    const timestamp = serverTimestamp()

    const data: DocumentData = { ...profile }

    if (actionType === 'add') {
      data['createdAt'] = timestamp
    }
    data['updatedAt'] = timestamp

    delete data['uid']

    return data
  },

  fromFirestore: (snapshot: QueryDocumentSnapshot, options: SnapshotOptions): StriveUser => {
    const data = snapshot.data(options) as StriveUser

    return snapshot.exists()
      ? createUser(toDate<StriveUser>({ ...data, uid: snapshot.id }))
      : createUser()
  },
};

@Injectable({ providedIn: 'root' })
export class AuthService implements OnDestroy {
  private _auth = inject(Auth)

  user = signal<User | null>(this._auth.currentUser)
  user$ = toObservable(this.user).pipe(distinctUntilChanged())
  uid = signal<string | undefined>(this._auth.currentUser ? this._auth.currentUser.uid : undefined)
  uid$ = toObservable(this.uid).pipe(distinctUntilChanged())
  isLoggedIn = signal<boolean | undefined>(undefined)

  profile = signal<StriveUser | undefined>(undefined)
  profile$ = toObservable(this.uid).pipe(
    switchMap(uid => {
      console.log('UID changed:', this.uid())
      if (uid) {
        const profileRef = doc(getFirestore(), `Users/${uid}`).withConverter(converter)
        console.log('going to setup profile obs')
        return docSnapshots(profileRef).pipe(
          map(snap => snap.exists() ? snap.data() : undefined),
          tap(console.log)
        )
      } else {
        return [undefined]
      }
    })
  )

  // private _uid$ = new BehaviorSubject<string | undefined>(undefined)
  // uid$ = this._uid$.pipe(distinctUntilChanged())


  // private sub = this.profile$.subscribe(profile => {
  //   this.profile = createUser(profile)
  //   this.uid = profile ? profile.uid : ''
  //   this._uid$.next(this.uid)
  //   if (profile) {
  //     setUser({ id: profile.uid, username: profile.username })
  //   } else {
  //     setUser(null)
  //   }
  // })

  // private sub = computed(() => this.user()).subscribe(user => {
  //   this.profile = user ? createUser({ uid: user.uid, email: user.email || undefined }) : undefined
  //   this.uid.set(user ? user.uid : null)
  //   this._uid$.next(this.uid())
  //   if (user) {
  //     setUser({ id: user.uid, username: user.displayName || user.email || undefined })
  //   } else {
  //     setUser(null)
  //   }
  // })

  private authStateChangeUnsubscribe = this._auth.onAuthStateChanged((user) => {
    this.isLoggedIn.set(!!user)
    this.user.set(user)
    this.uid.set(user ? user.uid : undefined)
  })

  constructor() {
    this._auth.authStateReady().then(() => {
      this.isLoggedIn.set(!!this._auth.currentUser)
      this.user.set(this._auth.currentUser)
      this.uid.set(this._auth.currentUser ? this._auth.currentUser.uid : undefined)
    })
  }

  // constructor() {
    // toObservable(this.uid)

    // effect((onCleanup) => {
    //   const uid = this.uid()
    //   if (uid) {
    //     const profileRef = doc(getFirestore(), `users/${uid}`).withConverter(striveUserConverter)
    //     docSnapshots(profileRef).pipe()

    //     const unsub = onSnapshot(profileRef, (snap: DocumentSnapshot<StriveUser>) => {
    //       const profileData = snap.exists() ? snap.data() : undefined
    //       this.profile.set(profileData)
    //       this.profile$.next(profileData)
    //     })

    //     onCleanup(() => {
    //       unsub()
    //     })
    //   } else {
    //     this.profile$.next(undefined)
    //   }
    // })
  // }

  ngOnDestroy() {
    // this.sub.unsubscribe()
    this.authStateChangeUnsubscribe()
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
    const ref = doc(getFirestore(), `striveAdmin/${uid}`)
    const snap = await getDoc(ref)
    return snap.exists()
  }
}
