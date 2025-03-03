describe("Product Page Tests", () => {
  before(() => {
    cy.login();
  });

  beforeEach(() => {
    cy.visit("http://localhost:3000/");
    cy.get('[data-id="menu-button"]').click({ force: true });
    cy.get('[data-id="slide-inventory"]').click();
    cy.get('[data-id="slide-products"]').click();
    cy.wait(5000);
  });

  it("should display the header with the correct title", () => {
    cy.get("header").contains("Products").should("be.visible");
  });

  it("should display the total count of products", () => {
    cy.get("p")
      .contains(/^Total: \d+/)
      .should("be.visible");
  });

  it("should navigate to the create product page on button click and return when click cancel", () => {
    cy.contains("Create product +").click();
    cy.url().should("include", "/create_product");
    cy.contains("Cancel").click();
    cy.url().should("include", "http://localhost:3000/products");
  });

  it("should navigate to product detail page on product block click and return when click back", () => {
    cy.get('[data-id="product-block"]').first().click();
    cy.url().should("match", /\/products\/.+/);
    cy.contains("Back").click();
    cy.url().should("include", "/products");
  });

  it("should add the product when create new product button is clicked", () => {
    cy.contains("Create product +").click();
    cy.url().should("include", "/create_product");
    cy.get('[data-id="product-id"]').type("3012005");
    cy.get('[data-id="product-name"]').type("Cypress Test Product");
    cy.get('[data-id="product-category"]').type("Cypress Test Category");
    cy.get('[data-id="add-category-button"]').click();
    cy.get('[data-id="product-average-cost"]').type("3012005");
    cy.get('[data-id="currency-select"]').select("CAD");
    cy.get('[data-id="product-description"]').type("Cypress Test Description");
    cy.get('input[type="file"]')
      .first()
      .selectFile("cypress/fixtures/BananaCat.png", {
        force: true,
      });
    cy.get('[data-id="create-button"]').click();
    cy.wait(5000);
  });

  it("should delete the product when the delete button is clicked", () => {
    cy.get('[data-id="product-block"]')
      .contains("Cypress Test Product")
      .click();
    cy.get('[data-id="delete-button"]').click();
    cy.get('[data-id="confirmation-window"]')
      .should("be.visible")
      .within(() => {
        cy.get('[data-id="confirm-delete-button"]')
          .should("be.visible")
          .click()
          .wait(5000);
      });
    cy.contains("Cypress Test Product").should("not.exist");
  });

  it("should filter products by category", () => {
    cy.get('[data-id="filter-button"]').click();
    cy.contains("Categories").click();
    cy.get('[data-id="category-filter"]').contains("sweater").click();
    cy.get('[data-id="apply-filters"]').click();
    cy.get('[data-id="product-block"]').each(($el) => {
      cy.wrap($el).should("contain.text", "sweater");
    });
  });

  it("should sort products by name ascending", () => {
    cy.get('[data-id="filter-button"]').click();
    cy.get('[data-id="sort-by"]').click();
    cy.contains("Name Ascending").click();
    cy.get('[data-id="apply-filters"]').click();
  });

  it("should sort products by name descending", () => {
    cy.get('[data-id="filter-button"]').click();
    cy.get('[data-id="sort-by"]').click();
    cy.contains("Name Descending").click();
    cy.get('[data-id="apply-filters"]').click();
  });

  it("should display search results for products", () => {
    cy.get('[data-id="search-bar"]').type("test");
    cy.get('[data-id="product-block"]').should("include", "test");
  });
});
