import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithCredential,
  sendPasswordResetEmail,
  User as FirebaseUser,
  UserCredential,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';
import type { AuthUser } from '@angla/shared';

// ============================================================
// AUTH SERVICE — Firebase Authentication wrapper
// Supports Email/Password + Google Sign-In
// ============================================================

/**
 * Convert Firebase User to our AuthUser type
 */
const toAuthUser = (firebaseUser: FirebaseUser): AuthUser => ({
  uid: firebaseUser.uid,
  email: firebaseUser.email,
  displayName: firebaseUser.displayName,
  photoURL: firebaseUser.photoURL,
  emailVerified: firebaseUser.emailVerified,
});

/**
 * Create user profile document in Firestore after signup
 */
const createUserProfile = async (
  uid: string,
  data: { email: string; name: string }
): Promise<void> => {
  const userRef = doc(db, 'users', uid);
  const existing = await getDoc(userRef);

  if (!existing.exists()) {
    await setDoc(userRef, {
      email: data.email,
      name: data.name,
      income: 0,
      contributionRate: 50,
      coupleId: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
};

/**
 * Sign up with email and password
 */
export const signUpWithEmail = async (
  email: string,
  password: string,
  name: string
): Promise<AuthUser> => {
  const credential: UserCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  // Set display name on Firebase Auth profile
  await updateProfile(credential.user, { displayName: name });

  // Create Firestore user document
  await createUserProfile(credential.user.uid, { email, name });

  return toAuthUser(credential.user);
};

/**
 * Sign in with email and password
 */
export const signInWithEmail = async (
  email: string,
  password: string
): Promise<AuthUser> => {
  const credential: UserCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
  return toAuthUser(credential.user);
};

/**
 * Sign in with Google (for React Native — requires idToken from expo-google-sign-in)
 */
export const signInWithGoogle = async (
  idToken: string
): Promise<AuthUser> => {
  const googleCredential = GoogleAuthProvider.credential(idToken);
  const credential: UserCredential = await signInWithCredential(
    auth,
    googleCredential
  );

  // Create profile if first time
  await createUserProfile(credential.user.uid, {
    email: credential.user.email || '',
    name: credential.user.displayName || 'User',
  });

  return toAuthUser(credential.user);
};

/**
 * Sign out current user
 */
export const signOut = async (): Promise<void> => {
  await firebaseSignOut(auth);
};

/**
 * Send password reset email
 */
export const resetPassword = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(auth, email);
};

/**
 * Listen to auth state changes.
 * Returns unsubscribe function.
 */
export const onAuthChange = (
  callback: (user: AuthUser | null) => void
): (() => void) => {
  return onAuthStateChanged(auth, (firebaseUser) => {
    callback(firebaseUser ? toAuthUser(firebaseUser) : null);
  });
};

/**
 * Get current authenticated user (synchronous check)
 */
export const getCurrentUser = (): AuthUser | null => {
  const user = auth.currentUser;
  return user ? toAuthUser(user) : null;
};
