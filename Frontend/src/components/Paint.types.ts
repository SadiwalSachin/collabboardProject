export type Shape = {
    id: string;
    color: string;
    x: number;
    y: number;
  };
  
  export type Scribble = Shape & {
    points: number[];
  };
  
  export type Circle = Shape & {
    radius: number;
  };
  
  export type Rectangle = Shape & {
    width: number;
    height: number;
  };
  
  export type Arrow = Shape & {
    points: number[];
  };
  
  export interface Size {
    width: number;
    height: number;
  }