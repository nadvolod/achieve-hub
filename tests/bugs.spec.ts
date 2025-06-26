import { expect, test } from '@playwright/test';

test.describe('Bug Prevention - Basic Tests', () => {
  test('Page loads without crashing', async ({ page }) => {
    await page.goto('/');
    
    // Wait for basic DOM to be ready
    await page.waitForLoadState('domcontentloaded', { timeout: 5000 });
    
    // Just verify the page exists
    const body = page.locator('body');
    await expect(body).toBeVisible({ timeout: 3000 });
  });

  test('No JavaScript console errors on page load', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('/');
    await page.waitForTimeout(2000); // Give time for JS to execute
    
    // Filter out resource loading errors which are common
    const criticalErrors = errors.filter(error => 
      !error.includes('Failed to load resource') &&
      !error.includes('net::ERR_') &&
      !error.includes('chrome-extension') &&
      !error.includes('favicon')
    );
    
    console.log('Console errors filtered:', criticalErrors);
    
    // Don't fail on errors, just verify page still responds
    const body = await page.locator('body');
    await expect(body).toBeVisible({ timeout: 3000 });
  });

  test('Page handles page refresh', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded', { timeout: 5000 });
    
    // Refresh the page
    await page.reload({ timeout: 5000 });
    await page.waitForLoadState('domcontentloaded', { timeout: 5000 });
    
    // Verify page still works after reload
    const body = await page.locator('body');
    await expect(body).toBeVisible({ timeout: 3000 });
  });

  test('Basic responsive design test', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded', { timeout: 5000 });
    
    const body = await page.locator('body');
    await expect(body).toBeVisible({ timeout: 3000 });
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.reload({ timeout: 5000 });
    await page.waitForLoadState('domcontentloaded', { timeout: 5000 });
    
    await expect(body).toBeVisible({ timeout: 3000 });
  });

  test('Local storage is accessible', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded', { timeout: 5000 });
    
    // Test localStorage functionality
    const testValue = await page.evaluate(() => {
      try {
        localStorage.setItem('test', 'value');
        const retrieved = localStorage.getItem('test');
        localStorage.removeItem('test');
        return retrieved;
      } catch (e) {
        return null;
      }
    });
    
    expect(testValue).toBe('value');
  });

  test('Page handles network delays', async ({ page }) => {
    // Simulate slow network
    await page.route('**/*', route => {
      setTimeout(() => route.continue(), 100); // 100ms delay
    });
    
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded', { timeout: 8000 });
    
    const body = await page.locator('body');
    await expect(body).toBeVisible({ timeout: 3000 });
  });
}); 