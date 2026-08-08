import React, { useState, useEffect, useCallback, useRef, TouchEvent, MouseEvent } from 'react';
import {
  RotateCcw,
  Volume2,
  VolumeX,
  HelpCircle,
  Undo2,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Trophy,
} from 'lucide-react';
import { Direction, Grid } from './types';
import {
  createInitialGrid,
  drawFromDeck,
  shiftGrid,
  hasValidMoves,
  calculateTotalScore,
  getMaxTileValue,
  generateId,
} from './utils/gameLogic';
import { soundFX } from './utils/audio';
import { TileView } from './components/TileView';
import { NextTilePreview } from './components/NextTilePreview';
import { GameOverModal } from './components/GameOverModal';
import { HowToPlayModal } from './components/HowToPlayModal';

interface HistoryState {
  grid: Grid;
  score: number;
  nextTileValue: number;
  isBonusNext: boolean;
  deck: number[];
}

export default function App() {
  const [grid, setGrid] = useState<Grid>(
    () =>
      Array(4)
        .fill(null)
        .map(() => Array(4).fill(null))
  );
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('threes_high_score');
      return saved ? parseInt(saved, 10) || 0 : 0;
    }
    return 0;
  });
  const [nextTileValue, setNextTileValue] = useState<number>(1);
  const [isBonusNext, setIsBonusNext] = useState<boolean>(false);
  const [deck, setDeck] = useState<number[]>([]);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [isNewHighScore, setIsNewHighScore] = useState<boolean>(false);
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);

  // Swipe gesture tracking
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const mouseStartRef = useRef<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Initialize new game
  const initGame = useCallback(() => {
    const { grid: initGrid, deck: initDeck } = createInitialGrid();
    const maxVal = getMaxTileValue(initGrid);
    const { value, isBonus, newDeck } = drawFromDeck(initDeck, maxVal);

    const initialScore = calculateTotalScore(initGrid);

    setGrid(initGrid);
    setDeck(newDeck);
    setNextTileValue(value);
    setIsBonusNext(isBonus);
    setScore(initialScore);
    setGameOver(false);
    setIsNewHighScore(false);
    setHistory([]);
    soundFX.playRestart();
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  // Execute a move in direction
  const handleMove = useCallback(
    (dir: Direction) => {
      if (gameOver) return;

      const { newGrid, shifted, spawnCandidates, highestMerged } = shiftGrid(grid, dir);

      if (!shifted) {
        return; // Invalid move, do nothing
      }

      // Save state to history for undo
      setHistory((prev) => [
        ...prev.slice(-5), // Keep up to 5 steps of history
        {
          grid: grid.map((row) => [...row]),
          score,
          nextTileValue,
          isBonusNext,
          deck: [...deck],
        },
      ]);

      // Choose spawn location from candidates
      let spawnSpot: { r: number; c: number } | null = null;
      if (spawnCandidates.length > 0) {
        spawnSpot = spawnCandidates[Math.floor(Math.random() * spawnCandidates.length)];
      } else {
        // Fallback: pick any empty spot on the grid
        const emptySpots: { r: number; c: number }[] = [];
        for (let r = 0; r < 4; r++) {
          for (let c = 0; c < 4; c++) {
            if (newGrid[r][c] === null) {
              emptySpots.push({ r, c });
            }
          }
        }
        if (emptySpots.length > 0) {
          spawnSpot = emptySpots[Math.floor(Math.random() * emptySpots.length)];
        }
      }

      // Place next tile
      if (spawnSpot) {
        newGrid[spawnSpot.r][spawnSpot.c] = {
          id: generateId(),
          value: nextTileValue,
          isNew: true,
        };
      }

      // Draw upcoming next tile preview
      const maxVal = getMaxTileValue(newGrid);
      const { value: upcomingVal, isBonus: upcomingBonus, newDeck } = drawFromDeck(
        deck,
        maxVal
      );

      const newScore = calculateTotalScore(newGrid);

      setGrid(newGrid);
      setDeck(newDeck);
      setNextTileValue(upcomingVal);
      setIsBonusNext(upcomingBonus);
      setScore(newScore);

      // Update High Score
      if (newScore > highScore) {
        setHighScore(newScore);
        setIsNewHighScore(true);
        if (typeof window !== 'undefined') {
          localStorage.setItem('threes_high_score', newScore.toString());
        }
      }

      // Play sound
      if (highestMerged) {
        soundFX.playMerge(highestMerged);
      } else {
        soundFX.playMove();
      }

      // Check for Game Over
      if (!hasValidMoves(newGrid)) {
        setGameOver(true);
        soundFX.playGameOver();
      }
    },
    [gameOver, grid, score, nextTileValue, isBonusNext, deck, highScore]
  );

  // Undo move
  const handleUndo = useCallback(() => {
    if (history.length === 0 || gameOver) return;
    const previous = history[history.length - 1];
    setGrid(previous.grid);
    setScore(previous.score);
    setNextTileValue(previous.nextTileValue);
    setIsBonusNext(previous.isBonusNext);
    setDeck(previous.deck);
    setHistory((prev) => prev.slice(0, -1));
    soundFX.playMove();
  }, [history, gameOver]);

  // Toggle Mute
  const handleToggleMute = useCallback(() => {
    const muted = soundFX.toggleMute();
    setIsMuted(muted);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid interference if modals are open or user is typing elsewhere
      if (isHelpOpen) return;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          handleMove('UP');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          handleMove('DOWN');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          handleMove('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          handleMove('RIGHT');
          break;
        case 'z':
        case 'Z':
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault();
            handleUndo();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleMove, handleUndo, isHelpOpen]);

  // Touch Swipe Handlers
  const handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    }
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (!touchStartRef.current || e.changedTouches.length === 0) return;
    const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x;
    const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    const minSwipeDist = 30; // pixels

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (Math.abs(deltaX) > minSwipeDist) {
        handleMove(deltaX > 0 ? 'RIGHT' : 'LEFT');
      }
    } else {
      if (Math.abs(deltaY) > minSwipeDist) {
        handleMove(deltaY > 0 ? 'DOWN' : 'UP');
      }
    }
  };

  // Mouse Drag Handlers for Desktop Swiping
  const handleMouseDown = (e: MouseEvent) => {
    setIsDragging(true);
    mouseStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = (e: MouseEvent) => {
    if (!isDragging || !mouseStartRef.current) return;
    const deltaX = e.clientX - mouseStartRef.current.x;
    const deltaY = e.clientY - mouseStartRef.current.y;
    mouseStartRef.current = null;
    setIsDragging(false);

    const minSwipeDist = 30;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (Math.abs(deltaX) > minSwipeDist) {
        handleMove(deltaX > 0 ? 'RIGHT' : 'LEFT');
      }
    } else {
      if (Math.abs(deltaY) > minSwipeDist) {
        handleMove(deltaY > 0 ? 'DOWN' : 'UP');
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#E5E9EC] text-[#414B57] flex flex-col items-center justify-center p-3 sm:p-5 selection:bg-none">
      {/* ARTISTIC FLAIR MAIN CARD CONTAINER */}
      <div className="relative flex flex-col items-center max-w-[420px] w-full p-5 sm:p-6 bg-white rounded-[40px] shadow-2xl border-8 border-white my-auto">
        {/* TOP HEADER BAR */}
        <header className="w-full flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#414B57] flex items-center gap-1.5">
              Threes!
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#65B2F1] text-white font-bold tracking-normal">
                1+2
              </span>
            </h1>
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleUndo}
              disabled={history.length === 0 || gameOver}
              title="Undo Last Move"
              className="p-2 rounded-xl bg-slate-50 text-[#414B57] hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed border border-slate-200/60 shadow-sm transition-all cursor-pointer active:scale-95"
            >
              <Undo2 className="w-4 h-4" />
            </button>

            <button
              onClick={handleToggleMute}
              title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
              className="p-2 rounded-xl bg-slate-50 text-[#414B57] hover:bg-slate-100 border border-slate-200/60 shadow-sm transition-all cursor-pointer active:scale-95"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-rose-500" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={() => setIsHelpOpen(true)}
              title="How to Play"
              className="p-2 rounded-xl bg-slate-50 text-[#414B57] hover:bg-slate-100 border border-slate-200/60 shadow-sm transition-all cursor-pointer active:scale-95"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            <button
              onClick={initGame}
              title="Restart Game"
              className="p-2 rounded-xl bg-[#414B57] text-white hover:bg-[#2D343D] shadow-md transition-all cursor-pointer active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* STATS & PREVIEW HEADER */}
        <div className="w-full flex justify-between items-end mb-6 px-1">
          {/* Current Score */}
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9BA5B1] mb-1">
              Current Score
            </span>
            <span className="text-3xl sm:text-4xl font-black text-[#414B57]">
              {score.toLocaleString()}
            </span>
          </div>

          {/* Next Tile Preview */}
          <NextTilePreview
            value={nextTileValue}
            isBonusNext={isBonusNext}
            deckCount={deck.length}
          />

          {/* High Score */}
          <div className="flex flex-col items-end relative">
            {isNewHighScore && (
              <span className="absolute -top-3 right-0 text-[9px] font-bold bg-amber-400 text-slate-900 px-1.5 py-0.2 rounded-full animate-pulse">
                NEW
              </span>
            )}
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9BA5B1] mb-1">
              Best
            </span>
            <span className="text-2xl sm:text-3xl font-black text-[#9BA5B1]">
              {highScore.toLocaleString()}
            </span>
          </div>
        </div>

        {/* GAME BOARD CANVAS */}
        <main
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => setIsDragging(false)}
          className="relative w-[320px] h-[320px] sm:w-[340px] sm:h-[340px] bg-[#D1D9E0] p-3 rounded-[32px] grid grid-cols-4 grid-rows-4 gap-2.5 cursor-grab active:cursor-grabbing touch-none select-none shadow-inner"
        >
          {grid.map((row, r) =>
            row.map((cell, c) => (
              <div key={`${r}-${c}`} className="w-full h-full relative">
                <TileView tile={cell} />
              </div>
            ))
          )}
        </main>

        {/* BOTTOM RESTART & CONTROLS */}
        <div className="mt-5 flex flex-col items-center gap-3 w-full">
          <div className="flex gap-3 w-full">
            <button
              onClick={initGame}
              className="flex-1 py-3.5 bg-[#414B57] text-white font-bold text-sm rounded-2xl shadow-lg active:scale-95 transition-all hover:bg-[#2D343D] cursor-pointer flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              RESTART
            </button>
          </div>

          {/* Directional Pad */}
          <div className="flex flex-col items-center gap-1 mt-1">
            <button
              onClick={() => handleMove('UP')}
              disabled={gameOver}
              className="w-10 h-8 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 rounded-lg flex items-center justify-center text-[#414B57] active:scale-95 transition-all cursor-pointer"
              aria-label="Move Up"
            >
              <ChevronUp className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleMove('LEFT')}
                disabled={gameOver}
                className="w-10 h-8 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 rounded-lg flex items-center justify-center text-[#414B57] active:scale-95 transition-all cursor-pointer"
                aria-label="Move Left"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleMove('DOWN')}
                disabled={gameOver}
                className="w-10 h-8 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 rounded-lg flex items-center justify-center text-[#414B57] active:scale-95 transition-all cursor-pointer"
                aria-label="Move Down"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleMove('RIGHT')}
                disabled={gameOver}
                className="w-10 h-8 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 rounded-lg flex items-center justify-center text-[#414B57] active:scale-95 transition-all cursor-pointer"
                aria-label="Move Right"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      {gameOver && (
        <GameOverModal
          score={score}
          highScore={highScore}
          isNewHighScore={isNewHighScore}
          grid={grid}
          onRestart={initGame}
        />
      )}

      <HowToPlayModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
}
