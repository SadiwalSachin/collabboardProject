import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { roomData } from "./CreateRoom";
import { v4 as uuidv4 } from "uuid";

interface JoinRoomProps {
  socket: any;
}

const JoinRoom:React.FC<JoinRoomProps> = ({ socket }) => {
  const [roomId, setRoomId] = useState<string>("");
  const navigate = useNavigate();
  const handleRoomJoin = () => {
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
    <>
      <div className="d-flex flex-column align-items-center mt-sm-5 mt-3 px-4">
        <input
          type="text"
          className="form-control px-3 py-2 border border-dark rounded-3"
          placeholder="Enter room id"
          name="roomId"
          value={roomId}
          onChange={(e:React.ChangeEvent<HTMLInputElement>) => setRoomId(e.target.value)}
        />
        <button
          onClick={handleRoomJoin}
          className="btn btn-secondary mt-2 px-3 py-1 rounded-3 text-white text-uppercase w-100"
        >
          JOIN
        </button>
      </div>
    </>
  );
};

export default JoinRoom;
