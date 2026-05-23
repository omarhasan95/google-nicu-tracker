'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signOut as firebaseSignOut, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { BabyProfile } from '../types';
import { 
  isMockMode, 
  getBabyProfile, 
  saveBabyProfile as dbSaveBabyProfile 
} from '../lib/dbService';

export interface AuthUser {
  uid: string;
  email: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  babyProfile: BabyProfile | null;
  setBabyProfile: React.Dispatch<React.SetStateAction<BabyProfile | null>>;
  logout: () => Promise<void>;
  saveBabyProfile: (profile: BabyProfile) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  sendResetEmail: (email: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  isMock: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [babyProfile, setBabyProfile] = useState<BabyProfile | null>(null);
  const [isMock, setIsMock] = useState<boolean>(false);

  useEffect(() => {
    const mockActive = isMockMode();
    setIsMock(mockActive);

    if (mockActive) {
      // LocalStorage Mock Auth State Listener
      const checkMockSession = async () => {
        try {
          const sessionData = localStorage.getItem('nicu_session');
          if (sessionData) {
            const mockUser = JSON.parse(sessionData) as AuthUser;
            setUser(mockUser);
            // Fetch profile
            const profile = await getBabyProfile(mockUser.uid);
            setBabyProfile(profile);
          } else {
            setUser(null);
            setBabyProfile(null);
          }
        } catch (error) {
          console.error("Error checking mock session:", error);
        } finally {
          setLoading(false);
        }
      };
      checkMockSession();
    } else {
      // Real Firebase Auth State Listener
      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
          const mappedUser: AuthUser = {
            uid: currentUser.uid,
            email: currentUser.email
          };
          setUser(mappedUser);
          
          try {
            const profile = await getBabyProfile(currentUser.uid);
            setBabyProfile(profile);
          } catch (error) {
            console.error("Error fetching baby profile:", error);
          }
        } else {
          setUser(null);
          setBabyProfile(null);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    if (isMockMode()) {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      // Store in localStorage registered users
      const usersData = localStorage.getItem('nicu_registered_users');
      const usersList = usersData ? JSON.parse(usersData) : {};
      
      if (!usersList[email]) {
        // If user doesn't exist, create it on login (convenient mock behavior) or check
        usersList[email] = password;
        localStorage.setItem('nicu_registered_users', JSON.stringify(usersList));
      } else if (usersList[email] !== password) {
        throw { code: 'auth/wrong-password', message: 'Incorrect password.' };
      }

      const mockUser: AuthUser = {
        uid: `user_${email.replace(/[^a-zA-Z0-9]/g, '')}`,
        email
      };
      
      localStorage.setItem('nicu_session', JSON.stringify(mockUser));
      setUser(mockUser);
      const profile = await getBabyProfile(mockUser.uid);
      setBabyProfile(profile);
      return;
    }

    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string) => {
    if (isMockMode()) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      const usersData = localStorage.getItem('nicu_registered_users');
      const usersList = usersData ? JSON.parse(usersData) : {};

      if (usersList[email]) {
        throw { code: 'auth/email-already-in-use', message: 'Email already in use.' };
      }

      usersList[email] = password;
      localStorage.setItem('nicu_registered_users', JSON.stringify(usersList));

      const mockUser: AuthUser = {
        uid: `user_${email.replace(/[^a-zA-Z0-9]/g, '')}`,
        email
      };

      localStorage.setItem('nicu_session', JSON.stringify(mockUser));
      setUser(mockUser);
      setBabyProfile(null);
      return;
    }

    await createUserWithEmailAndPassword(auth, email, password);
  };

  const sendResetEmail = async (email: string) => {
    if (isMockMode()) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const usersData = localStorage.getItem('nicu_registered_users');
      const usersList = usersData ? JSON.parse(usersData) : {};
      
      if (!usersList[email]) {
        throw { code: 'auth/user-not-found', message: 'No account with this email.' };
      }
      return;
    }

    await sendPasswordResetEmail(auth, email);
  };

  const signInWithGoogle = async () => {
    if (isMockMode()) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const mockUser: AuthUser = {
        uid: 'google_user_mock',
        email: 'google.parent@gmail.com'
      };
      localStorage.setItem('nicu_session', JSON.stringify(mockUser));
      setUser(mockUser);
      const profile = await getBabyProfile(mockUser.uid);
      setBabyProfile(profile);
      return;
    }

    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    setLoading(true);
    if (isMockMode()) {
      localStorage.removeItem('nicu_session');
      setUser(null);
      setBabyProfile(null);
      setLoading(false);
      return;
    }

    await firebaseSignOut(auth);
    setUser(null);
    setBabyProfile(null);
    setLoading(false);
  };

  const saveBabyProfile = async (profile: BabyProfile) => {
    if (!user) throw new Error("No authenticated user.");
    await dbSaveBabyProfile(user.uid, profile);
    setBabyProfile(profile);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      babyProfile, 
      setBabyProfile, 
      logout, 
      saveBabyProfile,
      signIn,
      signUp,
      sendResetEmail,
      signInWithGoogle,
      isMock
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
