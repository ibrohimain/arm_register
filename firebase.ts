
// Firebase modular SDK imports with standardized quotes and clean formatting
// Fix: Use @firebase/ prefix for modular imports to resolve exported member errors
import { initializeApp } from '@firebase/app';
import { getFirestore } from '@firebase/firestore';
import { getAnalytics } from '@firebase/analytics';
import { getAuth } from '@firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDq-U3suDJJdn9upi5XL3vK2Tx3Ct8qzgQ",
  authDomain: "main-audio-478112-u7.firebaseapp.com",
  projectId: "main-audio-478112-u7",
  storageBucket: "main-audio-478112-u7.firebasestorage.app",
  messagingSenderId: "91432956988",
  appId: "1:91432956988:web:ba798920f13112df27ff39",
  measurementId: "G-HY6DLKH3ME"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
