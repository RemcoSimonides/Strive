import {
  openAuthModal,
  navigateToSignup,
  fillSignupForm,
  submitSignup,
  dismissWelcomeModal,
} from '../support/auth.po';
import {
  openCreateGoalModal,
  fillGoalTitle,
  clickNext,
  clickFinish,
  addMilestone,
  verifyMilestoneExists,
  verifySuggestionsLoaded,
  addSuggestionByIndex,
  addAllSuggestions,
  verifyGoalPage,
} from '../support/goal.po';

describe('Goal Creation Flow', () => {
  const email = `e2e-${Date.now()}@test.strive.com`;
  const password = 'TestPassword123!';
  const username = `e2e${Date.now().toString(36)}`;
  const goalTitle = 'Run a marathon';

  before(() => {
    cy.visit('/');
    openAuthModal();
    navigateToSignup();
    fillSignupForm(username, email, password);
    submitSignup();
    dismissWelcomeModal();
    // dismissWelcomeModal navigates to explore page, go back to goals
    cy.visit('/');
    cy.get('section.no_goals', { timeout: 10000 }).should('be.visible');
  });

  it('should open the goal creation modal', () => {
    openCreateGoalModal();
  });

  it('should fill in goal details and proceed', () => {
    fillGoalTitle(goalTitle);
    // Deadline is pre-filled by default, so we can proceed
    clickNext();
  });

  it('should skip image step and proceed to roadmap', () => {
    // Verify we are on the images step
    cy.get('strive-goal-images', { timeout: 10000 }).should('exist');
    // Skip image selection - just click Next
    clickNext();
    cy.get('strive-goal-roadmap', { timeout: 10000 }).should('exist');
  });

  it('should load milestone suggestions from ChatGPT', () => {

    // Wait for AI-generated milestone suggestions to load
    verifySuggestionsLoaded();
  });

  it('should add a suggestion to the roadmap by clicking it', () => {
    addSuggestionByIndex(0);
    // Verify at least one milestone was added
    cy.get('strive-roadmap ion-item.milestone', { timeout: 5000 })
      .should('have.length.gte', 1);
  });

  it('should add all remaining suggestions to the roadmap', () => {
    // Wait for suggestions to finish loading, then add all
    cy.get('strive-suggestion ion-button', { timeout: 30000 }).contains('Add suggestions').click({ force: true });
    // Verify suggestions are marked as added
    cy.get('strive-suggestion ion-list.small ion-item', { timeout: 5000 }).first()
      .should('have.class', 'fake-disable');
  });

  it('should also add manual milestones to the roadmap', () => {
    addMilestone('Register for the marathon');
    verifyMilestoneExists('Register for the marathon');

    addMilestone('Complete a 10K run');
    verifyMilestoneExists('Complete a 10K run');

    clickNext();
    // Verify we advanced to reminders
    cy.get('strive-reminders', { timeout: 10000 }).should('exist');
  });

  it('should skip reminders step', () => {
    clickNext();
    // Verify we advanced to share
    cy.get('strive-goal-share', { timeout: 10000 }).should('exist');
  });

  it('should finish goal creation and navigate to goal page', () => {
    clickFinish();
    verifyGoalPage(goalTitle);
  });
});
