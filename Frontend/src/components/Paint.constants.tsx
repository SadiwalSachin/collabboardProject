import { LuMousePointer2, LuPencil } from "react-icons/lu";

export enum DrawAction {
  Select = "select",
  Rectangle = "rectangle",
  Circle = "circle",
  Scribble = "freedraw",
  Arrow = "arrow",
}

export const PAINT_OPTIONS = [
  {
    id: DrawAction.Select,
    label: "Select Shapes",
    icon: <LuMousePointer2 size={20} />,
  },
  {
    id: DrawAction.Scribble,
    label: "Scribble",
    icon: <LuPencil size={20} />,
  },
];
