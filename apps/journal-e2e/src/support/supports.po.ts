// ---------- Navigation ----------

export function visitSupportsPage() {
  cy.visit('/supports');
}

// ---------- Page Verification ----------

export function verifySupportsPageLoaded() {
  cy.get('journal-supports', { timeout: 10000 }).should('exist');
}

export function verifySupportsHeader() {
  cy.get('journal-supports strive-header-root').should('exist');
}

export function verifyEmptyState() {
  cy.get('journal-supports section.empty', { timeout: 10000 }).should('exist');
  cy.get('journal-supports section.empty i').should('contain.text', 'No supports yet');
}

// ---------- Support List ----------

export function verifySupportListExists() {
  cy.get('journal-supports strive-support-list', { timeout: 10000 }).should('exist');
}

export function verifySupportPledgeExists(description: string) {
  cy.get('journal-supports strive-support-pledge', { timeout: 10000 }).contains(description).should('exist');
}

export function verifySupportCount(count: number) {
  cy.get('journal-supports strive-support-pledge', { timeout: 10000 }).should('have.length', count);
}

export function verifyGoalLinkExists(goalTitle: string) {
  cy.get('journal-supports strive-support-list a', { timeout: 10000 }).contains(goalTitle).should('exist');
}

export function clickSupportPledge(description: string) {
  cy.get('journal-supports strive-support-list ion-item', { timeout: 10000 })
    .contains(description)
    .closest('ion-item')
    .click({ force: true });
}

// ---------- Support Detail Modal ----------

export function verifySupportDetailModal() {
  cy.get('ion-modal strive-support-details', { timeout: 10000 }).should('exist');
}

export function verifySupportStatus(statusText: string) {
  cy.get('strive-support-details section.details small.status', { timeout: 10000 })
    .should('contain.text', statusText);
}

export function verifySupportCreatedDate() {
  cy.get('strive-support-details section.details small').contains('Created:').should('exist');
}

export function verifyGiveButton(recipientUsername: string) {
  cy.get('strive-support-details section.actions ion-button')
    .contains(`Give to ${recipientUsername}`)
    .should('exist');
}

export function verifyRemoveButton() {
  cy.get('strive-support-details section.actions ion-button')
    .contains('Remove Support')
    .should('exist');
}

export function clickGiveButton() {
  cy.get('strive-support-details section.actions ion-button.secondary').click();
}

export function confirmGiveSupport() {
  cy.get('ion-alert button').contains('Yes').click();
}

export function clickRemoveButton() {
  cy.get('strive-support-details section.actions ion-button.danger').click();
}

export function confirmRemoveSupport() {
  cy.get('ion-alert button').contains('Yes').click();
}

export function verifyGoalLink(goalTitle: string) {
  cy.get('strive-support-details small.gray a').contains(goalTitle).should('exist');
}

// ---------- Decision Component ----------

export function verifyDecisionComponent() {
  cy.get('strive-support-decision', { timeout: 10000 }).should('exist');
}

export function clickGiveDecision() {
  cy.get('strive-support-decision ion-button').contains('Give').click();
}

export function clickRejectDecision() {
  cy.get('strive-support-decision ion-button').contains('Reject').click();
}

// ---------- Counter Support ----------

export function verifyCounterForm() {
  cy.get('strive-support-details ion-list.counter-form', { timeout: 10000 }).should('exist');
}

export function fillCounterSupport(description: string) {
  cy.get('strive-support-details ion-list.counter-form ion-input input').clear().type(description);
}

export function saveCounterSupport() {
  cy.get('strive-support-details ion-list.counter-form ion-button').contains('Save').click();
}

// ---------- Support List Item Styles ----------

export function verifySupportIsDisabled(description: string) {
  cy.get('journal-supports strive-support-list ion-item')
    .contains(description)
    .closest('ion-item')
    .should('have.class', 'fake-disable');
}

export function verifySupportIsActive(description: string) {
  cy.get('journal-supports strive-support-list ion-item')
    .contains(description)
    .closest('ion-item')
    .should('not.have.class', 'fake-disable');
}

export function navigateBackToSupports() {
  // Close the support detail modal
  cy.get('ion-modal strive-header-modal ion-button').first().click({ force: true });
  cy.get('ion-modal', { timeout: 5000 }).should('not.exist');
}
