module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000', 'http://localhost:3000/landing'],
      startServerCommand: 'npx serve -s dist -l 3000',
      startServerReadyPattern: 'Local:',
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'first-contentful-paint': ['error', { maxNumericValue: 500 }], // 0.5 seconds
        'largest-contentful-paint': ['error', { maxNumericValue: 800 }], // 0.8 seconds
        'speed-index': ['error', { maxNumericValue: 1000 }], // 1 second
        'interactive': ['error', { maxNumericValue: 1500 }], // 1.5 seconds
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
}; 