// Global error handler to filter out extension errors
export function setupGlobalErrorHandler() {
  if (typeof window === 'undefined') return;

  // Store original error handler
  const originalOnError = window.onerror;

  window.onerror = function (message, source, lineno, colno, error) {
    // Filter out known extension errors
    if (source && source.includes('register.js')) {
      console.log('Ignoring browser extension error from register.js');
      return true; // Prevent default error handling
    }

    // Filter out chrome extension errors
    if (source && (source.includes('chrome-extension://') || source.includes('moz-extension://'))) {
      console.log('Ignoring browser extension error');
      return true;
    }

    // Call original handler if it exists
    if (originalOnError) {
      return originalOnError(message, source, lineno, colno, error);
    }

    return false;
  };

  // Also handle unhandled promise rejections
  window.addEventListener('unhandledrejection', event => {
    // Log but don't crash the app for extension errors
    if (event.reason?.stack?.includes('register.js')) {
      console.log('Ignoring browser extension promise rejection');
      event.preventDefault();
    }
  });
}
