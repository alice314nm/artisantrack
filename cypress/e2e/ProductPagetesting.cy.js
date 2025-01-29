describe("Product Page Tests", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3000/");
  });

  it("should display the header with the correct title", () => {
    cy.get("header").contains("Products").should("be.visible");
  });

  it("should display the total count of products", () => {
    cy.contains("Total: 30").should("be.visible");
  });

  it("should navigate to the create product page on button click and return when click cancel", () => {
    cy.contains("Create product +").click();
    cy.url().should("include", "/pages/create_product");
    cy.contains("Cancel").click();
    cy.url().should("include", "http://localhost:3000/");
  });

  it("should navigate to product detail page on product block click and return when click back", () => {
    cy.get('[data-id="product-block"]').first().click();
    cy.url().should("include", "/pages/productid");
    cy.contains("Back").click();
    cy.url().should("include", "http://localhost:3000/");
  });

  it("should change the view for client or default view", () => {
    cy.get('[data-id="product-block"]').click();
    cy.contains("View for client").click();
    cy.get('[data-id="Client view"]').should("be.visible");
    cy.contains("Default View").click();
    cy.get('[data-id="Your view"]').should("be.visible");
  });

  it("should display a confirmation popup when the delete button is clicked", () => {
    cy.get('[data-id="product-block"]').first().click();
    cy.contains("Delete").click();
    cy.get('[data-id="delete-button"]').should("be.visible");
    cy.get('[data-id="confirmation-text"]').contains(
      "Are you sure you want to delete?"
    );
    cy.get('[data-id="confirmation-window"]').contains("Cancel").click();
    cy.get('[data-id="confirmation-window"]').should("not.visible");
  });
});