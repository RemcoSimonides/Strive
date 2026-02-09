import { Injectable, inject } from '@angular/core'
import { FIRESTORE } from '@strive/utils/firebase-init'
import { doc } from 'firebase/firestore'
import { createConverter, docData } from '@strive/utils/firebase'
import { Observable } from 'rxjs'

import { Aggregation, createAggregation } from '@strive/model'

const converter = createConverter<Aggregation>(createAggregation)

@Injectable({providedIn: 'root'})
export class AggregationService {
  private firestore = inject(FIRESTORE)

  valueChanges(): Observable<Aggregation | undefined> {
    const docRef = doc(this.firestore, 'miscellaneous/aggregation').withConverter(converter)
    return docData(docRef)
  }
}