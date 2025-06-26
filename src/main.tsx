import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

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

createRoot(document.getElementById("root")!).render(<App />);
