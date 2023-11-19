import * as admin from 'firebase-admin'
import type { Message as FCMMessage } from 'firebase-admin/messaging'
import { Message, Personal } from '@strive/model'
import { format } from 'date-fns'
import { sendMailFromTemplate } from '../../shared/sendgrid/sendgrid'
import { groupIds, templateIds } from '../email/ids'

export function sendDearFutureSelfPushNotification(personal: Personal, message: Message) {
  if (!personal.fcmTokens.length) return
  const { main, exerciseDearFutureSelf } = personal.settings.pushNotification
  if (!main || !exerciseDearFutureSelf) return

  const from = format(message.createdAt, 'MMM yyyy')
  const time = message.createdAt.getTime()

  const link = `goals?dfs=${time}`
  const messages: FCMMessage[] = personal.fcmTokens.map(token => ({
    token,
    notification: {
      title: 'A message from the past!',
      body: `Your message from ${from} can now be read!`
    },
    data: { link },
    webpush: {
      notification: {
        icon: 'https://firebasestorage.googleapis.com/v0/b/strive-journal.appspot.com/o/FCMImages%2Ficon-72x72.png?alt=media&token=19250b44-1aef-4ea6-bbaf-d888150fe4a9',
      },
      fcmOptions: { link }
    }
  }))
  if (!messages.length) return
  return admin.messaging().sendEach(messages)
}

export function sendDearFutureSelfEmail(personal: Personal, description: string) {
  return sendMailFromTemplate({
    to: personal.email,
    templateId: templateIds.dearFutureSelfMessage,
    data: { description }
  }, groupIds.unsubscribeAll)
}
