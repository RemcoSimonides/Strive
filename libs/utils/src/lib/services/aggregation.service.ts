import { Injectable, inject } from '@angular/core'
import { Firestore, docData as _docData } from '@angular/fire/firestore'
import { doc } from 'firebase/firestore'
import { createConverter } from '@strive/utils/firebase'
import { Observable } from 'rxjs'

import { Aggregation, createAggregation } from '@strive/model'

const converter = createConverter<Aggregation>(createAggregation)

@Injectable({providedIn: 'root'})
export class AggregationService {
  private firestore = inject(Firestore)

  valueChanges(): Observable<Aggregation | undefined> {
    const docRef = doc(this.firestore, 'miscellaneous/aggregation').withConverter(converter)
    return _docData(docRef)
  }
}