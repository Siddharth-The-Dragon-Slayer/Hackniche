// Firebase Cloud Messaging Service Worker
// Required by Firebase SDK — handles background push notifications.
// importScripts are loaded lazily when the FCM SDK is actually used.

importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// Firebase config is injected at runtime via the messaging SDK;
// this stub ensures the service worker is registered without 404 errors.
// If you are NOT using FCM push notifications you can leave this file empty.

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});
