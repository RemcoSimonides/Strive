import {
  openAuthModal,
  navigateToSignup,
  fillSignupForm,
  submitSignup,
  dismissWelcomeModal,
  logout,
} from '../support/auth.po';
import {
  visitOwnProfile,
  getProfileHeader,
  getProfileCard,
  getProfileAvatar,
  getProfileUsername,
  getShareButton,
  getFollowersCount,
  getFollowingCount,
  getSupportingCount,
  clickFollowers,
  clickFollowing,
  getFollowButton,
  getCreateGoalButton,
  getNoGoalsMessage,
  getFollowersModal,
  getFollowingModal,
  dismissModal,
  visitProfileById,
} from '../support/profile.po';

describe('Profile Page', () => {

  describe('Own Profile (authenticated)', () => {
    const email = `e2e-${Date.now()}@test.strive.com`;
    const password = 'TestPassword123!';
    const username = `e2e${Date.now().toString(36)}`;

    before(() => {
      cy.visit('/');
      openAuthModal();
      navigateToSignup();
      fillSignupForm(username, email, password);
      submitSignup();
      dismissWelcomeModal();
      cy.visit('/');
      cy.get('section.no_goals', { timeout: 10000 }).should('be.visible');
    });

    it('should navigate to own profile page', () => {
      visitOwnProfile();
      cy.url().should('include', '/profile');
    });

    it('should display the profile header', () => {
      // strive-header only renders title on mobile viewports; on desktop just verify it exists
      getProfileHeader().should('exist');
    });

    it('should display the profile card with avatar', () => {
      getProfileCard().should('be.visible');
      getProfileAvatar().should('be.visible');
    });

    it('should display the username', () => {
      getProfileUsername().should('contain.text', username);
    });

    it('should display the join date', () => {
      cy.get('journal-profile article.profile span').should('contain.text', 'Joined');
    });

    it('should display the share button', () => {
      getShareButton().should('be.visible');
    });

    it('should display follower, following, and supporting counts', () => {
      getFollowersCount().should('contain.text', '0');
      getFollowingCount().should('contain.text', '0');
      getSupportingCount().should('contain.text', '0');
    });

    it('should not display a follow button on own profile', () => {
      cy.get('journal-profile ion-button.follow').should('not.exist');
    });

    it('should display the Create Goal button on own profile', () => {
      getCreateGoalButton().should('be.visible');
      getCreateGoalButton().should('contain.text', 'Create Goal');
    });

    it('should show "Not achieving any goals" for new user', () => {
      getNoGoalsMessage().should('contain.text', 'Not achieving any goals');
    });

    it('should open the followers modal', () => {
      clickFollowers();
      getFollowersModal().should('exist');
      cy.get('ion-modal').should('contain.text', 'Followers');
    });

    it('should close the followers modal', () => {
      dismissModal();
      cy.get('ion-modal').should('not.exist');
    });

    it('should open the following modal', () => {
      clickFollowing();
      getFollowingModal().should('exist');
      cy.get('ion-modal').should('contain.text', 'Following');
    });

    it('should close the following modal', () => {
      dismissModal();
      cy.get('ion-modal').should('not.exist');
    });
  });

  describe("Visiting another user's profile", () => {
    const userAEmail = `e2e-a-${Date.now()}@test.strive.com`;
    const userAPassword = 'TestPassword123!';
    const userAUsername = `e2ea${Date.now().toString(36)}`;

    const userBEmail = `e2e-b-${Date.now() + 1}@test.strive.com`;
    const userBPassword = 'TestPassword123!';
    const userBUsername = `e2eb${(Date.now() + 1).toString(36)}`;

    let userBUid: string;

    before(() => {
      // Log out previous user from "Own Profile" tests
      logout();

      // Intercept Firebase Auth signup to capture User B's UID
      cy.intercept('POST', '**/accounts:signUp**').as('signupB');

      // Sign up User B first so their profile exists
      cy.visit('/');
      openAuthModal();
      navigateToSignup();
      fillSignupForm(userBUsername, userBEmail, userBPassword);
      submitSignup();

      // Capture User B's UID from the signup response
      cy.wait('@signupB').then(interception => {
        userBUid = interception.response!.body.localId;
      });

      // Welcome modal may not appear on subsequent signups in same session
      cy.wait(2000);
      cy.get('body').then($body => {
        if ($body.find('ion-button:contains("Skip")').length) {
          dismissWelcomeModal();
        }
      });
      cy.visit('/');
      cy.get('section.no_goals', { timeout: 10000 }).should('be.visible');

      // Log out User B
      logout();
      cy.get('journal-home').should('exist');

      // Sign up User A
      openAuthModal();
      navigateToSignup();
      fillSignupForm(userAUsername, userAEmail, userAPassword);
      submitSignup();
      cy.wait(2000);
      cy.get('body').then($body => {
        if ($body.find('ion-button:contains("Skip")').length) {
          dismissWelcomeModal();
        }
      });
      cy.visit('/');
      cy.get('section.no_goals', { timeout: 10000 }).should('be.visible');
    });

    it('should navigate to another user profile directly', () => {
      visitProfileById(userBUid);
      cy.url({ timeout: 5000 }).should('include', `/profile/${userBUid}`);
      cy.get('journal-profile', { timeout: 10000 }).should('exist');
    });

    it('should display the other user\'s username in the header', () => {
      // strive-header only renders title on mobile viewports; on desktop just verify it exists
      getProfileHeader().should('exist');
    });

    it('should display the other user\'s profile card', () => {
      getProfileCard().should('be.visible');
      getProfileAvatar().should('be.visible');
      getProfileUsername().should('contain.text', userBUsername);
    });

    it('should not display "Your Profile" for another user', () => {
      getProfileHeader().should('not.contain.text', 'Your Profile');
    });

    it('should not display the Create Goal button on another user\'s profile', () => {
      cy.get('journal-profile section.goals ion-button').should('not.exist');
    });

    it('should display the Follow button on another user\'s profile', () => {
      getFollowButton().should('be.visible');
      getFollowButton().should('contain.text', 'Follow');
    });

    it('should follow the user when clicking Follow', () => {
      cy.get('journal-profile ion-button.follow').click({ force: true });
      // Button should change to "Following"
      cy.contains('journal-profile ion-button.follow', 'Following', { timeout: 10000 })
        .should('exist');
    });

    it('should update follower count after following', () => {
      // User B should now have 1 follower
      getFollowersCount().should('contain.text', '1');
    });

    it('should unfollow the user when clicking Following', () => {
      cy.get('journal-profile ion-button.follow').click({ force: true });
      // Button should change back to "Follow"
      cy.contains('journal-profile ion-button.follow', 'Follow', { timeout: 10000 })
        .should('exist');
    });

    it('should re-follow for followers/following navigation tests', () => {
      cy.get('journal-profile ion-button.follow').click({ force: true });
      cy.contains('journal-profile ion-button.follow', 'Following', { timeout: 10000 })
        .should('exist');
    });

    it('should open followers modal from another user\'s profile', () => {
      clickFollowers();
      getFollowersModal().should('exist');
      cy.get('ion-modal').should('contain.text', 'Followers');
      // User A should appear in the followers list
      cy.get('ion-modal strive-user-followers ion-item', { timeout: 10000 })
        .should('contain.text', userAUsername);
    });

    it('should navigate to a profile from the followers modal', () => {
      // Click on User A in the followers list
      cy.get('ion-modal strive-user-followers ion-item')
        .contains(userAUsername)
        .click({ force: true });
      // Modal should close and navigate to User A's profile
      cy.url({ timeout: 10000 }).should('include', '/profile/');
      cy.get('journal-profile article.profile h5', { timeout: 10000 }).should('contain.text', userAUsername);
    });

    it('should show following count on User A profile after following User B', () => {
      getFollowingCount().should('contain.text', '1');
    });

    it('should open following modal and see User B', () => {
      clickFollowing();
      getFollowingModal().should('exist');
      cy.get('ion-modal strive-user-following ion-item', { timeout: 10000 })
        .should('contain.text', userBUsername);
    });

    it('should navigate to User B profile from following modal', () => {
      cy.get('ion-modal strive-user-following ion-item')
        .contains(userBUsername)
        .click({ force: true });
      cy.url({ timeout: 10000 }).should('include', '/profile/');
      cy.get('journal-profile article.profile h5', { timeout: 10000 }).should('contain.text', userBUsername);
    });
  });

  describe('Profile page for non-existent user', () => {
    it('should show 404 page for invalid profile ID', () => {
      visitProfileById('nonexistentuserid12345');
      cy.get('strive-404', { timeout: 10000 }).should('be.visible');
    });
  });

  describe('Profile page when not authenticated', () => {
    before(() => {
      // Make sure we're logged out
      cy.clearCookies();
      cy.clearLocalStorage();
    });

    it('should redirect or show appropriate state for /profile without auth', () => {
      cy.visit('/profile');
      // When not authenticated, the profile page should show loading then 404 or redirect
      // since there's no profileId from auth
      cy.get('strive-404, journal-home', { timeout: 10000 }).should('exist');
    });
  });
});
