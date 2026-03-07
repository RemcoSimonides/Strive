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

  it('should add milestones to the roadmap', () => {
    // Verify we are on the roadmap step
    cy.get('strive-goal-roadmap').should('be.visible');

    addMilestone('Register for the marathon');
    verifyMilestoneExists('Register for the marathon');

    addMilestone('Complete a 10K run');
    verifyMilestoneExists('Complete a 10K run');

    addMilestone('Complete a half marathon');
    verifyMilestoneExists('Complete a half marathon');

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
