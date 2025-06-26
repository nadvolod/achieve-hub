import { expect, test } from '@playwright/test';

test.describe('Performance - Optimized Loading', () => {
  test('should load landing page with excellent performance', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/landing');
    await page.waitForLoadState('networkidle');
    
    const endTime = Date.now();
    const loadTime = endTime - startTime;
    
    console.log(`Landing page load time: ${loadTime}ms`);
    // Excellent performance - under 1 second
    expect(loadTime).toBeLessThan(1000);
  });

  test('should load main app with excellent performance', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const endTime = Date.now();
    const loadTime = endTime - startTime;
    
    console.log(`Main app load time: ${loadTime}ms`);
    // Excellent performance - under 1 second
    expect(loadTime).toBeLessThan(1000);
  });

  test('should have excellent Core Web Vitals', async ({ page }) => {
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

    // First Contentful Paint should be under 700ms (excellent)
    expect(paintMetrics.firstContentfulPaint).toBeLessThan(700);
    
    // If LCP is measured, it should be under 1.2 seconds
    if (paintMetrics.largestContentfulPaint > 0) {
      expect(paintMetrics.largestContentfulPaint).toBeLessThan(1200);
    }
  });

  test('should load bundle efficiently', async ({ page }) => {
    const resourceSizes: { [key: string]: number } = {};
    const resourceCount = { js: 0, css: 0, images: 0, fonts: 0 };
    let totalJSSize = 0;
    let totalCSSSize = 0;

    page.on('response', async (response) => {
      const url = response.url();
      const contentLength = response.headers()['content-length'];
      const size = contentLength ? parseInt(contentLength) : 0;
      
      if (url.endsWith('.js')) {
        resourceCount.js++;
        totalJSSize += size;
        resourceSizes[url] = size;
      } else if (url.endsWith('.css')) {
        resourceCount.css++;
        totalCSSSize += size;
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
    expect(resourceCount.js).toBeLessThan(20); // Allow for chunked bundles
    expect(resourceCount.css).toBeLessThan(5);
    
    // Total JS size should be reasonable (under 2MB)
    expect(totalJSSize).toBeLessThan(2 * 1024 * 1024);
    
    // Total CSS size should be reasonable (under 400KB)
    expect(totalCSSSize).toBeLessThan(400 * 1024);
    
    console.log('Resource counts:', resourceCount);
    console.log('Total JS size:', totalJSSize);
    console.log('Total CSS size:', totalCSSSize);
  });

  test('should have very fast navigation between pages', async ({ page }) => {
    await page.goto('/landing');
    await page.waitForLoadState('networkidle');

    // Test navigation to auth
    const startTime = Date.now();
    await page.click('text=Start Achieving Today');
    await page.waitForLoadState('networkidle');
    const navigationTime = Date.now() - startTime;

    console.log(`Navigation time: ${navigationTime}ms`);
    expect(navigationTime).toBeLessThan(500);
  });

  test('should optimize images and fonts', async ({ page }) => {
    let imageCount = 0;
    let fontCount = 0;
    let oversizedResources = 0;

    page.on('response', async (response) => {
      const url = response.url();
      const contentLength = response.headers()['content-length'];
      const size = contentLength ? parseInt(contentLength) : 0;

      if (url.match(/\.(png|jpg|jpeg|gif|svg|webp)$/)) {
        imageCount++;
        // Images should be under 1MB
        if (size > 1024 * 1024) {
          oversizedResources++;
        }
      } else if (url.match(/\.(woff|woff2|ttf|eot)$/)) {
        fontCount++;
        // Fonts should be under 200KB
        if (size > 200 * 1024) {
          oversizedResources++;
        }
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    expect(oversizedResources).toBe(0);
    console.log('Image count:', imageCount);
    console.log('Font count:', fontCount);
  });

  test('should have minimal Time to Interactive', async ({ page }) => {
    await page.goto('/');
    
    // Measure Time to Interactive using a basic heuristic
    const tti = await page.evaluate(() => {
      return new Promise((resolve) => {
        const startTime = performance.timing.navigationStart;
        
        // Simple TTI measurement
        const checkTTI = () => {
          const now = performance.now();
          if (document.readyState === 'complete') {
            resolve(now);
          } else {
            setTimeout(checkTTI, 50);
          }
        };
        
        checkTTI();
      });
    });

    console.log(`Time to Interactive: ${tti}ms`);
    expect(tti).toBeLessThan(2000); // Under 2 seconds
  });
}); 