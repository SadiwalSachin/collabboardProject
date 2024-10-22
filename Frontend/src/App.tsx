import { ChakraProvider } from "@chakra-ui/react";
import { Paint } from "./components/Paint";
import ProtectedRoute from "./components/ProtectedRoute";
import { Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import io , {Socket} from "socket.io-client"
import React, { useEffect, useState } from "react";

function App():React.FC {

  const [socket,setSockt] = useState<Socket | null>(null) 

  useEffect(()=>{
    const socketio = io("http://localhost:5000")
    setSockt(socketio)
    socketio.on("connect",()=>{
      console.log("Connected to backend");
    })
  },[])

  return (
    <>
      <ChakraProvider>
    <Routes>
        <Route path="/" element={<ProtectedRoute component={<Home socket={socket}/>}/>} />
        <Route path="/:roomId" element={<ProtectedRoute component={<Paint />}/>}/>
    </Routes>
      </ChakraProvider>
    </>
  );
}

export default App;
