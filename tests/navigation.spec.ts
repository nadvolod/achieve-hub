import { expect, test } from '@playwright/test';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have correct page title', async ({ page }) => {
    await expect(page).toHaveTitle(/Daily Dreamer/);
  });


  test('should navigate to auth page', async ({ page }) => {
    // Click the "Sign In" button from landing page
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page).toHaveURL('/auth');
  });

  test('should navigate via CTA button', async ({ page }) => {
    // Click the main CTA button
    await page.getByRole('button', { name: 'Start Your Transformation Today' }).click();
    await expect(page).toHaveURL('/auth');
  });

  test('should handle protected routes', async ({ page }) => {
    // Test navigation to protected pages (should redirect to landing for unauthenticated users)
    await page.goto('/history');
    await expect(page).toHaveURL('/landing');
    
    await page.goto('/settings');
    await expect(page).toHaveURL('/landing');
  });

  test('should handle 404 pages', async ({ page }) => {
    await page.goto('/non-existent-page');
    await expect(page.getByText(/not found/i)).toBeVisible();
  });
}); 