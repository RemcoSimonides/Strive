import { Injectable } from '@angular/core'
import { DocumentSnapshot, Firestore } from '@angular/fire/firestore'
// Services
import { FireCollection } from '@strive/utils/services/collection.service'
// Interfaces
import { createSupport, Support } from '@strive/model'
import { UserService } from '@strive/user/user/user.service'
import { of, switchMap, map, shareReplay } from 'rxjs'
import { limit, where } from 'firebase/firestore'
import { toDate } from '@strive/utils/helpers'

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

  constructor(protected db: Firestore, private user: UserService) {
    super(db)
  }

  protected fromFirestore(snapshot: DocumentSnapshot<Support>) {
    return (snapshot.exists())
      ? createSupport(toDate({ ...snapshot.data(), id: snapshot.id }))
      : undefined
  }
}
