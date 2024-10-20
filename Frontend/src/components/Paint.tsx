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
import { Arrow, Circle, Rectangle, Scribble, Size } from "../components/Paint.types";
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
import RoomDetails from "./RoomDetails";
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
  const [rectangles, setRectangles] = useState<Rectangle[]>([]);
  const [circles, setCircles] = useState<Circle[]>([]);
  const [arrows, setArrows] = useState<Arrow[]>([]);
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
    setCircles(state.circles || []);
    setRectangles(state.rectangles || []);
    setArrows(state.arrows || []);
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
          circles,
          rectangles,
          arrows,
          image
        });

        break;


      // case DrawAction.Circle:
      //   setCircles((prevCircles) => {
      //     const existingCircleIndex = prevCircles.findIndex(c => c.id === action.action.id);
      //     if (existingCircleIndex !== -1) {
      //       const updatedCircles = [...prevCircles];
      //       updatedCircles[existingCircleIndex] = action.action;
      //       return updatedCircles;
      //     }
      //     return [...prevCircles, action.action];
      //   });
      //   break;
      // case DrawAction.Rectangle:
      //   setRectangles((prevRectangles) => {
      //     const existingRectIndex = prevRectangles.findIndex(r => r.id === action.action.id);
      //     if (existingRectIndex !== -1) {
      //       const updatedRectangles = [...prevRectangles];
      //       updatedRectangles[existingRectIndex] = action.action;
      //       return updatedRectangles;
      //     }
      //     return [...prevRectangles, action.action];
      //   });
      //   break;

      case DrawAction.Circle:
        setCircles((prevCircles) => {
          const existingCircleIndex = prevCircles.findIndex(c => c.id === action.action.id);
          if (existingCircleIndex !== -1) {
            const updatedCircles = [...prevCircles];
            updatedCircles[existingCircleIndex] = action.action;
            return updatedCircles;
          }
          return [...prevCircles, action.action];
        });
        break;
      case DrawAction.Rectangle:
        setRectangles((prevRectangles) => {
          const existingRectIndex = prevRectangles.findIndex(r => r.id === action.action.id);
          if (existingRectIndex !== -1) {
            const updatedRectangles = [...prevRectangles];
            updatedRectangles[existingRectIndex] = action.action;
            return updatedRectangles;
          }
          return [...prevRectangles, action.action];
        });
        break;

      case DrawAction.Arrow:
        setArrows((prevArrows) => {
          const existingArrowIndex = prevArrows.findIndex(a => a.id === action.action.id);
          if (existingArrowIndex !== -1) {
            const updatedArrows = [...prevArrows];
            updatedArrows[existingArrowIndex] = action.action;
            return updatedArrows;
          }
          return [...prevArrows, action.action];
        });



        addToHistory({
          scribbles,
          circles,
          rectangles,
          arrows,
          image
        });

        break;
      case 'clear':

      addToHistory({
        scribbles: [],
        circles: [],
        rectangles: [],
        arrows: [],
        image: undefined
      });

        setScribbles([]);
        setCircles([]);
        setRectangles([]);
        setArrows([]);
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
  }, [addToHistory, applyState, history, scribbles, circles, rectangles, arrows, image]);

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


      // case DrawAction.Circle:
      //   newAction.radius = 0;
      //   setCircles((prevCircles) => [...prevCircles, newAction]);
      //   break;
      // case DrawAction.Rectangle:
      //   newAction.width = 0;
      //   newAction.height = 0;
      //   setRectangles((prevRectangles) => [...prevRectangles, newAction]);
      //   break;

      case DrawAction.Circle:
        newAction.radius = 0;
        setCircles((prevCircles) => [...prevCircles, newAction as Circle]);
        break;
      case DrawAction.Rectangle:
        newAction.width = 0;
        newAction.height = 0;
        setRectangles((prevRectangles) => [...prevRectangles, newAction as Rectangle]);
        break;


      case DrawAction.Arrow:
        newAction.points = [x, y, x, y];
        setArrows((prevArrows) => [...prevArrows, newAction]);
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


      // case DrawAction.Circle:
      //   setCircles((prevCircles) =>
      //     prevCircles.map((prevCircle) => {
      //       if (prevCircle.id === id) {
      //         const radius = ((x - prevCircle.x) ** 2 + (y - prevCircle.y) ** 2) ** 0.5;
      //         updatedShape = { ...prevCircle, radius };
      //         return updatedShape;
      //       }
      //       return prevCircle;
      //     })
      //   );
      //   break;
      // case DrawAction.Rectangle:
      //   setRectangles((prevRectangles) =>
      //     prevRectangles.map((prevRectangle) => {
      //       if (prevRectangle.id === id) {
      //         const width = x - prevRectangle.x;
      //         const height = y - prevRectangle.y;
      //         updatedShape = { ...prevRectangle, width, height };
      //         return updatedShape;
      //       }
      //       return prevRectangle;
      //     })
      //   );
      //   break;

      case DrawAction.Circle:
        setCircles((prevCircles) =>
          prevCircles.map((prevCircle) => {
            if (prevCircle.id === id) {
              const radius = Math.sqrt((x - prevCircle.x) ** 2 + (y - prevCircle.y) ** 2);
              updatedShape = { ...prevCircle, radius };
              return updatedShape;
            }
            return prevCircle;
          })
        );
        break;
      case DrawAction.Rectangle:
        setRectangles((prevRectangles) =>
          prevRectangles.map((prevRectangle) => {
            if (prevRectangle.id === id) {
              const width = x - prevRectangle.x;
              const height = y - prevRectangle.y;
              updatedShape = { ...prevRectangle, width, height };
              return updatedShape;
            }
            return prevRectangle;
          })
        );
        break;

      case DrawAction.Arrow:
        setArrows((prevArrows) =>
          prevArrows.map((prevArrow) => {
            if (prevArrow.id === id) {
              const points = [prevArrow.points[0], prevArrow.points[1], x, y];
              updatedShape = { ...prevArrow, points };
              return updatedShape;
            }
            return prevArrow;
          })
        );
        break;
    }

    if (updatedShape) {
      emitWhiteboardAction(drawAction, updatedShape);
    }
  }, [drawAction, emitWhiteboardAction]);

  const onClear = useCallback(() => {
    setRectangles([]);
    setCircles([]);
    setScribbles([]);
    setArrows([]);
    setImage(undefined);

    emitWhiteboardAction('clear', {});
  }, [emitWhiteboardAction]);

  // const emitWhiteboardAction = useCallback((type, action) => {
  //   socket.emit('whiteboardAction', { roomId, type, action });
  // }, [roomId]);

  // const handleWhiteboardAction = useCallback((action) => {
  //   console.log("Received action:", action);
  //   switch (action.type) {
  //     case DrawAction.Scribble:
  //       setScribbles((prevScribbles) => [...prevScribbles, action.action]);
  //       break;
  //     case DrawAction.Circle:
  //       setCircles((prevCircles) => [...prevCircles, action.action]);
  //       break;
  //     case DrawAction.Rectangle:
  //       setRectangles((prevRectangles) => [...prevRectangles, action.action]);
  //       break;
  //     case DrawAction.Arrow:
  //       setArrows((prevArrows) => [...prevArrows, action.action]);
  //       break;
  //     case 'clear':
  //       setScribbles([]);
  //       setCircles([]);
  //       setRectangles([]);
  //       setArrows([]);
  //       setImage(undefined);
  //       break;
  //     default:
  //       break;
  //   }
  // }, []);

  // useEffect(() => {
  //   socket.emit('joinRoom', roomId);
  //   socket.on('whiteboardAction', handleWhiteboardAction);

  //   return () => {
  //     socket.off('whiteboardAction', handleWhiteboardAction);
  //   };
  // }, [roomId, handleWhiteboardAction]);

  // const onStageMouseDown = useCallback((e: KonvaEventObject<MouseEvent>) => {
  //   if (drawAction === DrawAction.Select) return;
  //   isPaintRef.current = true;
  //   const stage = stageRef?.current;
  //   const pos = stage?.getPointerPosition();
  //   const x = pos?.x || 0;
  //   const y = pos?.y || 0;
  //   const id = uuidv4();
  //   currentShapeRef.current = id;

  //   const newAction = { id, x, y, color };

  //   switch (drawAction) {
  //     case DrawAction.Scribble:
  //       newAction.points = [x, y];
  //       setScribbles((prevScribbles) => [...prevScribbles, newAction]);
  //       break;
  //     case DrawAction.Circle:
  //       newAction.radius = 1;
  //       setCircles((prevCircles) => [...prevCircles, newAction]);
  //       break;
  //     case DrawAction.Rectangle:
  //       newAction.height = 1;
  //       newAction.width = 1;
  //       setRectangles((prevRectangles) => [...prevRectangles, newAction]);
  //       break;
  //     case DrawAction.Arrow:
  //       newAction.points = [x, y, x, y];
  //       setArrows((prevArrows) => [...prevArrows, newAction]);
  //       break;
  //   }

  //   emitWhiteboardAction(drawAction, newAction);
  // }, [drawAction, color, emitWhiteboardAction]);

  // const onStageMouseMove = useCallback(() => {
  //   if (drawAction === DrawAction.Select || !isPaintRef.current) return;

  //   const stage = stageRef?.current;
  //   const id = currentShapeRef.current;
  //   const pos = stage?.getPointerPosition();
  //   const x = pos?.x || 0;
  //   const y = pos?.y || 0;

  //   let updatedShape;

  //   switch (drawAction) {
  //     case DrawAction.Scribble:
  //       setScribbles((prevScribbles) =>
  //         prevScribbles.map((prevScribble) =>
  //           prevScribble.id === id
  //             ? { ...prevScribble, points: [...prevScribble.points, x, y] }
  //             : prevScribble
  //         )
  //       );
  //       updatedShape = { id, points: [x, y] };
  //       break;
  //     case DrawAction.Circle:
  //       setCircles((prevCircles) =>
  //         prevCircles.map((prevCircle) =>
  //           prevCircle.id === id
  //             ? { ...prevCircle, radius: ((x - prevCircle.x) ** 2 + (y - prevCircle.y) ** 2) ** 0.5 }
  //             : prevCircle
  //         )
  //       );
  //       updatedShape = { id, x, y };
  //       break;
  //     case DrawAction.Rectangle:
  //       setRectangles((prevRectangles) =>
  //         prevRectangles.map((prevRectangle) =>
  //           prevRectangle.id === id
  //             ? { ...prevRectangle, height: y - prevRectangle.y, width: x - prevRectangle.x }
  //             : prevRectangle
  //         )
  //       );
  //       updatedShape = { id, x, y };
  //       break;
  //     case DrawAction.Arrow:
  //       setArrows((prevArrows) =>
  //         prevArrows.map((prevArrow) =>
  //           prevArrow.id === id
  //             ? { ...prevArrow, points: [prevArrow.points[0], prevArrow.points[1], x, y] }
  //             : prevArrow
  //         )
  //       );
  //       updatedShape = { id, points: [x, y] };
  //       break;
  //   }

  //   if (updatedShape) {
  //     emitWhiteboardAction(drawAction, updatedShape);
  //   }
  // }, [drawAction, emitWhiteboardAction]);

  // const onClear = useCallback(() => {
  //   setRectangles([]);
  //   setCircles([]);
  //   setScribbles([]);
  //   setArrows([]);
  //   setImage(undefined);

  //   emitWhiteboardAction('clear', {});
  // }, [emitWhiteboardAction]);
  
  const onImportImageClick = useCallback(() => {
    fileRef?.current && fileRef?.current?.click();
  }, []);

  const onExportClick = useCallback(() => {
    const dataUri = stageRef?.current?.toDataURL({ pixelRatio: 3 });
    downloadURI(dataUri, "image.png");
  }, []);

  // const onClear = useCallback(() => {
  //   setRectangles([]);
  //   setCircles([]);
  //   setScribbles([]);
  //   setArrows([]);
  //   setImage(undefined);

  //   // Emit clear action to the server
  //   socket.emit('whiteboardAction', {
  //     roomId,
  //     type: 'clear',
  //   });
  // }, [roomId]);

  const onStageMouseUp = useCallback(() => {
    isPaintRef.current = false;
  }, []);

  // const onStageMouseDown = useCallback((e: KonvaEventObject<MouseEvent>) => {
  //   if (drawAction === DrawAction.Select) return;
  //   isPaintRef.current = true;
  //   const stage = stageRef?.current;
  //   const pos = stage?.getPointerPosition();
  //   const x = pos?.x || 0;
  //   const y = pos?.y || 0;
  //   const id = uuidv4();
  //   currentShapeRef.current = id;

  //   switch (drawAction) {
  //     case DrawAction.Scribble: {
  //       setScribbles((prevScribbles) => [
  //         ...prevScribbles,
  //         { id, points: [x, y], color },
  //       ]);
  //       break;
  //     }
  //     case DrawAction.Circle: {
  //       setCircles((prevCircles) => [
  //         ...prevCircles,
  //         { id, radius: 1, x, y, color },
  //       ]);
  //       break;
  //     }
  //     case DrawAction.Rectangle: {
  //       setRectangles((prevRectangles) => [
  //         ...prevRectangles,
  //         { id, height: 1, width: 1, x, y, color },
  //       ]);
  //       break;
  //     }
  //     case DrawAction.Arrow: {
  //       setArrows((prevArrows) => [
  //         ...prevArrows,
  //         { id, points: [x, y, x, y], color },
  //       ]);
  //       break;
  //     }
  //   }

  //   // Emit draw action to the server
  //   socket.emit('whiteboardAction', {
  //     roomId,
  //     type: drawAction,
  //     action: { id, x, y, color },
  //   });
  // }, [drawAction, color, roomId]);

  // const onStageMouseMove = useCallback(() => {
  //   if (drawAction === DrawAction.Select || !isPaintRef.current) return;

  //   const stage = stageRef?.current;
  //   const id = currentShapeRef.current;
  //   const pos = stage?.getPointerPosition();
  //   const x = pos?.x || 0;
  //   const y = pos?.y || 0;

  //   switch (drawAction) {
  //     case DrawAction.Scribble: {
  //       setScribbles((prevScribbles) =>
  //         prevScribbles?.map((prevScribble) =>
  //           prevScribble.id === id
  //             ? { ...prevScribble, points: [...prevScribble.points, x, y] }
  //             : prevScribble
  //         )
  //       );
  //       break;
  //     }
  //     case DrawAction.Circle: {
  //       setCircles((prevCircles) =>
  //         prevCircles?.map((prevCircle) =>
  //           prevCircle.id === id
  //             ? { ...prevCircle, radius: ((x - prevCircle.x) ** 2 + (y - prevCircle.y) ** 2) ** 0.5 }
  //             : prevCircle
  //         )
  //       );
  //       break;
  //     }
  //     case DrawAction.Rectangle: {
  //       setRectangles((prevRectangles) =>
  //         prevRectangles?.map((prevRectangle) =>
  //           prevRectangle.id === id
  //             ? { ...prevRectangle, height: y - prevRectangle.y, width: x - prevRectangle.x }
  //             : prevRectangle
  //         )
  //       );
  //       break;
  //     }
  //     case DrawAction.Arrow: {
  //       setArrows((prevArrows) =>
  //         prevArrows.map((prevArrow) =>
  //           prevArrow.id === id
  //             ? { ...prevArrow, points: [prevArrow.points[0], prevArrow.points[1], x, y] }
  //             : prevArrow
  //         )
  //       );
  //       break;
  //     }
  //   }

  //   // Emit draw action to the server
  //   socket.emit('whiteboardAction', {
  //     roomId,
  //     type: drawAction,
  //     action: { id, x, y, color },
  //   });
  // }, [drawAction, roomId ,color]);

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

  // useEffect(() => {
  //   socket.emit('joinRoom', roomId);
  //   console.log("UseEffect is running for both connectioin");
    
  //   socket.on('whiteboardAction', (action) => {
  //     console.log(action);
      
  //     console.log("whiteboardAction is runing");
  //     console.log("room Id coming from backend ", action.roomId);
  //     switch (action.type) {
  //       case DrawAction.Scribble: {
  //         console.log("Scrible type chala");
  //         setScribbles((prevScribbles) => [...prevScribbles, action.action]);
  //         break;
  //       }
  //       case DrawAction.Circle: {
  //         console.log("Circel type chala");
  //         setCircles((prevCircles) => [...prevCircles, action.action]);
  //         break;
  //       }
  //       case DrawAction.Rectangle: {
  //         setRectangles((prevRectangles) => [...prevRectangles, action.action]);
  //         break;
  //       }
  //       case DrawAction.Arrow: {
  //         setArrows((prevArrows) => [...prevArrows, action.action]);
  //         break;
  //       }
  //       case 'clear': {
  //         onClear();
  //         break;
  //       }
  //       default:
  //         break;
  //     }
  //   });

  //   return () => {
  //     socket.off('whiteboardAction');
  //   };
  // }, [roomId, onClear , drawAction , onStageMouseDown , onStageMouseMove , onStageMouseUp]);

  // useEffect(() => {
  //   socket.emit('joinRoom', roomId);
    
  //   const handleWhiteboardAction = (action) => {
  //     console.log("Received whiteboard action:", action);
      
  //     switch (action.type) {
  //       case DrawAction.Scribble:
  //         setScribbles((prevScribbles) => [...prevScribbles, action.action]);
  //         break;
  //       case DrawAction.Circle:
  //         setCircles((prevCircles) => [...prevCircles, action.action]);
  //         break;
  //       case DrawAction.Rectangle:
  //         setRectangles((prevRectangles) => [...prevRectangles, action.action]);
  //         break;
  //       case DrawAction.Arrow:
  //         setArrows((prevArrows) => [...prevArrows, action.action]);
  //         break;
  //       case 'clear':
  //         setScribbles([]);
  //         setCircles([]);
  //         setRectangles([]);
  //         setArrows([]);
  //         setImage(undefined);
  //         break;
  //       default:
  //         break;
  //     }
  //   };
  
  //   socket.on('whiteboardAction', handleWhiteboardAction);
  
  //   return () => {
  //     socket.off('whiteboardAction', handleWhiteboardAction);
  //   };
  // }, [roomId]);


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

            {arrows.map((arrow,index) => (
              <KonvaArrow
                key={index}
                id={arrow.id}
                points={arrow.points}
                fill={arrow.color}
                stroke={arrow.color}
                strokeWidth={4}
                onClick={onShapeClick}
                draggable={isDraggable}
              />
            ))}

            {rectangles.map((rectangle) => (
              <KonvaRect
                key={rectangle.id}
                x={rectangle?.x}
                y={rectangle?.y}
                height={rectangle?.height}
                width={rectangle?.width}
                stroke={rectangle?.color}
                id={rectangle?.id}
                strokeWidth={4}
                onClick={onShapeClick}
                draggable={isDraggable}
              />
            ))}

            {circles.map((circle) => (
              <KonvaCircle
                key={circle.id}
                id={circle.id}
                x={circle?.x}
                y={circle?.y}
                radius={circle?.radius}
                stroke={circle?.color}
                strokeWidth={4}
                onClick={onShapeClick}
                draggable={isDraggable}
              />
            ))}
{/* 
{rectangles.map((rect) => (
            <KonvaRect
              key={rect.id}
              x={rect.x}
              y={rect.y}
              width={Math.abs(rect.width)}
              height={Math.abs(rect.height)}
              stroke={rect.color}
              strokeWidth={4}
              draggable={isDraggable}
            />
          ))}
          {circles.map((circle) => (
            <KonvaCircle
              key={circle.id}
              x={circle.x}
              y={circle.y}
              radius={circle.radius}
              stroke={circle.color}
              strokeWidth={4}
              draggable={isDraggable}
            />
          ))} */}

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