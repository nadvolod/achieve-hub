# Daily Dreamer - Test Suite

This directory contains automated end-to-end tests for the Daily Dreamer application using Playwright.

## Test Structure

- **`auth.spec.ts`** - Authentication flow tests (login, signup, validation)
- **`navigation.spec.ts`** - Route navigation and URL handling tests
- **`ui-components.spec.ts`** - UI component functionality and responsiveness tests
- **`accessibility.spec.ts`** - Accessibility compliance tests (WCAG guidelines)
- **`performance.spec.ts`** - Performance and load time tests
- **`helpers/auth.ts`** - Helper utilities for authentication and common operations

## Running Tests

### Prerequisites
1. Install dependencies: `npm install`
2. Install Playwright browsers: `npx playwright install`

### Test Commands

```bash
# Run all tests
npm run test

# Run tests with UI mode (interactive)
npm run test:ui

# Run tests in headed mode (see browser)
npm run test:headed

# Debug tests (step through)
npm run test:debug

# View test report
npm run test:report
```

### Running Specific Tests

```bash
# Run only authentication tests
npx playwright test auth.spec.ts

# Run tests for specific browser
npx playwright test --project=chromium

# Run tests matching a pattern
npx playwright test --grep "should navigate"
```

## Test Configuration

The tests are configured via `playwright.config.ts` in the root directory:

- **Browsers**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Base URL**: http://localhost:5173 (dev server)
- **Screenshots**: Taken on failure
- **Videos**: Recorded on failure
- **Traces**: Collected on retry

## Writing New Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should do something', async ({ page }) => {
    // Test implementation
    await expect(page.getByText('Expected Text')).toBeVisible();
  });
});
```

### Using Helpers

```typescript
import { AuthHelper, PageHelper } from './helpers/auth';

test('authenticated user test', async ({ page }) => {
  const auth = new AuthHelper(page);
  const pageHelper = new PageHelper(page);
  
  await page.goto('/auth');
  await auth.signIn('test@example.com', 'password123');
  await pageHelper.waitForPageLoad();
});
```

## Test Coverage

### Authentication
- ✅ Landing page display
- ✅ Navigation to auth page
- ✅ Form validation (email, password)
- ✅ Sign up attempt
- ✅ Mode switching (sign in/sign up)

### Navigation
- ✅ Route handling (/auth, /history, /settings, 404)
- ✅ Back/forward navigation
- ✅ Route parameters
- ✅ State management during navigation

### UI Components
- ✅ Responsive design (desktop, tablet, mobile)
- ✅ Button accessibility
- ✅ Form element functionality
- ✅ Dark mode toggle
- ✅ Loading states
- ✅ Keyboard navigation
- ✅ Error states
- ✅ Focus management

### Accessibility
- ✅ Semantic HTML structure
- ✅ Form element accessibility
- ✅ Keyboard navigation
- ✅ Focus indicators
- ✅ Image alt text
- ✅ Screen reader announcements
- ✅ Reduced motion support
- ✅ High contrast mode

### Performance
- ✅ Page load times
- ✅ Core Web Vitals (FCP, LCP)
- ✅ Network condition handling
- ✅ Resource efficiency
- ✅ User interaction response times
- ✅ Memory usage
- ✅ Caching behavior

## CI/CD Integration

Tests run automatically on:
- Push to main/master branch
- Pull requests
- GitHub Actions workflow (`.github/workflows/playwright.yml`)

Test artifacts (reports, screenshots, videos) are uploaded and retained for 30 days.

## Debugging Tests

### Local Debugging
```bash
# Run in debug mode (opens browser dev tools)
npm run test:debug

# Run specific test in debug mode
npx playwright test auth.spec.ts --debug
```

### Visual Debugging
```bash
# Open test results with traces
npm run test:report

# Generate and view traces for failed tests
npx playwright show-trace test-results/[test-name]/trace.zip
```

### Common Issues

1. **Test timeouts**: Increase timeout in test or use `page.waitForLoadState()`
2. **Element not found**: Use more specific selectors or wait for elements
3. **Flaky tests**: Add proper waits and assertions
4. **Network issues**: Mock external API calls in tests

## Best Practices

1. **Use semantic selectors**: Prefer `getByRole`, `getByText`, `getByLabel`
2. **Wait for states**: Use `waitForLoadState()`, `waitForSelector()`
3. **Keep tests isolated**: Each test should be independent
4. **Use helpers**: Extract common operations to helper functions
5. **Test user flows**: Focus on real user scenarios
6. **Handle async operations**: Properly await all async operations
7. **Mock external dependencies**: Don't rely on external services

## Environment Variables

For tests that require authentication or external services:

```bash
# .env.test
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=testpassword123
SUPABASE_TEST_URL=your-test-supabase-url
SUPABASE_TEST_ANON_KEY=your-test-anon-key
``` 