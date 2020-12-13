import { enumNotificationType, GoalRequest, Notification, PostMeta } from './notification.firestore';

/** A factory function that creates a NotificationDocument. */
export function createNotification(params: Partial<Notification> = {}): Notification {
  const meta = 
  isPostMeta(params) ? createPostMeta(params.meta)
    : isGoalRequest(params) ? createGoalRequest(params.meta)
    : {}
    
  return {
    id: !!params.id ? params.id : '',
    discussionId: '',
    message: [],
    type: 0,
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
    meta
  }
}

export interface PostNotification extends Notification<PostMeta> {
  type: enumNotificationType.post
}
export const isPostMeta = (notification: Partial<Notification>): notification is PostNotification => notification.type === enumNotificationType.post
export function createPostMeta(postMeta: Partial<PostMeta>): PostMeta {
  return {
    deadline: '',
    supports: [],
    collectiveGoalId: '',
    goalId: '',
    postId: '',
    ...postMeta
  }
}


export interface GoalRequestNotification extends Notification<GoalRequest> {
  type: enumNotificationType.goal_request_to_join
}
export const isGoalRequest = (notification: Partial<Notification>): notification is GoalRequestNotification => notification.type === enumNotificationType.goal_request_to_join
export function createGoalRequest(goalRequest: Partial<GoalRequest>): GoalRequest {
  return {
    requestStatus: 'open',
    uidRequestor: '',
    collectiveGoalId: '',
    goalId: '',
    ...goalRequest
  }
}

