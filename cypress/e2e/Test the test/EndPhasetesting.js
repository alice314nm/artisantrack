describe("End Phase E2E Tests", () => {
  before(() => {
    cy.login();
  });

  beforeEach(() => {
    cy.visit("http://localhost:3000/");
  });
  describe("Product Page Tests", () => {
    beforeEach(() => {
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

    it("should change the view for client or default view", () => {
      cy.get('[data-id="product-block"]').first().click();
      cy.contains("View for client").click();
      cy.get('[data-id="Client view"]').should("be.visible");
      cy.contains("Default View").click();
      cy.get('[data-id="Your view"]').should("be.visible");
    });

    it("should add the product when create new product button is clicked", () => {
      cy.contains("Create product +").click();
      cy.url().should("include", "/create_product");
      cy.get('[data-id="product-id"]').type("3012005");
      cy.get('[data-id="product-name"]').type("Cypress Test Product");
      cy.get('[data-id="product-description"]').type(
        "Cypress Test Description"
      );
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
      cy.get('[data-id="sort-by-option"]').click();
      cy.get('[data-id="sort-by"]').contains("Name Ascending").click();
      cy.get('[data-id="apply-filters"]').click();
      cy.get('[data-id="product-title"]').then(($elements) => {
        const productNames = [...$elements].map((el) => el.innerText.trim());
        const sortedNames = [...productNames].sort((a, b) =>
          a.localeCompare(b, undefined, { sensitivity: "base" })
        );
        expect(productNames).to.deep.equal(sortedNames);
      });
    });

    it("should sort products by name descending", () => {
      cy.get('[data-id="filter-button"]').click();
      cy.get('[data-id="sort-by-option"]').click();
      cy.get('[data-id="sort-by"]').contains("Name Descending").click();
      cy.get('[data-id="apply-filters"]').click();
      cy.get('[data-id="product-title"]').then(($elements) => {
        const productNames = [...$elements].map((el) => el.innerText.trim());
        const sortedNames = [...productNames]
          .sort((a, b) =>
            a.localeCompare(b, undefined, { sensitivity: "base" })
          )
          .reverse();
        expect(productNames).to.deep.equal(sortedNames);
      });
    });

    it("should display search results for products", () => {
      cy.get('[data-id="search-bar"]').type("test");
      cy.get('[data-id="product-block"]').should("exist");
      cy.get('[data-id="product-block"]').each(($el) => {
        const productName = $el.text().toLowerCase();
        expect(productName).to.include("test");
      });
    });
  });

  // describe("Document Page Tests", () => {
  //   beforeEach(() => {
  //     cy.get('[data-id="menu-button"]').click({ force: true });
  //     cy.contains("Documents").click();
  //   });

  //   it("should display the header with the correct title", () => {
  //     cy.get("header").contains("Documents").should("be.visible");
  //   });

  //   it("should display the total count of documents", () => {
  //     cy.contains("Total: 30").should("be.visible");
  //   });

  //   it("should navigate to the create document page on button click and return the page when click cancel", () => {
  //     cy.contains("Create document +").click();
  //     cy.url().should("include", "/pages/create_document");
  //     cy.contains("Cancel").click();
  //     cy.url().should("include", "/pages/documents");
  //   });

  //   it("should navigate to products page on document block click", () => {
  //     cy.get('[data-id="document-block"]').click();
  //     cy.url().should("include", "http://localhost:3000/");
  //   });
  // });

  describe("Material Page Tests", () => {
    beforeEach(() => {
      cy.get('[data-id="menu-button"]').click({ force: true });
      cy.contains("Inventory").click();
      cy.contains("Materials").click();
      cy.wait(5000);
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
      cy.url().should("include", "/create_material");
      cy.contains("Cancel").click();
      cy.url().should("include", "/materials");
    });

    it("should navigate to products page on material block click and return when click back", () => {
      cy.get('[data-id="material-block"]').first().click();
      cy.url().should("match", /\/materials\/.+/);
      cy.contains("Back").click();
      cy.url().should("include", "/materials");
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
      cy.url().should("include", "/create_material");
      cy.get('[data-id="material-id"]').type("3012005");
      cy.get('[data-id="material-name"]').type("Cypress Test Material");
      cy.get('[data-id="material-description"]').type(
        "Cypress Test Description"
      );
      cy.get('[data-id="material-color"]').type("Cypress Test Material Color");
      cy.get('[data-id="material-category"]').type("Cypress Test Category");
      cy.get('[data-id="material-add-category"]').click();
      cy.get('input[type="file"]').selectFile(
        "cypress/fixtures/BananaCat.png",
        {
          force: true,
        }
      );
      cy.get('[data-id="material-shop"]').type("Cypress Test Shop");
      cy.get('[data-id="material-total-price"]').type("100");
      cy.get('[data-id="material-quantity"]').type("2");
      cy.get('[data-id="currency-select"]').select("CAD");
      cy.get('[data-id="material-cost-per-unit"]').should(
        "have.value",
        "50.00"
      );
      cy.get('[data-id="create-button"]').click();
      cy.wait(5000);
    });

    it("should delete the material when the delete button is clicked", () => {
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

    it("should filter materials by category 'wool'", () => {
      cy.get('[data-id="filter-button"]').click();
      cy.contains("Categories").click();
      cy.get('[data-id="category-filter"]').contains(/wool/i).click();
      cy.get('[data-id="apply-filters"]').click();
      cy.get('[data-id="material-block"]').each(($el) => {
        cy.wrap($el)
          .invoke("text")
          .then((text) => {
            expect(text.toLowerCase()).to.contain("wool");
          });
      });
    });

    it("should filter materials by color 'grey'", () => {
      cy.get('[data-id="filter-button"]').click();
      cy.get('[data-id="color-option"]').click();
      cy.get('[data-id="color-filter"]').contains(/grey/i).click();
      cy.get('[data-id="apply-filters"]').click();
      cy.get('[data-id="material-block"]').each(($el) => {
        cy.wrap($el)
          .invoke("text")
          .then((text) => {
            expect(text.toLowerCase()).to.contain("grey");
          });
      });
    });

    it("should sort materials by name ascending", () => {
      cy.get('[data-id="filter-button"]').click();
      cy.get('[data-id="sort-by-option"]').click();
      cy.get('[data-id="sort-by"]').contains("Name Ascending").click();
      cy.get('[data-id="apply-filters"]').click();
      cy.get('[data-id="material-title"]').then(($elements) => {
        const materialNames = [...$elements].map((el) => el.innerText.trim());
        const sortedNames = [...materialNames].sort((a, b) =>
          a.localeCompare(b, undefined, { sensitivity: "base" })
        );
        expect(materialNames).to.deep.equal(sortedNames);
      });
    });

    it("should sort materials by name descending", () => {
      cy.get('[data-id="filter-button"]').click();
      cy.get('[data-id="sort-by-option"]').click();
      cy.get('[data-id="sort-by"]').contains("Name Descending").click();
      cy.contains("Name Descending").click();
      cy.get('[data-id="apply-filters"]').click();
      cy.get('[data-id="material-title"]').then(($elements) => {
        const materialNames = [...$elements].map((el) => el.innerText.trim());
        const sortedNames = [...materialNames]
          .sort((a, b) =>
            a.localeCompare(b, undefined, { sensitivity: "base" })
          )
          .reverse();
        expect(materialNames).to.deep.equal(sortedNames);
      });
    });

    it("should display search results for materials", () => {
      cy.get('[data-id="search-bar"]').type("white with red");
      cy.get('[data-id="material-block"]').should("exist");
      cy.get('[data-id="material-block"]').each(($el) => {
        const productName = $el.text().toLowerCase();
        expect(productName).to.include("white with red");
      });
    });
  });

  describe("Order Page Tests", () => {
    beforeEach(() => {
      cy.get('[data-id="menu-button"]').click({ force: true });
      cy.get('[data-id="slide-orders"]').click({ force: true });
      cy.wait(2000);
    });

    it("should display the header with the correct title", () => {
      cy.get("header").contains("Orders").should("be.visible");
    });

    it("should display the total count of orders dynamically", () => {
      cy.get("p")
        .contains(/^Total: \d+/)
        .should("be.visible");
    });

    it("should navigate to the create order page on button click and return the page when click cancel", () => {
      cy.contains("Create order +").click();
      cy.url().should("include", "/create_order");
      cy.contains("Cancel").click();
      cy.url().should("include", "/orders");
    });

    it("should navigate to products page on order block click", () => {
      cy.get('[data-id="order-block"]').first().click();
      cy.url().should("match", /\/orders\/.+/);
      cy.contains("Back").click();
      cy.url().should("include", "/orders");
    });

    it("should change the view for client or default view", () => {
      cy.get('[data-id="order-block"]').first().click();
      cy.contains("View for client").click();
      cy.get('[data-id="Client view"]').should("be.visible");
      cy.contains("Default View").click();
      cy.get('[data-id="Your view"]').should("be.visible");
    });

    it("should create a new order", () => {
      cy.contains("Create order +").click();
      cy.url().should("include", "/create_order");

      cy.get('[data-id="order-name"]').type("Cypress Test Order");
      cy.get('[data-id="start-date"]').click();
      cy.get('[data-id="start-date"]').type("30-01-2025");
      cy.get('[data-id="deadline"]').click();
      cy.get('[data-id="deadline"]').type("01-02-2025");
      cy.get('[data-id="days-counter"]').should("have.value", "2");
      cy.get('[data-id="order-customer"]').type("Test Customer");
      cy.get('[data-id="order-description"]').type("Cypress Test Description");
      cy.get('[data-id="select-product-button"]').click();
      cy.get('[data-id="select-product-holder-button"]').first().click();
      cy.get('[data-id="select-product-holder-button"]')
        .first()
        .should("contain.text", "selected");
      cy.contains("Confirm").click();
      cy.get('[data-id="select-material-button"]').click();
      cy.get('[data-id="select-material-holder-button"]').first().click();
      cy.get('[data-id="select-material-holder-button"]')
        .first()
        .should("contain.text", "selected");
      cy.get('[data-id="selected-material-quantity"]').type("2");
      cy.contains("Confirm").click();
      cy.get('[data-id="work-cost"]').type("10");
      cy.get('[data-id="currency-select"]').select("CAD");
      cy.get('[data-id="create-button"]').click();
      cy.wait(5000);
      cy.contains("Cypress Test Order").should("exist");
    });

    it("should delete an order when the delete button is clicked", () => {
      cy.get('[data-id="order-block"]').contains("Cypress Test Order").click();
      cy.get('[data-id="delete-button"]').click();
      cy.get('[data-id="confirmation-window"]')
        .should("be.visible")
        .within(() => {
          cy.get('[data-id="confirm-delete-button"]').click().wait(5000);
        });
      cy.contains("Cypress Test Order").should("not.exist");
    });

    it("should filter orders by status 'completed'", () => {
      cy.get('[data-id="filter-button"]').click();
      cy.contains("Status").click();
      cy.get('[data-id="status-filter"]')
        .contains(/completed/i)
        .click();
      cy.get('[data-id="apply-filters"]').click();

      cy.get('[data-id="order-block"]').each(($el) => {
        cy.wrap($el)
          .invoke("text")
          .then((text) => {
            expect(text.toLowerCase()).to.contain("completed");
          });
      });
    });

    it("should filter orders by customer name 'Lebron James'", () => {
      cy.get('[data-id="filter-button"]').click();
      cy.contains("Clients").click();
      cy.get('[data-id="client-filter"]')
        .contains(/lebron james/i)
        .click();
      cy.get('[data-id="apply-filters"]').click();
      cy.get('[data-id="order-block"]').each(($el) => {
        cy.wrap($el)
          .invoke("text")
          .then((text) => {
            expect(text.toLowerCase()).to.contain("Lebron James");
          });
      });
    });

    it("should sort orders by name ascending", () => {
      cy.get('[data-id="filter-button"]').click();
      cy.get('[data-id="sort-by-option"]').click();
      cy.get('[data-id="sort-by"]').contains("Name Ascending").click();
      cy.get('[data-id="apply-filters"]').click();

      cy.get('[data-id="order-title"]').then(($elements) => {
        const orderNames = [...$elements].map((el) => el.innerText.trim());
        const sortedNames = [...orderNames].sort((a, b) =>
          a.localeCompare(b, undefined, { sensitivity: "base" })
        );
        expect(orderNames).to.deep.equal(sortedNames);
      });
    });

    it("should sort orders by name descending", () => {
      cy.get('[data-id="filter-button"]').click();
      cy.get('[data-id="sort-by-option"]').click();
      cy.get('[data-id="sort-by"]').contains("Name Descending").click();
      cy.get('[data-id="apply-filters"]').click();

      cy.get('[data-id="order-title"]').then(($elements) => {
        const orderNames = [...$elements].map((el) => el.innerText.trim());
        const sortedNames = [...orderNames]
          .sort((a, b) =>
            a.localeCompare(b, undefined, { sensitivity: "base" })
          )
          .reverse();
        expect(orderNames).to.deep.equal(sortedNames);
      });
    });

    it("should display search results for orders", () => {
      cy.get('[data-id="search-bar"]').type("test");
      cy.get('[data-id="order-block"]').should("exist");
      cy.get('[data-id="order-block"]').each(($el) => {
        const orderName = $el.text().toLowerCase();
        expect(orderName).to.include("test");
      });
    });
  });

  describe("Finance Page Tests", () => {
    beforeEach(() => {
      cy.visit("http://localhost:3000/");
      cy.get('[data-id="menu-button"]').click({ force: true });
      cy.get('[data-id="slide-finance"]').click({ force: true });
      cy.wait(2000);
    });

    it("should display the header with the correct title", () => {
      cy.get("header").contains("Finance").should("be.visible");
    });

    it("should update tax value when changed", () => {
      cy.get("button").contains("Change Tax").click();
      cy.get('input[type="number"]').clear().type("12");
      cy.get("button").contains("Save").click();
      cy.wait(1000);
      cy.contains("Set Tax: 12%").should("be.visible");
    });

    it("should cancel tax update", () => {
      cy.get("button").contains("Change Tax").click();
      cy.get('input[type="number"]').clear().type("15");
      cy.get("button").contains("Cancel").click();
      cy.contains("Set Tax:").should("not.contain", "15%");
    });

    it("should display this month’s income and expenses", () => {
      const currentMonth = new Date().toLocaleString("default", {
        month: "long",
      });
      cy.contains(`This month (${currentMonth}):`).should("be.visible");
      cy.contains("Income:").should("be.visible");
      cy.contains("Expenses:").should("be.visible");
    });

    it("should display this year’s income and expenses", () => {
      const currentYear = new Date().getFullYear();
      cy.contains(`This year (${currentYear}):`).should("be.visible");
      cy.contains("Income:").should("be.visible");
      cy.contains("Expenses:").should("be.visible");
    });

    it("should navigate to the Monthly Financial Report", () => {
      cy.contains("Monthly Financial Report").click();
      cy.url().should("include", "/finances/monthly");
    });

    it("should navigate to the Yearly Financial Report", () => {
      cy.contains("Yearly Financial Report").click();
      cy.url().should("include", "/finances/yearly");
    });
  });
});
