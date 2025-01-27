describe("Order Page Tests", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3000/");
    cy.get('[data-id="menu-button"]').click({ force: true });
    cy.contains("Orders").click();
  });

  it("should display the header with the correct title", () => {
    cy.get("header").contains("Orders").should("be.visible");
  });

  it("should display the total count of orders", () => {
    cy.contains("Total: 30").should("be.visible");
  });

  it("should navigate to the create order page on button click and return the page when click cancel", () => {
    cy.contains("Create order +").click();
    cy.url().should("include", "/pages/create_order");
    cy.contains("Cancel").click();
    cy.url().should("include", "/pages/orders");
  });

  it("should navigate to products page on order block click", () => {
    cy.get('[data-id="order-block"]').click();
    cy.url().should("include", "http://localhost:3000/");
  });
});