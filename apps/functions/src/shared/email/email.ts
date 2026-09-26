import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2'
import { compile } from 'handlebars'

import { logger } from 'firebase-functions/v2'
import { unsubscribeUrl } from './unsubscribe'
import monthlyGoalReminderHtml from './templates/monthly-goal-reminder'
import dearFutureSelfHtml from './templates/dear-future-self'

const from = 'Strive Journal <remco@strivejournal.com>'
// strivejournal.com has no MX record, so replies go to Gmail
const replyTo = 'remcosimonides@gmail.com'
const region = 'eu-west-1'

const templates = {
  monthlyGoalReminder: { subject: 'Your monthly goal reminder', html: compile(monthlyGoalReminderHtml) },
  dearFutureSelf: { subject: 'A message from the past!', html: compile(dearFutureSelfHtml) }
}
export type EmailTemplate = keyof typeof templates

export interface EmailRequest {
  to: string
  /** The recipient's uid, for the unsubscribe link */
  uid: string
  template: EmailTemplate
  data: Record<string, unknown>
}

let client: SESv2Client | undefined
function getClient() {
  if (client) return client
  const { AWS_SES_ACCESS_KEY_ID, AWS_SES_SECRET_ACCESS_KEY } = process.env
  if (!AWS_SES_ACCESS_KEY_ID || !AWS_SES_SECRET_ACCESS_KEY) throw new Error('aws ses credentials missing')
  client = new SESv2Client({
    region,
    // the session token is only set for local test sends with temporary credentials
    credentials: { accessKeyId: AWS_SES_ACCESS_KEY_ID, secretAccessKey: AWS_SES_SECRET_ACCESS_KEY, sessionToken: process.env['AWS_SESSION_TOKEN'] }
  })
  return client
}

export async function sendMail({ to, uid, template, data }: EmailRequest) {
  const { subject, html: render } = templates[template]
  const unsubscribe = unsubscribeUrl(uid)
  const html = render({ ...data, unsubscribeUrl: unsubscribe })

  const command = new SendEmailCommand({
    FromEmailAddress: from,
    ReplyToAddresses: [replyTo],
    Destination: { ToAddresses: [to] },
    Content: {
      Simple: {
        Subject: { Data: subject, Charset: 'UTF-8' },
        Body: {
          Html: { Data: html, Charset: 'UTF-8' },
          Text: { Data: toText(html), Charset: 'UTF-8' }
        },
        // One-click unsubscribe (RFC 8058), required by Gmail and Yahoo for bulk senders
        Headers: [
          { Name: 'List-Unsubscribe', Value: `<${unsubscribe}>` },
          { Name: 'List-Unsubscribe-Post', Value: 'List-Unsubscribe=One-Click' }
        ]
      }
    }
  })

  try {
    return await getClient().send(command)
  } catch (e) {
    logger.error(`sending ${template} email failed`, e)
    throw e
  }
}

/** Plain-text part for clients that do not render html */
function toText(html: string) {
  return html
    .replace(/<(head|style)[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<a [^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, '$2 ($1)')
    .replace(/<(br|\/p|\/div|\/li|\/h[1-6]|\/tr)[^>]*>/gi, '\n')
    .replace(/<li[^>]*>/gi, '- ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .split('\n').map(line => line.trim()).filter(Boolean).join('\n')
}
