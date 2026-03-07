export function openCreateGoalModal() {
  cy.get('section.no_goals ion-button').contains('Create Goal').click();
  cy.get('ion-modal').should('be.visible');
  cy.get('ion-title').contains('Create Goal').should('be.visible');
}

export function fillGoalTitle(title: string) {
  cy.ionInput('title', title);
}

export function clickNext() {
  cy.get('ion-footer ion-button[fill="solid"]').contains('Next').click();
}

export function clickPrevious() {
  cy.get('ion-footer ion-button[fill="clear"]').contains('Previous').click();
}

export function clickFinish() {
  cy.get('ion-footer ion-button[fill="solid"]').contains('Finish').click();
}

export function selectPexelsImage() {
  // Wait for images to load from Pexels API
  cy.get('strive-goal-images ul li', { timeout: 15000 }).should('have.length.greaterThan', 0);
  // Click the first image to select it
  cy.get('strive-goal-images ul li').first().click();
  // Verify image is selected (shows SELECTED text)
  cy.get('strive-goal-images ul li').first().contains('SELECTED').should('be.visible');
}

export function searchImage(query: string) {
  cy.get('strive-goal-images ion-searchbar').shadow().find('input').clear().type(query);
  // Wait for new results to load
  cy.get('strive-goal-images ul li', { timeout: 15000 }).should('have.length.greaterThan', 0);
}

export function addMilestone(content: string) {
  cy.get('strive-roadmap ion-input[formcontrolname="content"]').find('input').clear().type(content);
  cy.get('strive-roadmap ion-button').contains('Add').click();
}

export function verifyMilestoneExists(content: string) {
  cy.get('strive-roadmap ion-item.milestone').contains(content).should('be.visible');
}

export function verifyGoalPage(title: string) {
  // After goal creation, the modal closes and we navigate to the goal page
  cy.get('ion-modal', { timeout: 10000 }).should('not.exist');
  cy.url().should('include', '/goal/');
}
