import { createSupportLink, Support, SupportLink } from '@strive/support/+state/support.firestore'
import { createGoalLink, Goal, GoalLink, createMilestoneLink, Milestone, MilestoneLink } from '@strive/model'
import { createUserLink, User, UserLink } from '@strive/user/user/+state/user.firestore'

export enum enumEvent {
  // 200000 -> 299999 = goal events
  gNew = 200001, //deprecated
  gNewBucketlist = 200010,
  gNewActive = 200011,
  gNewFinished = 200012,
  gFinished = 200002,
  gUpdated = 200003,
  gRoadmapUpdated = 204001,
  gMilestoneCompletedSuccessfully = 201001,
  gMilestoneCompletedUnsuccessfully = 201002,
  gMilestoneDeadlinePassed = 201010,
  gStakeholderAchieverAdded = 202001,
  gStakeholderAchieverRemoved = 202002,
  gStakeholderAdminAdded = 202003,
  gStakeholderAdminRemoved = 202004,
  gStakeholderSupporterAdded = 202005,
  gStakeholderSupporterRemoved = 202006,
  gStakeholderRequestToJoinPending = 202101,
  gStakeholderRequestToJoinAccepted = 202102,
  gStakeholderRequestToJoinRejected = 202103,
  gSupportAdded = 203010,
  gSupportWaitingToBePaid = 203020,
  gSupportPaid = 203030,
  gSupportRejected = 203040,
  gSupportPendingSuccesful = 203050, // succeeded achieving objective
  gSupportPendingFailed = 203051, // failed achieving objective
  gSupportDeleted = 203060,
  gNewPost = 205001,
  gNewMessage = 206001,
  // 300000 -> 399999 = discussion events
  // discussionNewMessage = 300000,
  // 400000 -> 499999 = user events
  userSpectatorAdded = 400001,
  userSpectatorRemoved = 400002,
}

interface NotificationBase {
  id?: string
  event: enumEvent
  source: SupportSource | NotificationSource
  updatedAt?: Date
  createdAt?: Date
}

export interface Notification extends NotificationBase {
  source: NotificationSource
}

export interface SupportNotification extends NotificationBase {
  source: SupportSource
}

export interface SupportSource {
  goal: GoalLink
  milestone?: MilestoneLink
  supporter: UserLink
  receiver?: UserLink
}

export interface NotificationSource {
  goal?: GoalLink
  user?: UserLink
  milestone?: MilestoneLink
  support?: SupportLink
}

export interface DiscussionSource {
  user?: UserLink
  goal?: GoalLink
}

export function createNotification(params: Partial<Notification> = {}): Notification {
  return {
    event: 0,
    ...params,
    source: createNotificationSource(params.source),
  }
}

export function createSupportSource(params: {
  goal: GoalLink | Goal
  milestone?: MilestoneLink | Milestone
  supporter: UserLink | User
  receiver?: UserLink | User
}): SupportSource {
  const source: SupportSource = {
    goal: createGoalLink(params?.goal),
    supporter: createUserLink(params?.supporter)
  }

  if (params?.milestone?.id) source.milestone = createMilestoneLink(params.milestone)
  if (params?.receiver?.uid) source.receiver = createUserLink(params.receiver)

  return source
}

export function createDiscussionSource(params: {
  goal: GoalLink | Goal,
  user: UserLink | User
}): DiscussionSource {
  const source: DiscussionSource = {}

  if (params.goal?.id) source.goal = createGoalLink(params.goal)
  if (params.user?.uid) source.user = createUserLink(params.user)

  return source
}

// COMMENT SOURCE TOO?

export function createNotificationSource(params: {
  goal?: GoalLink | Goal
  milestone?: MilestoneLink | Milestone
  user?: UserLink | User
  support?: SupportLink | Support
}): NotificationSource {
  const source: NotificationSource = {}

  if (params.goal?.id) source.goal = createGoalLink(params.goal)
  if (params.user?.uid) source.user = createUserLink(params.user)
  if (params.milestone?.id) source.milestone = createMilestoneLink(params.milestone)
  if (params.support?.id) source.support = createSupportLink(params.support)

  return source
}

export interface NotificationMessageText {
  text: string;
  link?: string;
}
