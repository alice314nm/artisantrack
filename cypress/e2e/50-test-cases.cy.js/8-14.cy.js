describe("Test Cases 8-14", () => {
  before(() => {
    cy.loginTestNew();
    cy.get("header").contains("Artisan Track").should("be.visible");
  });

  beforeEach(() => {
    cy.visit("http://localhost:3000/");
  });

  it("8. should display order page", () => {
    cy.get('[data-id="view-orders"]').click();
    cy.wait(3000);
    cy.url().should("include", "/orders");
  });

  it("9. should display products page", () => {
    cy.get('[data-id="view-products"]').click();
    cy.wait(3000);
    cy.url().should("include", "/products");
  });

  it("10. should display materials page", () => {
    cy.get('[data-id="view-materials"]').click();
    cy.wait(3000);
    cy.url().should("include", "/materials");
  });

  it("11. should prevent duplicate account creation", () => {
    cy.signInTest();
    cy.contains(
      "This email address is already associated with an account."
    ).should("be.visible");
  });

  it("12. should verify user email validation", () => {
    indexedDB.deleteDatabase("firebaseLocalStorageDb");
    cy.visit("http://localhost:3000/");
    cy.wait(3000);
    cy.contains("Create Account").click();
    cy.get('[data-id="email"]').type("test#test");
    cy.get('[data-id="name"]').type("Test User");
    cy.get('[data-id="tax"]').type("5");
    cy.get('[data-id="password"]').type("password");
    cy.get('[data-id="repeat-password"]').type("password");
    cy.get('[data-id="sign-up"]').click();
    cy.contains("Invalid email format. Please try again.").should("be.visible");
  });

  it("13. should check password complexity", () => {
    indexedDB.deleteDatabase("firebaseLocalStorageDb");
    cy.visit("http://localhost:3000/");
    cy.contains("Create Account").click();
    cy.wait(2000);
    cy.get('[data-id="email"]').type("test@gmail.com");
    cy.get('[data-id="name"]').type("Test User");
    cy.get('[data-id="tax"]').type("5");
    cy.get('[data-id="password"]').type("New");
    cy.get('[data-id="repeat-password"]').type("New");
    cy.get('[data-id="sign-up"]').click();
    cy.wait(5000);
    cy.contains("Password should be at least 6 characters.").should(
      "be.visible"
    );
  });

  it("14. should prevent login with incorrect password", () => {
    cy.loginTest();
    cy.contains("Incorrect password. Please try again.").should("be.visible");
  });
});
