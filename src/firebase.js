// src/firebase.js  – TO‘LIQ YANGI KOD (oldinikini o‘chirib, shuni yozing)

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";  // DB uchun
import { getAuth } from "firebase/auth";           // Auth uchun

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

// EXPORTLAR – ENG MUHIM QISM!
export const db = getFirestore(app);    // Bu qator albatta bo‘lsin!
export const auth = getAuth(app);        // Bu ham!

// Analytics kerak emas – o‘chirdik
// import { getAnalytics } from "firebase/analytics";  – bu qatorni o‘chiring
// const analytics = getAnalytics(app);  – bu ham o‘chiring