describe("Test Cases 1-7", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3000/");
  });

  it("1. should create an account and sign up", () => {
    cy.signInTest();
    cy.contains("Welcome back, Test User!").should("be.visible");
  });

  it("2. should log in with the new account", () => {
    cy.loginTest();
    cy.contains("Welcome back, Test User!").should("be.visible");
  });

  it("3. should log out", () => {
    cy.loginTest();
    cy.contains("Welcome back, Test User!").should("be.visible");
    cy.get('[data-id="menu-button"]').click({ force: true });
    cy.get('[data-id="logout"]').click({ force: true });
    cy.wait(3000);
    cy.contains("Welcome to Artisan Track!").should("be.visible");
  });

  it("4. should display user profile page", () => {
    cy.loginTest();
    cy.get('[data-id="menu-button"]').click({ force: true });
    cy.get('[data-id="slide-profile"]').click({ force: true });
    cy.wait(3000);
    cy.url().should("include", "/profile");
    cy.get("header").contains("Profile").should("be.visible");
  });

  it("5. should update user display name", () => {
    cy.loginTest();
    cy.get('[data-id="menu-button"]').click({ force: true });
    cy.get('[data-id="slide-profile"]').click({ force: true });
    cy.get('[data-id="edit-name-button"]').click();
    cy.get('[data-id="new-name"]').clear().type("New Test User");
    cy.get('[data-id="confirm-name-change"]').click();
    cy.wait(3000);
    cy.contains("New Test User").should("be.visible");
  });

  it("6. should change password", () => {
    cy.get('[data-id="menu-button"]').click({ force: true });
    cy.get('[data-id="slide-profile"]').click({ force: true });
    cy.get('[data-id="change-password-button"]').click();
    cy.get('[data-id="current-password"]').type("password");
    cy.get('[data-id="new-password"]').type("Newpassword");
    cy.get('[data-id="confirm-new-password"]').type("Newpassword");
    cy.get('[data-id="change-button"]').click();
    cy.wait(2000);
    cy.contains("Password successfully updated!").should("be.visible");
  });

  it("7. should login with new password", () => {
    cy.loginTestNew();
    cy.contains("Welcome back, New Test User!").should("be.visible");
  });
});
