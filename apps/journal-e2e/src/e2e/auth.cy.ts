import {
  openAuthModal,
  navigateToSignup,
  navigateToLogin,
  fillSignupForm,
  fillLoginForm,
  submitSignup,
  submitLogin,
  dismissWelcomeModal,
  logout,
} from '../support/auth.po';

describe('Authentication Flow', () => {
  const email = `e2e-${Date.now()}@test.strive.com`;
  const password = 'TestPassword123!';
  const username = `e2e${Date.now().toString(36)}`;

  it('should sign up with email and password', () => {
    cy.visit('/');
    openAuthModal();
    navigateToSignup();
    fillSignupForm(username, email, password);
    submitSignup();
    dismissWelcomeModal();

    // After signup, user is logged in — home landing page should not be visible
    cy.get('journal-home').should('not.exist');
    // New user has no goals, so the no_goals section should be visible
    cy.get('section.no_goals').should('be.visible');
  });

  it('should log out', () => {
    logout();

    // After logout, user is redirected to home and auth modal opens in login mode
    cy.get('journal-home').should('exist');
  });

  it('should log in with existing credentials', () => {
    // After logout, the auth modal is already open in login mode
    navigateToLogin();
    fillLoginForm(email, password);
    submitLogin();

    // Wait for modal to dismiss (login succeeded)
    cy.get('ion-modal').should('not.exist');
    // Navigate to goals page via app navigation
    cy.get('ion-button[routerlink="/goals"]').click();
    // Same user still has no goals
    cy.get('section.no_goals').should('be.visible');
  });
});
