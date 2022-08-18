import {
  createGoalLink,
  Goal,
  GoalLink,
  createMilestoneLink,
  Milestone,
  MilestoneLink,
  createSupportLink,
  Support,
  SupportLink,
  createUserLink,
  User,
  UserLink
} from '@strive/model'

const eventTypes = [
  '',
  'goalCreatedStatusBucketlist',
  'goalCreatedStatusActive',
  'goalCreatedStatusFinished',
  'goalDeleted',
  'goalPublicityPublic',
  'goalPublicityPrivate',
  'goalStatusFinished',
  'goalMilestoneCreated',
  'goalMilestoneCompletedSuccessfully',
  'goalMilestoneCompletedUnsuccessfully',
  'goalMilestoneDeadlinePassed',
  'goalMilestoneDeleted',
  'goalStakeholderCreated',
  'goalStakeholderBecameAchiever',
  'goalStakeholderBecameAdmin',
  'goalStakeholderBecameSupporter',
  'goalStakeholderRequestedToJoin',
  'goalStakeholderRequestToJoinAccepted',
  'goalStakeholderRequestToJoinRejected',
  'goalSupportCreated',
  'goalSupportDeleted',
  'goalSupportStatusWaitingToBePaid',
  'goalSupportStatusPaid',
  'goalSupportStatusRejected',
  'goalSupportStatusPendingSuccessful',
  'goalSupportStatusPendingUnsuccessful',
  'goalChatMessageCreated',
  'goalStoryPostCreated',
  'userCreated',
  'userDeleted',
  'userSpectatorCreated',
  'userSpectatorDeleted'
] as const

export type EventType = typeof eventTypes[number]


// Notification types that have a notification messsage
export const notificationEvents: EventType[] = [
  'goalCreatedStatusBucketlist',
  'goalCreatedStatusActive',
  'goalCreatedStatusFinished',
  'goalStatusFinished',
  'goalMilestoneDeadlinePassed',
  'goalStakeholderRequestedToJoin',
  'goalStakeholderRequestToJoinAccepted',
  'goalStakeholderRequestToJoinRejected',
  'goalSupportStatusPendingSuccessful',
  'goalSupportStatusPendingUnsuccessful',
  'goalSupportStatusPaid',
  'goalSupportStatusRejected',
  'userSpectatorCreated',
]

const notificationIcons = [
  'alert-outline',
  'bookmark-outline',
  'chatbox-outline',
  'checkmark-outline',
  'create-outline',
  'flag-outline',
  'heart-outline',
  'heart-dislike-outline',
  'person-add-outline',
  'person-remove-outline',
  'close-outline'
] as const
export type NotificationIcons = typeof notificationIcons[number];

export interface Notification {
  id?: string
  event: EventType
  source: NotificationSource
  updatedAt?: Date
  createdAt?: Date
}

export interface NotificationSource {
  goal?: GoalLink
  user?: UserLink
  milestone?: MilestoneLink
  support?: SupportLink
}

export function createNotification(params: Partial<Notification> = {}): Notification {
  return {
    event: '',
    ...params,
      source: createNotificationSource(params.source),
  }
}

export function createNotificationSource(params: {
  goal?: GoalLink | Goal
  milestone?: MilestoneLink | Milestone
  user?: UserLink | User
  support?: SupportLink | Support
} = {}): NotificationSource {
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
