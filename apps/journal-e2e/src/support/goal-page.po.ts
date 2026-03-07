// ---------- Goal Page Verification ----------

export function verifyGoalPageLoaded(title: string) {
  cy.get('journal-goal', { timeout: 15000 }).should('exist');
  cy.get('journal-goal h1').should('contain.text', title);
}

export function verifyGoalImage() {
  cy.get('journal-goal picture img[alt="goal image"]').should('exist');
}

export function verifyRoadmapSection() {
  cy.get('journal-goal section.roadmap').should('exist');
  cy.get('journal-goal section.roadmap h5').should('contain.text', 'Roadmap');
}

export function verifyMilestoneInRoadmap(content: string) {
  cy.get('journal-goal strive-roadmap ion-item.milestone').contains(content).should('exist');
}

export function verifyGoalProperties() {
  // Verify achiever, supporter, follower counts are shown
  cy.get('journal-goal ul.properties li').should('have.length.greaterThan', 0);
}

export function verifyDeadlineShown() {
  cy.get('journal-goal ul.properties li').contains('End date').should('exist');
}

// ---------- Chat ----------

export function openChat() {
  cy.get('journal-goal ion-button').contains('Chat').click();
  cy.get('strive-header-modal', { timeout: 5000 }).should('exist');
}

export function sendChatMessage(message: string) {
  cy.get('ion-footer ion-textarea textarea').type(message);
  cy.get('ion-footer ion-icon[name="send"]').click();
}

export function verifyChatMessageSent(message: string) {
  cy.get('ion-content ul li', { timeout: 10000 }).contains(message).should('be.visible');
}

export function closeChatModal() {
  cy.get('strive-header-modal ion-button').first().click();
  cy.get('strive-header-modal').should('not.exist');
}

// ---------- Follow ----------

export function clickFollow() {
  cy.get('journal-goal section.actions ion-button').contains('Follow').click();
}

export function verifyFollowing() {
  cy.get('journal-goal section.actions ion-button').contains('Following').should('exist');
}

// ---------- Support ----------

export function addSupport(description: string) {
  cy.get('strive-support-add ion-input input').clear();
  cy.get('strive-support-add ion-input input').type(description);
  cy.get('strive-support-add ion-button').contains('ADD').click();
}

export function verifySupportExists(description: string) {
  cy.get('journal-goal section.supports', { timeout: 10000 }).contains(description).should('exist');
}

// ---------- Story ----------

export function verifyStorySection() {
  cy.get('journal-goal section.story').should('exist');
  cy.get('journal-goal section.story h5').should('contain.text', 'Story');
}

// ---------- Options Menu ----------

export function openOptionsMenu() {
  cy.get('journal-goal section.actions ion-button ion-icon[name="ellipsis-horizontal-outline"]').closest('ion-button').click();
}

export function clickEditGoalOption() {
  cy.get('ion-popover ion-item').contains('Edit Goal').click();
}

export function clickEditRemindersOption() {
  cy.get('ion-popover ion-item').contains('Edit Reminders').click();
}

// ---------- Share ----------

export function openShareButton() {
  cy.get('journal-goal section.actions ion-button ion-icon[name="person-add-outline"]').closest('ion-button').click();
}

export function verifyAddOthersModal() {
  cy.get('ion-searchbar[placeholder="Search"]', { timeout: 5000 }).should('exist');
}

export function closeModal() {
  cy.get('strive-header-modal ion-button').first().click();
}

// ---------- Roadmap Order ----------

export function toggleRoadmapOrder() {
  cy.get('journal-goal section.roadmap header ion-button').click();
}

// ---------- Story Order ----------

export function toggleStoryOrder() {
  cy.get('journal-goal section.story header ion-button').click();
}

// ---------- Description ----------

export function verifyDescriptionSection() {
  cy.get('journal-goal strive-description').should('exist');
}
