import { Page } from '@playwright/test';

export class AuthHelper {
  constructor(private page: Page) {}

  async signUp(email: string, password: string) {
    await this.page.getByPlaceholder('Enter your email').fill(email);
    await this.page.getByPlaceholder('Enter your password').fill(password);
    await this.page.getByRole('button', { name: 'Sign Up' }).click();
  }

  async signIn(email: string, password: string) {
    await this.page.getByPlaceholder('Enter your email').fill(email);
    await this.page.getByPlaceholder('Enter your password').fill(password);
    await this.page.getByRole('button', { name: 'Sign In' }).click();
  }

  async waitForAuthentication() {
    // Wait for redirect away from auth page
    await this.page.waitForURL('/', { timeout: 10000 });
  }

  async logout() {
    await this.page.getByRole('button', { name: /logout/i }).click();
  }

  // Generate a unique test email
  generateTestEmail(): string {
    const timestamp = Date.now();
    return `test+${timestamp}@example.com`;
  }

  // Check if user is on the landing/auth page
  async isOnAuthPage(): Promise<boolean> {
    try {
      await this.page.waitForSelector('h1:has-text("Welcome to Daily Dreamer")', { timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  }

  // Check if user is authenticated (on main app)
  async isAuthenticated(): Promise<boolean> {
    try {
      // Look for elements that appear when authenticated
      await this.page.waitForSelector('[data-testid="daily-questions"], h1:has-text("Daily Questions")', { timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  }
}

export class PageHelper {
  constructor(private page: Page) {}

  async navigateToHistory() {
    await this.page.getByRole('link', { name: /history/i }).click();
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToSettings() {
    await this.page.getByRole('link', { name: /settings/i }).click();
    await this.page.waitForLoadState('networkidle');
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  async fillTextarea(placeholder: string, text: string) {
    await this.page.getByPlaceholder(placeholder).fill(text);
  }

  async clickSaveAll() {
    await this.page.getByRole('button', { name: /save all/i }).click();
  }
} 