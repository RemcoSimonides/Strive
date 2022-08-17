export interface Aggregation {
	goalsCreated: number
	goalsDeleted: number
	usersCreated: number
	usersDeleted: number
}

export type AggregationKey = keyof Aggregation