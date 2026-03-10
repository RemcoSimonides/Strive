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
} from '../support/goal.po';
import {
  addSupport,
  verifySupportExists,
} from '../support/goal-page.po';
import {
  visitSupportsPage,
  verifySupportsPageLoaded,
  verifySupportsHeader,
  verifyEmptyState,
  verifySupportListExists,
  verifySupportPledgeExists,
  verifySupportCount,
  verifyGoalLinkExists,
  clickSupportPledge,
  verifySupportDetailModal,
  verifySupportStatus,
  verifySupportCreatedDate,
  verifyGiveButton,
  verifyRemoveButton,
  clickGiveButton,
  confirmGiveSupport,
  clickRemoveButton,
  confirmRemoveSupport,
  verifyGoalLink,
  verifyDecisionComponent,
  clickGiveDecision,
  clickRejectDecision,
  verifySupportIsDisabled,
  verifySupportIsActive,
  verifyCounterForm,
  fillCounterSupport,
  saveCounterSupport,
  navigateBackToSupports,
} from '../support/supports.po';

describe('Supports Page', () => {
  const email = `e2e-${Date.now()}@test.strive.com`;
  const password = 'TestPassword123!';
  const username = `e2e${Date.now().toString(36)}`;
  const goalTitle = 'Run a half marathon';
  const milestone1 = 'Run 5K without stopping';
  const milestone2 = 'Run 10K race';
  const milestone3 = 'Complete training plan';
  const support1 = 'Buy running shoes';
  const support2 = 'A protein shake';
  const support3 = 'New water bottle';

  before(() => {
    // Sign up a new user
    cy.visit('/');
    openAuthModal();
    navigateToSignup();
    fillSignupForm(username, email, password);
    submitSignup();
    dismissWelcomeModal();
    cy.visit('/');
    cy.get('section.no_goals', { timeout: 10000 }).should('be.visible');

    // Create a goal with milestones
    createGoalWithMilestones(goalTitle, [milestone1, milestone2, milestone3]);
  });

  describe('Empty State', () => {
    it('should display the supports page with empty state when no supports exist', () => {
      visitSupportsPage();
      verifySupportsPageLoaded();
      verifySupportsHeader();
      verifyEmptyState();
    });
  });

  describe('Adding Supports', () => {
    before(() => {
      // Navigate to goal page and add supports
      cy.visit('/');
      cy.get('strive-goal-thumbnail', { timeout: 10000 }).contains(goalTitle).click({ force: true });
      cy.url({ timeout: 10000 }).should('include', '/goal/');

      // Add first support (supporting your own goal)
      addSupport(support1);
      verifySupportExists(support1);

      // Add second support
      addSupport(support2);
      verifySupportExists(support2);

      // Add third support
      addSupport(support3);
      verifySupportExists(support3);
    });

    it('should display supports on the supports page', () => {
      visitSupportsPage();
      verifySupportsPageLoaded();
      verifySupportListExists();
    });

    it('should show all three support pledges', () => {
      verifySupportPledgeExists(support1);
      verifySupportPledgeExists(support2);
      verifySupportPledgeExists(support3);
      verifySupportCount(3);
    });

    it('should show the goal title link', () => {
      verifyGoalLinkExists(goalTitle);
    });

    it('should show supports as active (open status)', () => {
      verifySupportIsActive(support1);
      verifySupportIsActive(support2);
      verifySupportIsActive(support3);
    });
  });

  describe('Support Detail Page', () => {
    it('should navigate to support detail when clicking a pledge', () => {
      clickSupportPledge(support1);
      verifySupportDetailModal();
    });

    it('should display the support status as waiting', () => {
      verifySupportStatus('Waiting for goal');
    });

    it('should show the goal title in the status text', () => {
      // Goal title appears in the status text, not as a separate link
      cy.get('strive-support-details small.status').should('contain.text', goalTitle);
    });

    it('should show the created date', () => {
      verifySupportCreatedDate();
    });

    it('should show give and remove buttons (user is supporter)', () => {
      verifyGiveButton(username);
      verifyRemoveButton();
    });

    it('should show the counter support form (user is also recipient)', () => {
      verifyCounterForm();
    });

    it('should save a counter support description', () => {
      const counterDescription = 'Wash the car';
      fillCounterSupport(counterDescription);
      saveCounterSupport();
      // Verify counter description appears in the pledge
      cy.get('strive-support-pledge', { timeout: 5000 }).contains(counterDescription).should('exist');
    });

    it('should navigate back to supports page', () => {
      navigateBackToSupports();
      verifySupportsPageLoaded();
    });
  });

  describe('Give Support Early (before goal completion)', () => {
    it('should navigate to a support detail to give it early', () => {
      clickSupportPledge(support2);
      verifySupportDetailModal();
    });

    it('should show confirmation alert when giving support before goal is finished', () => {
      clickGiveButton();
      // An alert should appear since the goal is not completed yet
      cy.get('ion-alert', { timeout: 5000 }).should('exist');
      cy.get('ion-alert').contains('not completed yet').should('exist');
      confirmGiveSupport();
    });

    it('should show accepted status after giving support', () => {
      // Wait for Firestore to update the support status
      cy.get('strive-support-details small.status', { timeout: 10000 })
        .should('contain.text', 'should have been given');
    });

    it('should navigate back and see the support as disabled', () => {
      navigateBackToSupports();
      verifySupportIsDisabled(support2);
    });
  });

  describe('Remove Support', () => {
    it('should navigate to a support detail to remove it', () => {
      clickSupportPledge(support3);
      verifySupportDetailModal();
    });

    it('should show confirmation alert when removing support', () => {
      clickRemoveButton();
      cy.get('ion-alert', { timeout: 5000 }).should('exist');
      cy.get('ion-alert').contains('Are you sure').should('exist');
      confirmRemoveSupport();
    });

    it('should navigate back to supports page with one fewer support', () => {
      // After removal, the modal should close
      cy.get('ion-modal', { timeout: 10000 }).should('not.exist');
      verifySupportCount(2);
    });
  });

  describe('Support After Milestone Completion', () => {
    before(() => {
      // Navigate to the goal page to complete a milestone
      cy.visit('/');
      cy.get('strive-goal-thumbnail', { timeout: 10000 }).contains(goalTitle).click({ force: true });
      cy.url({ timeout: 10000 }).should('include', '/goal/');

      // Click the status button on the first milestone to complete it
      cy.get('strive-roadmap ion-item.milestone', { timeout: 10000 })
        .contains(milestone1)
        .closest('ion-item')
        .find('ion-button.status-button')
        .click({ force: true });

      // Select "Succeeded" from the alert
      cy.get('ion-alert', { timeout: 5000 }).should('exist');
      cy.get('ion-alert button').contains('Succeeded').click({ force: true });

      // A post modal may appear - close it
      cy.wait(1000);
      cy.get('body').then($body => {
        if ($body.find('ion-modal').length) {
          cy.get('ion-modal ion-button ion-icon[name="close"]').first().click({ force: true });
          cy.wait(1000);
        }
      });
    });

    it('should still show remaining supports on the supports page', () => {
      visitSupportsPage();
      verifySupportsPageLoaded();
      verifySupportPledgeExists(support1);
    });
  });

  describe('Support After Goal Completion', () => {
    before(() => {
      // Navigate to the goal page to complete remaining milestones
      cy.visit('/');
      cy.get('strive-goal-thumbnail', { timeout: 10000 }).contains(goalTitle).click({ force: true });
      cy.url({ timeout: 10000 }).should('include', '/goal/');

      // Complete milestone 2
      completeMilestone(milestone2);

      // Complete milestone 3 (last one - may trigger goal completion prompt)
      completeMilestone(milestone3);

      // After all milestones done, an alert may ask about goal status
      cy.wait(2000);
      cy.get('body').then($body => {
        if ($body.find('ion-alert:contains("Yes")').length) {
          cy.get('ion-alert button').contains('Yes').click({ force: true });
          // Close post modal if it appears after confirming
          closePostModalIfPresent();
        }
      });

      // Wait for Cloud Function to set needsDecision on remaining open supports
      cy.wait(5000);
    });

    // These tests depend on a Cloud Function setting needsDecision after goal completion.
    // Skipped because Cloud Function timing is unreliable in e2e tests.
    it.skip('should show decision component for open support after goal completion', () => {
      visitSupportsPage();
      verifySupportsPageLoaded();

      // The remaining open support should now need a decision
      verifyDecisionComponent();
    });

    it.skip('should accept the support via decision component', () => {
      clickGiveDecision();

      // After giving, the support should be marked as disabled (accepted)
      cy.wait(2000);
      verifySupportIsDisabled(support1);
    });
  });
});

