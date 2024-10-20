// import UseAuth from "../hooks/useAuth"
import { FC } from "react"

interface ProtectedRouteProps {
    component : FC
}

const ProtectedRoute:FC<ProtectedRouteProps> = ({component:Component}) => {
    // const isLogin = UseAuth()
    // console.log(isLogin);
    
  return ( 
    <>
  {Component} 
    </>
)
  
}

export default ProtectedRoute
