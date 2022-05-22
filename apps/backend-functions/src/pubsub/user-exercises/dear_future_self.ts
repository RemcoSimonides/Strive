import * as admin from 'firebase-admin'
import { Personal } from '@strive/user/user/+state/user.firestore'
import { getDocument } from '../../shared/utils'
import { Message } from '@strive/exercises/dear-future-self/+state/dear-future-self.firestore'
import { format } from 'date-fns'
import { Timestamp } from '@firebase/firestore-types'

export async function sendDearFutureSelfPushNotification(uid: string, message: Message) {

  const personal = await getDocument<Personal>(`Users/${uid}/Personal/${uid}`)
  const from = format((message.createdAt as Timestamp).toDate(), 'MMM yyyy')

  if (personal.fcmTokens.some(token => token)) {

    return admin.messaging().sendToDevice(personal.fcmTokens, {
      notification: {
        title: `A message from the past!`,
        body: `Your message from ${from} can now be read!`,
        icon: 'https://firebasestorage.googleapis.com/v0/b/strive-journal.appspot.com/o/FCMImages%2Ficon-72x72.png?alt=media&token=19250b44-1aef-4ea6-bbaf-d888150fe4a9',
        clickAction: 'dearFutureSelf'
      }
    })
  }
}

export async function sendDearFutureSelfEmail() {
  // TODO


}
