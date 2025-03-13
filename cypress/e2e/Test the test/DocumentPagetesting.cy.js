describe("Document Page Tests", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3000/");
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