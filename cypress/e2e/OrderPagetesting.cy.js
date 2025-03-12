describe("Order Page Tests", () => {
  before(() => {
    cy.login();
  });

  beforeEach(() => {
    cy.visit("http://localhost:3000/");
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
        .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }))
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
