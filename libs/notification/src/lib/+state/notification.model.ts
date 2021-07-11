import { GoalRequest, Notification, SupportDecisionMeta } from './notification.firestore';

/** A factory function that creates a NotificationDocument. */
export function createNotification(params: Partial<Notification> = {}): Notification {
  const meta = 
  isSupportDecisionNotification(params) ? createSupportDecisionMeta(params.meta)
    : isGoalRequestNotification(params) ? createGoalRequest(params.meta)
    : {}
    
  return {
    discussionId: '',
    message: [],
    type: 'feed',
    event: 0,
    source: {
      image: '',
      name: '',
      goalId: '',
      milestoneId: '',
      postId: '',
      supportId: '',
      collectiveGoalId: '',
      templateId: '',
      userId: ''
    },
    isRead: false,
    needsDecision: false,
    ...params,
    meta
  }
}


export const isSupportDecisionNotification = (notification: Partial<Notification>): notification is Notification<SupportDecisionMeta> => notification?.meta.type === 'supportDecision'
export function createSupportDecisionMeta(meta: Partial<SupportDecisionMeta>): SupportDecisionMeta {
  return {
    type: 'supportDecision',
    deadline: '',
    supports: [],
    status: 'pending',
    ...meta
  }
}


export const isGoalRequestNotification = (notification: Partial<Notification>): notification is Notification<GoalRequest> => notification?.meta.type === 'goalRequest'
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