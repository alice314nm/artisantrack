// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.Commands.add("login", () => {
    indexedDB.deleteDatabase("firebaseLocalStorageDb");
    cy.visit("http://localhost:3000/pages/login");
    cy.contains("Log In").click();
    cy.get('[data-id="email"]').type("artisantracksoftpillow@gmail.com");
    cy.get('[data-id="password"]').type("ArtisanTrack");
    cy.contains("Log In").click();
    cy.wait(2000);
});

