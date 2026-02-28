export const getPageTitle = () => cy.get('#homepage-title');
export const getFeatureSections = () => cy.get('.overview li.main h3');
export const getExerciseLinks = () => cy.get('.overview li[routerlink]');
export const getStatisticsSection = () => cy.get('.statistics');
export const getGuidesSection = () => cy.get('.blogs');
