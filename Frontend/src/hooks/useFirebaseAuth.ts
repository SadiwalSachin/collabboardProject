import { useState, useEffect } from 'react';
import { onAuthStateChanged, User, getIdToken } from 'firebase/auth';
import { auth } from '../config/firebase';

interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isLoggedIn: boolean;
}

const useFirebaseAuth = (): AuthState => {
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        token: null,
        isLoading: true,
        isLoggedIn: false,
    });

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const token = await getIdToken(user);
                setAuthState({
                    user,
                    token,
                    isLoading: false,
                    isLoggedIn: true,
                });
            } else {
                setAuthState({
                    user: null,
                    token: null,
                    isLoading: false,
                    isLoggedIn: false,
                });
            }
        });

        return () => unsubscribe();
    }, []);

    return authState;
};

export default useFirebaseAuth;
