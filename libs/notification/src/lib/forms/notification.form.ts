// import { FormControl, FormGroup } from '@angular/forms';
// import { FormEntity } from '@strive/utils/form/entity.form';
// import { GoalRequest, Notification, SupportDecisionMeta } from '../+state/notification.firestore';
// import { createNotification, createSupportDecisionMeta, createGoalRequest, isSupportDecisionNotification, isGoalRequestNotification } from '../+state/notification.model';

// function createNotificationFormControl(params?: Notification) {
//   const notification = createNotification(params)
//   return {
//     id: new FormControl(notification.id),
//     discussionId: new FormControl(notification.discussion),
//     message: new FormControl(notification.message),
//     notificationType: new FormControl(notification.type),
//     event: new FormControl(notification.event),
//     source: new FormEntity({
//       image: new FormControl(notification.source.image),
//       name: new FormControl(notification.source.name),
//       goalId: new FormControl(notification.source.goalId),
//       milestoneId: new FormControl(notification.source.milestoneId),
//       postId: new FormControl(notification.source.postId),
//       supportId: new FormControl(notification.source.supportId),
//       templateId: new FormControl(notification.source.templateId),
//       userId: new FormControl(notification.source.userId)
//     }),
//     isRead: new FormControl(notification.isRead),
//     meta: createMetaControl(notification)
//   }
// }

// type NotificationControl = ReturnType<typeof createNotificationFormControl>

// function createMetaControl(notification: Notification): SupportDecisionForm | GoalRequestForm | FormGroup {
//   if (isSupportDecisionNotification(notification)) {
//     return new SupportDecisionForm(notification.meta)
//   } else if (isGoalRequestNotification(notification)) {
//     return new GoalRequestForm(notification.meta)
//   }
// }

// // PostMeta
// function createSupportDecisionMetaFormControl(params?: Partial<SupportDecisionMeta>) {
//   const meta = createSupportDecisionMeta(params)
//   return {
//     supports: new FormControl(meta.supports),
//     status: new FormControl(meta.status)
//   }
// }

// type SupportDecisionMetaControl = ReturnType<typeof createSupportDecisionMetaFormControl>
// export class SupportDecisionForm extends FormEntity<SupportDecisionMetaControl, SupportDecisionMeta> {
//   constructor(meta?: Partial<SupportDecisionMeta>) {
//     super(createSupportDecisionMetaFormControl(meta))
//   }
// }

// // GoalRequest
// function createGoalRequestFormControl(params?: Partial<GoalRequest>) {
//   const goalRequest = createGoalRequest(params)
//   return {
//     requestStatus: new FormControl(goalRequest.requestStatus),
//     uidRequestor: new FormControl(goalRequest.uidRequestor),
//     goalId: new FormControl(goalRequest.goalId)
//   }
// }
// type GoalRequestControl = ReturnType<typeof createGoalRequestFormControl>
// export class GoalRequestForm extends FormEntity<GoalRequestControl, GoalRequest> {
//   constructor(goalRequest?: Partial<GoalRequest>) {
//     super(createGoalRequestFormControl(goalRequest))
//   }
// }