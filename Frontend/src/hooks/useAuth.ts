import Keycloak from "keycloak-js"
import { useEffect, useState, useRef } from "react"

interface AuthState {
  isLoggedIn: boolean;
  isLoading: boolean;
  error: string | null;
}

const client = new Keycloak({
    url:import.meta.env.VITE_KEYLOAK_URL,
    realm:import.meta.env.VITE_KEYLOAK_REALM,
    clientId:import.meta.env.VITE_KEYLOAK_CLIENT_ID,
})

export const login = () => {
  client.login();
};

export const logout = () => {
  client.logout();
};

export const register = () => {
  client.register();
};

const UseAuth = (): AuthState => {
    const isRun = useRef<boolean>()
    const [authState, setAuthState] = useState<AuthState>({
        isLoggedIn: false,
        isLoading: true,
        error: null,
      });

    useEffect(()=>{
        console.log(import.meta.env.VITE_KEYLOAK_URL);
        
        if(isRun.current) return
        isRun.current = true;
        const initAuth = async () => {
            try {
              const authenticated = await client.init({ onLoad: "check-sso" }); // Changed to check-sso to not force login
              console.log(authenticated);
              setAuthState({
                isLoggedIn: authenticated,
                isLoading: false,
                error: null,
              });
            } catch (error) {
              setAuthState({
                isLoggedIn: false,
                isLoading: false,
                error: "Failed to initialize Keycloak",
              });
              console.error("Keycloak initialization error:", error);
              console.log(error);
              
            }
          };
      
          initAuth();
          
    },[])

  return authState;
}

export default UseAuth
