interface Space {
  filled: boolean;
  playerId: string;
  isApple: boolean;
}

interface Segment {
  num: number;
  coords: { x: number; y: number };
}

interface Player {
  id: string;
  colour: string;
  username: string;
  points: number;
  snake: {
    segments: Segment[];
    dir: string;
    nextDir: string;
  };
}
