import { Direction, Grid, Tile, TileFaceDetails } from '../types';

let idCounter = 1;
export function generateId(): string {
  return `tile_${Date.now()}_${idCounter++}_${Math.random().toString(36).substring(2, 7)}`;
}

// Score formula: 1 and 2 = 0 points. For white tiles N >= 3: 3^((log2(N/3))+1)
export function calculateTilePoints(val: number): number {
  if (val < 3) return 0;
  const power = Math.floor(Math.log2(val / 3)) + 1;
  return Math.pow(3, power);
}

export function calculateTotalScore(grid: Grid): number {
  let total = 0;
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const tile = grid[r][c];
      if (tile) {
        total += calculateTilePoints(tile.value);
      }
    }
  }
  return total;
}

export function getTileFaceDetails(value: number): TileFaceDetails {
  switch (value) {
    case 1:
      return { face: '', label: 'One' };
    case 2:
      return { face: '', label: 'Two' };
    case 3:
      return { face: '• ‿ •', label: 'Three' };
    case 6:
      return { face: '◕ ‿ ◕', label: 'Six' };
    case 12:
      return { face: '•̀ ᴗ •́', label: 'Twelve' };
    case 24:
      return { face: '⌐■_■', label: 'Twenty-Four' };
    case 48:
      return { face: '★ ‿ ★', label: 'Forty-Eight' };
    case 96:
      return { face: '✧ ‿ ✧', label: 'Ninety-Six' };
    case 192:
      return { face: '👑', label: 'One-Ninety-Two', borderColor: 'border-amber-300' };
    case 384:
      return { face: '🔥', label: 'Three-Eighty-Four', borderColor: 'border-orange-400' };
    case 768:
      return { face: '💎', label: 'Seven-Sixty-Eight', borderColor: 'border-cyan-300' };
    case 1536:
      return { face: '⚡', label: 'Fifteen-Thirty-Six', borderColor: 'border-yellow-400' };
    case 3072:
      return { face: '🌟', label: 'Thirty-Seventy-Two', borderColor: 'border-purple-400' };
    default:
      return { face: '✨', label: `${value}` };
  }
}

// Generate a fresh Threes deck bag: [1,1,1,1, 2,2,2,2, 3,3,3,3]
export function createDeck(): number[] {
  const bag = [1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3];
  // Shuffle
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
  return bag;
}

// Draw a tile value from the deck bag
export function drawFromDeck(
  deck: number[],
  maxTileOnBoard: number
): { value: number; isBonus: boolean; newDeck: number[] } {
  let currentDeck = [...deck];
  if (currentDeck.length === 0) {
    currentDeck = createDeck();
  }

  // Bonus tile check: if max tile >= 48, ~1 in 21 chance for a bonus tile
  if (maxTileOnBoard >= 48 && Math.random() < 0.05) {
    // Bonus tile is between 6 and maxTile / 8
    const maxBonus = Math.max(6, Math.floor(maxTileOnBoard / 8));
    const bonusOptions: number[] = [];
    let curr = 6;
    while (curr <= maxBonus) {
      bonusOptions.push(curr);
      curr *= 2;
    }
    const bonusVal = bonusOptions[Math.floor(Math.random() * bonusOptions.length)];
    return { value: bonusVal, isBonus: true, newDeck: currentDeck };
  }

  const value = currentDeck.pop()!;
  return { value, isBonus: false, newDeck: currentDeck };
}

export function canMerge(t1: Tile | null, t2: Tile | null): boolean {
  if (!t1 || !t2) return false;
  if (t1.value === 1 && t2.value === 2) return true;
  if (t1.value === 2 && t2.value === 1) return true;
  if (t1.value >= 3 && t2.value >= 3 && t1.value === t2.value) return true;
  return false;
}

// Shift a 1D line of length 4 towards index 0 by at most 1 space per tile
function shiftLineLeft(line: (Tile | null)[]): {
  newLine: (Tile | null)[];
  shifted: boolean;
  mergedValue: number | null;
} {
  const newLine = [...line].map((t) => (t ? { ...t, isNew: false, isMerged: false } : null));
  let shifted = false;
  let mergedValue: number | null = null;

  // Option 1: check index 0 & 1
  if (newLine[0] === null && newLine[1] !== null) {
    newLine[0] = newLine[1];
    newLine[1] = newLine[2];
    newLine[2] = newLine[3];
    newLine[3] = null;
    shifted = true;
  } else if (canMerge(newLine[0], newLine[1])) {
    const val = newLine[0]!.value + newLine[1]!.value;
    newLine[0] = { id: generateId(), value: val, isMerged: true, isNew: false };
    newLine[1] = newLine[2];
    newLine[2] = newLine[3];
    newLine[3] = null;
    shifted = true;
    mergedValue = val;
  } else {
    // Option 2: check index 1 & 2
    if (newLine[1] === null && newLine[2] !== null) {
      newLine[1] = newLine[2];
      newLine[2] = newLine[3];
      newLine[3] = null;
      shifted = true;
    } else if (canMerge(newLine[1], newLine[2])) {
      const val = newLine[1]!.value + newLine[2]!.value;
      newLine[1] = { id: generateId(), value: val, isMerged: true, isNew: false };
      newLine[2] = newLine[3];
      newLine[3] = null;
      shifted = true;
      mergedValue = val;
    } else {
      // Option 3: check index 2 & 3
      if (newLine[2] === null && newLine[3] !== null) {
        newLine[2] = newLine[3];
        newLine[3] = null;
        shifted = true;
      } else if (canMerge(newLine[2], newLine[3])) {
        const val = newLine[2]!.value + newLine[3]!.value;
        newLine[2] = { id: generateId(), value: val, isMerged: true, isNew: false };
        newLine[3] = null;
        shifted = true;
        mergedValue = val;
      }
    }
  }

  return { newLine, shifted, mergedValue };
}

