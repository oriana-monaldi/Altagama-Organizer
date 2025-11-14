import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDbxtgfoZ6XyiHGc4IsRCLUdPhAM6qYcg4",
  authDomain: "alatagama-organizer.firebaseapp.com",
  projectId: "alatagama-organizer",
  storageBucket: "alatagama-organizer.firebasestorage.app",
  messagingSenderId: "58127953665",
  appId: "1:58127953665:web:083b6de47743bf9df3f500",
  measurementId: "G-8H095KSFWK"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };
