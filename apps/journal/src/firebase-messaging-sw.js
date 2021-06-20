importScripts('https://www.gstatic.com/firebasejs/8.6.7/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.6.7/firebase-messaging.js');
firebase.initializeApp({
  projectId: "strive-journal",
  messagingSenderId: '423468347975',
  apiKey: "AIzaSyAIg4VtWaOMi5ASSr9Dc5PH-memu-58xXQ",
  appId: "1:423468347975:web:6e2be7bea1c4475ad2f762",
});
const messaging = firebase.messaging();
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  const notificationTitle = 'Background Message Title';
  const notificationOptions = {
    body: 'Background Message body.',
    icon: '/firebase-logo.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});