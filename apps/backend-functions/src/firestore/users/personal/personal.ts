import { createPersonal} from '@strive/model'
import { admin, functions } from '../../../internals/firebase';
import { logger } from 'firebase-functions';

export const personalChangeHandler = functions.firestore.document(`Users/{userId}/Personal/{uid}`)
  .onUpdate(async (snapshot) => {

    const before = createPersonal({ ...snapshot.before.data(), uid: snapshot.before.id })
    const after = createPersonal({ ...snapshot.after.data(), uid: snapshot.after.id })

    if (before.fcmTokens.length < after.fcmTokens.length) {
      admin.messaging().subscribeToTopic(after.fcmTokens, 'notifications')
        .then(res => { logger.log('Successfully subscribed to topic:', res) })
        .catch(err => { logger.log('Error subscribing tot topic', err) })
    }
  })