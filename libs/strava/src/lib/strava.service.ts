import { Injectable, Injector, inject } from '@angular/core'
import { Firestore, setDoc } from '@angular/fire/firestore'
import { collection, doc, query, QueryConstraint } from 'firebase/firestore'
import { createConverter, collectionData } from '@strive/utils/firebase'
import { Observable } from 'rxjs'

import { StravaIntegration, createStravaIntegration } from '@strive/model'

const converter = createConverter<StravaIntegration>(createStravaIntegration)

@Injectable({ providedIn: 'root' })
export class StravaService {
  private firestore = inject(Firestore)
  private injector = inject(Injector)

  collectionData(constraints: QueryConstraint[]): Observable<StravaIntegration[]> {
    const colRef = collection(this.firestore, 'Strava').withConverter(converter)
    const q = query(colRef, ...constraints)
    return collectionData(this.injector, q, { idField: 'id' })
  }

  update(id: string, data: Partial<StravaIntegration>) {
    const docRef = doc(this.firestore, `Strava/${id}`).withConverter(converter)
    return setDoc(docRef, data, { merge: true })
  }
}
