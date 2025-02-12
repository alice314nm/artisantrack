describe("End Phase E2E Tests", () => {
  before(() => {
    cy.login();
  });

  beforeEach(() => {
    cy.visit("http://localhost:3000/");
  });
  describe("Product Page Tests", () => {
    it("should display the header with the correct title", () => {
      cy.get("header").contains("Products").should("be.visible");
    });

    it("should display the total count of products", () => {
      cy.contains("Total: 30").should("be.visible");
    });

    it("should navigate to the create product page on button click and return when click cancel", () => {
      cy.contains("Create product +").click();
      cy.url().should("include", "/pages/create_product");
      cy.contains("Cancel").click();
      cy.url().should("include", "http://localhost:3000/");
    });

    it("should navigate to product detail page on product block click and return when click back", () => {
      cy.get('[data-id="product-block"]').first().click();
      cy.url().should("include", "/pages/productid");
      cy.contains("Back").click();
      cy.url().should("include", "http://localhost:3000/");
    });

    it("should change the view for client or default view", () => {
      cy.get('[data-id="product-block"]').click();
      cy.contains("View for client").click();
      cy.get('[data-id="Client view"]').should("be.visible");
      cy.contains("Default View").click();
      cy.get('[data-id="Your view"]').should("be.visible");
    });

    it("should display a confirmation popup when the delete button is clicked", () => {
      cy.get('[data-id="product-block"]').first().click();
      cy.contains("Delete").click();
      cy.get('[data-id="delete-button"]').should("be.visible");
      cy.get('[data-id="confirmation-text"]').contains(
        "Are you sure you want to delete?"
      );
      cy.get('[data-id="confirmation-window"]').contains("Cancel").click();
      cy.get('[data-id="confirmation-window"]').should("not.visible");
    });
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
      cy.get('[data-id="menu-button"]').click({ force: true });
      cy.get('[data-id="slide-menu"]').should("be.visible");
      cy.get('[data-id="menu-button"]').click({ force: true });
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

    describe("SlideMenu Navigation Tests", () => {
      beforeEach(() => {
        cy.get('[data-id="menu-button"]').click({ force: true });
      });

      it("should navigate to the profile page on profile link click", () => {
        cy.contains("Profile").click();
        cy.url().should("include", "/pages/profile");
      });

      it("should navigate to the documents page on documents link click", () => {
        cy.contains("Documents").click();
        cy.url().should("include", "/pages/documents");
      });

      it("should navigate to the finance page on finance link click", () => {
        cy.contains("Finance").click();
        cy.url().should("include", "/pages/finances");
      });

      it("should navigate to the orders page on orders link click", () => {
        cy.contains("Orders").click();
        cy.url().should("include", "/pages/orders");
      });

      it("should navigate to the materials page on materials link click and back to products page", () => {
        cy.contains("Inventory").click();
        cy.contains("Materials").click();
        cy.url().should("include", "/pages/materials");
        cy.get('[data-id="menu-button"]').click({ force: true });
        cy.contains("Inventory").click();
        cy.contains("Products").click();
        cy.url().should("include", "http://localhost:3000/");
      });
    });
  });

  describe("Document Page Tests", () => {
    beforeEach(() => {
      cy.get('[data-id="menu-button"]').click({ force: true });
      cy.contains("Documents").click();
    });

    it("should display the header with the correct title", () => {
      cy.get("header").contains("Documents").should("be.visible");
    });

    it("should display the total count of documents", () => {
      cy.contains("Total: 30").should("be.visible");
    });

    it("should navigate to the create document page on button click and return the page when click cancel", () => {
      cy.contains("Create document +").click();
      cy.url().should("include", "/pages/create_document");
      cy.contains("Cancel").click();
      cy.url().should("include", "/pages/documents");
    });

    it("should navigate to products page on document block click", () => {
      cy.get('[data-id="document-block"]').click();
      cy.url().should("include", "http://localhost:3000/");
    });
  });

  describe("Material Page Tests", () => {
    beforeEach(() => {
      cy.get('[data-id="menu-button"]').click({ force: true });
      cy.contains("Inventory").click();
      cy.contains("Materials").click();
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
      cy.get('[data-id="material-block"]').each(($el) => {
        cy.wrap($el).should("contain.text", "wool");
      });
    });

    it("should filter materials by color", () => {
      cy.get('[data-id="filter-button"]').click();
      cy.get('[data-id="color-filter"]').click();
      cy.get('[data-id="color-filter"]').contains("white").click();
      cy.get('[data-id="apply-filters"]').click();
      cy.get('[data-id="material-block"]').each(($el) => {
        cy.wrap($el).should("contain.text", "white");
      });
    });

    it("should sort materials by name ascending", () => {
      cy.get('[data-id="filter-button"]').click();
      cy.get('[data-id="sort-by"]').click();
      cy.contains("Name Ascending").click();
      cy.get('[data-id="apply-filters"]').click();
    });

    it("should sort materials by name descending", () => {
      cy.get('[data-id="filter-button"]').click();
      cy.get('[data-id="sort-by"]').click();
      cy.contains("Name Descending").click();
      cy.get('[data-id="apply-filters"]').click();
    });

    it("should display search results for materials", () => {
      cy.get('[data-id="search-bar"]').type("white wool");
      cy.get('[data-id="material-block"]').should("include", "white wool");
    });
  });

  describe("Order Page Tests", () => {
    beforeEach(() => {
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
});
