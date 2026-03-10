import {
  openAuthModal,
  navigateToSignup,
  fillSignupForm,
  submitSignup,
  dismissWelcomeModal,
} from '../support/auth.po';
import {
  fillGoalTitle,
  clickNext,
  clickFinish,
  addMilestone,
} from '../support/goal.po';
import {
  verifyGoalsOverviewLoaded,
  verifyEmptyState,
  verifyGoalCardExists,
  verifyGoalCardCount,
  clickGoalCard,
  verifyCreateGoalButtonInHeader,
  verifyFilterButton,
  verifyGoalHasProgressBar,
  verifyGoalHasImage,
  openGoalOptionsMenu,
  verifyGoalOptionsMenu,
  clickCreateGoalButtonInHeader,
  clickCreateGoalFromEmptyState,
} from '../support/goals-overview.po';

describe('Goals Overview Page', () => {
  const email = `e2e-${Date.now()}@test.strive.com`;
  const password = 'TestPassword123!';
  const username = `e2e${Date.now().toString(36)}`;
  const goal1Title = 'Learn to cook Italian food';
  const goal2Title = 'Read 20 books this year';

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

  describe('Empty State', () => {
    it('should display the goals overview page', () => {
      verifyGoalsOverviewLoaded();
    });

    it('should show the empty state when no goals exist', () => {
      verifyEmptyState();
    });

    it('should open the create goal modal from the empty state', () => {
      clickCreateGoalFromEmptyState();
      // Close the modal without creating
      cy.get('ion-modal ion-header ion-button', { timeout: 5000 }).first().click({ force: true });
      cy.wait(1000);
    });
  });

  describe('With Goals', () => {
    before(() => {
      // Create first goal
      cy.visit('/');
      createGoalQuickly(goal1Title);

      // Navigate back to overview
      cy.visit('/');

      // Create second goal
      createGoalQuickly(goal2Title);

      // Navigate back to overview and wait for goal cards to load
      cy.visit('/');
      cy.get('section.cards strive-goal-thumbnail', { timeout: 15000 }).should('have.length.gte', 2);
    });

    it('should display goal cards for created goals', () => {
      verifyGoalCardExists(goal1Title);
      verifyGoalCardExists(goal2Title);
    });

    it('should show two goal cards', () => {
      verifyGoalCardCount(2);
    });

    it('should show the Create Goal button in the header', () => {
      verifyCreateGoalButtonInHeader();
    });

    it('should show the filter button', () => {
      verifyFilterButton();
    });

    it('should display a progress bar on each goal card', () => {
      verifyGoalHasProgressBar(goal1Title);
      verifyGoalHasProgressBar(goal2Title);
    });

    it('should display an image on each goal card', () => {
      verifyGoalHasImage(goal1Title);
      verifyGoalHasImage(goal2Title);
    });

    it('should open the options menu on a goal card', () => {
      openGoalOptionsMenu(goal1Title);
      verifyGoalOptionsMenu();
      // Dismiss the popover by pressing Escape
      cy.get('body').type('{esc}', { force: true });
      cy.wait(500);
    });

    it('should navigate to the goal page when clicking a card', () => {
      clickGoalCard(goal1Title);
      cy.url({ timeout: 10000 }).should('include', '/goal/');
      cy.get('journal-goal h1', { timeout: 10000 }).should('contain.text', goal1Title);
    });

    it('should navigate back to the overview', () => {
      cy.visit('/');
      verifyGoalsOverviewLoaded();
      verifyGoalCardExists(goal1Title);
    });

    it('should open the create goal modal from the header button', () => {
      clickCreateGoalButtonInHeader();
      // Close the modal without creating
      cy.get('ion-modal ion-header ion-button', { timeout: 5000 }).first().click({ force: true });
      cy.wait(1000);
    });
  });
});

/**
 * Helper to quickly create a goal with minimal steps (skips image selection and milestones).
 */
function createGoalQuickly(title: string) {
  // Wait for page to settle, then open create modal from either empty state or header
  cy.get('ion-content', { timeout: 10000 }).should('exist');
  // Use a single contains that matches the Create Goal button regardless of location
  cy.contains('ion-button', 'Create Goal', { timeout: 10000 }).first().click({ force: true });
  cy.get('ion-modal', { timeout: 5000 }).should('be.visible');
  fillGoalTitle(title);
  clickNext();

  // Skip image step
  cy.get('strive-goal-images', { timeout: 10000 }).should('exist');
  clickNext();

  // Add one milestone for realism
  cy.get('strive-goal-roadmap', { timeout: 10000 }).should('exist');
  addMilestone('First step');
  clickNext();

  // Skip reminders
  cy.get('strive-reminders').should('exist');
  clickNext();

  // Finish
  cy.get('strive-goal-share').should('exist');
  clickFinish();

  // Wait for navigation to goal page
  cy.url({ timeout: 10000 }).should('include', '/goal/');
}
