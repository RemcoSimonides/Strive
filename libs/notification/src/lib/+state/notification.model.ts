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
    ...params,
    meta
  }
}

export interface SupportDecisionNotification extends Notification<SupportDecisionMeta> {
  type: 'supportDecision'
}
export const isSupportDecisionNotification = (notification: Partial<Notification>): notification is SupportDecisionNotification => notification.type === 'supportDecision'
export function createSupportDecisionMeta(meta: Partial<SupportDecisionMeta>): SupportDecisionMeta {
  return {
    deadline: '',
    supports: [],
    decisionStatus: 'pending',
    ...meta
  }
}


export interface GoalRequestNotification extends Notification<GoalRequest> {
  type: 'goalRequest'
}
export const isGoalRequestNotification = (notification: Partial<Notification>): notification is GoalRequestNotification => notification.type === 'goalRequest'
export function createGoalRequest(meta: Partial<GoalRequest>): GoalRequest {
  return {
    requestStatus: 'open',
    uidRequestor: '',
    ...meta
  }
}

