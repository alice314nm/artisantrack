describe("Test Cases 26-31", () => {
  before(() => {
    cy.login();
    cy.get("header").contains("Artisan Track").should("be.visible");
  });

  beforeEach(() => {
    cy.visit("http://localhost:3000/");
  });

  //   it("26. should alert low stock for materials", () => {

  //   });

  it("27. should ensure that the product is properly classified", () => {
    cy.get('[data-id="view-products"]').click();
    cy.get('[data-id="filter-button"]').click();
    cy.contains("Categories").click();
    cy.get('[data-id="category-filter"]').contains("sweater").click();
    cy.get('[data-id="apply-filters"]').click();
    cy.get('[data-id="product-block"]').each(($el) => {
      cy.wrap($el).should("contain.text", "sweater");
    });
  });

  it("28. should update product price", () => {
    cy.get('[data-id="view-products"]').click();
    cy.get('[data-id="product-block"]').contains("testName").click();
    cy.get('[data-id="edit-button"]').click();
    cy.wait(2000);
    cy.get('[data-id="product-average-cost"]').clear().type("100");
    cy.contains("Save").click();
    cy.wait(2000);
    cy.contains("100").should("be.visible");
  });

  it("29. should be able to click materials", () => {
    cy.get('[data-id="view-materials"]').click();
    cy.get('[data-id="material-block"]').contains("Grey Cotton").click();
    cy.wait(2000);
    cy.contains("Grey Cotton").should("be.visible");
  });

  it("30. should create a new product", () => {
    cy.get('[data-id="view-products"]').click();
    cy.contains("Create product +").click();
    cy.url().should("include", "/create_product");
    cy.get('[data-id="product-id"]').type("3012005");
    cy.get('[data-id="product-name"]').type("Cypress Test Product");
    cy.get('[data-id="product-description"]').type("Cypress Test Description");
    cy.get('[data-id="product-category"]').type("Cypress Test Category");
    cy.get('[data-id="add-category-button"]').click();
    cy.get('input[type="file"]')
      .first()
      .selectFile("cypress/fixtures/BananaCat.png", {
        force: true,
      });
    cy.get('[data-id="product-average-cost"]').type("3012005");
    cy.get('[data-id="currency-select"]').select("CAD");
    cy.get('[data-id="create-button"]').click();
    cy.wait(5000);
    cy.get('[data-id="product-block"]')
      .contains("Cypress Test Product")
      .should("be.visible");
  });

  it("31. should delete a product", () => {
    cy.get('[data-id="view-products"]').click();
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
});
