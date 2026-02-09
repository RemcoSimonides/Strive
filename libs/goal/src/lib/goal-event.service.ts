import { Injectable, inject } from '@angular/core'
import { FIRESTORE } from '@strive/utils/firebase-init'
import { collection, query, QueryConstraint } from 'firebase/firestore'
import { collectionData, createConverter } from '@strive/utils/firebase'
import { Observable } from 'rxjs'

import { createGoalEvent, GoalEvent } from '@strive/model'

const converter = createConverter<GoalEvent>(createGoalEvent as (data: any) => GoalEvent)

@Injectable({ providedIn: 'root' })
export class GoalEventService {
  private firestore = inject(FIRESTORE)

  collectionData(constraints: QueryConstraint[]): Observable<GoalEvent[]> {
    const colRef = collection(this.firestore, 'GoalEvents').withConverter(converter)
    const q = query(colRef, ...constraints)
    return collectionData(q)
  }
}
