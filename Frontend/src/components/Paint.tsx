import { KonvaEventObject } from "konva/lib/Node";
import React, { useCallback, useRef, useState, useEffect } from "react";
import {
  Stage,
  Layer,
  Rect as KonvaRect,
  Image as KonvaImage,
  Line as KonvaLine,
  Transformer,
} from "react-konva";
import { v4 as uuidv4 } from "uuid";
import { Scribble, Size } from "../components/Paint.types";
import { DrawAction, PAINT_OPTIONS } from "./Paint.constants";
import { SketchPicker } from "react-color";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  useMediaQuery,
} from "@chakra-ui/react";

import { io } from "socket.io-client";
import { useParams, useNavigate } from "react-router-dom";
import {
  LuLayout,
  LuUsers,
  LuClock,
  LuSettings,
  LuDownload,
  LuUpload,
  LuUndo2,
  LuRedo2,
  LuTrash2,
  LuChevronLeft,
  LuLayoutDashboard,
  LuShare2,
  LuMenu,
  LuX
} from "react-icons/lu";
import { motion, AnimatePresence } from "framer-motion";

const ENDPOINT = "http://localhost:5000";
const socket = io(ENDPOINT);

const downloadURI = (uri: string, name: string) => {
  const link = document.createElement("a");
  link.download = name;
  link.href = uri || "";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const SIZE = 500;

const SidebarItem = ({ icon: Icon, label, active = false, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${active
      ? 'bg-blue-50 text-blue-600'
      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}>
    <Icon size={20} />
    <span className="lg:inline">{label}</span>
  </button>
);

export const Paint: React.FC = React.memo(function Paint() {
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

  const [isMobile] = useMediaQuery("(max-width: 1024px)");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [history, setHistory] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState(-1);

  const { roomId } = useParams();

  // Logic remains the same
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

  const emitWhiteboardAction = useCallback((type: string, action: any) => {
    socket.emit('whiteboardAction', { roomId, type, action });
  }, [roomId]);

  const handleWhiteboardAction = useCallback((action: any) => {
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
        addToHistory({ scribbles, image });
        break;
      case 'clear':
        addToHistory({ scribbles: [], image: undefined });
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
    }
  }, [addToHistory, applyState, history, scribbles, image]);

  useEffect(() => {
    socket.emit('joinRoom', roomId);
    socket.on('whiteboardAction', handleWhiteboardAction);
    return () => { socket.off('whiteboardAction', handleWhiteboardAction); };
  }, [roomId, handleWhiteboardAction]);

  const onStageMouseDown = useCallback((_e: KonvaEventObject<MouseEvent>) => {
    if (drawAction === DrawAction.Select) return;
    isPaintRef.current = true;
    const stage = stageRef?.current;
    const pos = stage?.getPointerPosition();
    const x = pos?.x || 0;
    const y = pos?.y || 0;
    const id = uuidv4();
    currentShapeRef.current = id;
    let newAction: any = { id, x, y, color };
    if (drawAction === DrawAction.Scribble) {
      newAction.points = [x, y];
      setScribbles((prevScribbles) => [...prevScribbles, newAction as Scribble]);
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
    if (drawAction === DrawAction.Scribble) {
      setScribbles((prevScribbles) =>
        prevScribbles.map((prevScribble) =>
          prevScribble.id === id
            ? { ...prevScribble, points: [...prevScribble.points, x, y] }
            : prevScribble
        )
      );
      updatedShape = { id, points: [x, y] };
    }
    if (updatedShape) emitWhiteboardAction(drawAction, updatedShape);
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
    downloadURI(dataUri, "boardify-export.png");
  }, []);

  const onStageMouseUp = useCallback(() => { isPaintRef.current = false; }, []);

  const onShapeClick = useCallback((e: KonvaEventObject<MouseEvent>) => {
    if (drawAction !== DrawAction.Select) return;
    const currentTarget = e.currentTarget;
    transformerRef?.current?.node(currentTarget);
  }, [drawAction]);

  const isDraggable = drawAction === DrawAction.Select;
  const onBgClick = useCallback((_e: KonvaEventObject<MouseEvent>) => {
    transformerRef?.current?.nodes([]);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const mainContent = document.getElementById('canvas-container');
      if (mainContent) {
        setSize({ width: mainContent.offsetWidth, height: mainContent.offsetHeight });
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex h-screen bg-white font-sans overflow-hidden">
      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[40]"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        ${isMobile ? 'fixed inset-y-0 left-0 z-[50] w-64' : 'w-64 z-20'} 
        border-r border-gray-100 flex flex-col p-4 bg-white transform transition-transform duration-300 ease-in-out
        ${isMobile && !isSidebarOpen ? '-translate-x-full' : 'translate-x-0'}
      `}>
        <div className="flex items-center justify-between gap-2 px-2 mb-8">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/dashboard")}>
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <LuLayoutDashboard size={20} />
            </div>
            <span className="font-bold text-xl text-gray-900">Boardify</span>
          </div>
          {isMobile && (
            <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
              <LuX size={20} />
            </button>
          )}
        </div>

        <nav className="flex-1 flex flex-col gap-1">
          <SidebarItem icon={LuLayout} label="My Boards" active onClick={() => navigate("/dashboard")} />
          <SidebarItem icon={LuUsers} label="Shared with Me" />
          <SidebarItem icon={LuClock} label="Recent" />
        </nav>

        <div className="mt-auto pt-4 border-t border-gray-50 flex flex-col gap-1">
          <SidebarItem icon={LuSettings} label="Settings" />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Top Header */}
        <header className="h-16 border-b border-gray-100 bg-white flex items-center justify-between px-4 sm:px-6 z-10 shrink-0">
          <div className="flex items-center gap-2 sm:gap-4">
            {isMobile && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 -ml-2 text-gray-500 hover:bg-gray-50 rounded-lg"
              >
                <LuMenu size={24} />
              </button>
            )}
            <button
              onClick={() => navigate("/dashboard")}
              className="hidden sm:block p-2 hover:bg-gray-50 rounded-lg text-gray-500 transition-colors"
            >
              <LuChevronLeft size={24} />
            </button>
            <div className="hidden sm:block h-6 w-[1px] bg-gray-200"></div>
            <h1 className="font-semibold text-gray-900 truncate max-w-[120px] sm:max-w-[200px] text-sm sm:text-base">
              {roomId === "new-board" ? "Untitled" : roomId}
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden xs:flex items-center bg-gray-50 rounded-lg p-0.5 sm:p-1">
              <button
                onClick={undo}
                disabled={currentStep <= 0}
                className="p-1.5 sm:p-2 text-gray-600 hover:bg-white hover:shadow-sm disabled:opacity-30 rounded-md transition-all"
              >
                <LuUndo2 size={16} />
              </button>
              <button
                onClick={redo}
                disabled={currentStep >= history.length - 1}
                className="p-1.5 sm:p-2 text-gray-600 hover:bg-white hover:shadow-sm disabled:opacity-30 rounded-md transition-all"
              >
                <LuRedo2 size={16} />
              </button>
            </div>

            <button
              onClick={onImportImageClick}
              className="p-2 text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-200 sm:px-4 sm:py-2 flex items-center gap-2"
            >
              <LuUpload size={18} />
              <span className="hidden lg:inline text-sm font-medium">Import</span>
            </button>

            <button
              onClick={onExportClick}
              className="flex items-center gap-2 px-3 py-2 sm:px-4 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
            >
              <LuDownload size={18} />
              <span className="hidden sm:inline">Export</span>
            </button>

            <button className="hidden sm:block p-2 text-gray-500 hover:bg-gray-50 rounded-lg">
              <LuShare2 size={20} />
            </button>
          </div>
        </header>

        {/* Drawing Toolbar - Floating */}
        <div className={`
          absolute z-20 flex flex-col gap-1.5 p-1.5 bg-white rounded-2xl shadow-xl border border-gray-100
          ${isMobile ? 'left-3 top-20' : 'left-6 top-24'}
        `}>
          {PAINT_OPTIONS.map(({ id, icon, label }) => (
            <button
              key={id}
              onClick={() => setDrawAction(id)}
              className={`p-2.5 sm:p-3 rounded-xl transition-all ${drawAction === id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                : 'text-gray-500 hover:bg-gray-50'
                }`}
              title={label}
            >
              {React.cloneElement(icon as React.ReactElement, { size: isMobile ? 18 : 20 })}
            </button>
          ))}

          <div className="h-[1px] bg-gray-100 mx-2 my-1"></div>

          <button
            onClick={onClear}
            className="p-2.5 sm:p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all"
            title="Clear Board"
          >
            <LuTrash2 size={isMobile ? 18 : 20} />
          </button>

          <Popover placement="right">
            <PopoverTrigger>
              <div className="p-1 rounded-xl cursor-pointer hover:bg-gray-50 transition-all flex items-center justify-center">
                <div
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg shadow-inner border border-gray-200"
                  style={{ backgroundColor: color }}
                />
              </div>
            </PopoverTrigger>
            <PopoverContent border="none" borderRadius="2xl" shadow="2xl" p={0} overflow="hidden">
              {/*@ts-ignore*/}
              <SketchPicker
                color={color}
                onChangeComplete={(selectedColor) => setColor(selectedColor.hex)}
                width={isMobile ? "180" : "220"}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Canvas Area */}
        <div id="canvas-container" className="flex-1 bg-gray-50 relative overflow-hidden">
          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }}
          />

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
                fill="transparent"
                id="bg"
                onClick={onBgClick}
              />

              {image && (
                <KonvaImage
                  image={image}
                  x={20}
                  y={20}
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

              <Transformer
                ref={transformerRef}
                anchorStroke="#3b82f6"
                anchorFill="#fff"
                anchorSize={isMobile ? 6 : 8}
                borderStroke="#3b82f6"
              />
            </Layer>
          </Stage>
        </div>

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileRef}
          onChange={onImportImageSelect}
          className="hidden"
          accept="image/*"
        />
      </div>
    </div>
  );
});
