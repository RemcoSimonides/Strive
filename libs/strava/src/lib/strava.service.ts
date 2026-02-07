import { Injectable, inject } from '@angular/core'
import { collectionData as _collectionData, collection, doc, Firestore, query, QueryConstraint, setDoc } from '@angular/fire/firestore'
import { createConverter } from '@strive/utils/firebase'
import { Observable } from 'rxjs'

import { StravaIntegration, createStravaIntegration } from '@strive/model'

const converter = createConverter<StravaIntegration>(createStravaIntegration)

@Injectable({ providedIn: 'root' })
export class StravaService {
  private firestore = inject(Firestore)

  collectionData(constraints: QueryConstraint[]): Observable<StravaIntegration[]> {
    const colRef = collection(this.firestore, 'Strava').withConverter(converter)
    const q = query(colRef, ...constraints)
    return _collectionData(q, { idField: 'id' })
  }

  update(id: string, data: Partial<StravaIntegration>) {
    const docRef = doc(this.firestore, `Strava/${id}`).withConverter(converter)
    return setDoc(docRef, data, { merge: true })
  }
}