export function getMaxTileValue(grid: Grid): number {
  let max = 3;
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (grid[r][c] && grid[r][c]!.value > max) {
        max = grid[r][c]!.value;
      }
    }
  }
  return max;
}

export function shiftGrid(
  grid: Grid,
  direction: Direction
): {
  newGrid: Grid;
  shifted: boolean;
  spawnCandidates: { r: number; c: number }[];
  highestMerged: number | null;
} {
  const newGrid: Grid = Array(4)
    .fill(null)
    .map(() => Array(4).fill(null));

  let shifted = false;
  const spawnCandidates: { r: number; c: number }[] = [];
  let highestMerged: number | null = null;

  for (let i = 0; i < 4; i++) {
    let line: (Tile | null)[] = [];

    if (direction === 'LEFT') {
      line = [grid[i][0], grid[i][1], grid[i][2], grid[i][3]];
    } else if (direction === 'RIGHT') {
      line = [grid[i][3], grid[i][2], grid[i][1], grid[i][0]];
    } else if (direction === 'UP') {
      line = [grid[0][i], grid[1][i], grid[2][i], grid[3][i]];
    } else if (direction === 'DOWN') {
      line = [grid[3][i], grid[2][i], grid[1][i], grid[0][i]];
    }

    const { newLine, shifted: lineShifted, mergedValue } = shiftLineLeft(line);

    if (lineShifted) {
      shifted = true;
      if (mergedValue && (!highestMerged || mergedValue > highestMerged)) {
        highestMerged = mergedValue;
      }
    }

    // Map output back to grid and record opposite edge candidates
    if (direction === 'LEFT') {
      for (let c = 0; c < 4; c++) newGrid[i][c] = newLine[c];
      if (lineShifted && newGrid[i][3] === null) {
        spawnCandidates.push({ r: i, c: 3 });
      }
    } else if (direction === 'RIGHT') {
      newGrid[i][3] = newLine[0];
      newGrid[i][2] = newLine[1];
      newGrid[i][1] = newLine[2];
      newGrid[i][0] = newLine[3];
      if (lineShifted && newGrid[i][0] === null) {
        spawnCandidates.push({ r: i, c: 0 });
      }
    } else if (direction === 'UP') {
      for (let r = 0; r < 4; r++) newGrid[r][i] = newLine[r];
      if (lineShifted && newGrid[3][i] === null) {
        spawnCandidates.push({ r: 3, c: i });
      }
    } else if (direction === 'DOWN') {
      newGrid[3][i] = newLine[0];
      newGrid[2][i] = newLine[1];
      newGrid[1][i] = newLine[2];
      newGrid[0][i] = newLine[3];
      if (lineShifted && newGrid[0][i] === null) {
        spawnCandidates.push({ r: 0, c: i });
      }
    }
  }

  return { newGrid, shifted, spawnCandidates, highestMerged };
}

// Check if any move remains in any of the 4 directions
export function hasValidMoves(grid: Grid): boolean {
  const directions: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
  for (const dir of directions) {
    const { shifted } = shiftGrid(grid, dir);
    if (shifted) return true;
  }
  return false;
}

// Create initial 4x4 game state with 9 random tiles (mixture of 1s, 2s, 3s)
export function createInitialGrid(): { grid: Grid; deck: number[] } {
  let deck = createDeck();
  const grid: Grid = Array(4)
    .fill(null)
    .map(() => Array(4).fill(null));

  // Pick 9 unique random positions from 16 total positions
  const positions: { r: number; c: number }[] = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      positions.push({ r, c });
    }
  }

  // Shuffle positions
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }

  // Place 9 tiles from deck
  const initialPositions = positions.slice(0, 9);
  for (const pos of initialPositions) {
    if (deck.length === 0) deck = createDeck();
    const val = deck.pop()!;
    grid[pos.r][pos.c] = {
      id: generateId(),
      value: val,
      isNew: false,
    };
  }

  return { grid, deck };
}
