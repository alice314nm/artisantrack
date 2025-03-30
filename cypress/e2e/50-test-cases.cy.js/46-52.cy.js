describe("Test Cases 46-52", () => {
  before(() => {
    cy.login();
    cy.get("header").contains("Artisan Track").should("be.visible");
  });

  beforeEach(() => {
    cy.visit("http://localhost:3000/");
  });

  // Test Case 46 is manually tested

  it("47. should validate image format .png or .jpg", () => {
    cy.get('[data-id="view-products"]').click();
    cy.contains("Create product +").click();
    cy.url().should("include", "/create_product");
    cy.get('[data-id="product-id"]').type("3012005");
    cy.get('[data-id="product-name"]').type("Cypress Test Product");
    cy.get('input[type="file"]')
      .first()
      .selectFile("cypress/fixtures/BananaCat.pdf", {
        force: true,
      });
    cy.contains("Only PNG and JPG files are allowed.").should("be.visible");
  });

  it("48. should back to products page when click cancel on creation page", () => {
    cy.get('[data-id="view-products"]').click();
    cy.contains("Create product +").click();
    cy.url().should("include", "/create_product");
    cy.get('[data-id="product-id"]').type("3012005");
    cy.get('[data-id="product-name"]').type("Cypress Test Product");
    cy.get('[data-id="cancel-button"]').click();
    cy.wait(1000);
    cy.get('[data-id="product-block"]')
      .contains("Cypress Test Product")
      .should("not.exist");
  });

  it("49. should back to materials page when click cancel on creation page", () => {
    cy.get('[data-id="view-materials"]').click();
    cy.contains("Create material +").click();
    cy.url().should("include", "/create_material");
    cy.get('[data-id="material-id"]').type("3012005");
    cy.get('[data-id="material-name"]').type("Cypress Test Material");
    cy.get('[data-id="cancel-button"]').click();
    cy.wait(1000);
    cy.get('[data-id="material-block"]')
      .contains("Cypress Test Material")
      .should("not.exist");
  });

  it("50. should export their monthly financial summaries", () => {
    cy.get('[data-id="view-finances"]').click();
    cy.contains("Monthly Financial Report").click();
    cy.get('[data-id="second-button"]').click();
    cy.readFile("cypress/downloads/March-2025-artisan-Soft Pillow.xlsx").should(
      "exist"
    );
  });

  // 51, 52 haven't been implemented yet
});
