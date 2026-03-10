// ---------- Navigation ----------

export function visitSettingsPage() {
  cy.visit('/settings');
}

export function visitEmailNotificationsPage() {
  cy.visit('/settings/email-notifications');
}

export function visitPushNotificationsPage() {
  cy.visit('/settings/push-notifications');
}

export function visitApiKeysPage() {
  cy.visit('/settings/api-keys');
}

// ---------- Main Settings Page ----------

export function verifySettingsPageLoaded() {
  cy.get('journal-settings', { timeout: 10000 }).should('exist');
}

export function verifySettingsHeader() {
  cy.get('strive-header').should('contain.text', 'Settings');
}

export function verifyThemeToggleButton() {
  cy.get('strive-header ion-button ion-icon').first().should('exist');
}

export function clickThemeToggle() {
  cy.get('strive-header ion-button').first().click();
}

export function verifyAccountSection() {
  cy.get('ion-list-header').contains('Account').should('exist');
  cy.get('ion-item').contains('Edit Profile').should('exist');
  cy.get('ion-item').contains('API Keys').should('exist');
  cy.get('ion-item').contains('Log out').should('exist');
}

export function verifyNotificationsSection() {
  cy.get('ion-list-header').contains('Notifications').should('exist');
  cy.get('ion-item').contains('Email Notifications').should('exist');
  cy.get('ion-item').contains('Push Notifications').should('exist');
}

export function verifySupportSection() {
  cy.get('ion-list-header').contains('Support').should('exist');
  cy.get('ion-item').contains('Guides').should('exist');
  cy.get('ion-item').contains('Blog').should('exist');
  cy.get('ion-item').contains('Questions or Feedback').should('exist');
}

export function verifyLegalSection() {
  cy.get('ion-list-header').contains('Legal').should('exist');
  cy.get('ion-item').contains('Terms of Use').should('exist');
  cy.get('ion-item').contains('Privacy Policy').should('exist');
}

export function verifyVersionDisplayed() {
  cy.get('span.version').should('exist');
}

export function clickEditProfile() {
  cy.get('ion-item').contains('Edit Profile').click();
}

export function clickApiKeys() {
  cy.get('ion-item').contains('API Keys').click();
}

export function clickLogout() {
  cy.get('ion-item').contains('Log out').click();
}

export function clickEmailNotifications() {
  cy.get('ion-item').contains('Email Notifications').click();
}

export function clickPushNotifications() {
  cy.get('ion-item').contains('Push Notifications').click();
}

export function clickTermsOfUse() {
  cy.get('ion-item').contains('Terms of Use').click();
}

export function clickPrivacyPolicy() {
  cy.get('ion-item').contains('Privacy Policy').click();
}

// ---------- Email Notifications Page ----------

export function verifyEmailNotificationsPageLoaded() {
  cy.get('journal-email-notification-settings', { timeout: 10000 }).should('exist');
}

export function verifyEmailNotificationsHeader() {
  cy.get('strive-header').should('contain.text', 'Email Notifications');
}

export function getEmailMainToggle() {
  return cy.get('strive-header ion-toggle');
}

export function verifyEmailGeneralSection() {
  cy.get('ion-list-header').contains('General').should('exist');
}

export function verifyMonthlyGoalReminderCheckbox() {
  cy.get('ion-checkbox[formcontrolname="monthlyGoalReminder"]').should('exist');
}

export function getMonthlyGoalReminderLabel() {
  return cy.get('ion-item').contains('Monthly Goal Reminder');
}

// ---------- Push Notifications Page ----------

export function verifyPushNotificationsPageLoaded() {
  cy.get('journal-push-notification-settings', { timeout: 10000 }).should('exist');
}

export function verifyPushNotificationsHeader() {
  cy.get('strive-header').should('contain.text', 'Push Notifications');
}

export function getPushMainToggle() {
  return cy.get('strive-header ion-toggle');
}

export function verifyPushPeopleYouFollowSection() {
  cy.get('ion-list-header').contains('People you follow').should('exist');
  cy.get('ion-checkbox[formcontrolname="userSpectatingGeneral"]').should('exist');
}

export function verifyPushGoalsSection() {
  cy.get('ion-list-header').contains('Goals').should('exist');
  cy.get('ion-checkbox[formcontrolname="goalGeneral"]').should('exist');
  cy.get('ion-checkbox[formcontrolname="goalTeam"]').should('exist');
  cy.get('ion-checkbox[formcontrolname="goalChat"]').should('exist');
  cy.get('ion-checkbox[formcontrolname="goalRoadmap"]').should('exist');
  cy.get('ion-checkbox[formcontrolname="goalStory"]').should('exist');
}

export function verifyPushSupportsSection() {
  cy.get('ion-list-header').contains('Supports').should('exist');
  cy.get('ion-checkbox[formcontrolname="supports"]').should('exist');
}

export function verifyPushExercisesSection() {
  cy.get('ion-list-header').contains('Exercises').should('exist');
  cy.get('ion-checkbox[formcontrolname="exerciseAffirmations"]').should('exist');
  cy.get('ion-checkbox[formcontrolname="exerciseDailyGratitude"]').should('exist');
  cy.get('ion-checkbox[formcontrolname="exerciseDearFutureSelf"]').should('exist');
  cy.get('ion-checkbox[formcontrolname="exerciseSelfReflect"]').should('exist');
  cy.get('ion-checkbox[formcontrolname="exerciseWheelOfLife"]').should('exist');
}

export function getPushCheckbox(formControlName: string) {
  return cy.get(`ion-checkbox[formcontrolname="${formControlName}"]`);
}

// ---------- API Keys Page ----------

export function verifyApiKeysPageLoaded() {
  cy.get('journal-api-keys', { timeout: 10000 }).should('exist');
}

export function verifyApiKeysHeader() {
  cy.get('strive-header').should('contain.text', 'API Keys');
}

export function verifyEmptyKeysState() {
  cy.get('p.empty-state').should('contain.text', 'No API keys yet');
}

export function getAddKeyButton() {
  return cy.get('ion-list-header ion-button');
}

export function verifyYourKeysListHeader() {
  cy.get('ion-list-header').contains('Your Keys').should('exist');
}

export function getApiKeyItems() {
  return cy.get('ion-item .key-meta');
}

export function getApiKeyDeleteButton(keyName: string) {
  return cy.get('ion-item')
    .contains(keyName)
    .closest('ion-item')
    .find('ion-button[color="danger"]');
}
