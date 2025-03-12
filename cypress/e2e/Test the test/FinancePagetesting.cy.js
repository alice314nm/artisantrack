describe("Finance Page Tests", () => {
  before(() => {
    cy.login();
  });

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
