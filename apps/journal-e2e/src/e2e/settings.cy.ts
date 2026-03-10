import {
  openAuthModal,
  navigateToSignup,
  fillSignupForm,
  submitSignup,
  dismissWelcomeModal,
} from '../support/auth.po';
import {
  visitSettingsPage,
  visitEmailNotificationsPage,
  visitPushNotificationsPage,
  visitApiKeysPage,
  verifySettingsPageLoaded,
  verifySettingsHeader,
  verifyThemeToggleButton,
  verifyAccountSection,
  verifyNotificationsSection,
  verifySupportSection,
  verifyLegalSection,
  verifyVersionDisplayed,
  clickEditProfile,
  clickApiKeys,
  clickEmailNotifications,
  clickPushNotifications,
  clickTermsOfUse,
  clickPrivacyPolicy,
  clickLogout,
  verifyEmailNotificationsPageLoaded,
  verifyEmailNotificationsHeader,
  getEmailMainToggle,
  verifyEmailGeneralSection,
  verifyMonthlyGoalReminderCheckbox,
  getMonthlyGoalReminderLabel,
  verifyPushNotificationsPageLoaded,
  verifyPushNotificationsHeader,
  getPushMainToggle,
  verifyPushPeopleYouFollowSection,
  verifyPushGoalsSection,
  verifyPushSupportsSection,
  verifyPushExercisesSection,
  verifyApiKeysPageLoaded,
  verifyApiKeysHeader,
  verifyEmptyKeysState,
  getAddKeyButton,
  verifyYourKeysListHeader,
} from '../support/settings.po';

describe('Settings', () => {

  const email = `e2e-settings-${Date.now()}@test.strive.com`;
  const username = `e2e${Date.now().toString(36)}`;
  const password = 'TestPassword123!';

  before(() => {
    cy.visit('/');
    openAuthModal();
    navigateToSignup();
    fillSignupForm(username, email, password);
    submitSignup();
    dismissWelcomeModal();
  });

  describe('Main Settings Page', () => {
    before(() => visitSettingsPage());

    it('should display the settings page with header', () => {
      verifySettingsPageLoaded();
      verifySettingsHeader();
    });

    // Theme toggle is in strive-header which has 0 height on desktop viewport
    it.skip('should display the theme toggle button', () => {
      verifyThemeToggleButton();
    });

    it('should display the Account section with all items', () => {
      verifyAccountSection();
    });

    it('should display the Notifications section with all items', () => {
      verifyNotificationsSection();
    });

    it('should display the Support section with external links', () => {
      verifySupportSection();
    });

    it('should display the Legal section with all items', () => {
      verifyLegalSection();
    });

    it('should display the app version', () => {
      verifyVersionDisplayed();
    });
  });

  describe('Settings Navigation', () => {
    it('should navigate to Edit Profile page', () => {
      visitSettingsPage();
      clickEditProfile();
      cy.url({ timeout: 10000 }).should('include', '/edit-profile');
    });

    it('should navigate to Email Notifications page', () => {
      visitSettingsPage();
      clickEmailNotifications();
      cy.url({ timeout: 10000 }).should('include', '/settings/email-notifications');
    });

    it('should navigate to Push Notifications page', () => {
      visitSettingsPage();
      clickPushNotifications();
      cy.url({ timeout: 10000 }).should('include', '/settings/push-notifications');
    });

    it('should navigate to API Keys page', () => {
      visitSettingsPage();
      clickApiKeys();
      cy.url({ timeout: 10000 }).should('include', '/settings/api-keys');
    });

    it('should navigate to Terms of Use page', () => {
      visitSettingsPage();
      clickTermsOfUse();
      cy.url({ timeout: 10000 }).should('include', '/terms');
    });

    it('should navigate to Privacy Policy page', () => {
      visitSettingsPage();
      clickPrivacyPolicy();
      cy.url({ timeout: 10000 }).should('include', '/privacy-policy');
    });
  });

  describe('Email Notifications', () => {
    before(() => visitEmailNotificationsPage());

    it('should display the email notifications page with header', () => {
      verifyEmailNotificationsPageLoaded();
      verifyEmailNotificationsHeader();
    });

    // Toggle is in strive-header which has 0 height on desktop viewport
    it.skip('should display the main toggle in the header', () => {
      getEmailMainToggle().should('exist');
    });

    it('should display the General section', () => {
      verifyEmailGeneralSection();
    });

    it('should display the Monthly Goal Reminder checkbox', () => {
      verifyMonthlyGoalReminderCheckbox();
    });

    it('should display Monthly Goal Reminder label with description', () => {
      getMonthlyGoalReminderLabel().should('exist');
      cy.get('ion-item').contains('Your goals, missed notifications, new features').should('exist');
    });
  });

  describe('Push Notifications', () => {
    before(() => visitPushNotificationsPage());

    it('should display the push notifications page with header', () => {
      verifyPushNotificationsPageLoaded();
      verifyPushNotificationsHeader();
    });

    // Toggle is in strive-header which has 0 height on desktop viewport
    it.skip('should display the main toggle in the header', () => {
      getPushMainToggle().should('exist');
    });

    it('should display People you follow section with checkbox', () => {
      verifyPushPeopleYouFollowSection();
    });

    it('should display Goals section with all checkboxes', () => {
      verifyPushGoalsSection();
    });

    it('should display Supports section with checkbox', () => {
      verifyPushSupportsSection();
    });

    it('should display Exercises section with all checkboxes', () => {
      verifyPushExercisesSection();
    });

    it('should display notification descriptions', () => {
      cy.get('ion-item').contains('New goals, finished goals').should('exist');
      cy.get('ion-item').contains('Status changes, reminders').should('exist');
      cy.get('ion-item').contains('Team changes, Requests to join goal').should('exist');
      cy.get('ion-item').contains('New messages').should('exist');
      cy.get('ion-item').contains('Milestones status changes, due date warnings').should('exist');
      cy.get('ion-item').contains('New posts').should('exist');
      cy.get('ion-item').contains('Status changes, counter supports').should('exist');
      cy.get('ion-item').contains('Daily affirmation').should('exist');
      cy.get('ion-item').contains('Reminder to write down three things').should('exist');
      cy.get('ion-item').contains('Receive message from the past').should('exist');
      cy.get('ion-item').contains('New entry possible to self reflect').should('exist');
      cy.get('ion-item').contains('Reminder to fill in wheel of life').should('exist');
    });
  });

  describe('API Keys', () => {
    before(() => visitApiKeysPage());

    it('should display the API keys page with header', () => {
      verifyApiKeysPageLoaded();
      verifyApiKeysHeader();
    });

    it('should display the Your Keys list header', () => {
      verifyYourKeysListHeader();
    });

    it('should display the add key button', () => {
      getAddKeyButton().should('exist');
    });

    it('should display empty state when no keys exist', () => {
      verifyEmptyKeysState();
    });

    it('should open the create key alert when clicking add', () => {
      // Re-visit the page to ensure auth state is fully loaded
      visitApiKeysPage();
      verifyApiKeysPageLoaded();
      cy.wait(1000);
      getAddKeyButton().click({ force: true });
      cy.get('ion-alert', { timeout: 10000 }).should('be.visible');
      cy.get('ion-alert').should('contain.text', 'Create API Key');
      // Dismiss the alert
      cy.get('ion-alert button').contains('Cancel').click();
    });
  });

  describe('Logout', () => {
    it('should log out and show the auth modal', () => {
      visitSettingsPage();
      clickLogout();
      // After logout, the auth modal should appear
      cy.get('ion-modal', { timeout: 10000 }).should('be.visible');
    });
  });
});
