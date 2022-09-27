import { Injectable } from '@angular/core'
import { FireDocument } from 'ngfire'

import { Aggregation } from '@strive/model'

@Injectable({providedIn: 'root'})
export class AggregationService extends FireDocument<Aggregation> {
  readonly path = 'miscellaneous/aggregation'
  override readonly memorize = true
}