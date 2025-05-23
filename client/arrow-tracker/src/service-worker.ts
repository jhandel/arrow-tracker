/// <reference lib="webworker" />
/* eslint-disable no-restricted-globals */

import { clientsClaim } from 'workbox-core';
import { ExpirationPlugin } from 'workbox-expiration';
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';

declare const self: ServiceWorkerGlobalScope;

// Precache all of the assets generated by your build process
clientsClaim();
precacheAndRoute(self.__WB_MANIFEST);

// Set up App Shell-style routing
const fileExtensionRegexp = new RegExp('/[^/?]+\\.[^/]+$');
registerRoute(
  ({ request, url }) => {
    if (request.mode !== 'navigate') {
      return false;
    }
    
    if (url.pathname.startsWith('/_')) {
      return false;
    }
    
    if (url.pathname.match(fileExtensionRegexp)) {
      return false;
    }
    
    return true;
  },
  createHandlerBoundToURL(process.env.PUBLIC_URL + '/index.html')
);

// Cache API responses
registerRoute(
  ({ url }) => url.origin === self.location.origin && url.pathname.startsWith('/api/'),
  new StaleWhileRevalidate({
    cacheName: 'api-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24, // 24 hours
      }),
    ],
  })
);

// Cache images with a Cache First strategy
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
      }),
    ],
  })
);

// This allows the web app to trigger skipWaiting via
// registration.waiting.postMessage({type: 'SKIP_WAITING'})
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Background sync for offline data
// @ts-ignore - TypeScript doesn't recognize the sync event type
self.addEventListener('sync', (event: any) => {
  if (event.tag === 'sync-practice-sessions') {
    event.waitUntil(syncPracticeSessions());
  }
});

// Placeholder function for syncing practice sessions when coming back online
async function syncPracticeSessions() {
  // TODO: Implement the actual sync logic here
  console.log('Syncing practice sessions in the background');
}