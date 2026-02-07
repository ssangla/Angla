import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL, FirebaseStorage } from 'firebase/storage';
import { getAuth, Auth } from 'firebase/auth';

// Firebase config for Dfabrik-dev project
// In production, load these from environment variables via expo-constants
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'YOUR_API_KEY',
  authDomain: 'dfabrik-dev.firebaseapp.com',
  projectId: 'dfabrik-dev',
  storageBucket: 'dfabrik-dev.firebasestorage.app',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || 'YOUR_SENDER_ID',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || 'YOUR_APP_ID',
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || '',
};

let app: FirebaseApp;
let storage: FirebaseStorage;
let auth: Auth;

function getFirebaseApp(): FirebaseApp {
  if (!app) {
    const existingApps = getApps();
    app = existingApps.length > 0 ? existingApps[0] : initializeApp(firebaseConfig);
  }
  return app;
}

export function getFirebaseStorage(): FirebaseStorage {
  if (!storage) {
    storage = getStorage(getFirebaseApp());
  }
  return storage;
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    auth = getAuth(getFirebaseApp());
  }
  return auth;
}

// Upload an invoice image to Firebase Storage
export async function uploadInvoiceImage(
  restaurantId: string,
  invoiceId: string,
  imageUri: string,
  mimeType: string = 'image/jpeg'
): Promise<string> {
  const storage = getFirebaseStorage();
  const fileName = `${Date.now()}.${mimeType.split('/')[1] || 'jpg'}`;
  const storageRef = ref(storage, `invoices/${restaurantId}/${invoiceId}/${fileName}`);

  // Convert URI to blob for upload
  const response = await fetch(imageUri);
  const blob = await response.blob();

  await uploadBytes(storageRef, blob, { contentType: mimeType });
  const downloadUrl = await getDownloadURL(storageRef);
  return downloadUrl;
}

// Upload extraction result JSON
export async function uploadExtractionResult(
  restaurantId: string,
  invoiceId: string,
  extractionData: object
): Promise<string> {
  const storage = getFirebaseStorage();
  const storageRef = ref(storage, `extractions/${restaurantId}/${invoiceId}.json`);

  const jsonBlob = new Blob([JSON.stringify(extractionData)], {
    type: 'application/json',
  });

  await uploadBytes(storageRef, jsonBlob, { contentType: 'application/json' });
  const downloadUrl = await getDownloadURL(storageRef);
  return downloadUrl;
}

// Get download URL for an invoice image
export async function getInvoiceImageUrl(
  restaurantId: string,
  invoiceId: string,
  fileName: string
): Promise<string> {
  const storage = getFirebaseStorage();
  const storageRef = ref(storage, `invoices/${restaurantId}/${invoiceId}/${fileName}`);
  return getDownloadURL(storageRef);
}

export { firebaseConfig };
