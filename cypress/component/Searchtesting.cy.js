import React from "react";
import SearchBar from "/app/components/search-bar";

describe("SearchBar Component", () => {
  let onSearchMock, onOpenFiltersMock;

  beforeEach(() => {
    onSearchMock = cy.stub();
    onOpenFiltersMock = cy.stub();
  });

  it("should call onSearch function when typing in the search input", () => {
    cy.mount(
      <SearchBar
        onSearch={onSearchMock}
        filterOn={true}
        onOpenFilters={onOpenFiltersMock}
      />
    );
    const searchInput = cy.get('input[type="text"]');
    searchInput.type("test search");
    cy.wrap(onSearchMock).should("have.been.calledWith", "test search");
  });

  it("should show filter button when filterOn is true", () => {
    cy.mount(
      <SearchBar
        onSearch={onSearchMock}
        filterOn={true}
        onOpenFilters={onOpenFiltersMock}
      />
    );
    cy.get('[data-id="filter-button"]').should("be.visible");
  });

  it("should trigger onOpenFilters function when the filter button is clicked", () => {
    cy.mount(
      <SearchBar
        onSearch={onSearchMock}
        filterOn={true}
        onOpenFilters={onOpenFiltersMock}
      />
    );
    cy.get('[data-id="filter-button"]').click();
    cy.wrap(onOpenFiltersMock).should("have.been.calledOnce");
  });

  it("should not show filter button when filterOn is false", () => {
    cy.mount(
      <SearchBar
        onSearch={onSearchMock}
        filterOn={false}
        onOpenFilters={onOpenFiltersMock}
      />
    );
    cy.get('[data-id="filter-button"]').should("not.exist");
  });
});
