import React, { useState, FormEvent } from "react";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setHostData } from "../redux/slices/hostData";
import { LuDoorOpen } from "react-icons/lu";
import {
  Box,
  VStack,
  Heading,
  Text,
  Input,
  Button,
  Icon,
  useColorModeValue,
  Flex
} from "@chakra-ui/react";

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

  const cardBg = useColorModeValue("white", "gray.800");

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
    navigate(`/${roomData.roomId}`);
  };

  return (
    <form onSubmit={createRoomHandler} style={{ width: '100%' }}>
      <VStack spacing={6} w="full">
        <Box textAlign="center" mb={2}>
          <Flex
            w={20}
            h={20}
            mx="auto"
            mb={4}
            bgGradient="linear(to-br, green.400, emerald.600)"
            borderRadius="3xl"
            align="center"
            justify="center"
            boxShadow="0 10px 20px -5px rgba(52, 211, 153, 0.4)"
            color="white"
          >
            <Icon as={LuDoorOpen} fontSize="4xl" />
          </Flex>
          <Heading size="lg" fontWeight="800" letterSpacing="tight">Create Room</Heading>
          <Text color="gray.500" fontSize="sm">Start your futuristic collaboration</Text>
        </Box>

        <Input
          placeholder="Enter room name"
          size="lg"
          h="60px"
          borderRadius="2xl"
          bg={useColorModeValue("gray.50", "whiteAlpha.50")}
          border="2px solid"
          borderColor="transparent"
          _focus={{ borderColor: "green.400", bg: cardBg, boxShadow: "0 0 0 4px rgba(72, 187, 120, 0.15)" }}
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          required
        />

        <Button
          type="submit"
          w="full"
          h="60px"
          size="lg"
          colorScheme="green"
          borderRadius="2xl"
          fontWeight="bold"
          boxShadow="0 15px 30px -10px rgba(72, 187, 120, 0.4)"
          _hover={{ transform: 'translateY(-2px)' }}
          _active={{ transform: 'scale(0.98)' }}
        >
          CREATE SPACE
        </Button>
      </VStack>
    </form>
  );
};

export default CreateRoom;
