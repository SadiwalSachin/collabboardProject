import { useState, useEffect } from 'react';
import { onAuthStateChanged, User, getIdToken } from 'firebase/auth';
import { auth } from '../config/firebase';

interface AuthState {
  user: any | null; // Can be Firebase User or our Backend User
  token: string | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  getIdToken: () => Promise<string | null>;
}

const useAuth = (): AuthState => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isLoggedIn: false,
    getIdToken: async () => null
  });

  useEffect(() => {
    // 1. Check if we have a backend session in localStorage
    const storedToken = localStorage.getItem('boardify_token');
    const storedUser = localStorage.getItem('boardify_user');

    if (storedToken && storedUser) {
      setAuthState(prev => ({
        ...prev,
        user: JSON.parse(storedUser),
        token: storedToken,
        isLoggedIn: true,
        isLoading: false,
        getIdToken: async () => storedToken
      }));
    }

    // 2. Also listen to Firebase for Google logins
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const token = await getIdToken(firebaseUser);
        setAuthState({
          user: firebaseUser,
          token,
          isLoading: false,
          isLoggedIn: true,
          getIdToken: async () => await getIdToken(firebaseUser)
        });
      } else if (!storedToken) {
        // Only clear state if no backend token exists
        setAuthState({
          user: null,
          token: null,
          isLoading: false,
          isLoggedIn: false,
          getIdToken: async () => null
        });
      }
    });

    return () => unsubscribe();
  }, []);

  return authState;
};

export default useAuth;
