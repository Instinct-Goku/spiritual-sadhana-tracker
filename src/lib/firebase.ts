
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCnDq_2ncZJ3ZmjmNN24dul9BRI_zc6Jj8",
  authDomain: "iskcon-dm.firebaseapp.com",
  projectId: "iskcon-dm",
  storageBucket: "iskcon-dm.firebasestorage.app",
  messagingSenderId: "932506556805",
  appId: "1:932506556805:web:ebdcc1ed31d2e110540cec"
};

// Initialize Firebase - use a conditional to avoid the duplicate app initialization
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  // If the app is already initialized, get the existing instance
  app = initializeApp();
  console.log("Using existing Firebase app instance");
}

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
