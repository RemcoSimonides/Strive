export function visitOwnProfile() {
  cy.visit('/profile');
}

export function visitProfileById(uid: string) {
  cy.visit(`/profile/${uid}`);
}

export function getProfileHeader() {
  return cy.get('journal-profile strive-header-root, journal-profile strive-header');
}

export function getProfileCard() {
  return cy.get('journal-profile ion-card');
}

export function getProfileAvatar() {
  return cy.get('journal-profile ion-avatar');
}

export function getProfileUsername() {
  return cy.get('journal-profile article.profile h5');
}

export function getProfileJoinDate() {
  return cy.get('journal-profile article.profile span');
}

export function getShareButton() {
  return cy.get('journal-profile article.profile ion-button');
}

export function getFollowersCount() {
  return cy.get('journal-profile ul li').eq(0).find('.number');
}

export function getFollowingCount() {
  return cy.get('journal-profile ul li').eq(1).find('.number');
}

export function getSupportingCount() {
  return cy.get('journal-profile ul li').eq(2).find('.number');
}

export function clickFollowers() {
  cy.get('journal-profile ul li').eq(0).click({ force: true });
}

export function clickFollowing() {
  cy.get('journal-profile ul li').eq(1).click({ force: true });
}

export function clickSupporting() {
  cy.get('journal-profile ul li').eq(2).click({ force: true });
}

export function getFollowButton() {
  return cy.get('journal-profile ion-button.follow');
}

export function getCreateGoalButton() {
  return cy.get('journal-profile section.goals ion-button');
}

export function getGoalThumbnails() {
  return cy.get('journal-profile strive-goal-thumbnail');
}

export function getNoGoalsMessage() {
  return cy.get('journal-profile section.goals span');
}

export function getFollowersModal() {
  return cy.get('ion-modal strive-user-followers');
}

export function getFollowingModal() {
  return cy.get('ion-modal strive-user-following');
}

export function getFollowersModalItems() {
  return cy.get('ion-modal strive-user-followers ion-item');
}

export function getFollowingModalItems() {
  return cy.get('ion-modal strive-user-following ion-item');
}

export function dismissModal() {
  cy.get('ion-modal strive-header-modal ion-button').first().click();
}
