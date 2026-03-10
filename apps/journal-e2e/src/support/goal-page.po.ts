// ---------- Goal Page Verification ----------

export function verifyGoalPageLoaded(title: string) {
  cy.get('journal-goal', { timeout: 15000 }).should('exist');
  cy.get('journal-goal h1').should('contain.text', title);
}

export function verifyGoalImage() {
  cy.get('journal-goal picture img[alt="goal image"]', { timeout: 5000 }).should('exist');
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
  cy.get('journal-goal ion-button').contains('Chat').click({ force: true });
  cy.get('strive-header-modal', { timeout: 5000 }).should('exist');
}

export function sendChatMessage(message: string) {
  cy.get('ion-footer ion-textarea textarea', { timeout: 5000 }).type(message, { force: true });
  cy.get('ion-footer ion-icon[name="send"]').click({ force: true });
}

export function verifyChatMessageSent(message: string) {
  cy.get('ion-content ul li', { timeout: 15000 }).contains(message).should('exist');
}

export function closeChatModal() {
  // Click the close/dismiss button (close-outline icon), not the settings button
  cy.get('strive-header-modal ion-button ion-icon[name="close-outline"]').closest('ion-button').click({ force: true });
  cy.wait(1000);
}

// ---------- Follow ----------

export function clickFollow() {
  cy.contains('journal-goal section.actions ion-button', 'Follow').then($btn => {
    $btn[0].click();
  });
}

export function verifyFollowing() {
  cy.contains('journal-goal section.actions ion-button', 'Following', { timeout: 10000 }).should('exist');
}

// ---------- Support ----------

export function addSupport(description: string) {
  cy.get('strive-support-add ion-input input', { timeout: 5000 }).clear({ force: true });
  cy.get('strive-support-add ion-input input').type(description, { force: true });
  cy.get('strive-support-add ion-button').contains('ADD').click({ force: true });
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
  cy.get('journal-goal section.actions ion-button ion-icon[name="ellipsis-horizontal-outline"]').closest('ion-button').click({ force: true });
}

export function clickEditGoalOption() {
  cy.get('ion-popover ion-item', { timeout: 5000 }).contains('Edit Goal').click({ force: true });
}

export function clickEditRemindersOption() {
  cy.get('ion-popover ion-item', { timeout: 5000 }).contains('Edit Reminders').click({ force: true });
}

// ---------- Share ----------

export function openShareButton() {
  cy.get('journal-goal section.actions ion-button ion-icon[name="person-add-outline"]').closest('ion-button').click({ force: true });
}

export function verifyAddOthersModal() {
  cy.get('ion-searchbar[placeholder="Search"]', { timeout: 5000 }).should('exist');
}

export function closeModal() {
  cy.get('strive-header-modal ion-button').first().click({ force: true });
  cy.wait(1000);
}

// ---------- Roadmap Order ----------

export function toggleRoadmapOrder() {
  cy.get('journal-goal section.roadmap header ion-button').click({ force: true });
}

// ---------- Story Order ----------

export function toggleStoryOrder() {
  cy.get('journal-goal section.story header ion-button').click({ force: true });
}

// ---------- Description ----------

export function verifyDescriptionSection() {
  cy.get('journal-goal strive-description').should('exist');
}
