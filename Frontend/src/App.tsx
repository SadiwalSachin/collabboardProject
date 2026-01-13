import { ChakraProvider } from "@chakra-ui/react";
import { Paint } from "./components/Paint";
import ProtectedRoute from "./components/ProtectedRoute";
import { Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard";
import io, { Socket } from "socket.io-client"
import { useEffect, useState } from "react";

function App() {

  const [socket, setSockt] = useState<Socket | null>(null)

  useEffect(() => {
    const socketio = io("http://localhost:5000")
    setSockt(socketio)
    socketio.on("connect", () => {
      console.log("Connected to backend");
    })
  }, [])

  return (
    <>
      <ChakraProvider>
        <Routes>
          <Route path="/" element={<ProtectedRoute><Home socket={socket} /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/:roomId" element={<ProtectedRoute><Paint /></ProtectedRoute>} />
        </Routes>
      </ChakraProvider>
    </>
  );
}

export default App;

