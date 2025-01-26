import React from "react";
import FilterWindow from "/app/components/filter-window";

describe("FilterWindow Component", () => {
  let closeMock;
  beforeEach(() => {
    closeMock = cy.stub();
  });

  it("should be hidden when windowVisibility is false", () => {
    cy.mount(<FilterWindow windowVisibility={false} onClose={closeMock} />);
    cy.get('[data-id="filter-window"]').should("have.class", "hidden");
  });

  it("should be visible when windowVisibility is true", () => {
    cy.mount(<FilterWindow windowVisibility={true} onClose={closeMock} />);
    cy.get('[data-id="filter-window"]').should("be.visible");
  });

  it("should call onClose function when the close button is clicked", () => {
    cy.mount(<FilterWindow windowVisibility={true} onClose={closeMock} />);
    closeMock.returns(true);
    cy.get('[data-id="close-button"]').click();
    cy.wrap(closeMock).should("have.been.calledOnce");
  });

  it('should close the filter window when the "Apply Filters" button is clicked', () => {
    cy.mount(<FilterWindow windowVisibility={true} onClose={closeMock} />);
    closeMock.returns(true);
    cy.get("button").contains("Apply Filters").click();
    cy.wrap(closeMock).should("have.been.calledOnce");
  });

  it("should display filter options for the selected category", () => {
    cy.mount(<FilterWindow windowVisibility={true} onClose={closeMock} />);
    cy.get(".bg-beige").contains("Scarf");
    cy.get('[data-id="sort-by-button"]').click();
    cy.get(".bg-beige").contains("category");
    cy.get(".bg-beige").contains("name descending");
    cy.get('[data-id="categories-button"]').click();
    cy.get(".bg-beige").contains("Scarf");
  });
});
