
// Sendgrid Emails
export const templateIds = {
  monthlyGoalReminder: 'd-709a6094be254533a25b421dfad30f9a',
  monthlyGoalFocus: 'd-52d39fea905344bd98d579b9b648106a',
  dearFutureSelfMessage: 'd-dee467720bd04293bb396da7cb090e84'
}

/**
 * This is the ids of the email groups on Sendgrid.
 * We need to pass an id for each template we send to Sendgrid to avoid the default unsubscribe link at the end of the email.
 * Presently, there is only the Reset Password email, the Verification Email and the first invitation email with credentials that are mandatory
*/
export const groupIds = {
  // This is for letting user unsubscribe from every email except the critical ones as reset password.
  unsubscribeAll: 18356,  
  // forceUnsubscribeAll : if we ever need a group to unsubscribe from all email even critical, we will use this namming
  // Critical emails that we don't want users to unsusbcribe
  criticalsEmails: 15136,
  // Use this groupId to remove unsubscribe link at mail bottom. Typically for support emails
  // Note, only "text" emails (as opposition to "html") will remove the unsubscribe link
  // noUnsubscribeLink: 0
}
