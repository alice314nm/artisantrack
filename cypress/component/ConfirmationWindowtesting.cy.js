import React from "react";
import ConfirmationWindow from "/app/components/confirmation-window";

describe("ConfirmationWindow Component", () => {
  it("renders correctly when visible", () => {
    cy.mount(
      <ConfirmationWindow windowVisibility={true} onClose={cy.stub()} />
    );
    cy.get('[data-id="confirmation-window"]').should("be.visible");
    cy.get('[data-id="confirmation-text"]').should(
      "contain.text",
      "Are you sure you want to delete?"
    );
    cy.contains("Delete").should("be.visible");
    cy.contains("Cancel").should("be.visible");
  });

  it("does not render when not visible", () => {
    cy.mount(
      <ConfirmationWindow windowVisibility={false} onClose={cy.stub()} />
    );
    cy.get('[data-id="confirmation-window"]').should("have.class", "hidden");
  });

  it("calls onClose when Delete button is clicked", () => {
    const onCloseSpy = cy.spy().as("onCloseSpy");
    cy.mount(
      <ConfirmationWindow windowVisibility={true} onClose={onCloseSpy} />
    );
    cy.contains("Delete").click();
    cy.get("@onCloseSpy").should("have.been.calledOnce");
  });

  it("calls onClose when Cancel button is clicked", () => {
    const onCloseSpy = cy.spy().as("onCloseSpy");
    cy.mount(
      <ConfirmationWindow windowVisibility={true} onClose={onCloseSpy} />
    );
    cy.contains("Cancel").click();
    cy.get("@onCloseSpy").should("have.been.calledOnce");
  });
});
