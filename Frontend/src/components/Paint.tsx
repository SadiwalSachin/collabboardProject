import { KonvaEventObject } from "konva/lib/Node";
import React, { useCallback, useRef, useState, useEffect } from "react";
import {
  Stage,
  Layer,
  Rect as KonvaRect,
  Image as KonvaImage,
  Circle as KonvaCircle,
  Line as KonvaLine,
  Arrow as KonvaArrow,
  Transformer,
} from "react-konva";
import { v4 as uuidv4 } from "uuid";
import { Scribble, Size } from "../components/Paint.types";
import { DrawAction, PAINT_OPTIONS } from "./Paint.constants";
import { SketchPicker } from "react-color";
import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  IconButton,
  Popover,
  PopoverArrow,
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger,
  useDisclosure,
  useMediaQuery,
} from "@chakra-ui/react";
import { Download, Upload, XLg } from "react-bootstrap-icons";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";
import { RiToolsFill } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import { FaArrowRotateRight } from "react-icons/fa6";
import { FaArrowRotateLeft } from "react-icons/fa6";
import { IoIosArrowBack } from "react-icons/io";


const ENDPOINT = "http://localhost:5000";
const socket = io(ENDPOINT);

const downloadURI = (uri:string, name:string) => {
  const link = document.createElement("a");
  link.download = name;
  link.href = uri || "";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const SIZE = 500;

interface PaintProps {
  roomId: string;
}

export const Paint: React.FC<PaintProps> = React.memo(function Paint() {
  const [size, setSize] = useState<Size>({ width: window.innerWidth, height: window.innerHeight });
  const [color, setColor] = useState("#000");
  const [drawAction, setDrawAction] = useState<DrawAction>(DrawAction.Select);
  const [scribbles, setScribbles] = useState<Scribble[]>([]);
  const [image, setImage] = useState<HTMLImageElement>();
  const fileRef = useRef<HTMLInputElement>(null);
  const stageRef = useRef<any>(null);
  const isPaintRef = useRef(false);
  const currentShapeRef = useRef<string>();
  const transformerRef = useRef<any>(null);
  const navigate = useNavigate();

  const [isMobile] = useMediaQuery("(max-width: 768px)");
  const { isOpen, onToggle } = useDisclosure();

  const [history, setHistory] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState(-1);

  // adding in history for redo undo  
  const addToHistory = useCallback((action: any) => {
    setHistory(prevHistory => {
      const newHistory = prevHistory.slice(0, currentStep + 1);
      return [...newHistory, action];
    });
    setCurrentStep(prevStep => prevStep + 1);
  }, [currentStep]);

  const undo = useCallback(() => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      const prevState = history[prevStep];
      setCurrentStep(prevStep);
      applyState(prevState);
      emitWhiteboardAction('undo', { step: prevStep });
    }
  }, [currentStep, history]);

  const redo = useCallback(() => {
    if (currentStep < history.length - 1) {
      const nextStep = currentStep + 1;
      const nextState = history[nextStep];
      setCurrentStep(nextStep);
      applyState(nextState);
      emitWhiteboardAction('redo', { step: nextStep });
    }
  }, [currentStep, history]);

  const applyState = useCallback((state: any) => {
    setScribbles(state.scribbles || []);
    setImage(state.image);
  }, []);

  const onImportImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const imageUrl = URL.createObjectURL(e.target.files?.[0]);
      const image = new Image(SIZE / 2, SIZE / 2);
      image.src = imageUrl;
      setImage(image);
    }
    e.target.files = null;
  }, []);

  const {roomId} = useParams()

  const emitWhiteboardAction = useCallback((type, action) => {
    socket.emit('whiteboardAction', { roomId, type, action });
  }, [roomId]);

  const handleWhiteboardAction = useCallback((action) => {
    console.log("Received action:", action);


    switch (action.type) {
      case DrawAction.Scribble:
        setScribbles((prevScribbles) => {
          const existingScribbleIndex = prevScribbles.findIndex(s => s.id === action.action.id);
          if (existingScribbleIndex !== -1) {
            const updatedScribbles = [...prevScribbles];
            updatedScribbles[existingScribbleIndex] = {
              ...updatedScribbles[existingScribbleIndex],
              points: [...updatedScribbles[existingScribbleIndex].points, ...action.action.points]
            };
            return updatedScribbles;
          }
          return [...prevScribbles, action.action];
        });

        addToHistory({
          scribbles,
          image
        });

        break;
      case 'clear':

      addToHistory({
        scribbles: [],
        image: undefined
      });

        setScribbles([]);
        setImage(undefined);
        break;

        case 'undo':
          setCurrentStep(action.action.step);
          applyState(history[action.action.step]);
          break;
        case 'redo':
          setCurrentStep(action.action.step);
          applyState(history[action.action.step]);
          break;

      default:
        break;
    }
  }, [addToHistory, applyState, history, scribbles, image]);

  useEffect(() => {
    socket.emit('joinRoom', roomId);
    socket.on('whiteboardAction', handleWhiteboardAction);

    return () => {
      socket.off('whiteboardAction', handleWhiteboardAction);
    };
  }, [roomId, handleWhiteboardAction]);

  const onStageMouseDown = useCallback((e: KonvaEventObject<MouseEvent>) => {
    if (drawAction === DrawAction.Select) return;
    isPaintRef.current = true;
    const stage = stageRef?.current;
    const pos = stage?.getPointerPosition();
    const x = pos?.x || 0;
    const y = pos?.y || 0;
    const id = uuidv4();
    currentShapeRef.current = id;

    const newAction = { id, x, y, color };

    switch (drawAction) {
      case DrawAction.Scribble:
        newAction.points = [x, y];
        setScribbles((prevScribbles) => [...prevScribbles, newAction]);
        break;
    }

    emitWhiteboardAction(drawAction, newAction);
  }, [drawAction, color, emitWhiteboardAction]);

  const onStageMouseMove = useCallback(() => {
    if (drawAction === DrawAction.Select || !isPaintRef.current) return;

    const stage = stageRef?.current;
    const id = currentShapeRef.current;
    const pos = stage?.getPointerPosition();
    const x = pos?.x || 0;
    const y = pos?.y || 0;

    let updatedShape;

    switch (drawAction) {
      case DrawAction.Scribble:
        setScribbles((prevScribbles) =>
          prevScribbles.map((prevScribble) =>
            prevScribble.id === id
              ? { ...prevScribble, points: [...prevScribble.points, x, y] }
              : prevScribble
          )
        );
        updatedShape = { id, points: [x, y] };
        break;
    }

    if (updatedShape) {
      emitWhiteboardAction(drawAction, updatedShape);
    }
  }, [drawAction, emitWhiteboardAction]);

  const onClear = useCallback(() => {
    setScribbles([]);
    setImage(undefined);

    emitWhiteboardAction('clear', {});
  }, [emitWhiteboardAction]);
  
  const onImportImageClick = useCallback(() => {
    fileRef?.current && fileRef?.current?.click();
  }, []);

  const onExportClick = useCallback(() => {
    const dataUri = stageRef?.current?.toDataURL({ pixelRatio: 3 });
    downloadURI(dataUri, "image.png");
  }, []);

  const onStageMouseUp = useCallback(() => {
    isPaintRef.current = false;
  }, []);


  const onShapeClick = useCallback((e: KonvaEventObject<MouseEvent>) => {
    if (drawAction !== DrawAction.Select) return;
    const currentTarget = e.currentTarget;
    transformerRef?.current?.node(currentTarget);
  }, [drawAction]);

  const isDraggable = drawAction === DrawAction.Select;

  const onBgClick = useCallback((e: KonvaEventObject<MouseEvent>) => {
    transformerRef?.current?.nodes([]);
  }, [drawAction]);

  useEffect(() => {
    const handleResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", handleResize);

    // Cleanup the event listener on component unmount
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <Box backgroundColor={"#FAFAFA"} width={"100vw"} height={"100vh"} position={"relative"}>
      <Box 
      cursor="pointer"
      onClick={()=>navigate(-1)}
      position="absolute" top="1vh" left="1vh" fontSize="4vh" zIndex="10">
      <IoIosArrowBack/>
      </Box>
      {/* <RoomDetails/> */}
      {isMobile &&  <Box 
      position={"absolute"}
      zIndex={"10"} 
      top={"1vh"}
      right={"1vh"}
      onClick={onToggle}
      fontSize={"4vh"}
      cursor="pointer"
      >
        <RiToolsFill/>
      </Box>}
     
     {/* // for mobile phone toolbar */}
      {isOpen ?  <Flex position={"absolute"} gap={"20px"} px={"10px"} py={"5px"} backgroundColor={"gray.300"} borderRadius={"9px"} mt={9} left={"50%"}  transform="translateX(-50%)" zIndex={"30"} justifyContent={"space-between"} alignItems="center" flexDirection={isMobile ? "column" : "row"}>
        <ButtonGroup size="sm" isAttached variant="solid">

        <IconButton aria-label={"Undo"} icon={< FaArrowRotateLeft/>} onClick={undo} isDisabled={currentStep <= 0} />
        <IconButton aria-label={"Redo"} icon={<FaArrowRotateRight />} onClick={redo} isDisabled={currentStep >= history.length - 1} />

          {PAINT_OPTIONS.map(({ id, label, icon }) => (
            <IconButton
              aria-label={label}
              icon={icon}
              onClick={() => setDrawAction(id)}
              colorScheme={id === drawAction ? "whatsapp" : undefined}
            />
          ))}
          <Popover>
            <PopoverTrigger>
              <Box
                bg={color}
                h={"32px"}
                w={"32px"}
                borderRadius="sm"
                cursor="pointer"
              ></Box>
            </PopoverTrigger>
            <PopoverContent width="300">
              <PopoverArrow />
              <PopoverCloseButton />
              {/*@ts-ignore*/}
              <SketchPicker
                color={color}
                onChangeComplete={(selectedColor) =>
                  setColor(selectedColor.hex)
                }
              />
            </PopoverContent>
          </Popover>
          <IconButton aria-label={"Clear"} icon={<XLg />} onClick={onClear} />
        </ButtonGroup>
        <Flex gap={4} alignItems="center" height="100%">
          <input
            type="file"
            ref={fileRef}
            onChange={onImportImageSelect}
            style={{ display: "none" }}
            accept="image/*"
          />
          <Button
            leftIcon={<Upload />}
            variant="solid"
            onClick={onImportImageClick}
            size="sm"
          >
            Import Image
          </Button>
          <Button
            backgroundColor={"green.400"}
            leftIcon={<Download />}
            colorScheme="whatsapp"
            variant="solid"
            onClick={onExportClick}
            size="sm"
          >
            Export
          </Button>
        </Flex>
      </Flex> : ""}

      <Flex position={"absolute"} gap={"20px"} px={"10px"} py={"5px"} backgroundColor={"gray.300"} borderRadius={"9px"} mt={9} left={"50%"}  transform="translateX(-50%)" zIndex={"30"} justifyContent={"space-between"} alignItems="center" display={isMobile ? "none" : "flex"}>
        <ButtonGroup size="sm" isAttached variant="solid">

        <IconButton aria-label={"Undo"} icon={< FaArrowRotateLeft />} onClick={undo} isDisabled={currentStep <= 0} />
        <IconButton aria-label={"Redo"} icon={<FaArrowRotateRight />} onClick={redo} isDisabled={currentStep >= history.length - 1} />

          {PAINT_OPTIONS.map(({ id, label, icon }) => (
            <IconButton
              aria-label={label}
              icon={icon}
              onClick={() => setDrawAction(id)}
              colorScheme={id === drawAction ? "whatsapp" : undefined}
            />
          ))}
          <Popover>
            <PopoverTrigger>
              <Box
                bg={color}
                h={"32px"}
                w={"32px"}
                borderRadius="sm"
                cursor="pointer"
              ></Box>
            </PopoverTrigger>
            <PopoverContent width="300">
              <PopoverArrow />
              <PopoverCloseButton />
              {/*@ts-ignore*/}
              <SketchPicker
                color={color}
                onChangeComplete={(selectedColor) =>
                  setColor(selectedColor.hex)
                }
              />
            </PopoverContent>
          </Popover>
          <IconButton aria-label={"Clear"} icon={<XLg />} onClick={onClear} />
        </ButtonGroup>
        <Flex gap={4} alignItems="center" height="100%">
          <input
            type="file"
            ref={fileRef}
            onChange={onImportImageSelect}
            style={{ display: "none" }}
            accept="image/*"
          />
          <Button
            leftIcon={<Upload />}
            variant="solid"
            onClick={onImportImageClick}
            size="sm"
          >
            Import Image
          </Button>
          <Button
            backgroundColor={"green.400"}
            leftIcon={<Download />}
            colorScheme="whatsapp"
            variant="solid"
            onClick={onExportClick}
            size="sm"
          >
            Export
          </Button>
        </Flex>
      </Flex>

      <Box
        width={"100vw"}
        height={"100vh"}
        border="1px solid black"
        overflow="hidden"
      >
        <Stage
          height={size.height}
          width={size.width}
          ref={stageRef}
          onMouseUp={onStageMouseUp}
          onMouseDown={onStageMouseDown}
          onMouseMove={onStageMouseMove}
        >
          <Layer>
            <KonvaRect
              x={0}
              y={0}
              height={size.height}
              width={size.width}
              fill="#FAFAFA"
              id="bg"
              onClick={onBgClick}
            />

            {image && (
              <KonvaImage
                image={image}
                x={0}
                y={0}
                height={SIZE / 2}
                width={SIZE / 2}
                draggable={isDraggable}
              />
            )}
            {scribbles.map((scribble) => (
              <KonvaLine
                key={scribble.id}
                id={scribble.id}
                lineCap="round"
                lineJoin="round"
                stroke={scribble?.color}
                strokeWidth={4}
                points={scribble.points}
                onClick={onShapeClick}
                draggable={isDraggable}
              />
            ))}

            <Transformer ref={transformerRef} />
          </Layer>
        </Stage>
      </Box>
    </Box>
  );
});