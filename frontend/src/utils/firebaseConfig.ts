import {initializeApp} from 'firebase/app';
import {getMessaging, getToken, onMessage, type Messaging} from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyDxm_hZIS_RJaq7JhrljvvnMw-10ENn5L0",
  authDomain: "volunteer-hub-6a4b5.firebaseapp.com",
  projectId: "volunteer-hub-6a4b5",
  storageBucket: "volunteer-hub-6a4b5.firebasestorage.app",
  messagingSenderId: "87499283203",
  appId: "1:87499283203:web:b0076ddfb62938bb282736",
  measurementId: "G-Q9DRGJLPJY"
};

// VAPID key for Web Push notifications
// Get from: Firebase Console -> Project Settings -> Cloud Messaging -> Web Push certificates
export const VAPID_KEY = "BBIdUsw0S1hfsOAGN7-QZQgg2dbNt3Ss57Tjzcn0PR9y9x-cDuvIy64_OqX_fOrQ5W4pAd-Acsue0V0VlMcTqAQ";

const app = initializeApp(firebaseConfig);

let messaging: Messaging | null = null;

try {
  messaging = getMessaging(app);
} catch (error) {
  console.error('Firebase Messaging initialization failed:', error);
}

export { app, messaging, getToken, onMessage };