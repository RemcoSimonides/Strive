import * as admin from 'firebase-admin'
import { Personal } from '@strive/user/user/+state/user.firestore'
import { Message } from '@strive/exercises/dear-future-self/+state/dear-future-self.firestore'
import { format } from 'date-fns'
import { Timestamp } from '@firebase/firestore-types'
import { sendMailFromTemplate } from '../../shared/sendgrid/sendgrid'
import { groupIds, templateIds } from '../email/ids'

export function sendDearFutureSelfPushNotification(personal: Personal, message: Message) {
  const from = format((message.createdAt as Timestamp).toDate(), 'MMM yyyy')

  if (personal.fcmTokens.some(token => token)) {

    return admin.messaging().sendToDevice(personal.fcmTokens, {
      notification: {
        title: `A message from the past!`,
        body: `Your message from ${from} can now be read!`,
        icon: 'https://firebasestorage.googleapis.com/v0/b/strive-journal.appspot.com/o/FCMImages%2Ficon-72x72.png?alt=media&token=19250b44-1aef-4ea6-bbaf-d888150fe4a9',
        clickAction: 'exercise/dear-future-self'
      }
    })
  }
}

export function sendDearFutureSelfEmail(personal: Personal, description: string) {
  return sendMailFromTemplate({
    to: personal.email,
    templateId: templateIds.dearFutureSelfMessage,
    data: { description }
  }, groupIds.unsubscribeAll)
}