export function openAuthModal() {
  cy.get('.overview li.main').contains('Create goal').click();
}

export function navigateToSignup() {
  // "Create goal" opens the modal in register mode, so we're already on the signup view
  cy.contains('ion-button', 'Sing up with Email').click();
}

export function navigateToLogin() {
  cy.contains('ion-button', 'Log in with Email').click();
}

export function fillSignupForm(username: string, email: string, password: string) {
  cy.ionInput('username', username);
  cy.ionInput('email', email);
  cy.ionInput('password', password);
}

export function fillLoginForm(email: string, password: string) {
  cy.ionInput('email', email);
  cy.ionInput('password', password);
}

export function submitSignup() {
  cy.contains('ion-button', 'Register').click();
}

export function submitLogin() {
  cy.get('ion-button.main-action').contains('Log in').click();
}

export function dismissWelcomeModal() {
  cy.contains('ion-button', 'Skip').click();
  cy.contains('ion-button', 'Explore Around').click();
}

export function logout() {
  cy.visit('/settings');
  cy.contains('ion-item', 'Log out').click();
}
