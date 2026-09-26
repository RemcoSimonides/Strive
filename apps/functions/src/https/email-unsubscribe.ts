import { db, logger, onRequest } from '@strive/api/firebase'
import { isValidUnsubscribeToken } from '../shared/email/unsubscribe'

/**
 * The link in every email and its List-Unsubscribe header.
 * GET only shows a confirm button, because mail scanners open links; POST unsubscribes
 * (the button, or a mail client's one-click unsubscribe).
 */
export const emailUnsubscribe = onRequest(async (req, res) => {
  const uid = typeof req.query['uid'] === 'string' ? req.query['uid'] : ''
  const token = typeof req.query['token'] === 'string' ? req.query['token'] : ''

  if (!isValidUnsubscribeToken(uid, token)) {
    res.status(400).send(page('This unsubscribe link is not valid.', 'You can turn emails off in the app under Settings - Email notifications.'))
    return
  }

  if (req.method === 'POST') {
    try {
      await db.doc(`Users/${uid}/Personal/${uid}`).update({ 'settings.emailNotification.main': false })
    } catch (err) {
      // an account that no longer exists receives nothing anyway
      if ((err as { code?: number }).code !== 5) throw err
      logger.warn(`unsubscribe for missing user ${uid}`)
    }
    res.send(page('You are unsubscribed', 'You will not receive emails from Strive Journal anymore. You can turn them back on in the app under Settings - Email notifications.'))
    return
  }

  const action = `?uid=${encodeURIComponent(uid)}&token=${encodeURIComponent(token)}`
  res.send(page('Unsubscribe from Strive Journal emails?', 'You will no longer receive the monthly goal reminder or Dear Future Self letters by email.', action))
})

function page(title: string, text: string, action?: string) {
  const form = action
    ? `<form method="post" action="${action}"><button type="submit">Unsubscribe</button></form>`
    : '<a href="https://strivejournal.com">Go to Strive Journal</a>'
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <style>
    body { font-family: 'Barlow', Helvetica, Arial, sans-serif; background: #1e1e1e; color: #ffffff; margin: 0; padding: 48px 16px; text-align: center; }
    main { max-width: 480px; margin: 0 auto; }
    img { width: 160px; margin-bottom: 32px; }
    p { line-height: 1.5; color: #dddddd; }
    button { background: #F7941D; color: #000000; border: 0; border-radius: 6px; padding: 12px 24px; font-size: 16px; font-weight: bold; cursor: pointer; margin-top: 16px; }
    a { color: #00B3A3; }
  </style>
</head>
<body>
  <main>
    <img src="https://strivejournal.com/assets/images/dark/strivejournal-without-margin.png" alt="Strive Journal">
    <h1>${title}</h1>
    <p>${text}</p>
    ${form}
  </main>
</body>
</html>`
}
