describe("Home Page E2E Tests", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3000/");
  });

  it("should display the header with the correct title", () => {
    cy.get("header").contains("Products").should("be.visible");
  });

  it("should display the total count of products", () => {
    cy.contains("Total: 30").should("be.visible");
  });

  it("should navigate to the create product page on button click", () => {
    cy.contains("Create product +").click();
    cy.url().should("include", "/pages/create_product");
  });

  it("should navigate to product detail page on product block click", () => {
    cy.get('[data-id="product-block"]').first().click();
    cy.url().should("include", "/pages/productid");
  });

  describe("Filter and Search Component Tests", () => {
    it("should display and interact with the filter window", () => {
      cy.get('[data-id="filter-button"]').click();
      cy.get('[data-id="filter-window"]').should("be.visible");
      cy.get(".bg-beige").contains("Scarf");
      cy.get('[data-id="sort-by-button"]').click();
      cy.get(".bg-beige").contains("category");
      cy.get(".bg-beige").contains("name descending");
      cy.get('[data-id="categories-button"]').click();
      cy.get(".bg-beige").contains("Scarf");
      cy.get('[data-id="close-button"]').click();
      cy.get('[data-id="filter-window"]').should("not.visible");
      cy.get('[data-id="filter-button"]').click();
      cy.get('[data-id="filter-window"]').should("be.visible");
      cy.get(".bg-beige").contains("Scarf");
    });

    it("should search for products correctly", () => {
      const searchQuery = "testTitle";
      cy.get('input[type="text"]').type(searchQuery);
      cy.get('input[type="text"]').should("have.value", searchQuery);
      cy.get('[data-id="product-block"]').should("contain", searchQuery);
    });
  });

  describe("SlideMenu Component Tests", () => {
    it("should toggle the slide menu visibility when clicking the menu button", () => {
      cy.get('[data-id="menu-button"]').click();
      cy.get('[data-id="slide-menu"]').should("be.visible");
      cy.get('[data-id="menu-button"]').click();
      cy.get('[data-id="slide-menu"]').should("have.class", "hidden");
    });

    it("should display the menu with correct links after opening", () => {
      cy.get('[data-id="menu-button"]').click();
      cy.contains("Profile").should("have.attr", "href", "/pages/profile");
      cy.contains("Documents").should("have.attr", "href", "/pages/documents");
      cy.contains("Finance").should("have.attr", "href", "/pages/finances");
      cy.contains("Orders").should("have.attr", "href", "/pages/orders");
      cy.get('[data-id="menu-button"]').click({ force: true });
      cy.get('[data-id="slide-menu"]').should("have.class", "hidden");
    });
  });

});
