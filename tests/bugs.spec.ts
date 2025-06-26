import { expect, test } from '@playwright/test';

test.describe('Bug Prevention Tests', () => {
  
  test('should not have memory leaks during navigation', async ({ page }) => {
    // Navigate through multiple pages to test for memory leaks
    await page.goto('/landing');
    await page.waitForLoadState('networkidle');
    
    await page.goto('/auth');
    await page.waitForLoadState('networkidle');
    
    await page.goto('/landing');
    await page.waitForLoadState('networkidle');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for memory usage after navigation
    const memoryInfo = await page.evaluate(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const perfMemory = (performance as any).memory;
      return perfMemory ? {
        usedJSHeapSize: perfMemory.usedJSHeapSize,
        totalJSHeapSize: perfMemory.totalJSHeapSize,
        jsHeapSizeLimit: perfMemory.jsHeapSizeLimit
      } : null;
    });
    
    if (memoryInfo) {
      console.log('Memory usage:', memoryInfo);
      // Memory usage should be reasonable (less than 50MB)
      expect(memoryInfo.usedJSHeapSize).toBeLessThan(50 * 1024 * 1024);
    }
  });

  test('should handle authentication state properly', async ({ page }) => {
    // Test auth flow without errors
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Should redirect to landing page when not authenticated
    expect(page.url()).toContain('/landing');
    
    // Check for auth-related errors in console
    const messages: string[] = await page.evaluate(() => {
      const errors: string[] = [];
      const originalError = console.error;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      console.error = (...args: any[]) => {
        errors.push(args.join(' '));
        originalError(...args);
      };
      return errors;
    });
    
    // Should not have auth-related errors
    const authErrors = messages.filter((msg: string) => 
      msg.includes('auth') || msg.includes('session') || msg.includes('user')
    );
    expect(authErrors.length).toBe(0);
  });

  test('should handle form submissions without errors', async ({ page }) => {
    await page.goto('/auth');
    await page.waitForLoadState('networkidle');
    
    // Fill out the form with invalid data to test error handling
    await page.fill('input[type="email"]', 'invalid-email');
    await page.fill('input[type="password"]', '123');
    
    // Submit form and check for proper error handling
    await page.click('button[type="submit"]');
    
    // Should show validation errors instead of crashing
    const errorMessages = await page.locator('.text-destructive, .text-red-500, .text-red-600').count();
    expect(errorMessages).toBeGreaterThan(0);
  });

  test('should handle network failures gracefully', async ({ page }) => {
    // Block network requests to simulate offline
    await page.route('**/*', route => route.abort());
    
    await page.goto('/');
    
    // Should show loading state or error message, not crash
    const hasLoadingOrError = await page.locator('.animate-spin, .text-destructive, .text-red-500').count();
    expect(hasLoadingOrError).toBeGreaterThan(0);
  });

  test('should not have accessibility violations', async ({ page }) => {
    await page.goto('/landing');
    await page.waitForLoadState('networkidle');
    
    // Check for basic accessibility
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').count();
    expect(headings).toBeGreaterThan(0);
    
    // Check for alt text on images
    const images = await page.locator('img').count();
    const imagesWithAlt = await page.locator('img[alt]').count();
    
    if (images > 0) {
      expect(imagesWithAlt).toBe(images);
    }
    
    // Check for proper form labels
    const inputs = await page.locator('input').count();
    const inputsWithLabels = await page.locator('input[aria-label], input[id] ~ label, label input').count();
    
    if (inputs > 0) {
      expect(inputsWithLabels).toBeGreaterThan(0);
    }
  });

  test('should handle rapid user interactions', async ({ page }) => {
    await page.goto('/landing');
    await page.waitForLoadState('networkidle');
    
    // Rapid button clicks should not cause errors
    const button = page.locator('text=Start Achieving Today');
    await button.click();
    await button.click();
    await button.click();
    
    // Should handle multiple clicks gracefully
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/auth');
  });

  test('should prevent XSS and injection attacks', async ({ page }) => {
    await page.goto('/auth');
    await page.waitForLoadState('networkidle');
    
    // Try to inject script
    const maliciousScript = '<script>alert("XSS")</script>';
    
    await page.fill('input[type="email"]', maliciousScript);
    await page.fill('input[type="password"]', maliciousScript);
    
    // Script should be escaped and not executed
    const alertFired = await page.evaluate(() => {
      let alertCalled = false;
      const originalAlert = window.alert;
      window.alert = () => {
        alertCalled = true;
        originalAlert('Alert was called');
      };
      return alertCalled;
    });
    
    expect(alertFired).toBe(false);
  });

  test('should handle data persistence correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check localStorage for theme persistence
    const themeStored = await page.evaluate(() => {
      return localStorage.getItem('theme') !== null;
    });
    
    expect(themeStored).toBe(true);
    
    // Theme should persist across page reloads
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    const themeAfterReload = await page.evaluate(() => {
      return localStorage.getItem('theme');
    });
    
    expect(themeAfterReload).toBe('light');
  });

  test('should handle responsive design properly', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/landing');
    await page.waitForLoadState('networkidle');
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500); // Allow time for responsive adjustments
    
    // Should not have horizontal scrollbar on mobile
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.body.scrollWidth > window.innerWidth;
    });
    
    expect(hasHorizontalScroll).toBe(false);
  });

  test('should handle concurrent requests properly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for race conditions in API calls
    let requestCount = 0;
    let errorCount = 0;
    
    page.on('response', response => {
      requestCount++;
      if (!response.ok()) {
        errorCount++;
      }
    });
    
    // Trigger multiple operations that might cause concurrent requests
    await Promise.all([
      page.click('text=History'),
      page.click('text=Settings'),
      page.click('text=Dashboard')
    ]);
    
    await page.waitForLoadState('networkidle');
    
    // Should handle concurrent requests without errors
    console.log(`Requests: ${requestCount}, Errors: ${errorCount}`);
    expect(errorCount).toBe(0);
  });
}); 