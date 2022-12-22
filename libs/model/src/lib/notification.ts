import { Goal, Milestone, SupportBase, User } from '@strive/model'


/**
 * Adding new event type? Also add them where it has to show up
 * Aggregated Message from Goal Events (./goal-events.ts && libs/notification/src/lib/message/aggregated.ts)
 * Story (./story.ts && libs\goal\src\lib\story\pipes\story-message.ts)
 * Notifications (👇 && libs\notification\src\lib\message\notification.ts)
 * Push Notification (libs\notification\src\lib\message\push-notification.ts)
 */
const eventTypes = [
  '',
  'goalCreated',
  'goalCreatedFinished',
  'goalDeleted',
  'goalPublicityPublic',
  'goalPublicityPrivate',
  'goalFinishedSuccessfully',
  'goalFinishedUnsuccessfully',
  'goalMilestoneCreated',
  'goalMilestoneCompletedSuccessfully',
  'goalMilestoneCompletedUnsuccessfully',
  'goalMilestoneDeadlinePassed',
  'goalMilestoneDeleted',
  'goalStakeholderCreated',
  'goalStakeholderBecameAchiever',
  'goalStakeholderBecameAdmin',
  'goalStakeholderBecameSupporter',
  'goalStakeholderInvitedToJoin',
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
  'goalCreated',
  'goalCreatedFinished',
  'goalFinishedSuccessfully',
  'goalFinishedUnsuccessfully',
  'goalMilestoneDeadlinePassed',
  'goalStakeholderInvitedToJoin',
  'goalStakeholderRequestedToJoin',
  'goalStakeholderRequestToJoinAccepted',
  'goalStakeholderRequestToJoinRejected',
  'goalSupportCreated',
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

export interface NotificationBase {
  id?: string
  event: EventType
  userId?: string
  goalId?: string
  milestoneId?: string
  supportId?: string
  updatedAt?: Date
  createdAt?: Date
}

export interface Notification extends NotificationBase {
  user?: User,
  goal?: Goal,
  milestone?: Milestone,
  support?: SupportBase
}

export function createNotificationBase(params: Partial<NotificationBase> = {}): NotificationBase {
  const notification: NotificationBase = {
    event: params.event ?? '',
    createdAt: params.createdAt ?? new Date(),
    updatedAt: params.updatedAt ?? new Date()
  }

  if (params.id) notification.id = params.id
  if (params.goalId) notification.goalId = params.goalId
  if (params.milestoneId) notification.milestoneId = params.milestoneId
  if (params.supportId) notification.supportId = params.supportId
  if (params.userId) notification.userId = params.userId

  return notification
}

export interface NotificationMessageText {
  text: string;
  link?: string;
}
