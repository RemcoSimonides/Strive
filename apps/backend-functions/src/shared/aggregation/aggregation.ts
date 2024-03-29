import { Aggregation, AggregationKey, createAggregation } from '@strive/model'
import { db, increment } from '@strive/api/firebase'

export function updateAggregation(aggregation: Partial<Aggregation>) {
    const agg = createAggregation(aggregation)
    const result = {}

    for (const [k, d] of Object.entries(agg)) {
        const key = k as AggregationKey
        const delta = d as number
        if (d === 0) continue
        result[key] = increment(delta)
    }

    if (Object.keys(result).length === 0) return
    db.doc(`miscellaneous/aggregation`).update(result)
}