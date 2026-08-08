export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface Tile {
  id: string;
  value: number; // 1 (blue), 2 (red), 3+ (white)
  isNew?: boolean;
  isMerged?: boolean;
}

export type Grid = (Tile | null)[][];

export interface GameState {
  grid: Grid;
  score: number;
  highScore: number;
  nextTileValue: number;
  isBonusNext: boolean;
  deck: number[]; // remaining bag of 1s, 2s, 3s
  gameOver: boolean;
  moveCount: number;
}

export interface TileFaceDetails {
  face: string;
  label: string;
  borderColor?: string;
  textColor?: string;
}
