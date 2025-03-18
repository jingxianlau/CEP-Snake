interface Space {
  filled: boolean;
  playerId: string;
  segmentNum: number;
  isApple: boolean;
}

interface Player {
  id: string;
  colour: string;
  dir: string;
  nextDir: string;
  size: number;
  prev: { x: number; y: number };
}
