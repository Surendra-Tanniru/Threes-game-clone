import React from 'react';
import { Trophy, RotateCcw, Award } from 'lucide-react';
import { Grid } from '../types';
import { calculateTilePoints, getTileFaceDetails } from '../utils/gameLogic';

interface GameOverModalProps {
  score: number;
  highScore: number;
  isNewHighScore: boolean;
  grid: Grid;
  onRestart: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  highScore,
  isNewHighScore,
  grid,
  onRestart,
}) => {
  // Compute summary of tile counts on the board
  const tileCounts: Record<number, number> = {};
  let maxTile = 0;

  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const t = grid[r][c];
      if (t) {
        tileCounts[t.value] = (tileCounts[t.value] || 0) + 1;
        if (t.value > maxTile) maxTile = t.value;
      }
    }
  }

  // Sort values descending
  const sortedValues = Object.keys(tileCounts)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-pop-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 text-center flex flex-col items-center gap-5 relative overflow-hidden">
        {/* Header Icon */}
        <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-[#FF6B81] shadow-inner">
          {isNewHighScore ? (
            <Trophy className="w-8 h-8 animate-bounce text-amber-500" />
          ) : (
            <Award className="w-8 h-8 text-[#FF6B81]" />
          )}
        </div>

        <div>
          <h2 className="text-3xl font-black text-[#414B57]">
            {isNewHighScore ? 'NEW HIGH SCORE!' : 'GAME OVER'}
          </h2>
          <p className="text-sm font-medium text-[#9BA5B1] mt-1">
            No more moves possible!
          </p>
        </div>

        {/* Score & High Score Cards */}
        <div className="grid grid-cols-2 gap-3 w-full">
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#9BA5B1]">
              Final Score
            </span>
            <span className="text-3xl font-black text-[#FF6B81] mt-0.5">
              {score.toLocaleString()}
            </span>
          </div>

          <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-600">
              Best
            </span>
            <span className="text-3xl font-black text-amber-700 mt-0.5">
              {highScore.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Highest Tile Badge */}
        {maxTile > 0 && (
          <div className="w-full bg-sky-50 border border-sky-100 rounded-2xl p-3 flex items-center justify-between px-4">
            <span className="text-xs font-semibold text-sky-700 uppercase">
              Highest Tile
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-sky-800">{maxTile}</span>
              <span className="text-xs text-sky-600">
                ({getTileFaceDetails(maxTile).label})
              </span>
            </div>
          </div>
        )}

        {/* Point Breakdown */}
        <div className="w-full text-left">
          <span className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2 block">
            Board Summary
          </span>
          <div className="max-h-36 overflow-y-auto pr-1 space-y-1.5 custom-scrollbar">
            {sortedValues.map((val) => {
              const count = tileCounts[val];
              const pointsEach = calculateTilePoints(val);
              const totalValPoints = pointsEach * count;

              return (
                <div
                  key={val}
                  className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-slate-50 text-slate-600 border border-slate-100"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] text-white ${
                        val === 1
                          ? 'bg-[#65B2F1]'
                          : val === 2
                          ? 'bg-[#FF6B81]'
                          : 'bg-[#414B57]'
                      }`}
                    >
                      {val}
                    </span>
                    <span className="font-semibold">{count}× tile</span>
                  </div>
                  <span className="font-bold text-slate-700">
                    {totalValPoints > 0 ? `+${totalValPoints} pts` : '0 pts'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Restart Button */}
        <button
          onClick={onRestart}
          className="w-full py-4 px-6 rounded-2xl bg-[#FF6B81] hover:bg-[#e05263] active:scale-95 text-white font-bold text-base shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer mt-1"
        >
          <RotateCcw className="w-5 h-5" />
          TRY AGAIN
        </button>
      </div>
    </div>
  );
};
