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
    cy.url().should("match", /\/pages\/materials\/.+/);
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

  it("should add the material when create new material button is clicked", () => {
    cy.contains("Create material +").click();
    cy.url().should("include", "/pages/create_material");
    cy.get('[data-id="material-id"]').type("3012005");
    cy.get('[data-id="material-name"]').type("Cypress Test Material");
    cy.get('[data-id="material-color"]').type("Cypress Test Material Color");
    cy.get('[data-id="material-category"]').type("Cypress Test Category");
    cy.get('[data-id="material-shop"]').type("Cypress Test Shop");
    cy.get('[data-id="material-price"]').type("3012005");
    cy.get('[data-id="material-currency"]').type("$");
    cy.get('[data-id="material-quantity"]').type("2");
    cy.get('[data-id="material-add-cost"]').click();
    cy.get('[data-id="material-description"]').type("Cypress Test Description");
    cy.get('input[type="file"]').selectFile("cypress/fixtures/BananaCat.png", {
      force: true,
    });
    cy.get('[data-id="create-button"]').click();
    cy.wait(5000);
  });

  it("should delete the material when the delete button is clicked", () => {
    cy.get('[data-id="material-block"]')
      .contains("Cypress Test Material")
      .click();
    cy.contains("Delete").click();
    cy.get('[data-id="delete-button"]').should("be.visible");
    cy.get('[data-id="confirmation-window"]').contains("Delete").click();
    cy.wait(5000);
    cy.visit("http://localhost:3000/pages/materials");
    cy.contains("Cypress Test Material").should("not.exist");
  });

  it("should filter materials by category", () => {
    cy.get('[data-id="filter-button"]').click();
    cy.contains("Categories").click();
    cy.get('[data-id="category-filter"]').contains("wool").click();
    cy.get('[data-id="apply-filters"]').click();
    // cy.get('[data-id="material-block"]').first().should("include", "wool");
  });

  it("should filter materials by color", () => {
    cy.get('[data-id="filter-button"]').click();
    cy.get('[data-id="color-filter"]').click();
    cy.get('[data-id="color-filter"]').contains("grey").click();
    cy.get('[data-id="apply-filters"]').click();
    // cy.get('[data-id="material-block"]').should("include", "grey");
  });

  it("should sort materials by name ascending", () => {
    cy.get('[data-id="filter-button"]').click();
    cy.get('[data-id="sort-by"]').click();
    cy.contains("Name Ascending").click();
    cy.get('[data-id="apply-filters"]').click();
    // cy.get('[data-id="material-block"]').first().contains("Cashmere");
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
    cy.get('[data-id="search-bar"]').type("wool with red");
    // cy.get('[data-id="material-block"]').should("include", "wool with red");
  });
});
