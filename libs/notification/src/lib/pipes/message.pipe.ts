import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { GoalEvent } from '@strive/goal/goal/+state/goal.firestore';
import { Notification, NotificationMessageText } from '../+state/notification.firestore';
import { getNotificationMessage, getGoalNotificationMessage, GoalNotificationMessage } from '../message/notification';

@Pipe({ name: 'storyMessage'})
export class GoalNotificationMessagePipe implements PipeTransform {
  transform(event: GoalEvent): GoalNotificationMessage {
    return getGoalNotificationMessage(event)
  }
}

@Pipe({ name: 'message' })
export class MessagePipe implements PipeTransform {
  transform(notification: Notification): { title: string, image: string, message: NotificationMessageText[] } {
    return getNotificationMessage(notification)
  }
}

@NgModule({
  exports: [MessagePipe, GoalNotificationMessagePipe],
  declarations: [MessagePipe, GoalNotificationMessagePipe]
})
export class MessagePipeModule { } 