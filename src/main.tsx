
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Get the root element
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error('Root element not found');
}

// Create and render the app
const root = createRoot(rootElement);

try {
  root.render(<App />);
} catch (error) {
  console.error('Error rendering app:', error);
  // Fallback rendering
  rootElement.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; font-family: system-ui;">
      <div style="text-align: center; padding: 20px;">
        <h1 style="color: #ef4444; margin-bottom: 10px;">App failed to load</h1>
        <p style="color: #6b7280;">Please refresh the page or check the console for errors.</p>
      </div>
    </div>
  `;
}

// Register service worker for caching and performance
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Performance monitoring
if (import.meta.env.PROD) {
  // Report Web Vitals
  const reportWebVitals = () => {
    if ('performance' in window) {
      // Report First Contentful Paint
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            console.log('FCP:', entry.startTime);
          }
          if (entry.name === 'largest-contentful-paint') {
            console.log('LCP:', entry.startTime);
          }
        });
      });
      
      observer.observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
    }
  };

  // Report when page is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', reportWebVitals);
  } else {
    reportWebVitals();
  }
}

// Preload critical modules
const preloadModules = async () => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(async () => {
      try {
        // Preload landing components for faster navigation
        await import('./pages/Landing.tsx');
        await import('./components/landing/HeroSection.tsx');
      } catch (error) {
        // Silently fail if preloading fails
      }
    });
  }
};

preloadModules();
