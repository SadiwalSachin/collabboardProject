import React, { useState, FormEvent } from "react";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setHostData } from "../redux/slices/hostData";
import { LuDoorOpen } from "react-icons/lu";
import { motion } from "framer-motion";

export interface roomData {
  roomName: string;
  roomId: string;
  userId: string;
  host: boolean;
}

interface CreateRoomProps {
  socket: any;
}

const CreateRoom: React.FC<CreateRoomProps> = ({ socket }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [roomName, setRoomName] = useState<string>("");

  const createRoomHandler = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const roomData: roomData = {
      roomName: roomName,
      roomId: uuidv4(),
      userId: uuidv4(),
      host: true,
    };
    dispatch(setHostData(roomData));
    socket.emit("createdRoomData", roomData);
    console.log(roomData);
    navigate(`/${roomData.roomId}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center w-full max-w-md"
    >
      <form onSubmit={createRoomHandler} className="w-full">
        <motion.div
          whileHover={{ y: -5 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100"
        >
          <div className="text-center mb-6">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.2 }}
              className="w-20 h-20 rounded-3xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-4 text-4xl text-white shadow-lg"
            >
              <LuDoorOpen />
            </motion.div>
            <h4 className="font-bold mb-2 text-gray-800 text-xl">Create Room</h4>
            <p className="text-gray-600 text-base">Start a new collaboration space</p>
          </div>

          <motion.input
            whileFocus={{ scale: 1.02 }}
            type="text"
            className="w-full mb-6 px-6 py-4 rounded-2xl border-2 border-gray-200 text-base transition-all duration-300 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 focus:outline-none bg-gray-50 focus:bg-white"
            placeholder="Enter room name"
            name="roomName"
            value={roomName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRoomName(e.target.value)}
            required
          />

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 border-0 text-base font-semibold text-white tracking-wide transition-all duration-300 shadow-lg hover:shadow-xl hover:from-green-600 hover:to-emerald-700"
          >
            CREATE ROOM
          </motion.button>
        </motion.div>
      </form>
    </motion.div>
  );
};

export default CreateRoom;
