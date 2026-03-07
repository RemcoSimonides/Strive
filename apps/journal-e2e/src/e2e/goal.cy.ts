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
  selectPexelsImage,
  addMilestone,
  verifyMilestoneExists,
  verifySuggestionsLoaded,
  addSuggestionByIndex,
  addAllSuggestions,
  verifySuggestionAddedToRoadmap,
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
    cy.get('section.no_goals').should('be.visible');
  });

  it('should open the goal creation modal', () => {
    openCreateGoalModal();
  });

  it('should fill in goal details and proceed', () => {
    fillGoalTitle(goalTitle);
    // Deadline is pre-filled by default, so we can proceed
    clickNext();
  });

  it('should select an image from Pexels', () => {
    // Verify we are on the images step
    cy.get('strive-goal-images').should('be.visible');
    selectPexelsImage();
    clickNext();
  });

  it('should load milestone suggestions from ChatGPT', () => {
    // Verify we are on the roadmap step
    cy.get('strive-goal-roadmap').should('be.visible');

    // Wait for AI-generated milestone suggestions to load
    verifySuggestionsLoaded();
  });

  it('should add a suggestion to the roadmap by clicking it', () => {
    // Click the first suggestion to add it as a milestone
    addSuggestionByIndex(0);
    verifySuggestionAddedToRoadmap(0);
  });

  it('should add all remaining suggestions to the roadmap', () => {
    // Use the "Add suggestions" button to add all suggestions at once
    addAllSuggestions();

    // Verify each suggestion item shows as added (has fake-disable class)
    cy.get('strive-suggestion ion-list.small ion-item').each($item => {
      cy.wrap($item).should('have.class', 'fake-disable');
    });
  });

  it('should also add manual milestones to the roadmap', () => {
    addMilestone('Register for the marathon');
    verifyMilestoneExists('Register for the marathon');

    addMilestone('Complete a 10K run');
    verifyMilestoneExists('Complete a 10K run');

    clickNext();
  });

  it('should skip reminders step', () => {
    // Verify we are on the reminders step
    cy.get('strive-reminders').should('exist');
    clickNext();
  });

  it('should finish goal creation and navigate to goal page', () => {
    // Verify we are on the share step
    cy.get('strive-goal-share').should('exist');
    clickFinish();
    verifyGoalPage(goalTitle);
  });
});
