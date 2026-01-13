import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { roomData } from "./CreateRoom";
import { v4 as uuidv4 } from "uuid";
import { LuLogIn } from "react-icons/lu";
import { motion } from "framer-motion";

interface JoinRoomProps {
  socket: any;
}

const JoinRoom: React.FC<JoinRoomProps> = ({ socket }) => {
  const [roomId, setRoomId] = useState<string>("");
  const navigate = useNavigate();

  const handleRoomJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const roomData: roomData = {
      roomName: "",
      roomId: roomId,
      userId: uuidv4(),
      host: false,
    };

    socket.emit("roomJoined", roomData);
    navigate(`/${roomId}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="flex flex-col items-center w-full max-w-md"
    >
      <form onSubmit={handleRoomJoin} className="w-full">
        <motion.div
          whileHover={{ y: -5 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100"
        >
          <div className="text-center mb-6">
            <motion.div
              whileHover={{ scale: 1.1, rotate: -5 }}
              transition={{ duration: 0.2 }}
              className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-4 text-4xl text-white shadow-lg"
            >
              <LuLogIn />
            </motion.div>
            <h4 className="font-bold mb-2 text-gray-800 text-xl">Join Room</h4>
            <p className="text-gray-600 text-base">Enter an existing room code</p>
          </div>

          <motion.input
            whileFocus={{ scale: 1.02 }}
            type="text"
            className="w-full mb-6 px-6 py-4 rounded-2xl border-2 border-gray-200 text-base transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none bg-gray-50 focus:bg-white"
            placeholder="Enter room ID"
            name="roomId"
            value={roomId}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRoomId(e.target.value)}
            required
          />

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 border-0 text-base font-semibold text-white tracking-wide transition-all duration-300 shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-indigo-700"
          >
            JOIN ROOM
          </motion.button>
        </motion.div>
      </form>
    </motion.div>
  );
};

export default JoinRoom;
