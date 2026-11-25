import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import {
  auth,
  googleProvider,
  firebaseReady,
  authPersistence,
} from "./firebase.js";

function ensureFirebase() {
  if (!firebaseReady || !auth) {
    throw new Error(
      "Firebase is not configured. Add your Firebase values to .env.local and restart the dev server."
    );
  }
}

/**
 * Translates Firebase Auth error codes into clear, user-friendly messages.
 */
export function formatAuthError(error) {
  if (!error) return "";
  const code = error.code || "";
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Invalid email or password. Please try again.";
    case "auth/email-already-in-use":
      return "This email is already in use. Please sign in instead.";
    case "auth/weak-password":
      return "Password is too weak. Please use at least 6 characters.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/operation-not-allowed":
      return "This sign-in method is disabled in Firebase Console. Go to Authentication > Sign-in method to enable it.";
    case "auth/unauthorized-domain":
      return "This domain is not authorized. Add your domain (e.g. localhost) in Firebase Console under Authentication > Settings > Authorized domains.";
    case "auth/popup-closed-by-user":
      return "Google sign-in popup was closed before completing.";
    case "auth/popup-blocked":
      return "Google sign-in popup was blocked by your browser. Please allow popups.";
    case "auth/cancelled-popup-request":
      return "Only one sign-in popup can be active at a time.";
    case "auth/network-request-failed":
      return "Network error. Please check your internet connection.";
    case "auth/too-many-requests":
      return "Too many attempts. Access is temporarily disabled. Please try again later.";
    case "auth/user-disabled":
      return "This account has been disabled. Please contact support.";
    default:
      return error.message
        ? error.message.replace(/^Firebase:\s*/, "")
        : "Authentication failed. Please try again.";
  }
}

export async function signUp(email, password) {
  ensureFirebase();
  await authPersistence;
  const cleanEmail = (email || "").trim();
  return createUserWithEmailAndPassword(auth, cleanEmail, password);
}

export async function signIn(email, password) {
  ensureFirebase();
  await authPersistence;
  const cleanEmail = (email || "").trim();
  return signInWithEmailAndPassword(auth, cleanEmail, password);
}

export async function signInWithGoogle() {
  ensureFirebase();
  await authPersistence;
  return signInWithPopup(auth, googleProvider);
}

export async function logOut() {
  ensureFirebase();
  return signOut(auth);
}
