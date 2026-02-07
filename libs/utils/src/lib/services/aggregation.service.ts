import { Injectable, Injector, inject } from '@angular/core'
import { Firestore } from '@angular/fire/firestore'
import { doc } from 'firebase/firestore'
import { createConverter, docData } from '@strive/utils/firebase'
import { Observable } from 'rxjs'

import { Aggregation, createAggregation } from '@strive/model'

const converter = createConverter<Aggregation>(createAggregation)

@Injectable({providedIn: 'root'})
export class AggregationService {
  private firestore = inject(Firestore)
  private injector = inject(Injector)

  valueChanges(): Observable<Aggregation | undefined> {
    const docRef = doc(this.firestore, 'miscellaneous/aggregation').withConverter(converter)
    return docData(this.injector, docRef)
  }
}