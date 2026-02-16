import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Only initialize if config is present
const hasConfig = firebaseConfig.apiKey && firebaseConfig.apiKey !== 'your_api_key_here';

let app = null;
let auth = null;
let db = null;
let googleProvider = null;
let appCheck = null;

if (hasConfig) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  });
  googleProvider = new GoogleAuthProvider();

  // Firebase App Check - protects backend resources from abuse
  const recaptchaKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
  if (recaptchaKey) {
    try {
      appCheck = initializeAppCheck(app, {
        provider: new ReCaptchaEnterpriseProvider(recaptchaKey),
        isTokenAutoRefreshEnabled: true,
      });
    } catch (err) {
      if (import.meta.env.DEV) console.warn('App Check init failed:', err);
    }
  } else if (import.meta.env.DEV) {
    // In development, enable debug token for App Check
    // Set FIREBASE_APPCHECK_DEBUG_TOKEN=true in browser console before loading
    self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  }

}

export { app, auth, db, googleProvider, hasConfig, appCheck };
