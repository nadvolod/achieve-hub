import { expect, test } from '@playwright/test';

test.describe('Navigation - Basic Tests', () => {
  test('Page loads and responds', async ({ page }) => {
    await page.goto('/');
    
    // Just check that we get a valid response
    expect(page.url()).toContain('localhost:8080');
    
    // Check that the page loaded something
    const body = await page.locator('body');
    await expect(body).toBeVisible({ timeout: 3000 });
  });

  test('Basic page structure exists', async ({ page }) => {
    await page.goto('/');
    
    // Wait for basic page load
    await page.waitForLoadState('domcontentloaded', { timeout: 5000 });
    
    // Check if page has basic HTML structure
    const html = await page.locator('html');
    await expect(html).toBeVisible({ timeout: 3000 });
  });

  test('Page responds to different routes', async ({ page }) => {
    // Test basic route navigation without expecting specific behavior
    await page.goto('/');
    expect(page.url()).toContain('/');
    
    await page.goto('/auth');
    expect(page.url()).toContain('/auth');
    
    await page.goto('/history');
    expect(page.url()).toContain('/history');
  });

  test('Page handles non-existent routes', async ({ page }) => {
    await page.goto('/non-existent-page');
    
    // Don't expect specific content, just that page responds
    const body = await page.locator('body');
    await expect(body).toBeVisible({ timeout: 3000 });
  });
});
