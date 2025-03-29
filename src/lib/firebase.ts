
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBkUz1AzL8HfJm-aIbLqMdYGs22U4Jaug4",
  authDomain: "devotee-management-app.firebaseapp.com",
  projectId: "devotee-management-app",
  storageBucket: "devotee-management-app.appspot.com",
  messagingSenderId: "553462378886",
  appId: "1:553462378886:web:f2757a57c0a9ccc2fc84b3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
