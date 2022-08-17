export function createAggregation(aggregation: Partial<Aggregation> = {}): Aggregation {
	return {
		goalsCreated: 0,
		goalsFinished: 0,
		goalsActive: 0,
		goalsBucketlist: 0,
		goalsPublic: 0,
		goalsPrivate: 0,
		goalsDeleted: 0,
		goalsAchievers: 0,
		goalsAdmins: 0,
		goalsSupporters: 0,
		goalsCustomSupports: 0,
		usersCreated: 0,
		usersDeleted: 0,
		...aggregation
	}
}

export interface Aggregation {
	goalsCreated: number
	goalsFinished: number
	goalsActive: number
	goalsBucketlist: number
	goalsPublic: number
	goalsPrivate: number
	goalsDeleted: number
	goalsAchievers: number
	goalsAdmins: number
	goalsSupporters: number
	goalsCustomSupports: number
	usersCreated: number
	usersDeleted: number
}

export type AggregationKey = keyof Aggregation