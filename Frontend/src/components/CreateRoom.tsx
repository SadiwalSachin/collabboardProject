import React, { useState , FormEvent  } from "react";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setHostData } from "../redux/slices/hostData";

export interface roomData {
  roomName: string;
  roomId: string;
  userId: string;
  host: boolean;
}

interface CreateRoomProps {
  socket: any;
}

const CreateRoom:React.FC<CreateRoomProps> = ({ socket }) => {
  const dispatch = useDispatch()

  const navigate = useNavigate();
  const [roomName, setRoomName] = useState<string>("");

  const createRoomHandler = (e:FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const roomData: roomData = {
      roomName: roomName,
      roomId: uuidv4(),
      userId: uuidv4(),
      host: true,
    };
    dispatch(setHostData(roomData))
    socket.emit("createdRoomData", roomData);
    console.log(roomData);
    navigate(`/${roomData.roomId}`);
  };

  return (
    <>
      <div className="d-flex flex-column align-items-center mt-5 px-4">
        <form action="" onSubmit={createRoomHandler}>
          <input
            type="text"
            className="form-control px-3 py-2 border border-dark rounded-3"
            placeholder="Enter room name"
            name="roomName"
            value={roomName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRoomName(e.target.value)}
          />
          <button className="btn btn-secondary mt-2 px-3 py-1 rounded-3 text-white text-uppercase w-100">
            Create a room
          </button>
        </form>
      </div>
    </>
  );
};

export default CreateRoom;
