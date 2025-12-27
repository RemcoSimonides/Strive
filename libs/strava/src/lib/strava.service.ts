import { Injectable } from '@angular/core'
import { DocumentSnapshot, serverTimestamp } from 'firebase/firestore'
import { FireCollection } from 'ngfire'
import { toDate } from '@strive/utils/firebase'

import { StravaIntegration, createStravaIntegration } from '@strive/model'

@Injectable({ providedIn: 'root' })
export class StravaService extends FireCollection<StravaIntegration> {
  readonly path = 'Strava'
  override readonly memorize = true

  protected override toFirestore(item: StravaIntegration, actionType: 'add' | 'update'): StravaIntegration {
    const timestamp = serverTimestamp() as any

    if (actionType === 'add') item.createdAt = timestamp
    item.updatedAt = timestamp

    return item
  }

  protected override fromFirestore(snapshot: DocumentSnapshot<StravaIntegration>) {
    return snapshot.exists()
      ? createStravaIntegration(toDate<StravaIntegration>({ ...snapshot.data(), [this.idKey]: snapshot.id }))
      : undefined
  }
}
