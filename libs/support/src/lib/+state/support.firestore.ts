import { FieldValue } from '@firebase/firestore-types';
import { GoalLink, createGoalLink } from '@strive/goal/goal/+state/goal.firestore'
import { MilestoneLink, createMilestoneLink } from '@strive/milestone/+state/milestone.firestore'
import { ProfileLink, createProfileLink } from '@strive/user/user/+state/user.firestore'

export type SupportDecision = 'give' | 'keep'
export type SupportStatus = 'open' | 'rejected' | 'waiting_to_be_paid' | 'paid' | 'waiting_for_receiver'

export interface Support {
  id?: string;
  amount?: number;
  description: string;
  status: SupportStatus;
  goal: GoalLink;
  milestone?: MilestoneLink;
  path?: {
    level1id: string;
    level1description: string;
    level2id: string;
    level2description: string;
    level3id: string;
    level3description: string;
  };
  supporter: ProfileLink;
  receiver?: ProfileLink;
  updatedAt?: FieldValue;
  createdAt?: FieldValue;
}

export interface NotificationSupport {
  id: string;
  description: string;
  decision: SupportDecision;
  finished: boolean;
  receiver: ProfileLink;
}

/** A factory function that creates a SupportDocument. */
export function createSupport(params: Partial<Support> = {}): Support {
  return {
    id: !!params.id ? params.id : '',
    description: '',
    status: 'open',
    goal: createGoalLink(params.goal),
    milestone: createMilestoneLink(params.milestone),
    path: {
      level1id: '',
      level1description: '',
      level2id: '',
      level2description: '',
      level3id: '',
      level3description: ''
    },
    supporter: createProfileLink(params.supporter),
    receiver: createProfileLink(params.receiver),
    ...params
  }
}

/** A factory function that creates a NotificationSupportDocumnet */
export function createNotificationSupport(params: Partial<NotificationSupport> = {}): NotificationSupport {
  return {
    id: !!params.id ? params.id : '',
    description: '',
    decision: params.finished ? 'give' : 'keep',
    finished: false,
    receiver: createProfileLink(params.receiver),
    ...params
  }
}