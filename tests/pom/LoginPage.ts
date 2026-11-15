import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * Page Object Model for Login & Registration Page (/login)
 */
export class LoginPage extends BasePage {
  readonly signInTab: Locator;
  readonly registerTab: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitSignInButton: Locator;
  readonly fullNameInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly submitRegisterButton: Locator;
  readonly googleSignInButton: Locator;
  readonly alertBanner: Locator;

  constructor(page: Page) {
    super(page);
    this.signInTab = page.getByRole("button", { name: /sign in/i }).first();
    this.registerTab = page.getByRole("button", { name: /create account/i }).first();
    this.emailInput = page.locator("input[type='email']").first();
    this.passwordInput = page.locator("input[type='password']").first();
    this.submitSignInButton = page.getByRole("button", { name: /^sign in$/i });
    this.fullNameInput = page.locator("input[placeholder*='full name' i]");
    this.confirmPasswordInput = page.locator("input[placeholder*='confirm' i]");
    this.submitRegisterButton = page.getByRole("button", { name: /create account/i }).last();
    this.googleSignInButton = page.getByRole("button", { name: /continue with google/i });
    this.alertBanner = page.locator("div[role='alert'], .bg-red-500\\/10, .bg-emerald-500\\/10");
  }

  async goto() {
    await this.clearAuthCookies();
    await this.page.goto("/login");
    await this.page.waitForLoadState("domcontentloaded");
  }

  async switchTab(tab: "signin" | "register") {
    if (tab === "signin") {
      await this.signInTab.click();
    } else {
      await this.registerTab.click();
    }
  }

  async fillSignIn(email: string, pass: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(pass);
  }

  async fillRegister(fullName: string, email: string, pass: string, confirmPass: string) {
    await this.switchTab("register");
    await this.fullNameInput.fill(fullName);
    await this.page.locator("input[type='email']").fill(email);
    await this.page.locator("input[type='password']").first().fill(pass);
    await this.confirmPasswordInput.fill(confirmPass);
  }
}
