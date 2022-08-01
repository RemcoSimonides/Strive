import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { GoalEvent, Notification, NotificationMessageText } from '@strive/model'
import { getNotificationMessage, getStoryItemMessage, StoryItemMessage } from '../message/notification';

@Pipe({ name: 'storyMessage'})
export class StoryItemMessagePipe implements PipeTransform {
  transform(event: GoalEvent): StoryItemMessage {
    return getStoryItemMessage(event)
  }
}

@Pipe({ name: 'message' })
export class MessagePipe implements PipeTransform {
  transform(notification: Notification): { title: string, image: string, message: NotificationMessageText[] } {
    return getNotificationMessage(notification)
  }
}

@NgModule({
  exports: [MessagePipe, StoryItemMessagePipe],
  declarations: [MessagePipe, StoryItemMessagePipe]
})
export class MessagePipeModule { } 