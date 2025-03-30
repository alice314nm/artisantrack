describe("Test Cases 39-45", () => {
  before(() => {
    cy.login();
    cy.get("header").contains("Artisan Track").should("be.visible");
  });

  beforeEach(() => {
    cy.visit("http://localhost:3000/");
  });

  it("39. should search for materials", () => {
    cy.get('[data-id="view-materials"]').click();
    cy.get('[data-id="search-bar"]').type("white with red");
    cy.get('[data-id="material-block"]').should("exist");
    cy.get('[data-id="material-block"]').each(($el) => {
      const productName = $el.text().toLowerCase();
      expect(productName).to.include("white with red");
    });
  });

  it("40. should search for products", () => {
    cy.get('[data-id="view-products"]').click();
    cy.get('[data-id="search-bar"]').type("test");
    cy.get('[data-id="product-block"]').should("exist");
    cy.get('[data-id="product-block"]').each(($el) => {
      const productName = $el.text().toLowerCase();
      expect(productName).to.include("test");
    });
  });

  it("41. should search for orders", () => {
    cy.get('[data-id="view-orders"]').click();
    cy.get('[data-id="search-bar"]').type("test");
    cy.get('[data-id="order-block"]').should("exist");
    cy.get('[data-id="order-block"]').each(($el) => {
      const orderName = $el.text().toLowerCase();
      expect(orderName).to.include("test");
    });
  });

  it("42. should check invalid search results for orders", () => {
    cy.get('[data-id="view-orders"]').click();
    cy.get('[data-id="search-bar"]').type("invalid search");
    cy.get('[data-id="order-block"]').should("not.exist");
    cy.contains("No orders found").should("be.visible");
  });

  it("43. should check if that the searches are not case-sensitive for materials", () => {
    cy.get('[data-id="view-materials"]').click();
    cy.get('[data-id="search-bar"]').type("WhItE WiTh ReD");
    cy.get('[data-id="material-block"]').should("exist");
    cy.get('[data-id="material-block"]').each(($el) => {
      const productName = $el.text().toLowerCase();
      expect(productName).to.include("white with red");
    });
  });

  it("44. should check if that the searches are not case-sensitive for products", () => {
    cy.get('[data-id="view-products"]').click();
    cy.get('[data-id="search-bar"]').type("TeSt");
    cy.get('[data-id="product-block"]').should("exist");
    cy.get('[data-id="product-block"]').each(($el) => {
      const productName = $el.text().toLowerCase();
      expect(productName).to.include("test");
    });
  });

  it("45. should check if that the searches are not case-sensitive for orders", () => {
    cy.get('[data-id="view-orders"]').click();
    cy.get('[data-id="search-bar"]').type("TeSt");
    cy.get('[data-id="order-block"]').should("exist");
    cy.get('[data-id="order-block"]').each(($el) => {
      const orderName = $el.text().toLowerCase();
      expect(orderName).to.include("test");
    });
  });
});
