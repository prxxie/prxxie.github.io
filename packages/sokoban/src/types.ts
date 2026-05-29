export enum TileType {
  EMPTY = 0,
  WALL = 1,
  FLOOR = 2,
  TARGET = 3
}

export interface Player {
  x: number;
  y: number;
}

export interface Box {
  id: string;
  x: number;
  y: number;
}

export interface MoveSnapshot {
  player: Player;
  boxes: Box[];
}

export interface LevelData {
  id: string;
  name: string;
  grid: string[];
}
