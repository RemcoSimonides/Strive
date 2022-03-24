import { FieldValue } from '@firebase/firestore-types';
import { GoalLink, createGoalLink } from '@strive/goal/goal/+state/goal.firestore'
import { MilestoneLink, createMilestoneLink } from '@strive/goal/milestone/+state/milestone.firestore'
import { UserLink, createUserLink } from '@strive/user/user/+state/user.firestore'

export type SupportDecision = 'give' | 'keep'
export type SupportStatus = 'open' | 'rejected' | 'canceled' | 'waiting_to_be_paid' | 'paid'

export function getStatusLabel(support: Support) {
  const label: Record<SupportStatus, string> = {
    open: '',
    rejected: 'Rejected',
    canceled: 'Canceled',
    waiting_to_be_paid: 'Waiting to be paid',
    paid: 'Given'
  }

  if (support.status === 'open') {
    return support.milestone?.id
      ? 'Waiting for milestone to be completed'
      : 'Waiting for goal to be completed'
  } else {
    return label[support.status]
  }
}

export interface Support {
  id?: string;
  amount?: number;
  description: string;
  status: SupportStatus;
  goal: GoalLink;
  milestone?: MilestoneLink;
  supporter: UserLink;
  receiver?: UserLink;
  updatedAt?: FieldValue;
  createdAt?: FieldValue;
}

export interface NotificationSupport {
  id: string;
  description: string;
  decision: SupportDecision;
  receiver: UserLink;
}

/** A factory function that creates a SupportDocument. */
export function createSupport(params: Partial<Support> = {}): Support {
  return {
    id: params.id ? params.id : '',
    description: '',
    status: 'open',
    goal: createGoalLink(params.goal),
    milestone: createMilestoneLink(params.milestone),
    supporter: createUserLink(params.supporter),
    receiver: createUserLink(params.receiver),
    ...params
  }
}

/** A factory function that creates a NotificationSupportDocumnet */
export function createNotificationSupport(params: Partial<NotificationSupport> = {}): NotificationSupport {
  return {
    id: params.id ? params.id : '',
    description: '',
    decision: 'give',
    receiver: createUserLink(params.receiver),
    ...params
  }
}