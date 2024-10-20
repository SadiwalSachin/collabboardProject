import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

interface hostData{
  roomName:string
}

const RoomDetails :React.FC = () => {
  const hostData = useSelector((state : RootState) => state.hostData as hostData);

  console.log(hostData);

  return (
    <>
      <div className="d-flex gap-4 position-absolute">
        <p>RoomOwner - {hostData.roomName}</p>
        <p>Total members</p>
      </div>
    </>
  );
};

export default RoomDetails;
