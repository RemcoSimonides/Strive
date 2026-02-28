import {
  getPageTitle,
  getFeatureSections,
  getExerciseLinks,
  getStatisticsSection,
  getGuidesSection,
} from '../support/app.po';

describe('Home Page', () => {
  beforeEach(() => cy.visit('/'));

  it('should display the hero heading', () => {
    getPageTitle().should('be.visible').and('contain.text', 'Stay focused on your goals');
  });

  it('should display feature sections', () => {
    getFeatureSections().should('have.length', 3);
    getFeatureSections().eq(0).should('contain.text', 'Set Goals');
    getFeatureSections().eq(1).should('contain.text', 'Create Roadmap');
    getFeatureSections().eq(2).should('contain.text', 'Journal');
  });

  it('should display all 5 exercise sections', () => {
    getExerciseLinks().should('have.length', 5);
    getExerciseLinks().eq(0).should('contain.text', 'Self Reflect');
    getExerciseLinks().eq(1).should('contain.text', 'Dear Future Self');
    getExerciseLinks().eq(2).should('contain.text', 'Wheel of Life');
    getExerciseLinks().eq(3).should('contain.text', 'Affirmations');
    getExerciseLinks().eq(4).should('contain.text', 'Daily Gratitude');
  });

  it('should link exercises to correct routes', () => {
    const expectedRoutes = [
      '/exercise/self-reflect',
      '/exercise/dear-future-self',
      '/exercise/wheel-of-life',
      '/exercise/affirmations',
      '/exercise/daily-gratitude',
    ];

    getExerciseLinks().each(($el, index) => {
      expect($el.attr('routerlink')).to.equal(expectedRoutes[index]);
    });
  });

  it('should display the statistics section', () => {
    getStatisticsSection().should('exist');
    getStatisticsSection().find('h3').should('contain.text', "You're not alone");
  });

  it('should display the guides section with blog cards', () => {
    getGuidesSection().should('exist');
    getGuidesSection().find('h3').first().should('contain.text', 'Guides');
    getGuidesSection().find('ion-card').should('have.length', 2);
  });

  it('should render the footer', () => {
    cy.get('strive-footer').should('exist');
  });

  it('should have a "Create goal" button', () => {
    cy.get('.overview li.main').contains('Create goal').should('exist');
  });
});
