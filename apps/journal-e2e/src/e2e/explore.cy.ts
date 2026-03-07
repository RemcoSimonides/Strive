import {
  visitExplorePage,
  visitExplorePageWithQuery,
  visitExplorePageWithType,
  getSearchbar,
  searchFor,
  clearSearch,
  getOverviewSections,
  getOverviewViewMoreButtons,
  getSearchResults,
  getNoResultsMessage,
  getAlgoliaAttribution,
  getFooter,
  getHeader,
} from '../support/explore.po';

describe('Explore Page', () => {

  describe('Overview Mode', () => {
    beforeEach(() => visitExplorePage());

    it('should display the header with title "Explore"', () => {
      getHeader().should('be.visible');
      getHeader().should('contain.text', 'Explore');
    });

    it('should display the search bar with placeholder', () => {
      getSearchbar().should('be.visible');
      getSearchbar().should('have.attr', 'placeholder', 'Try "Eat Healthy" or "Klaudia"');
    });

    it('should display the type filter select', () => {
      cy.get('ion-select[formcontrolname="type"]').should('exist');
    });

    it('should display Categories, Goals, and Exercises sections', () => {
      getOverviewSections().should('have.length', 3);
      getOverviewSections().eq(0).should('contain.text', 'Categories');
      getOverviewSections().eq(1).should('contain.text', 'Goals');
      getOverviewSections().eq(2).should('contain.text', 'Exercises');
    });

    it('should display "view more" buttons for each section', () => {
      getOverviewViewMoreButtons().should('have.length', 3);
      getOverviewViewMoreButtons().each(($btn) => {
        expect($btn).to.contain.text('view more');
      });
    });

    it('should display the Algolia attribution', () => {
      getAlgoliaAttribution().should('exist');
    });

    it('should render the footer', () => {
      getFooter().should('exist');
    });
  });

  describe('Search Mode', () => {
    beforeEach(() => visitExplorePage());

    it('should switch to search mode when typing a query', () => {
      searchFor('health');
      // Wait for debounce (500ms) + rendering
      cy.get('ul.search', { timeout: 3000 }).should('exist');
    });

    it('should switch back to overview when search is cleared', () => {
      searchFor('health');
      cy.get('ul.search', { timeout: 3000 }).should('exist');
      clearSearch();
      // Overview sections should reappear
      cy.get('section h5', { timeout: 3000 }).should('exist');
    });

    it('should filter exercises client-side when searching', () => {
      searchFor('Affirm');
      cy.get('ul.search', { timeout: 3000 }).should('exist');
      cy.get('ul.search li').should('contain.text', 'Affirmations');
    });

    it('should filter categories client-side when searching', () => {
      searchFor('Career');
      cy.get('ul.search', { timeout: 3000 }).should('exist');
      cy.get('ul.search li').should('contain.text', 'Career');
    });

    it('should show "no results" message for nonsense query', () => {
      searchFor('zzzzxxxxxqqqqqnotfound');
      getNoResultsMessage({ timeout: 5000 } as any).should('contain.text', "Couldn't find anything");
    });
  });

  describe('Type Filter', () => {
    it('should switch to search mode when clicking "view more" on Categories', () => {
      visitExplorePage();
      getOverviewViewMoreButtons().eq(0).click();
      cy.get('ul.search', { timeout: 3000 }).should('exist');
      cy.url().should('include', 't=categories');
    });

    it('should switch to search mode when clicking "view more" on Goals', () => {
      visitExplorePage();
      getOverviewViewMoreButtons().eq(1).click();
      cy.get('ul.search', { timeout: 3000 }).should('exist');
      cy.url().should('include', 't=goals');
    });

    it('should switch to search mode when clicking "view more" on Exercises', () => {
      visitExplorePage();
      getOverviewViewMoreButtons().eq(2).click();
      cy.get('ul.search', { timeout: 3000 }).should('exist');
      cy.url().should('include', 't=exercises');
    });
  });

  describe('URL Query Parameters', () => {
    it('should populate search from query params', () => {
      visitExplorePageWithQuery('fitness');
      getSearchbar().find('input').should('have.value', 'fitness');
      cy.get('ul.search', { timeout: 3000 }).should('exist');
    });

    it('should set the type filter from query params', () => {
      visitExplorePageWithType('exercises');
      cy.get('ul.search', { timeout: 3000 }).should('exist');
    });

    it('should update URL when typing a search query', () => {
      visitExplorePage();
      searchFor('running');
      cy.url({ timeout: 3000 }).should('include', 'q=running');
    });
  });

  describe('Navigation', () => {
    it('should navigate to exercise page when clicking an exercise', () => {
      visitExplorePageWithType('exercises');
      cy.get('ul.search', { timeout: 3000 }).should('exist');
      cy.get('strive-small-thumbnail[ng-reflect-title="Affirmations"]', { timeout: 3000 })
        .first()
        .click();
      cy.url().should('include', '/exercise/affirmations');
    });

    it('should filter by category when clicking a category in overview', () => {
      visitExplorePage();
      // Click the first category thumbnail
      cy.get('strive-small-thumbnail').first().click();
      cy.url().should('include', 't=goals');
      cy.url().should('include', 'c=');
    });
  });
});
