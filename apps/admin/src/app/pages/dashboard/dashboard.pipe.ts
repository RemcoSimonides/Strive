import { NgModule, Pipe, PipeTransform } from '@angular/core'
import { Aggregation } from '@strive/model'

function totalGoals(aggregation: Aggregation) {
	return aggregation.goalsCreated - aggregation.goalsDeleted
}

function activeGoalsPercentage(aggregation: Aggregation) {
	return Math.round((aggregation.goalsActive / totalGoals(aggregation)) * 100)
}

function bucketlistGoalsPercentage(aggregation: Aggregation) {
	return Math.round((aggregation.goalsBucketlist / totalGoals(aggregation)) * 100)
}

function finishedGoalsPercentage(aggregation: Aggregation) {
	return Math.round((aggregation.goalsFinished / totalGoals(aggregation)) * 100)
}

function privateGoalsPercentage(aggregation: Aggregation) {
	return Math.round((aggregation.goalsPrivate / totalGoals(aggregation)) * 100)
}

function publicGoalsPercentage(aggregation: Aggregation) {
	return Math.round((aggregation.goalsPublic / totalGoals(aggregation)) * 100)
}

@Pipe({ name: 'totalGoals' })
export class TotalGoalsPipe implements PipeTransform {
	transform(aggregation: Aggregation) {
		return totalGoals(aggregation)
	}
}

@Pipe({ name: 'activeGoalsPercentage' })
export class ActiveGoalsPercentagePipe implements PipeTransform {
	transform(aggregation: Aggregation) {
		return activeGoalsPercentage(aggregation)
	}
}

@Pipe({ name: 'bucketlistGoalsPercentage' })
export class BucketListGoalsPercentagePipe implements PipeTransform {
	transform(aggregation: Aggregation) {
		return bucketlistGoalsPercentage(aggregation)
	}
}

@Pipe({ name: 'finishedGoalsPercentage' })
export class FinishedGoalsPercentagePipe implements PipeTransform {
	transform(aggregation: Aggregation) {
		return finishedGoalsPercentage(aggregation)
	}
}

@Pipe({ name: 'privateGoalsPercentage' })
export class PrivateGoalsPercentagePipe implements PipeTransform {
	transform(aggregation: Aggregation) {
		return privateGoalsPercentage(aggregation)
	}
}

@Pipe({ name: 'publicGoalsPercentage' })
export class PublicGoalsPercentagePipe implements PipeTransform {
	transform(aggregation: Aggregation) {
		return  publicGoalsPercentage(aggregation)
	}
}

@NgModule({
	exports: [
		TotalGoalsPipe,
		ActiveGoalsPercentagePipe,
		BucketListGoalsPercentagePipe,
		FinishedGoalsPercentagePipe,
		PrivateGoalsPercentagePipe,
		PublicGoalsPercentagePipe
	],
	declarations: [
		TotalGoalsPipe,
		ActiveGoalsPercentagePipe,
		BucketListGoalsPercentagePipe,
		FinishedGoalsPercentagePipe,
		PrivateGoalsPercentagePipe,
		PublicGoalsPercentagePipe
	]
})
export class AggregationPipeModule {}