import { Injectable, OnDestroy } from '@angular/core'
import { DocumentSnapshot, getDoc, getFirestore, doc, serverTimestamp } from 'firebase/firestore'
import { FireAuth } from 'ngfire'
import { toDate } from '@strive/utils/firebase'
import { setUser } from '@sentry/angular'

import { createUser, User } from '@strive/model'

import { distinctUntilChanged, map } from 'rxjs/operators'
import { BehaviorSubject, firstValueFrom } from 'rxjs'

@Injectable({ providedIn: 'root' })
export class AuthService extends FireAuth<User> implements OnDestroy {
  protected override readonly path = 'Users'
  protected override readonly idKey = 'uid'

  profile?: User
  uid: string | undefined = undefined
  private _uid$ = new BehaviorSubject<string | undefined>(undefined)
  uid$ = this._uid$.pipe(distinctUntilChanged())

  isLoggedIn$ = this.user$.pipe(map(user => !!user))

  private sub = this.profile$.subscribe(profile => {
    this.profile = createUser(profile)
    this.uid = profile ? profile.uid : ''
    this._uid$.next(this.uid)
    if (profile) {
      setUser({ id: profile.uid, username: profile.username })
    } else {
      setUser(null)
    }
  })

  ngOnDestroy() {
    this.sub.unsubscribe()
  }

  protected override toFirestore(profile: Partial<User>, actionType: 'add' | 'update') {
    const timestamp = serverTimestamp() as any

    if (actionType === 'add') profile.createdAt = timestamp
    profile.updatedAt = timestamp

    return profile
  }

  protected override fromFirestore(snapshot: DocumentSnapshot<User>) {
    return snapshot.exists()
      ? createUser(toDate({ ...snapshot.data(), [this.idKey]: snapshot.id }))
      : createUser()
  }

  async getUID(): Promise<string> {
    if (this.uid === undefined) {
      return firstValueFrom(this.user$).then(user => user?.uid ?? '')
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
