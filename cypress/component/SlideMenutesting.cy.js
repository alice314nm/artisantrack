import React from "react";
import SlideMenu from "/app/components/slide-menu";

describe("SlideMenu Component Tests", () => {
  it("should render the SlideMenu when menuVisible is true", () => {
    cy.mount(<SlideMenu menuVisible={true} />);
    cy.get('[data-id="slide-menu"]').should("be.visible");
  });

  it("should not render the SlideMenu when menuVisible is false", () => {
    cy.mount(<SlideMenu menuVisible={false} />);
    cy.get('[data-id="slide-menu"]').should("have.class", "hidden");
  });

  it("should display the Log out button", () => {
    cy.mount(<SlideMenu menuVisible={true} />);
    cy.contains("Log out").should("be.visible");
  });

  it("should display all menu links", () => {
    cy.mount(<SlideMenu menuVisible={true} />);
    cy.contains("Profile").should("have.attr", "href", "/pages/profile");
    cy.contains("Documents").should("have.attr", "href", "/pages/documents");
    cy.contains("Finance").should("have.attr", "href", "/pages/finances");
    cy.contains("Orders").should("have.attr", "href", "/pages/orders");
  });

  it("should toggle the Inventory submenu", () => {
    cy.mount(<SlideMenu menuVisible={true} />);

    // Initially collapsed (submenu is in the DOM but not visible)
    cy.get('[data-id="inventory-submenu"]').should("have.class", "opacity-0");

    // Expand submenu
    cy.contains("Inventory").click();
    cy.get('[data-id="inventory-submenu"]').should("have.class", "opacity-100");

    // Collapse submenu
    cy.contains("Inventory").click();
    cy.get('[data-id="inventory-submenu"]').should("have.class", "opacity-0");
  });

  // it("should navigate correctly for submenu links", () => {
  //   cy.mount(<SlideMenu menuVisible={true} />);
  //   cy.contains("Inventory").click();
  //   cy.get('[data-id="inventory-submenu"]')
  //     .contains("Products")
  //     .should("have.attr", "href", "/")
  //     .click();
  //   cy.get('[data-id="inventory-submenu"]')
  //     .contains("Materials")
  //     .should("have.attr", "href", "/pages/materials")
  //     .click();
  // });
});
