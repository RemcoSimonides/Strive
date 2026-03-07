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
      cy.get('ion-modal ion-button ion-icon[name="close"]').first().click();
      cy.get('ion-modal').should('not.exist');
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

      // Navigate back to overview
      cy.visit('/');
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
      // Dismiss the popover by clicking backdrop
      cy.get('ion-popover').shadow().find('.backdrop').click({ force: true });
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
      cy.get('ion-modal ion-button ion-icon[name="close"]').first().click();
      cy.get('ion-modal').should('not.exist');
    });
  });
});

/**
 * Helper to quickly create a goal with minimal steps (skips image selection and milestones).
 */
function createGoalQuickly(title: string) {
  openCreateGoalModal();
  fillGoalTitle(title);
  clickNext();

  // Select image
  cy.get('strive-goal-images').should('be.visible');
  selectPexelsImage();
  clickNext();

  // Skip milestones - add one for realism
  cy.get('strive-goal-roadmap').should('be.visible');
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
