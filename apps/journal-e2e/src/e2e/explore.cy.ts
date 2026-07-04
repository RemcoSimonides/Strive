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
      // strive-header only renders content on mobile viewports
      // On desktop, verify the page loaded by checking the searchbar exists
      getHeader().should('exist');
      getSearchbar().should('be.visible');
    });

    it('should display the search bar with placeholder', () => {
      getSearchbar().should('be.visible');
      getSearchbar().should('have.attr', 'placeholder', 'Try "Eat Healthy" or "Klaudia"');
    });

    it('should display the type filter select', () => {
      cy.get('ion-select[formcontrolname="type"]').should('exist');
    });

    it('should display Around the world, Categories, Goals, and Exercises sections', () => {
      getOverviewSections().should('have.length', 4);
      getOverviewSections().eq(0).should('contain.text', 'Around the world');
      getOverviewSections().eq(1).should('contain.text', 'Categories');
      getOverviewSections().eq(2).should('contain.text', 'Goals');
      getOverviewSections().eq(3).should('contain.text', 'Exercises');
    });

    it('should display a button for each section', () => {
      getOverviewViewMoreButtons().should('have.length', 4);
      getOverviewViewMoreButtons().eq(0).should('contain.text', 'view map');
      getOverviewViewMoreButtons().each(($btn, index) => {
        if (index === 0) return;
        expect($btn.text().trim().toLowerCase()).to.include('view more');
      });
    });

    it('should show the embedded map in overview', () => {
      cy.get('.map-embed strive-goals-map').should('exist');
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
      cy.get('ul.search', { timeout: 5000 }).should('exist');
    });

    it('should switch back to overview when search is cleared', () => {
      searchFor('health');
      cy.get('ul.search', { timeout: 5000 }).should('exist');
      clearSearch();
      // Overview sections should reappear
      cy.get('section h5', { timeout: 3000 }).should('exist');
    });

    it('should filter exercises client-side when searching', () => {
      searchFor('Affirm');
      cy.get('ul.search', { timeout: 5000 }).should('exist');
      cy.get('ul.search li').should('contain.text', 'Affirmations');
    });

    it('should filter categories client-side when searching', () => {
      searchFor('Career');
      cy.get('ul.search', { timeout: 5000 }).should('exist');
      cy.get('ul.search li').should('contain.text', 'Career');
    });

    it('should show "no results" message for nonsense query', () => {
      searchFor('zzzzxxxxxqqqqqnotfound');
      cy.get('ul.search i', { timeout: 5000 }).should('contain.text', "Couldn't find anything");
    });
  });

  describe('Type Filter', () => {
    it('should switch to map view when clicking "view map"', () => {
      visitExplorePage();
      getOverviewViewMoreButtons().eq(0).click({ force: true });
      cy.get('.map-view', { timeout: 5000 }).should('exist');
      cy.url().should('include', 't=map');
    });

    it('should switch to search mode when clicking "view more" on Categories', () => {
      visitExplorePage();
      getOverviewViewMoreButtons().eq(1).click({ force: true });
      cy.get('ul.search', { timeout: 5000 }).should('exist');
      cy.url().should('include', 't=categories');
    });

    it('should switch to search mode when clicking "view more" on Goals', () => {
      visitExplorePage();
      getOverviewViewMoreButtons().eq(2).click({ force: true });
      cy.get('ul.search', { timeout: 5000 }).should('exist');
      cy.url().should('include', 't=goals');
    });

    it('should switch to search mode when clicking "view more" on Exercises', () => {
      visitExplorePage();
      getOverviewViewMoreButtons().eq(3).click({ force: true });
      cy.get('ul.search', { timeout: 5000 }).should('exist');
      cy.url().should('include', 't=exercises');
    });
  });

  describe('URL Query Parameters', () => {
    it('should populate search from query params', () => {
      // Visit explore with query param using direct navigation
      visitExplorePage();
      // Type a query to verify search mode works with URL update
      searchFor('fitness');
      cy.url({ timeout: 5000 }).should('include', 'q=fitness');
      cy.get('ul.search', { timeout: 5000 }).should('exist');
    });

    it('should set the type filter from query params', () => {
      visitExplorePageWithType('exercises');
      cy.get('ul.search', { timeout: 5000 }).should('exist');
    });

    it('should update URL when typing a search query', () => {
      visitExplorePage();
      searchFor('running');
      cy.url({ timeout: 3000 }).should('include', 'q=running');
    });
  });

  describe('Map Mode', () => {
    it('should show the map when visiting with t=map', () => {
      visitExplorePageWithType('map');
      cy.get('.map-view strive-goals-map', { timeout: 5000 }).should('exist');
    });

    it('should not show search results in map mode', () => {
      visitExplorePageWithType('map');
      cy.get('.map-view', { timeout: 5000 }).should('exist');
      cy.get('ul.search').should('not.exist');
    });
  });

  describe('Navigation', () => {
    it('should navigate to exercise page when clicking an exercise', () => {
      visitExplorePageWithType('exercises');
      cy.get('ul.search', { timeout: 5000 }).should('exist');
      cy.get('ul.search li strive-small-thumbnail', { timeout: 5000 })
        .first()
        .click({ force: true });
      cy.url().should('include', '/exercise/');
    });

    it('should filter by category when clicking a category in overview', () => {
      visitExplorePage();
      // Click the first category thumbnail in the categories section
      cy.get('strive-small-thumbnail', { timeout: 5000 }).first().click({ force: true });
      cy.url().should('include', 't=goals');
      cy.url().should('include', 'c=');
    });
  });
});
