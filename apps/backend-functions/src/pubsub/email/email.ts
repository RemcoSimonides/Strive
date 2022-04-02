import { db, functions } from '../../internals/firebase';
import { logger } from 'firebase-functions';
import { sendgridApiKey } from '../../environments/environment';

import * as SendGrid from '@sendgrid/mail'

import { createPersonal } from '@strive/user/user/+state/user.firestore';
import { getDocument } from '../../shared/utils';
import { createGoalStakeholder } from '@strive/goal/stakeholder/+state/stakeholder.firestore';
import { Goal } from '@strive/goal/goal/+state/goal.firestore';
import { MailDataRequired } from '@sendgrid/mail';

const TEMPLATE_ID = 'd-709a6094be254533a25b421dfad30f9a';

export interface EmailTemplateRequest {
  to: string;
  templateId: string;
  data: {
    futureGoals: Goal[];
    currentGoals: Goal[];
  };
}
export type EmailJSON = { name?: string; email: string };


// // crontab.guru to determine schedule value
export const scheduledEmailRunner = functions.pubsub.schedule('*/5 * * * *').onRun(async (context) => {
// export const scheduledEmailRunner = functions.pubsub.schedule('5 8 * * 6').onRun(async (context) => {

  // get profiles
  const profileSnaps = await db.collectionGroup('Profile').get()

  for (const doc of profileSnaps.docs) {
    const profile = createPersonal(doc.data())
    const goals = await getGoals(profile.uid)
    logger.log('goals: ', goals)

    const futureGoals = goals.filter(goal => goal.status === 'bucketlist')
    const currentGoals = goals.filter(goal => goal.status === 'active')

    if (!futureGoals.length && !currentGoals.length) continue

    const data = { futureGoals, currentGoals }

    // await sendTemplateEmail('', TEMPLATE_ID, { text: mail })
    logger.log('should be sent to: ', profile.email)
    await sendMailFromTemplate({
      to: 'remcosimonides@gmail.com',
      templateId: TEMPLATE_ID,
      data
    })
  }
})

export function sendMailFromTemplate({ to, templateId, data }: EmailTemplateRequest) {
  const from: EmailJSON = { email: 'remco@strivejournal.com', name: 'Strive Journal'};

  const msg: MailDataRequired = {
    from,
    to,
    templateId,
    dynamicTemplateData: { ...data, from }
  };

  return send(msg);
}

async function send(msg: MailDataRequired) {
  if (sendgridApiKey === '') {
    throw new Error('sendgrid api key missing');
  }

  SendGrid.setApiKey(sendgridApiKey);
  return SendGrid.send(msg).catch(e => {
    if (e.message === 'Unauthorized') {
      logger.error('unauthorized');
      throw new Error('unauthorized');
    } else {
      logger.error(e);
      throw new Error('error');
    }
  });
}

async function getGoals(uid: string): Promise<Goal[]> {
  const stakeholderSnaps = await db.collectionGroup(`GStakeholders`).where(`uid`, `==`, uid).get()

  const promises = stakeholderSnaps.docs.map(doc => {
    const stakeholder = createGoalStakeholder(doc.data())
    return getDocument<Goal>(`Goals/${stakeholder.goalId}`)
  })
  return Promise.all(promises)
}
