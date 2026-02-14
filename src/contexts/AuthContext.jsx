import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db, googleProvider, hasConfig } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { syncToCloud, syncFromCloud } from '../utils/cloudSync';

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasConfig) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Sync data from cloud on login (with retry)
        for (let attempt = 1; attempt <= 2; attempt++) {
          try {
            await syncFromCloud(firebaseUser.uid);
            break; // Success, stop retrying
          } catch (e) {
            if (import.meta.env.DEV) console.warn(`Cloud sync attempt ${attempt} failed:`, e);
            if (attempt < 2) {
              await new Promise(r => setTimeout(r, 1000)); // Wait 1s before retry
            }
          }
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signup = async (email, password, displayName) => {
    if (!hasConfig) throw new Error('Firebase not configured');
    const result = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      await updateProfile(result.user, { displayName });
    }
    // Create user profile in Firestore
    await setDoc(doc(db, 'users', result.user.uid, 'data', 'profile'), {
      displayName: displayName || email.split('@')[0],
      email,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
    });
    // Migrate existing localStorage data to cloud
    await syncToCloud(result.user.uid);
    return result.user;
  };

  const login = async (email, password) => {
    if (!hasConfig) throw new Error('Firebase not configured');
    const result = await signInWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, 'users', result.user.uid, 'data', 'profile'), {
      lastLogin: serverTimestamp(),
    }, { merge: true });
    return result.user;
  };

  const loginWithGoogle = async () => {
    if (!hasConfig) throw new Error('Firebase not configured');
    const result = await signInWithPopup(auth, googleProvider);
    const userDoc = await getDoc(doc(db, 'users', result.user.uid, 'data', 'profile'));
    if (!userDoc.exists()) {
      // First time Google login — create profile + migrate local data
      await setDoc(doc(db, 'users', result.user.uid, 'data', 'profile'), {
        displayName: result.user.displayName || result.user.email.split('@')[0],
        email: result.user.email,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
      });
      await syncToCloud(result.user.uid);
    } else {
      await setDoc(doc(db, 'users', result.user.uid, 'data', 'profile'), {
        lastLogin: serverTimestamp(),
      }, { merge: true });
    }
    return result.user;
  };

  const logout = async () => {
    if (!hasConfig) return;
    // Sync before logout
    if (user) {
      try { await syncToCloud(user.uid); } catch (e) { if (import.meta.env.DEV) console.warn('Sync before logout failed:', e); }
    }
    await signOut(auth);
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    firebaseEnabled: hasConfig,
    signup,
    login,
    loginWithGoogle,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
