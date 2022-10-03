import { initializeApp } from 'firebase/app'
import { getMessaging, onBackgroundMessage } from 'firebase/messaging/sw'
import { environment } from '../../../environments/environment'

const firebaseApp = initializeApp(environment.firebase.options)
const messaging = getMessaging(firebaseApp)

onBackgroundMessage(messaging, payload => {
  console.log('[firebase-messaging-sw.js] Received background message 2 ', payload)

  // Customize notification here
  // const notificationTitle = 'Background Message Title';
  // const notificationOptions = {
  //   body: 'Background Message body.',
  //   icon: '/firebase-logo.png'
  // };

  // self.registration.showNotification(notificationTitle, notificationOptions);
})

(function () {
  'use strict';

  self.addEventListener('notificationclick', (event) => {
    // Write the code to open
    if (clients.openWindow && event.notification.data.url) {
      event.waitUntil(clients.openWindow(event.notification.data.url));
    }
  });}
());