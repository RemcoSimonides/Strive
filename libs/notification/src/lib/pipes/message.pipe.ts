import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { Notification, NotificationMessageText } from '../+state/notification.firestore';
import { getNotificationMessage } from '../message/notification';

@Pipe({ name: 'message' })
export class MessagePipe implements PipeTransform {
  transform(notification: Notification): { title: string, image: string, message: NotificationMessageText[] } {
    return getNotificationMessage(notification)
  }
}

@NgModule({
  exports: [MessagePipe],
  declarations: [MessagePipe]
})
export class MessagePipeModule { } 