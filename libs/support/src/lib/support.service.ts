import { Injectable } from '@angular/core'
import { DocumentSnapshot, serverTimestamp, where } from 'firebase/firestore'
import { toDate, FireSubCollection } from 'ngfire'

import { of, switchMap, map, shareReplay } from 'rxjs'

import { AuthService } from '@strive/user/auth/auth.service'

import { createSupportBase, SupportBase } from '@strive/model'

@Injectable({ providedIn: 'root' })
export class SupportService extends FireSubCollection<SupportBase> {
  readonly path = 'Goals/:goalId/Supports'
  override readonly memorize = true

  hasSupportNeedingDecision$ = this.auth.user$.pipe(
    switchMap(user => {
      if (!user) return of(false)
      const query = [where('supporterId', '==', user.uid)]
      return this.valueChanges(query).pipe(
        map(supports => supports.filter(support => support.needsDecision || support.counterNeedsDecision)),
        map(supports => !!supports.length)
      )
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  )

  constructor(private auth: AuthService) {
    super()
  }

  protected override toFirestore(support: SupportBase, actionType: 'add' | 'update'): SupportBase {
    const timestamp = serverTimestamp() as any

    if (actionType === 'add') support.createdAt = timestamp
    support.updatedAt = timestamp

    return support
  }

  protected override fromFirestore(snapshot: DocumentSnapshot<SupportBase>) {
    return (snapshot.exists())
      ? createSupportBase(toDate({ ...snapshot.data(), id: snapshot.id }))
      : undefined
  }
}
