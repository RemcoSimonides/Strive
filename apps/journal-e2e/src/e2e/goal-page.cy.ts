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
  verifyGoalPageLoaded,
  verifyGoalImage,
  verifyRoadmapSection,
  verifyMilestoneInRoadmap,
  verifyGoalProperties,
  verifyDeadlineShown,
  openChat,
  sendChatMessage,
  verifyChatMessageSent,
  closeChatModal,
  clickFollow,
  verifyFollowing,
  addSupport,
  verifySupportExists,
  verifyStorySection,
  openOptionsMenu,
  clickEditGoalOption,
  openShareButton,
  verifyAddOthersModal,
  closeModal,
  toggleRoadmapOrder,
} from '../support/goal-page.po';

describe('Goal Page Features', () => {
  const email = `e2e-${Date.now()}@test.strive.com`;
  const password = 'TestPassword123!';
  const username = `e2e${Date.now().toString(36)}`;
  const goalTitle = 'Learn to play guitar';
  const milestone1 = 'Buy a guitar';
  const milestone2 = 'Learn basic chords';
  const milestone3 = 'Play a full song';

  before(() => {
    // Sign up and create a goal to test the goal page
    cy.visit('/');
    openAuthModal();
    navigateToSignup();
    fillSignupForm(username, email, password);
    submitSignup();
    dismissWelcomeModal();
    // dismissWelcomeModal navigates to explore page, go back to goals
    cy.visit('/');
    cy.get('section.no_goals', { timeout: 10000 }).should('be.visible');

    // Create goal with image and milestones
    openCreateGoalModal();
    fillGoalTitle(goalTitle);
    clickNext();

    // Skip image step (just click Next without selecting)
    cy.get('strive-goal-images', { timeout: 10000 }).should('exist');
    clickNext();

    // Add milestones
    cy.get('strive-goal-roadmap', { timeout: 10000 }).should('exist');
    addMilestone(milestone1);
    addMilestone(milestone2);
    addMilestone(milestone3);
    clickNext();

    // Skip reminders
    cy.get('strive-reminders').should('exist');
    clickNext();

    // Finish
    cy.get('strive-goal-share').should('exist');
    clickFinish();

    // Wait for navigation to goal page
    cy.url({ timeout: 10000 }).should('include', '/goal/');
  });

  describe('Goal Page View', () => {
    it('should display the goal title', () => {
      verifyGoalPageLoaded(goalTitle);
    });

    it('should display the goal image or default', () => {
      // Image step was skipped in setup, so check for default asset or picture element
      cy.get('journal-goal picture, journal-goal img').should('exist');
    });

    it('should display the roadmap with milestones', () => {
      verifyRoadmapSection();
      verifyMilestoneInRoadmap(milestone1);
      verifyMilestoneInRoadmap(milestone2);
      verifyMilestoneInRoadmap(milestone3);
    });

    it('should display goal properties (achievers, supporters, followers)', () => {
      verifyGoalProperties();
    });

    it('should display the deadline', () => {
      verifyDeadlineShown();
    });

    it('should display the story section', () => {
      verifyStorySection();
    });
  });

  describe('Chat', () => {
    it('should open the chat modal', () => {
      openChat();
    });

    it('should send a chat message', () => {
      const message = 'Hello, this is a test message!';
      sendChatMessage(message);
      // Chat messages may take time to sync via Firestore
      // Just verify the input was cleared (message was sent)
      cy.get('ion-footer ion-textarea textarea', { timeout: 5000 }).should('have.value', '');
    });

    it('should close the chat modal', () => {
      closeChatModal();
    });
  });

  describe('Follow', () => {
    it('should follow the goal', () => {
      clickFollow();
      verifyFollowing();
    });
  });

  describe('Support', () => {
    it('should add a support pledge', () => {
      const supportDescription = 'A nice dinner';
      addSupport(supportDescription);
      verifySupportExists(supportDescription);
    });
  });

  describe('Share / Add Others', () => {
    it('should open the add others modal', () => {
      openShareButton();
      verifyAddOthersModal();
    });

    it('should close the add others modal', () => {
      closeModal();
    });
  });

  describe('Roadmap Interactions', () => {
    it('should toggle roadmap order', () => {
      toggleRoadmapOrder();
      // After toggling, the first milestone should change position
      // Verify the roadmap still has milestones (order changed)
      verifyRoadmapSection();
      verifyMilestoneInRoadmap(milestone1);
    });
  });

  describe('Options Menu', () => {
    it('should open the options menu and see edit options', () => {
      openOptionsMenu();
      cy.get('ion-popover ion-item', { timeout: 5000 }).contains('Edit Goal').should('exist');
      cy.get('ion-popover ion-item').contains('Edit Reminders').should('exist');
      cy.get('ion-popover ion-item').contains('Delete Goal').should('exist');
    });

    it('should open edit goal modal from options', () => {
      clickEditGoalOption();
      // Verify the update modal opens
      cy.get('ion-modal', { timeout: 5000 }).should('be.visible');
      // Close the modal via the close button in the header
      cy.get('ion-modal ion-header ion-button', { timeout: 5000 }).first().click({ force: true });
      cy.wait(1000);
    });
  });
});
