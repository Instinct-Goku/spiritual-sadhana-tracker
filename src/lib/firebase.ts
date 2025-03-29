
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBSPsRCgUvsjRVB4YzURGkIcXcOx0zxkxM",
  authDomain: "devotee-management.firebaseapp.com",
  projectId: "devotee-management",
  storageBucket: "devotee-management.appspot.com",
  messagingSenderId: "507418558991",
  appId: "1:507418558991:web:dc5c5d1d38e17d51e4e188"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
