import { Injectable } from '@angular/core'
import { DocumentSnapshot, limit, where } from 'firebase/firestore'
import { toDate, FireSubCollection } from 'ngfire'

import { of, switchMap, map, shareReplay } from 'rxjs'

import { AuthService } from '@strive/user/auth/auth.service'

import { createSupportBase, SupportBase } from '@strive/model'

@Injectable({ providedIn: 'root' })
export class SupportService extends FireSubCollection<SupportBase> {
  readonly path = 'Goals/:goalId/Supports'

  hasSupportNeedingDecision$ = this.auth.user$.pipe(
    switchMap(user => {
      if (!user) return of(false)
      const query = [
        where('supporterId', '==', user.uid),
        where('needsDecision', '!=', false),
        limit(1)
      ]
      return this.valueChanges(query).pipe(map(supports => !!supports.length))
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  )

  constructor(private auth: AuthService) {
    super()
  }

  protected override fromFirestore(snapshot: DocumentSnapshot<SupportBase>) {
    return (snapshot.exists())
      ? createSupportBase(toDate({ ...snapshot.data(), id: snapshot.id }))
      : undefined
  }
}
