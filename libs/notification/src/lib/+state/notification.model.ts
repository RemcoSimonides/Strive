import { createCollectiveGoalLink } from '@strive/collective-goal/collective-goal/+state/collective-goal.firestore';
import { createGoalLink } from '@strive/goal/goal/+state/goal.firestore';
import { createMilestoneLink } from '@strive/milestone/+state/milestone.firestore';
import { createSupport } from '@strive/support/+state/support.firestore';
import { createProfileLink } from '@strive/user/user/+state/user.firestore';
import { GoalRequest, Notification, SupportDecisionMeta } from './notification.firestore';
import { createComment } from '@strive/discussion/+state/comment.firestore';
import { createTemplateLink } from '@strive/template/+state/template.firestore';

/** A factory function that creates a NotificationDocument. */
export function createNotification(params: Partial<Notification> = {}): Notification {
  const meta = 
  isSupportDecisionNotification(params) ? createSupportDecisionMeta(params.meta)
    : isGoalRequestNotification(params) ? createGoalRequest(params.meta)
    : {}
    
  return {
    discussionId: '',
    type: 'feed',
    target: 'user',
    event: 0,
    source: {
      user: createProfileLink(),
      goal: createGoalLink(),
      milestone: createMilestoneLink(),
      postId: '',
      support: createSupport(),
      collectiveGoal: createCollectiveGoalLink(),
      template: createTemplateLink(),
      comment: createComment()
    },
    isRead: false,
    needsDecision: false,
    ...params,
    meta
  }
}


export const isSupportDecisionNotification = (notification: Partial<Notification>): notification is Notification<SupportDecisionMeta> => notification.meta?.type === 'supportDecision'
export function createSupportDecisionMeta(meta: Partial<SupportDecisionMeta>): SupportDecisionMeta {
  return {
    type: 'supportDecision',
    supports: [],
    status: 'pending',
    ...meta
  }
}


export const isGoalRequestNotification = (notification: Partial<Notification>): notification is Notification<GoalRequest> => notification.meta?.type === 'goalRequest'
export function createGoalRequest(meta: Partial<GoalRequest>): GoalRequest {
  return {
    type: 'goalRequest',
    status: 'open',
    uidRequestor: '',
    ...meta
  }
}

export function increaseSeqnoByOne(seqno: string): string {
  const segments = seqno.split('.');
  const last = segments.pop()
  const lastPlusOne = +last + 1
  segments.push(`${lastPlusOne}`)
  return segments.join('.')
}