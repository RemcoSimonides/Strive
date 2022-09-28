import * as SendGrid from '@sendgrid/mail'
import { MailDataRequired } from '@sendgrid/mail'
import { groupIds } from "../../pubsub/email/ids"

import { logger } from 'firebase-functions';

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
  to: string
  templateId: string
  data: any,
  attachments?: MailDataRequired['attachments']
}
export type EmailJSON = { name?: string; email: string };

export function sendMailFromTemplate({ to, templateId, data, attachments  }: EmailTemplateRequest, groupId: number = groupIds.criticalsEmails) {
  const from: EmailJSON = { email: 'remco@strivejournal.com', name: 'Strive Journal'};

  const msg: MailDataRequired = {
    from,
    to,
    templateId,
    attachments,
    asm: groupId ? { groupId, groupsToDisplay } : undefined,
    dynamicTemplateData: { ...data, ...substitutions, from }
  };

  return send(msg)
}

async function send(msg: MailDataRequired) {
  const { SENDGRID_APIKEY } = process.env 
  if (!SENDGRID_APIKEY) throw new Error('sendgrid api key missing')

  SendGrid.setApiKey(SENDGRID_APIKEY)
  return SendGrid.send(msg).catch(e => {
    if (e.message === 'Unauthorized') {
      logger.error('unauthorized')
      throw new Error('unauthorized')
    } else {
      logger.error(e);
      throw new Error('error')
    }
  });
}