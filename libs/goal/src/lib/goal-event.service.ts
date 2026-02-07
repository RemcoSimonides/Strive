import { Injectable, Injector, inject } from '@angular/core'
import { Firestore } from '@angular/fire/firestore'
import { collection, query, QueryConstraint } from 'firebase/firestore'
import { collectionData, createConverter } from '@strive/utils/firebase'
import { Observable } from 'rxjs'

import { createGoalEvent, GoalEvent } from '@strive/model'

const converter = createConverter<GoalEvent>(createGoalEvent as (data: any) => GoalEvent)

@Injectable({ providedIn: 'root' })
export class GoalEventService {
  private firestore = inject(Firestore)
  private injector = inject(Injector)

  collectionData(constraints: QueryConstraint[]): Observable<GoalEvent[]> {
    const colRef = collection(this.firestore, 'GoalEvents').withConverter(converter)
    const q = query(colRef, ...constraints)
    return collectionData(this.injector, q)
  }
}
