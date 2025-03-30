describe("Test Cases 32-35", () => {
  before(() => {
    cy.login();
    cy.get("header").contains("Artisan Track").should("be.visible");
  });

  beforeEach(() => {
    cy.visit("http://localhost:3000/");
  });

  it("32. should validate material input when create a material", () => {
    cy.get('[data-id="view-materials"]').click();
    cy.contains("Create material +").click();
    cy.url().should("include", "/create_material");
    cy.get('[data-id="material-description"]').type("Test test test");
    cy.get('[data-id="create-button"]').click();
    cy.contains("Id and Name are required.").should("be.visible");
  });

  it("33. should validate searching for a material", () => {
    cy.get('[data-id="view-materials"]').click();
    cy.get('[data-id="search-bar"]').type("white with red");
    cy.get('[data-id="material-block"]').should("exist");
    cy.get('[data-id="material-block"]').each(($el) => {
      const productName = $el.text().toLowerCase();
      expect(productName).to.include("white with red");
    });
    cy.get('[data-id="material-block"]').then((filteredItems) => {
      cy.get('[data-id="material-block"]').should(
        "have.length",
        filteredItems.length
      );
    });
  });

  // 34 and 25 are the same test case

  it("34. should validate material input when edit a material", () => {
    cy.get('[data-id="view-materials"]').click();
    cy.get('[data-id="material-block"]').contains("Grey Cotton").click();
    cy.get('[data-id="edit-button"]').click();
    cy.wait(2000);
    cy.get('[data-id="material-id"]').clear();
    cy.get('[data-id="material-name"]').clear();
    cy.get('[data-id="material-description"]').clear();
    cy.contains("Save").click();
    cy.contains("Id and Name are required.").should("be.visible");
  });

  // 37 -> 35 -> 36

  it("37. should create a new material", () => {
    cy.get('[data-id="view-materials"]').click();
    cy.contains("Create material +").click();
    cy.url().should("include", "/create_material");
    cy.get('[data-id="material-id"]').type("3012005");
    cy.get('[data-id="material-name"]').type("Cypress Test Material");
    cy.get('[data-id="material-description"]').type("Cypress Test Description");
    cy.get('[data-id="material-color"]').type("Cypress Test Material Color");
    cy.get('[data-id="material-category"]').type("Cypress Test Category");
    cy.get('[data-id="material-add-category"]').click();
    cy.get('input[type="file"]').selectFile("cypress/fixtures/BananaCat.png", {
      force: true,
    });
    cy.get('[data-id="material-shop"]').type("Cypress Test Shop");
    cy.get('[data-id="material-total-price"]').type("100");
    cy.get('[data-id="material-quantity"]').type("2");
    cy.get('[data-id="currency-select"]').select("CAD");
    cy.get('[data-id="material-cost-per-unit"]').should("have.value", "50.00");
    cy.get('[data-id="create-button"]').click();
    cy.wait(5000);
    cy.get('[data-id="material-block"]')
      .contains("Cypress Test Material")
      .should("be.visible");
  });

  it("38. should change the view for client or default view", () => {
    cy.get('[data-id="view-materials"]').click();
    cy.get('[data-id="material-block"]')
      .contains("Cypress Test Material")
      .click();
    cy.contains("View for client").click();
    cy.get('[data-id="Client view"]').should("be.visible");
    cy.contains("Default View").click();
    cy.get('[data-id="Your view"]').should("be.visible");
  });

  // 35 and 38 are the same test case
  it("36. should delete a material", () => {
    cy.get('[data-id="view-materials"]').click();
    cy.get('[data-id="material-block"]')
      .contains("Cypress Test Material")
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
    cy.contains("Cypress Test Material").should("not.exist");
  });
});
