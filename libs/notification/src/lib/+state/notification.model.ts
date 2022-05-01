import { createGoalLink } from '@strive/goal/goal/+state/goal.firestore';
import { createMilestoneLink } from '@strive/goal/milestone/+state/milestone.firestore';
import { createSupport } from '@strive/support/+state/support.firestore';
import { createUserLink } from '@strive/user/user/+state/user.firestore';
import { Notification, SupportDecisionMeta } from './notification.firestore';
import { createComment } from '@strive/discussion/+state/comment.firestore';

/** A factory function that creates a NotificationDocument. */
export function createNotification(params: Partial<Notification> = {}): Notification {
  const meta = isSupportDecisionNotification(params)
    ? createSupportDecisionMeta(params.meta)
    : {}
    
  return {
    discussionId: '',
    type: 'feed',
    target: 'user',
    event: 0,
    source: {
      user: createUserLink(),
      goal: createGoalLink(),
      milestone: createMilestoneLink(),
      postId: '',
      support: createSupport(),
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

export function increaseSeqnoByOne(seqno: string): string {
  const segments = seqno.split('.');
  const last = segments.pop()
  const lastPlusOne = +last + 1
  segments.push(`${lastPlusOne}`)
  return segments.join('.')
}