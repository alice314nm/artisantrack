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
  cy.visit("http://localhost:3000/");
  cy.contains("Log In").click();
  cy.wait(5000);
  cy.get('[data-id="email"]').type("artisantracksoftpillow@gmail.com");
  cy.get('[data-id="password"]').type("ArtisanTrack");
  cy.contains("Log In").click();
  cy.wait(2000);
});

Cypress.Commands.add("loginTest", () => {
  indexedDB.deleteDatabase("firebaseLocalStorageDb");
  cy.visit("http://localhost:3000/");
  cy.contains("Log In").click();
  cy.get('[data-id="email"]').type("test@gmail.com");
  cy.get('[data-id="password"]').type("password");
  cy.contains("Log In").click();
  cy.wait(5000);
});

Cypress.Commands.add("loginTestNew", () => {
  indexedDB.deleteDatabase("firebaseLocalStorageDb");
  cy.visit("http://localhost:3000/");
  cy.contains("Log In").click();
  cy.get('[data-id="email"]').type("test@gmail.com");
  cy.get('[data-id="password"]').type("Newpassword");
  cy.contains("Log In").click();
  cy.wait(5000);
});

Cypress.Commands.add("signInTest", () => {
  indexedDB.deleteDatabase("firebaseLocalStorageDb");
  cy.visit("http://localhost:3000/");
  cy.contains("Create Account").click();
  cy.get('[data-id="email"]').type("test@gmail.com");
  cy.get('[data-id="name"]').type("Test User");
  cy.get('[data-id="tax"]').type("5");
  cy.get('[data-id="password"]').type("password");
  cy.get('[data-id="repeat-password"]').type("password");
  cy.get('[data-id="sign-up"]').click();
  cy.wait(5000);
});
