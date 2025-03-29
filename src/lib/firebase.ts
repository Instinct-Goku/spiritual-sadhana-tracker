
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDuhNz9sCVeUKM_YvQojyUEGdxqCOEO4os",
  authDomain: "devotee-management-app-d2b50.firebaseapp.com",
  projectId: "devotee-management-app-d2b50",
  storageBucket: "devotee-management-app-d2b50.appspot.com",
  messagingSenderId: "155559349406",
  appId: "1:155559349406:web:1b93b3b4d6680d8bad22f5"
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
