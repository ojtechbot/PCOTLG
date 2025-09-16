// This file must be in the public folder.

// Scripts for firebase and firebase messaging
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js");

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "sacred-connect",
  "appId": "1:366216226232:web:95639871a2d627d3725b4d",
  "storageBucket": "sacred-connect.appspot.com",
  "apiKey": "AIzaSyBQwTFdPKx7isQShlXcn11mWoLk7sojbA0",
  "authDomain": "sacred-connect.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "366216226232"
};


// Initialize the Firebase app in the service worker with the configuration
firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon || "/images/logo.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
