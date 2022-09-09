import { unique } from '@strive/utils/helpers'
import { createGoalSource, GoalSource } from './goal'
import { EventType } from './notification'
import { GoalStakeholder } from './stakeholder'

export interface GoalEvent {
	name: EventType
	source: GoalSource
	createdAt?: Date
	updatedAt?: Date
}

export function createGoalEvent(params: GoalEvent): GoalEvent {
  return {
    ...params,
    source: createGoalSource(params.source),
  }
}

export function filterGoalEvents(events: GoalEvent[], stakeholder: GoalStakeholder): GoalEvent[] {

	const all: EventType[] = [
		'goalIsFinished',
		'goalMilestoneCompletedSuccessfully',
		'goalMilestoneCompletedUnsuccessfully',
		'goalMilestoneCreated',
		'goalStakeholderBecameAchiever',
		'goalStoryPostCreated',
	]

	const supporter: EventType[] = [
		'goalChatMessageCreated'
	]

	const achiever: EventType[] = [
		'goalChatMessageCreated',
		'goalMilestoneDeadlinePassed'

	]

	const admin: EventType[] = [
		'goalChatMessageCreated',
		'goalStakeholderRequestedToJoin'
	]

	if (stakeholder.isSupporter) all.push(...supporter)
	if (stakeholder.isAchiever) all.push(...achiever)
	if (stakeholder.isAdmin) all.push(...admin)

	const types = unique(all)

	return events
		.filter(event => types.includes(event.name))
		// Remove goal events triggered by current user
		.filter(event => event.source.user?.uid !== stakeholder.uid)
}