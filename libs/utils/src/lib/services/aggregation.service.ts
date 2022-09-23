import { Injectable } from '@angular/core'
import { FireCollection } from 'ngfire'

import { Aggregation } from '@strive/model'

@Injectable({providedIn: 'root'})
export class AggregationService extends FireCollection<Aggregation> {
  readonly path = 'miscellaneous'

  getAggregation$() {
    return this.valueChanges('aggregation')
  }

  getAggregation() {
    return this.getValue('aggregation')
  }
}