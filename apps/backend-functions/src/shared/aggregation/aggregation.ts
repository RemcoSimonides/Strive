import { Aggregation, AggregationKey, createAggregation } from '@strive/model';
import { db, increment, logger } from '../../internals/firebase'

export function updateAggregation(aggregation: Partial<Aggregation>) {
    const agg = createAggregation(aggregation)
    const result = {}

    for (const [k, d] of Object.entries(agg)) {
        const key = k as AggregationKey
        const delta = d as -1 | 0 | 1
        if (d === 0) continue
        result[key] = increment(delta)
    }

    logger.log('result: ', result)
    db.doc(`miscellaneous/aggregation`).update(result)
}