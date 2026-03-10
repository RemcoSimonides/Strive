export function visitExplorePage() {
  cy.visit('/explore');
}

export function visitExplorePageWithQuery(query: string) {
  cy.visit(`/explore?q=${encodeURIComponent(query)}`);
}

export function visitExplorePageWithType(type: string) {
  cy.visit(`/explore?t=${type}`);
}

export function getSearchbar() {
  return cy.get('ion-searchbar');
}

export function searchFor(query: string) {
  getSearchbar().find('input').clear({ force: true }).type(query, { force: true });
}

export function clearSearch() {
  getSearchbar().find('input').clear({ force: true });
}

export function getTypeSelect() {
  return cy.get('ion-select[formcontrolname="type"]');
}

export function selectType(type: string) {
  getTypeSelect().click();
  cy.get('ion-popover ion-select-option').contains(type).click();
}

export function getOverviewSections() {
  return cy.get('section h5');
}

export function getOverviewViewMoreButtons() {
  return cy.get('main section ion-button');
}

export function getCategoryThumbnails() {
  return cy.get('strive-small-thumbnail');
}

export function getSearchResults() {
  return cy.get('ul.search li');
}

export function getNoResultsMessage() {
  return cy.get('ul.search i');
}

export function getAlgoliaAttribution() {
  return cy.get('img.algolia');
}

export function getFooter() {
  return cy.get('strive-footer');
}

export function getHeader() {
  return cy.get('strive-header');
}
