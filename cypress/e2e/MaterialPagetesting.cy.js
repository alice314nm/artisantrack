describe("Material Page Tests", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3000/");
    cy.get('[data-id="menu-button"]').click({ force: true });
    cy.contains("Inventory").click();
    cy.contains("Materials").click();
  });

  it("should display the header with the correct title", () => {
    cy.get("header").contains("Materials").should("be.visible");
  });

  it("should display the total count of materials", () => {
    cy.contains("Total: 30").should("be.visible");
  });

  it("should navigate to the create material page on button click and return the page when click cancel", () => {
    cy.contains("Create material +").click();
    cy.url().should("include", "/pages/create_material");
    cy.contains("Cancel").click();
    cy.url().should("include", "/pages/materials");
  });

  it("should navigate to products page on material block click and return when click back", () => {
    cy.get('[data-id="material-block"]').click();
    cy.url().should("include", "/pages/materialid");
    cy.contains("Back").click();
    cy.url().should("include", "/pages/materials");
  });

  it("should change the view for client or default view", () => {
    cy.get('[data-id="material-block"]').click();
    cy.contains("View for client").click();
    cy.get('[data-id="Client view"]').should("be.visible");
    cy.contains("Default View").click();
    cy.get('[data-id="Your view"]').should("be.visible");
  });

  it("should display a confirmation popup when the delete button is clicked", () => {
    cy.get('[data-id="material-block"]').click();
    cy.contains("Delete").click();
    cy.get('[data-id="delete-button"]').should("be.visible");
    cy.get('[data-id="confirmation-text"]').contains(
      "Are you sure you want to delete?"
    );
    cy.get('[data-id="confirmation-window"]').contains("Cancel").click();
    cy.get('[data-id="confirmation-window"]').should("not.visible");
  });

  it("should not display the confirmation popup when the cancel or delete button is clicked", () => {
    cy.get('[data-id="material-block"]').click();
    cy.contains("Delete").click();
    cy.get('[data-id="delete-button"]').should("be.visible");
    cy.get('[data-id="confirmation-window"]').contains("Cancel").click();
    cy.get('[data-id="confirmation-window"]').should("not.visible");
    cy.contains("Delete").click();
    cy.get('[data-id="delete-button"]').should("be.visible");
    cy.get('[data-id="confirmation-window"]').contains("Delete").click();
    cy.get('[data-id="confirmation-window"]').should("not.visible");
  });
});