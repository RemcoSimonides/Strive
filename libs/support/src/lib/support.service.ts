import { Injectable } from '@angular/core'
import { DocumentSnapshot, getFirestore, limit, where } from 'firebase/firestore'
import { toDate } from 'ngfire'

import { of, switchMap, map, shareReplay } from 'rxjs'

import { FireCollection } from '@strive/utils/services/collection.service'
import { UserService } from '@strive/user/user/user.service'

import { createSupport, Support } from '@strive/model'

@Injectable({ providedIn: 'root' })
export class SupportService extends FireCollection<Support> {
  readonly path = 'Goals/:goalId/Supports'

  hasSupportNeedingDecision$ = this.user.user$.pipe(
    switchMap(user => {
      if (!user) return of(false)
      const query = [
        where('source.supporter.uid', '==', user.uid),
        where('needsDecision', '!=', false),
        limit(1)
      ]
      return this.groupChanges(query).pipe(map(supports => !!supports.length))
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  )

  constructor(private user: UserService) {
    super(getFirestore())
  }

  protected override fromFirestore(snapshot: DocumentSnapshot<Support>) {
    return (snapshot.exists())
      ? createSupport(toDate({ ...snapshot.data(), id: snapshot.id }))
      : undefined
  }
}
