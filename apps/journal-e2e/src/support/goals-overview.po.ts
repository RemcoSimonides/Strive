// ---------- Goals Overview Page ----------

export function verifyGoalsOverviewLoaded() {
  cy.get('strive-header-root', { timeout: 10000 }).should('exist');
  cy.get('ion-content').should('exist');
}

export function verifyEmptyState() {
  cy.get('section.no_goals').should('be.visible');
  cy.get('section.no_goals').contains('No goals yet. Create your first.').should('be.visible');
  cy.get('section.no_goals ion-button').contains('Create Goal').should('be.visible');
}

export function verifyGoalCardExists(title: string) {
  cy.get('section.cards strive-goal-thumbnail', { timeout: 10000 })
    .contains(title)
    .should('be.visible');
}

export function verifyGoalCardCount(count: number) {
  cy.get('section.cards strive-goal-thumbnail', { timeout: 10000 })
    .should('have.length', count);
}

export function clickGoalCard(title: string) {
  cy.get('section.cards strive-goal-thumbnail')
    .contains(title)
    .closest('strive-goal-thumbnail')
    .click();
}

export function verifyCreateGoalButtonInHeader() {
  cy.get('header ion-button.create-goal').contains('Create Goal').should('be.visible');
}

export function clickCreateGoalButtonInHeader() {
  cy.get('header ion-button.create-goal').contains('Create Goal').click();
  cy.get('ion-modal').should('be.visible');
}

export function verifyFilterButton() {
  cy.get('header ion-button ion-icon[name="filter-outline"]').should('exist');
}

export function verifyGoalHasProgressBar(title: string) {
  cy.get('section.cards strive-goal-thumbnail')
    .contains(title)
    .closest('strive-goal-thumbnail')
    .find('ion-progress-bar')
    .should('exist');
}

export function verifyGoalHasImage(title: string) {
  cy.get('section.cards strive-goal-thumbnail')
    .contains(title)
    .closest('strive-goal-thumbnail')
    .find('ion-thumbnail img')
    .should('exist');
}

export function openGoalOptionsMenu(title: string) {
  cy.get('section.cards strive-goal-thumbnail')
    .contains(title)
    .closest('strive-goal-thumbnail')
    .find('ion-button ion-icon[name="ellipsis-vertical"]')
    .closest('ion-button')
    .click({ force: true });
}

export function verifyGoalOptionsMenu() {
  cy.get('ion-popover', { timeout: 5000 }).should('be.visible');
}

export function clickCreateGoalFromEmptyState() {
  cy.get('section.no_goals ion-button').contains('Create Goal').click();
  cy.get('ion-modal').should('be.visible');
}
