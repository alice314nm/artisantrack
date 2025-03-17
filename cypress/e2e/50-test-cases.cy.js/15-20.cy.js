describe("Test Cases 15-20", () => {
  before(() => {
    cy.loginTestNew();
  });

  beforeEach(() => {
    cy.visit("http://localhost:3000/");
  });

  it("15. should log out user after 30 minutes of inactivity", () => {
    cy.wait(30 * 60 * 1000);
    cy.url().should("include", "http://localhost:3000/");
    cy.contains("Session expired. Please log in again.").should(
      "contain.text",
      "Session expired. Please log in again."
    );
  });

  it("16. should allow user to delete account", () => {
    cy.get('[data-id="menu-button"]').click({ force: true });
    cy.get('[data-id="slide-profile"]').click({ force: true });
    cy.get('[data-id="delete-account"]').click();
    cy.get('[data-id="confirm-delete-button"]').click();
    cy.get('[data-id="confirm-password"]').type("Newpassword");
    cy.get('[data-id="confirm-button-email-delete/change"]').click();
    cy.wait(3000);
    cy.contains("Account successfully deleted!").should(
      "contain.text",
      "Account successfully deleted!"
    );
  });

  it("17. should display the correct user in the header", () => {
    cy.login();
    cy.contains("Welcome back, Soft Pillow!").should("be.visible");
  });

  // 18 and 19 are both manual tests for reviewing the code.

  it("20. should prevent excessively long product descriptions", () => {
    cy.login();
    cy.get('[data-id="view-products"]').click();
    cy.contains("Create product +").click();
    cy.get('[data-id="product-description"]').clear().type("A".repeat(1001));
    cy.get('[data-id="product-description"]').should(
      "have.value",
      "A".repeat(1000)
    );
  });
});
