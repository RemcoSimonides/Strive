import { db, functions } from '../../internals/firebase';
import { logger } from 'firebase-functions';
import { sendgridApiKey } from '../../environments/environment';

import * as SendGrid from '@sendgrid/mail'

import { createPersonal } from '@strive/user/user/+state/user.firestore';
import { getDocument } from '../../shared/utils';
import { createGoalStakeholder } from '@strive/goal/stakeholder/+state/stakeholder.firestore';
import { Goal } from '@strive/goal/goal/+state/goal.firestore';
import { MailDataRequired } from '@sendgrid/mail';
import { Motivation, Motivations } from '../../../../admin/src/app/pages/motivation/motivation.model';
import { groupIds, templateIds } from './ids';

// Substitutions used in Sendgrid templates
const substitutions = {
  groupUnsubscribe: "<%asm_group_unsubscribe_raw_url%>",
  preferenceUnsubscribe: "<%asm_preferences_raw_url%>"
};

/**
 * Array of unsubscribe groups we want to display when users click on the preference link.
 * Like this, we can avoid showing the criticalEmails group, which is linked for example to the reset password email.
 * Users won't be able to unsubscribe from this group and will always received email from the criticalsEmails group.
*/
const groupsToDisplay = [groupIds.unsubscribeAll];

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

  const [ profileSnaps, motivation ] = await Promise.all([
    db.collectionGroup('Profile').get(),
    getMotivation()
  ])

  for (const doc of profileSnaps.docs) {
    const profile = createPersonal(doc.data())
    const goals = await getGoals(profile.uid)

    const futureGoals = goals.filter(goal => goal.status === 'bucketlist')
    const currentGoals = goals.filter(goal => goal.status === 'active')

    if (!futureGoals.length && !currentGoals.length) continue

    const data = { 
      futureGoals,
      currentGoals,
      motivation
    }

    // await sendTemplateEmail('', TEMPLATE_ID, { text: mail })
    logger.log('should be sent to: ', profile.email)
    await sendMailFromTemplate({
      to: 'remcosimonides@gmail.com',
      templateId: templateIds.monthlyGoalReminder,
      data,
    }, groupIds.monthlyGoalReminder)
  }
})

export function sendMailFromTemplate({ to, templateId, data }: EmailTemplateRequest, groupId: number = groupIds.criticalsEmails) {
  const from: EmailJSON = { email: 'remco@strivejournal.com', name: 'Strive Journal'};

  const msg: MailDataRequired = {
    from,
    to,
    templateId,
    asm: groupId ? { groupId, groupsToDisplay } : undefined,
    dynamicTemplateData: { ...data, ...substitutions, from }
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

async function getMotivation(): Promise<Motivation> {
  const ref = db.doc('miscellaneous/motivation')
  const motivationsSnap = await ref.get()
  const motivations = motivationsSnap.data() as Motivations
  const index = motivations.quotes.findIndex(quote => !quote.used)

  motivations.quotes[index].used = true
  ref.update({ quotes: motivations.quotes })

  return motivations.quotes[index]
}
