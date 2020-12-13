import { FormControl, FormGroup } from '@angular/forms';
import { FormEntity } from '@strive/utils/form/entity.form';
import { enumNotificationType, GoalRequest, Notification, PostMeta } from '../+state/notification.firestore';
import { createNotification, createPostMeta, createGoalRequest, isPost, isGoalRequest } from '../+state/notification.model';

function createNotificationFormControl(params?: Notification) {
  const notification = createNotification(params)
  return {
    id: new FormControl(notification.id),
    discussionId: new FormControl(notification.discussion),
    message: new FormControl(notification.message),
    notificationType: new FormControl(notification.type),
    event: new FormControl(notification.event),
    source: new FormEntity({
      image: new FormControl(notification.source.image),
      name: new FormControl(notification.source.name),
      goalId: new FormControl(notification.source.goalId),
      milestoneId: new FormControl(notification.source.milestoneId),
      postId: new FormControl(notification.source.postId),
      supportId: new FormControl(notification.source.supportId),
      collectiveGoalId: new FormControl(notification.source.collectiveGoalId),
      templateId: new FormControl(notification.source.templateId),
      userId: new FormControl(notification.source.userId)
    }),
    isRead: new FormControl(notification.isRead),
    meta: createMetaControl(notification)
  }
}

type NotificationControl = ReturnType<typeof createNotificationFormControl>

function createMetaControl(notification: Notification): PostMetaForm | GoalRequestForm | FormGroup {
  if (isPost(notification)) {
    return new PostMetaForm(notification.meta)
  } else if (isGoalRequest(notification)) {
    return new GoalRequestForm(notification.meta)
  }
}

// PostMeta
function createPostMetaFormControl(params?: Partial<PostMeta>) {
  const postMeta = createPostMeta(params)
  return {
    deadline: new FormControl(postMeta.deadline),
    supports: new FormControl(postMeta.supports),
    collectiveGoalId: new FormControl(postMeta.collectiveGoalId),
    goalId: new FormControl(postMeta.goalId),
    postId: new FormControl(postMeta.postId)
  }
}

type PostMetaControl = ReturnType<typeof createPostMetaFormControl>
export class PostMetaForm extends FormEntity<PostMetaControl, PostMeta> {
  constructor(postMeta?: Partial<PostMeta>) {
    super(createPostMetaFormControl(postMeta))
  }
}

// GoalRequest
function createGoalRequestFormControl(params?: Partial<GoalRequest>) {
  const goalRequest = createGoalRequest(params)
  return {
    requestStatus: new FormControl(goalRequest.requestStatus),
    uidRequestor: new FormControl(goalRequest.uidRequestor),
    collectiveGoalId: new FormControl(goalRequest.collectiveGoalId),
    goalId: new FormControl(goalRequest.goalId)
  }
}
type GoalRequestControl = ReturnType<typeof createGoalRequestFormControl>
export class GoalRequestForm extends FormEntity<GoalRequestControl, GoalRequest> {
  constructor(goalRequest?: Partial<GoalRequest>) {
    super(createGoalRequestFormControl(goalRequest))
  }
}