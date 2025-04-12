// This optional code is used to register a service worker.
// register() is not called by default.

// This lets the app load faster on subsequent visits in production, and gives
// it offline capabilities. However, it also means that developers (and users)
// will only see deployed updates on subsequent visits to a page, after all the
// existing tabs open on the page have been closed, since previously cached
// resources are updated in the background.

import { Workbox } from 'workbox-window';

export function register() {
  if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    // The URL constructor is available in all browsers that support SW.
    const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
    if (publicUrl.origin !== window.location.origin) {
      // Our service worker won't work if PUBLIC_URL is on a different origin
      // from what our page is served on. This might happen if a CDN is used to
      // serve assets; see https://github.com/facebook/create-react-app/issues/2374
      return;
    }

    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

      const wb = new Workbox(swUrl);

      // Add event listeners to handle updates
      wb.addEventListener('waiting', (event) => {
        // Show a UI element suggesting the user refresh for new content
        if (
          window.confirm(
            'New version of Arrow Tracker is available. Reload to update?'
          )
        ) {
          wb.messageSkipWaiting();
        }
      });

      wb.addEventListener('controlling', () => {
        window.location.reload();
      });

      // Register the service worker
      wb.register()
        .then(registration => {
          if (registration) {
            console.log('Service Worker registered with scope:', registration.scope);
          }
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
        });
    });
  }
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then(registration => {
        registration.unregister();
      })
      .catch(error => {
        console.error(error.message);
      });
  }
}