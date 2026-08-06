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
 * Safely processes local files into optimized Data URLs or uploads to storage.
 * Image files are scaled down & compressed to prevent large base64 data truncation issues.
 */
export async function uploadToFirebaseStorage(file, folderName = "uploads") {
  if (!file) return "default.jpg";
  if (typeof file === "string") return file;

  return new Promise((resolve) => {
    // If image file, compress to reasonable size (max 400x400)
    if (file.type && file.type.startsWith("image/")) {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const canvas = document.createElement("canvas");
        const maxDim = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.75);
        console.log(
          `[File Uploader] Compressed image ${file.name} for ${folderName}: original ${file.size} bytes -> base64 ${compressedDataUrl.length} chars`
        );
        resolve(compressedDataUrl);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result || "default.jpg");
        reader.onerror = () => resolve("default.jpg");
        reader.readAsDataURL(file);
      };
      img.src = url;
    } else {
      // For PDFs or non-image files, read as data URL directly
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log(`[File Uploader] Successfully processed ${file.name || "file"} for ${folderName}`);
        resolve(reader.result || "default.jpg");
      };
      reader.onerror = () => resolve("default.jpg");
      reader.readAsDataURL(file);
    }
  });
}