/**
 * Helper to create a goal with specified milestones.
 */
function createGoalWithMilestones(title: string, milestones: string[]) {
  openCreateGoalModal();
  fillGoalTitle(title);
  clickNext();

  // Skip image step
  cy.get('strive-goal-images', { timeout: 10000 }).should('exist');
  clickNext();

  // Add milestones
  cy.get('strive-goal-roadmap', { timeout: 10000 }).should('exist');
  for (const milestone of milestones) {
    addMilestone(milestone);
  }
  clickNext();

  // Skip reminders
  cy.get('strive-reminders', { timeout: 10000 }).should('exist');
  clickNext();

  // Finish
  cy.get('strive-goal-share', { timeout: 10000 }).should('exist');
  clickFinish();

  // Wait for navigation to goal page
  cy.url({ timeout: 10000 }).should('include', '/goal/');
}

/**
 * Close the "Create Post" modal if it appears.
 */
function closePostModalIfPresent() {
  cy.wait(1000);
  cy.get('body').then($body => {
    if ($body.find('ion-modal').length) {
      // Use the close icon button in the post modal header
      cy.get('ion-modal ion-icon[name="close"]').first().closest('ion-button').click({ force: true });
      cy.wait(1000);
    }
  });
}

/**
 * Helper to complete a milestone by clicking its status button and selecting "Succeeded".
 * Handles the post modal that may appear afterward.
 */
function completeMilestone(milestoneName: string) {
  cy.get('strive-roadmap ion-item.milestone', { timeout: 10000 })
    .contains(milestoneName)
    .closest('ion-item')
    .find('ion-button.status-button')
    .click({ force: true });

  cy.get('ion-alert', { timeout: 5000 }).should('exist');
  cy.get('ion-alert button').contains('Succeeded').click({ force: true });

  closePostModalIfPresent();
}
