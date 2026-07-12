const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const macChrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const chromePath = process.env.CHROME_PATH || (fs.existsSync(macChrome) ? macChrome : undefined);

module.exports = {
  ci: {
    collect: {
      staticDistDir: './dist',
      url: [
        'http://localhost/',
        'http://localhost/apartments/saphir/',
        'http://localhost/kontakt/',
        'http://localhost/lage/',
        'http://localhost/reisefuehrer/',
      ],
      numberOfRuns: 3,
      ...(chromePath ? { chromePath } : {}),
      settings: {
        formFactor: 'mobile',
        throttlingMethod: 'simulate',
        chromeFlags: '--headless --no-sandbox --disable-dev-shm-usage',
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.9, aggregationMethod: 'median' }],
        'categories:accessibility': ['error', { minScore: 0.95, aggregationMethod: 'median' }],
        'categories:best-practices': ['error', { minScore: 0.9, aggregationMethod: 'median' }],
        'categories:seo': ['error', { minScore: 0.95, aggregationMethod: 'median' }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500, aggregationMethod: 'median' }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1, aggregationMethod: 'median' }],
        // Navigation-Lighthouse kann INP nicht reproduzierbar messen; TBT ist der Lab-Proxy.
        'total-blocking-time': ['error', { maxNumericValue: 200, aggregationMethod: 'median' }],
        'resource-summary:script:size': ['error', { maxNumericValue: 102400, aggregationMethod: 'median' }],
        'button-name': 'error',
        'document-title': 'error',
        'html-has-lang': 'error',
        'image-alt': 'error',
        'link-name': 'error',
        'meta-viewport': 'error',
      },
    },
    upload: {
      target: 'filesystem',
      outputDir: process.env.LHCI_OUTPUT_DIR || path.join(os.tmpdir(), 'haus-aquamarin-lhci'),
    },
  },
};
