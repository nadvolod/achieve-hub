import { expect, test } from '@playwright/test';

test.describe('Performance', () => {

  test('should have good Core Web Vitals', async ({ page }) => {
    await page.goto('/');
    
    // Measure paint timing
    const paintMetrics = await page.evaluate(() => {
      const entries = performance.getEntriesByType('paint');
      const fcp = entries.find(entry => entry.name === 'first-contentful-paint');
      const lcp = entries.find(entry => entry.name === 'largest-contentful-paint');
      
      return {
        firstContentfulPaint: fcp?.startTime || 0,
        largestContentfulPaint: lcp?.startTime || 0
      };
    });

    // First Contentful Paint should be under 2 seconds
    expect(paintMetrics.firstContentfulPaint).toBeLessThan(2000);
    
    // If LCP is measured, it should be under 2.5 seconds
    if (paintMetrics.largestContentfulPaint > 0) {
      expect(paintMetrics.largestContentfulPaint).toBeLessThan(2500);
    }
  });

  test('should load resources efficiently', async ({ page }) => {
    const resourceSizes: { [key: string]: number } = {};
    const resourceCount = { js: 0, css: 0, images: 0, fonts: 0 };

    page.on('response', async (response) => {
      const url = response.url();
      const contentLength = response.headers()['content-length'];
      const size = contentLength ? parseInt(contentLength) : 0;
      
      if (url.endsWith('.js')) {
        resourceCount.js++;
        resourceSizes[url] = size;
      } else if (url.endsWith('.css')) {
        resourceCount.css++;
        resourceSizes[url] = size;
      } else if (url.match(/\.(png|jpg|jpeg|gif|svg|webp)$/)) {
        resourceCount.images++;
        resourceSizes[url] = size;
      } else if (url.match(/\.(woff|woff2|ttf|eot)$/)) {
        resourceCount.fonts++;
        resourceSizes[url] = size;
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Should not load excessive resources
    expect(resourceCount.js).toBeLessThan(10); // Reasonable limit for JS files
    expect(resourceCount.css).toBeLessThan(5); // Reasonable limit for CSS files
    
    console.log('Resource counts:', resourceCount);
  });
}); 