describe("Test Cases 21-25", () => {
  before(() => {
    cy.login();
    cy.get("header").contains("Artisan Track").should("be.visible");
  });

  beforeEach(() => {
    cy.visit("http://localhost:3000/");
  });

  it("21. should search for products", () => {
    cy.get('[data-id="view-products"]').click();
    cy.wait(2000);
    cy.get('[data-id="search-bar"]').type("test");
    cy.get('[data-id="product-block"]').should("exist");
    cy.get('[data-id="product-block"]').each(($el) => {
      const productName = $el.text().toLowerCase();
      expect(productName).to.include("test");
    });
  });

  it("22.1. should sort products by name descending", () => {
    cy.get('[data-id="view-products"]').click();
    cy.wait(2000);
    cy.get('[data-id="filter-button"]').click();
    cy.get('[data-id="sort-by-option"]').click();
    cy.get('[data-id="sort-by"]').contains("Name Descending").click();
    cy.get('[data-id="apply-filters"]').click();
    cy.get('[data-id="product-title"]').then(($elements) => {
      const productNames = [...$elements].map((el) => el.innerText.trim());
      const sortedNames = [...productNames]
        .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }))
        .reverse();
      expect(productNames).to.deep.equal(sortedNames);
    });
  });

  it("22.2. should filter products by category", () => {
    cy.get('[data-id="view-products"]').click();
    cy.wait(2000);
    cy.get('[data-id="filter-button"]').click();
    cy.contains("Categories").click();
    cy.get('[data-id="category-filter"]').contains("sweater").click();
    cy.get('[data-id="apply-filters"]').click();
    cy.get('[data-id="product-block"]').each(($el) => {
      cy.wrap($el).should("contain.text", "sweater");
    });
  });

  //   it("23. should check inventory deduction", () => {

  //   });

  it("24. should edit product details", () => {
    cy.get('[data-id="view-products"]').click();
    cy.get('[data-id="product-block"]').contains("testName").click();
    cy.get('[data-id="edit-button"]').click();
    cy.wait(2000);
    cy.get('[data-id="product-description"]').clear().type("editedDescription");
    cy.contains("Save").click();
    cy.wait(2000);
    cy.contains("editedDescription").should("be.visible");
  });

  it("25. should edit material details", () => {
    cy.get('[data-id="view-materials"]').click();
    cy.get('[data-id="material-block"]').contains("testName").click();
    cy.get('[data-id="edit-button"]').click();
    cy.wait(2000);
    cy.get('[data-id="material-description"]')
      .clear()
      .type("editedDescription");
    cy.contains("Save").click();
    cy.wait(2000);
    cy.contains("editedDescription").should("be.visible");
  });
});
