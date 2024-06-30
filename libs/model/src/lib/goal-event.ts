import { unique } from '@strive/utils/helpers'
import { EventType } from './notification'
import { GoalStakeholder } from './stakeholder'

export interface GoalEvent {
	name: EventType
	goalId: string
	userId?: string
	milestoneId?: string
	postId?: string
	supportId?: string
	commentId?: string
	createdAt: Date
	updatedAt: Date
}

export function createGoalEvent(params: GoalEvent): GoalEvent {
	const event: GoalEvent = {
		name: params.name ?? '',
		goalId: params.goalId ?? '',
		createdAt: params.createdAt ?? new Date(),
		updatedAt: params.updatedAt ?? new Date()
	}

	if (params.userId) event.userId = params.userId
	if (params.milestoneId) event.milestoneId = params.milestoneId
	if (params.postId) event.postId = params.postId
	if (params.supportId) event.supportId = params.supportId
	if (params.commentId) event.commentId = params.commentId

	return event
}

export function filterGoalEvents(events: GoalEvent[], stakeholder: GoalStakeholder): GoalEvent[] {

	const all: EventType[] = [
		'goalFinishedSuccessfully',
		'goalFinishedUnsuccessfully',
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
		'goalDeadlinePassed',
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
		.filter(event => event.userId !== stakeholder.uid)
}