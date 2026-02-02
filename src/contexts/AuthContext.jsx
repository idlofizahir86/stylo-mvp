import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth, db } from '../services/firebase/config'; // ⬅️ Tambah db
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore'; // ⬅️ Import Firestore

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // contexts/AuthContext.jsx - Update useEffect
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // 1. Ambil data dari Firestore TERLEBIH DAHULU
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          let userData;
          
          if (userDoc.exists()) {
            // ⭐⭐⭐ GUNAKAN photoURL DARI FIRESTORE ⭐⭐⭐
            const firestoreData = userDoc.data();
            userData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              // Prioritas: Firestore > Auth
              displayName: firestoreData.displayName || firebaseUser.displayName || 'User',
              // ⭐ INI YANG PENTING: Ambil dari Firestore! ⭐
              photoURL: firestoreData.photoURL || firebaseUser.photoURL,
              // Tambahkan data lain dari Firestore jika ada
              bio: firestoreData.bio || '',
              username: firestoreData.username || ''
            };
          } else {
            // Jika belum ada di Firestore (user lama), gunakan data Auth
            userData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || 'User',
              photoURL: firebaseUser.photoURL
            };
          }
          
          console.log('User data loaded:', userData); // ⬅️ Debug
          setUser(userData);
        } catch (error) {
          console.error('Error loading user from Firestore:', error);
          // Fallback
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || 'User',
            photoURL: firebaseUser.photoURL
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email, password) => {
    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || 'User',
        photoURL: firebaseUser.photoURL
      });
      
      return { success: true, user: firebaseUser };
    } catch (error) {
      console.error('Sign in error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to sign in' 
      };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email, password, displayName) => {
    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Update profile with display name di Firebase Auth
      if (displayName) {
        await updateProfile(firebaseUser, { displayName });
      }
      
      // ⭐⭐ TAMBAHKAN: Simpan ke Firestore ⭐⭐
      try {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        
        // Data yang akan disimpan ke Firestore
        const userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: displayName || 'User',
          photoURL: null, // Default null, bisa diupdate nanti
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // Hapus field yang undefined
        Object.keys(userData).forEach(key => {
          if (userData[key] === undefined) {
            delete userData[key];
          }
        });
        
        await setDoc(userDocRef, userData);
        console.log('✅ User data saved to Firestore');
        
      } catch (firestoreError) {
        console.error('Firestore save error:', firestoreError);
        // Jangan gagal sign up hanya karena Firestore error
        // Auth sudah berhasil, hanya Firestore yang gagal
      }
      
      // Set user state seperti biasa
      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: displayName || 'User',
        photoURL: firebaseUser.photoURL
      });
      
      return { success: true, user: firebaseUser };
    } catch (error) {
      console.error('Sign up error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to create account' 
      };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return { success: false, error: error.message };
    }
  };

  // ⭐⭐ TAMBAHKAN: Fungsi untuk mengambil data dari Firestore (opsional) ⭐⭐
  const getUserFromFirestore = async (userId) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        return userDoc.data();
      }
      return null;
    } catch (error) {
      console.error('Error getting user from Firestore:', error);
      return null;
    }
  };

  // ⭐⭐ TAMBAHKAN: Fungsi untuk update profile (opsional) ⭐⭐
  const updateUserProfile = async (updates) => {
    try {
      if (!user) throw new Error('No user logged in');
      
      // Update di Firebase Auth
      if (updates.displayName) {
        await updateProfile(auth.currentUser, {
          displayName: updates.displayName
        });
      }
      
      // Update di Firestore
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      }, { merge: true }); // merge: true untuk update sebagian
      
      // Update state
      setUser(prev => ({
        ...prev,
        ...updates
      }));
      
      return { success: true };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    getUserFromFirestore, // ⬅️ Tambah ke value
    updateUserProfile     // ⬅️ Tambah ke value
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};