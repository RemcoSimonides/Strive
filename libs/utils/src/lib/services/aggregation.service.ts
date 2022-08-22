import { Injectable } from '@angular/core'
import { getFirestore } from 'firebase/firestore'
import { FireCollection } from '@strive/utils/services/collection.service'

import { Aggregation } from '@strive/model'

@Injectable({providedIn: 'root'})
export class AggregationService extends FireCollection<Aggregation> {
  readonly path = 'miscellaneous'

  constructor() {
    super(getFirestore())
  }

  getAggregation$() {
    return this.valueChanges('aggregation')
  }

  getAggregation() {
    return this.getValue('aggregation')
  }
}