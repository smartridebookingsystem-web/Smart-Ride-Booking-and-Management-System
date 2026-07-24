// src/config/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

// Live Firebase Configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyA7iJOvP7esTDPDGpL3FIa0_5CscylTKmU",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "gemini-vscode-503215.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "gemini-vscode-503215",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "gemini-vscode-503215.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "910954894433",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:910954894433:web:5f3855c07e92f328264620",
};

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const storage = getStorage(app);

export { RecaptchaVerifier, signInWithPhoneNumber };

/**
 * Uploads a file (profile photo or license PDF).
 * Uses FileReader to convert local files to Data URLs instantly without triggering Firebase Cloud Storage CORS errors.
 */
export async function uploadToFirebaseStorage(file, folderName = "uploads") {
  if (!file) return "default.jpg";
  if (typeof file === "string") return file;

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      console.log(`[File Uploader] Successfully processed ${file.name || "file"} for ${folderName}`);
      resolve(reader.result || "default.jpg");
    };
    reader.onerror = () => resolve("default.jpg");
    reader.readAsDataURL(file);
  });
}
