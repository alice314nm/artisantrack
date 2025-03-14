describe("Test Cases 1-7", () => {
    beforeEach(() => {
        cy.visit("http://localhost:3000/");
    });

    it("1. should create an account and sign up", () => {
        indexedDB.deleteDatabase("firebaseLocalStorageDb");
        cy.contains("Create Account").click();
        cy.get('[data-id="email"]').type("test@gmail.com");
        cy.get('[data-id="name"]').type("Test User");
        cy.get('[data-id="tax"]').type("5");
        cy.get('[data-id="password"]').type("password");
        cy.get('[data-id="repeat-password"]').type("password");
        cy.get('[data-id="sign-up"]').click();
        cy.wait(2000);
        cy.contains("Welcome back, Test User!").should("be.visible");
    });

    it("2. should log in with the new account", () => {
        cy.loginTest();
        cy.contains("Welcome back, Test User!").should("be.visible");
    });

    it("3. should log out", () => {
        cy.loginTest();
        cy.contains("Welcome back, Test User!").should("be.visible");
        cy.get('[data-id="menu-button"]').click({ force: true });
        cy.get('[data-id="logout"]').click({ force: true });
        cy.wait(3000);
        cy.contains("Welcome to Artisan Track!").should("be.visible");
    });

    it("4. should display user profile page", () => {
        cy.loginTest();
        cy.get('[data-id="menu-button"]').click({ force: true });
        cy.get('[data-id="slide-profile"]').click({ force: true });
        cy.wait(2000);
        cy.url().should("include", "/profile");
        cy.get("header").contains("Profile").should("be.visible");
    });

    // it("5. should update user information", () => {


    // });

    it("6. should change password", () => {
        cy.get('[data-id="menu-button"]').click({ force: true });
        cy.get('[data-id="slide-profile"]').click({ force: true });
        cy.get('[data-id="change-password-button"]').click();
        cy.get('[data-id="current-password"]').type("password");
        cy.get('[data-id="new-password"]').type("Newpassword");
        cy.get('[data-id="confirm-new-password"]').type("Newpassword");
        cy.get('[data-id="change-button"]').click();
        cy.wait(1000);
        cy.contains("Password successfully updated!").should("be.visible");
    });

    it("7. should login with new password", () => {
        indexedDB.deleteDatabase("firebaseLocalStorageDb");
        cy.contains("Log In").click();
        cy.get('[data-id="email"]').type("test@gmail.com");
        cy.get('[data-id="password"]').type("Newpassword");
        cy.contains("Log In").click();
        cy.wait(2000);
        cy.contains("Welcome back, Test User!").should("be.visible");
    });
});