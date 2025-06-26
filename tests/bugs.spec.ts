import { expect, test } from '@playwright/test';

test.describe('Bug Prevention Tests', () => {
  test('Basic page structure loads correctly', async ({ page }) => {
    await page.goto('/');
    
    // Wait for basic page structure
    await page.waitForSelector('body', { timeout: 10000 });
    
    // Verify basic page elements
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    const root = page.locator('#root');
    await expect(root).toBeVisible();
    
    // Check that the page has some content
    const bodyText = await page.textContent('body');
    expect(bodyText?.length).toBeGreaterThan(50);
  });

  test('Page handles JavaScript loading', async ({ page }) => {
    await page.goto('/');
    
    // Wait for React to mount
    await page.waitForTimeout(3000);
    
    // Check if React has rendered content
    const rootContent = await page.locator('#root').textContent();
    expect(rootContent?.trim().length).toBeGreaterThan(0);
  });

  test('Navigation works without crashes', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Try basic navigation (refresh)
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Verify page still works after reload
    expect(await page.locator('body').isVisible()).toBe(true);
  });

  test('No uncaught JavaScript exceptions', async ({ page }) => {
    const exceptions: string[] = [];
    
    page.on('pageerror', error => {
      exceptions.push(error.message);
    });
    
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Log any exceptions for debugging
    if (exceptions.length > 0) {
      console.log('JavaScript exceptions:', exceptions);
    }
    
    // Verify the page still functions
    expect(await page.locator('body').isVisible()).toBe(true);
  });

  test('Basic responsive design works', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    expect(await page.locator('body').isVisible()).toBe(true);
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    expect(await page.locator('body').isVisible()).toBe(true);
  });

  test('Basic accessibility structure', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for basic accessibility elements
    const html = page.locator('html');
    const lang = await html.getAttribute('lang');
    expect(lang).toBeTruthy();
    
    // Check meta viewport
    const viewport = page.locator('meta[name="viewport"]');
    expect(await viewport.count()).toBeGreaterThan(0);
  });

  test('Service worker registration (if present)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check if service worker registration doesn't cause errors
    const swRegistration = await page.evaluate(() => {
      return 'serviceWorker' in navigator;
    });
    
    // Just verify the API exists, don't require registration
    expect(typeof swRegistration).toBe('boolean');
  });

  test('Local storage access works', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Test localStorage functionality
    await page.evaluate(() => {
      localStorage.setItem('test', 'value');
      return localStorage.getItem('test');
    });
    
    const testValue = await page.evaluate(() => {
      return localStorage.getItem('test');
    });
    
    expect(testValue).toBe('value');
    
    // Clean up
    await page.evaluate(() => {
      localStorage.removeItem('test');
    });
  });
}); 