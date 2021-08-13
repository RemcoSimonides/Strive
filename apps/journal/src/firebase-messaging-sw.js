importScripts('https://www.gstatic.com/firebasejs/8.6.7/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.6.7/firebase-messaging.js');
firebase.initializeApp({
  projectId: "strive-journal",
  messagingSenderId: '423468347975',
  apiKey: "AIzaSyAIg4VtWaOMi5ASSr9Dc5PH-memu-58xXQ",
  appId: "1:423468347975:web:6e2be7bea1c4475ad2f762",
});
const messaging = firebase.messaging();

// messaging.onBackgroundMessage((payload) => {
//   console.log('[firebase-messaging-sw.js] Received background message 2 ', payload);

//   const notificationOptions = {
//     body: payload.notification.body,
//     icon: payload.notification.icon || 'https://firebasestorage.googleapis.com/v0/b/strive-journal.appspot.com/o/FCMImages%2Ficon-72x72.png?alt=media&token=19250b44-1aef-4ea6-bbaf-d888150fe4a9'
//   };

//   self.registration.showNotification(payload.notification.title, notificationOptions);
// });

(function () {
  'use strict';

  self.addEventListener('notificationclick', (event) => {
    // Write the code to open
    if (clients.openWindow && event.notification.data.url) {
      event.waitUntil(clients.openWindow(event.notification.data.url));
    }
  });}
());