export function openCreateGoalModal() {
  cy.get('section.no_goals ion-button').contains('Create Goal').click();
  cy.get('ion-modal').should('be.visible');
  cy.get('ion-title').contains('Create Goal').should('be.visible');
}

export function fillGoalTitle(title: string) {
  cy.ionInput('title', title);
}

export function clickNext() {
  cy.contains('ion-modal ion-button', 'Next').should('not.be.disabled').click();
  cy.wait(500);
}

export function clickPrevious() {
  cy.get('ion-footer ion-button[fill="clear"]').contains('Previous').click();
}

export function clickFinish() {
  cy.contains('ion-modal ion-button', 'Finish').should('not.be.disabled').click();
  cy.wait(500);
}

export function selectPexelsImage() {
  // Wait for images to load from Pexels API
  cy.get('strive-goal-images ul li', { timeout: 15000 }).should('have.length.greaterThan', 0);
  // Click the first image to select it
  cy.get('strive-goal-images ul li').first().click({ force: true });
  // Verify image is selected (shows SELECTED text)
  cy.get('strive-goal-images ul li').first().contains('SELECTED', { timeout: 5000 }).should('be.visible');
}

export function searchImage(query: string) {
  cy.get('strive-goal-images ion-searchbar').shadow().find('input').clear().type(query);
  // Wait for new results to load
  cy.get('strive-goal-images ul li', { timeout: 15000 }).should('have.length.greaterThan', 0);
}

export function addMilestone(content: string) {
  cy.get('strive-roadmap ion-input[formcontrolname="content"]').find('input').clear({ force: true }).type(content, { force: true });
  cy.get('strive-roadmap ion-button').contains('Add').click({ force: true });
}

export function verifyMilestoneExists(content: string) {
  cy.get('strive-roadmap ion-item.milestone').contains(content).should('be.visible');
}

export function verifySuggestionsLoaded() {
  // Wait for the suggestion component to appear and finish generating
  cy.get('strive-suggestion', { timeout: 30000 }).should('be.visible');
  // Wait for suggestions to finish streaming/completing (list of suggestion items appears)
  cy.get('strive-suggestion ion-list.small ion-item', { timeout: 60000 }).should('have.length.greaterThan', 0);
}

export function addSuggestionByIndex(index: number) {
  cy.get('strive-suggestion ion-list.small ion-item').eq(index).click();
}

export function addAllSuggestions() {
  cy.get('strive-suggestion ion-button').contains('Add suggestions').click();
}

export function verifySuggestionAddedToRoadmap(index: number) {
  // After clicking a suggestion, it should appear as a milestone in the roadmap
  cy.get('strive-suggestion ion-list.small ion-item').eq(index).then($item => {
    const text = $item.find('small:not(.number)').text().trim();
    cy.get('strive-roadmap ion-item.milestone').contains(text).should('exist');
  });
}

export function verifyGoalPage(title: string) {
  // After goal creation, the modal closes and we navigate to the goal page
  cy.get('ion-modal', { timeout: 10000 }).should('not.exist');
  cy.url().should('include', '/goal/');
}
