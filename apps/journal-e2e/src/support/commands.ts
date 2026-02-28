/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    ionInput(formControlName: string, value: string): Chainable<void>;
  }
}

Cypress.Commands.add('ionInput', (formControlName: string, value: string) => {
  cy.get(`ion-input[formcontrolname="${formControlName}"]`)
    .find('input')
    .clear()
    .type(value);
});
