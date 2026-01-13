// import UseAuth from "../hooks/useAuth"
import React from "react"

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute:React.FC<ProtectedRouteProps> = ({children}) => {
    // const isLogin = UseAuth()
    // console.log(isLogin);
    
  return ( 
    <>
  {children} 
    </>
)
  
}

export default ProtectedRoute
