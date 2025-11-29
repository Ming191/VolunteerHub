importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');


firebase.initializeApp({
  apiKey: "AIzaSyDxm_hZIS_RJaq7JhrljvvnMw-10ENn5L0",
  authDomain: "volunteer-hub-6a4b5.firebaseapp.com",
  projectId: "volunteer-hub-6a4b5",
  storageBucket: "volunteer-hub-6a4b5.firebasestorage.app",
  messagingSenderId: "87499283203",
  appId: "1:87499283203:web:b0076ddfb62938bb282736"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);

  const notificationTitle = payload.notification?.title || 'VolunteerHub Notification';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    data: payload.data,
    actions: payload.data?.link ? [
      {
        action: 'open',
        title: 'Open'
      }
    ] : []
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification clicked:', event);
  
  event.notification.close();

  const urlToOpen = event.notification.data?.link || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});
