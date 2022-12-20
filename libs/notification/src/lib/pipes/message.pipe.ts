import { NgModule, Pipe, PipeTransform } from '@angular/core'
import { Notification } from '@strive/model'
import { getNotificationMessage } from '../message/notification'


@Pipe({ name: 'message' })
export class MessagePipe implements PipeTransform {
  transform(notification: Notification): { title: string, image: string, message: string } | undefined {
    const message = getNotificationMessage(notification)
    return message.message.length ? message : undefined
  }
}

@NgModule({
  exports: [MessagePipe],
  declarations: [MessagePipe]
})
export class MessagePipeModule { } 