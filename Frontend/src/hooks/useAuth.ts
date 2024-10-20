import Keycloak from "keycloak-js"
import { useEffect, useState, useRef } from "react"

const client = new Keycloak({
    url:import.meta.env.VITE_KEYLOAK_URL,
    realm:import.meta.env.VITE_KEYLOAK_REALM,
    clientId:import.meta.env.VITE_KEYLOAK_CLIENT_ID,
})

const UseAuth = ():boolean => {
    const isRun = useRef<boolean>()
    const [isLoggedIn,setIsLoggedIn] = useState<boolean>()

    const [authState, setAuthState] = useState<AuthState>({
        isLoggedIn: false,
        isLoading: true,
        error: null,
      });

    useEffect(()=>{
        console.log(import.meta.env.VITE_KEYLOAK_URL);
        
        if(isRun.current) return
        isRun.current = true;
        const login = async () => {
            try {
              const authenticated = await client.init({ onLoad: "login-required" });
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
      
          login();
          console.log(authState);
          
    },[])

  return isLoggedIn
}

export default UseAuth
