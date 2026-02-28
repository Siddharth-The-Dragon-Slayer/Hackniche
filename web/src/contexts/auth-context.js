'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

const AuthContext = createContext({});

const ROLE_REDIRECTS = {
  super_admin:     '/dashboard/platform',
  franchise_admin: '/dashboard/franchise',
  customer:        '/dashboard/customer',
};

/**
 * Loads user profile and, if the user belongs to a franchise, the franchise
 * document in a single parallel fetch  — minimises Firestore reads on login.
 */
async function loadProfileAndFranchise(uid) {
  const profileDoc = await getDoc(doc(db, 'users', uid));
  if (!profileDoc.exists()) return { profile: null, franchise: null };

  const profile  = profileDoc.data();
  let   franchise = null;

  if (profile.franchise_id) {
    // Parallel — no extra round-trip penalty
    const franchiseDoc = await getDoc(doc(db, 'franchises', profile.franchise_id));
    if (franchiseDoc.exists()) franchise = franchiseDoc.data();
  }

  return { profile, franchise };
}

export function AuthProvider({ children }) {
  const [user,             setUser]             = useState(null);
  const [userProfile,      setUserProfile]      = useState(null);
  const [franchiseProfile, setFranchiseProfile] = useState(null);
  const [loading,          setLoading]          = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const { profile, franchise } = await loadProfileAndFranchise(firebaseUser.uid);
          setUserProfile(profile);
          setFranchiseProfile(franchise);
        } catch (err) {
          console.error('Failed to load profile:', err);
        }
      } else {
        setUser(null);
        setUserProfile(null);
        setFranchiseProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const { profile, franchise } = await loadProfileAndFranchise(cred.user.uid);
    setUserProfile(profile);
    setFranchiseProfile(franchise);
    const role       = profile?.role || 'customer';
    const redirectTo = ROLE_REDIRECTS[role] || '/dashboard/branch';
    router.push(redirectTo);
    return { user: cred.user, profile, franchise };
  };

  const signup = async ({ name, email, phone, password }) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    const profile = {
      uid:          cred.user.uid,
      name,
      email,
      phone:        phone || '',
      role:         'customer',
      franchise_id: null,
      branch_id:    null,
      status:       'active',
      created_at:   serverTimestamp(),
    };
    await setDoc(doc(db, 'users', cred.user.uid), profile);
    setUserProfile(profile);
    setFranchiseProfile(null);
    router.push('/dashboard/customer');
    return { user: cred.user, profile };
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setUserProfile(null);
    setFranchiseProfile(null);
    router.push('/login');
  };

  const role = userProfile?.role || null;

  return (
    <AuthContext.Provider value={{
      user, userProfile, franchiseProfile, role,
      loading, login, signup, logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
