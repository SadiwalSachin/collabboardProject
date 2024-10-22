export type Shape = {
    id: string;
    color: string;
    x?: number;
    y?: number;
  };
  
  export type Scribble = Shape & {
    points: number[];
  };
  
  export interface Size {
    width: number;
    height: number;
  }