import { Injectable, inject } from '@angular/core'
import { collectionData as _collectionData, collection, Firestore, query, QueryConstraint } from '@angular/fire/firestore'
import { createConverter } from '@strive/utils/firebase'
import { Observable } from 'rxjs'

import { createGoalEvent, GoalEvent } from '@strive/model'

const converter = createConverter<GoalEvent>(createGoalEvent as (data: any) => GoalEvent)

@Injectable({ providedIn: 'root' })
export class GoalEventService {
  private firestore = inject(Firestore)

  collectionData(constraints: QueryConstraint[]): Observable<GoalEvent[]> {
    const colRef = collection(this.firestore, 'GoalEvents').withConverter(converter)
    const q = query(colRef, ...constraints)
    return _collectionData(q)
  }
}
