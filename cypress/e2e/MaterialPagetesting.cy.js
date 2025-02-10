describe("Material Page Tests", () => {
  before(() => {
    indexedDB.deleteDatabase("firebaseLocalStorageDb");
    cy.visit("http://localhost:3000/pages/login");
    cy.contains("Log In").click();
    cy.get('[data-id="email"]').type("artisantracksoftpillow@gmail.com");
    cy.get('[data-id="password"]').type("ArtisanTrack");
    cy.contains("Log In").click();
    cy.wait(2000);
  });

  beforeEach(() => {
    cy.visit("http://localhost:3000/");
    cy.get('[data-id="menu-button"]').click({ force: true });
    cy.contains("Inventory").click();
    cy.contains("Materials").click();
    cy.wait(2000);
  });

  it("should display the header with the correct title", () => {
    cy.get("header").contains("Materials").should("be.visible");
  });

  it("should display the total count of materials dynamically", () => {
    cy.get("p")
      .contains(/^Total: \d+/)
      .should("be.visible");
  });

  it("should navigate to the create material page on button click and return the page when click cancel", () => {
    cy.contains("Create material +").click();
    cy.url().should("include", "/pages/create_material");
    cy.contains("Cancel").click();
    cy.url().should("include", "/pages/materials");
  });

  it("should navigate to products page on material block click and return when click back", () => {
    cy.get('[data-id="material-block"]').first().click();
    cy.url().should("include", "/pages/materialid");
    cy.contains("Back").click();
    cy.url().should("include", "/pages/materials");
  });

  it("should change the view for client or default view", () => {
    cy.get('[data-id="material-block"]').first().click();
    cy.contains("View for client").click();
    cy.get('[data-id="Client view"]').should("be.visible");
    cy.contains("Default View").click();
    cy.get('[data-id="Your view"]').should("be.visible");
  });

  it("should display a confirmation popup when the delete button is clicked", () => {
    cy.get('[data-id="material-block"]').first().click();
    cy.contains("Delete").click();
    cy.get('[data-id="delete-button"]').should("be.visible");
    cy.get('[data-id="confirmation-text"]').contains(
      "Are you sure you want to delete?"
    );
    cy.get('[data-id="confirmation-window"]').contains("Cancel").click();
    cy.get('[data-id="confirmation-window"]').should("have.class", "hidden");
  });

  it("should not display the confirmation popup when the cancel or delete button is clicked", () => {
    cy.get('[data-id="material-block"]').first().click();
    cy.contains("Delete").click();
    cy.get('[data-id="delete-button"]').should("be.visible");
    cy.get('[data-id="confirmation-window"]').contains("Cancel").click();
    cy.get('[data-id="confirmation-window"]').should("have.class", "hidden");
    cy.contains("Delete").click();
    cy.get('[data-id="delete-button"]').should("be.visible");
    cy.get('[data-id="confirmation-window"]').contains("Delete").click();
    cy.get('[data-id="confirmation-window"]').should("have.class", "hidden");
  });

  it("should filter materials by category", () => {
    cy.get('[data-id="filter-button"]').click();
    cy.contains("Categories").click();
    cy.get('[data-id="category-filter"]').first().click();
    cy.get('[data-id="apply-filters"]').click();
    cy.get('[data-id="material-block"]').should("have.length", 1);
  });

  it("should filter materials by color", () => {
    cy.get('[data-id="filter-button"]').click();
    cy.get('[data-id="color-filter"]').click();
    cy.get('[data-id="color-filter"]').contains("grey").click();
    cy.get('[data-id="apply-filters"]').click();
    cy.get('[data-id="material-block"]').should("have.length", 1);
  });

  it("should sort materials by name ascending", () => {
    cy.get('[data-id="filter-button"]').click();
    cy.get('[data-id="sort-by"]').click();
    cy.contains("Name Ascending").click();
    cy.get('[data-id="apply-filters"]').click();
    cy.get('[data-id="material-block"]').first().contains("Cashmere");
  });

  it("should sort materials by name descending", () => {
    cy.get('[data-id="filter-button"]').click();
    cy.get('[data-id="sort-by"]').click();
    cy.contains("Name Descending").click();
    cy.get('[data-id="apply-filters"]').click();
    cy.get('[data-id="material-block"]')
      .first()
      .contains("Wool plus cashmere white with red");
  });

  it("should display search results for materials", () => {
    cy.get('[data-id="search-bar"]').type("cashmere");
    cy.get('[data-id="material-block"]').should("have.length", 2);
  });
});
