import React from 'react';
import { Tile } from '../types';
import { getTileFaceDetails } from '../utils/gameLogic';

interface TileViewProps {
  tile: Tile | null;
  sizeClass?: string;
}

export const TileView: React.FC<TileViewProps> = ({ tile }) => {
  if (!tile) {
    return (
      <div className="w-full h-full bg-[#9BA5B1]/15 rounded-xl border border-slate-200/40 flex items-center justify-center transition-all duration-150" />
    );
  }

  const { value, isNew, isMerged } = tile;
  const faceDetails = getTileFaceDetails(value);

  // Styling based on tile value
  let bgColor = 'bg-white';
  let textColor = 'text-[#414B57]';
  let shadowClass = 'tile-shadow-white';

  if (value === 1) {
    bgColor = 'bg-[#65B2F1]';
    textColor = 'text-white';
    shadowClass = 'tile-shadow-blue';
  } else if (value === 2) {
    bgColor = 'bg-[#FF6B81]';
    textColor = 'text-white';
    shadowClass = 'tile-shadow-red';
  } else {
    // 3 or greater
    if (value >= 192) {
      shadowClass = 'tile-shadow-gold';
    }
  }

  // Animation trigger class
  const animClass = isMerged
    ? 'animate-merge-pulse'
    : isNew
    ? 'animate-pop-in'
    : '';

  return (
    <div
      className={`relative w-full h-full rounded-xl ${bgColor} ${shadowClass} flex flex-col items-center justify-between p-2 md:p-2.5 select-none transition-transform duration-100 ${animClass}`}
    >
      {/* Top highlight bar */}
      <div className="w-full h-1 bg-white/20 rounded-full" />

      {/* Center Number */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <span
          className={`font-black tracking-tight ${textColor} ${
            value >= 1000
              ? 'text-xl sm:text-2xl md:text-3xl'
              : value >= 100
              ? 'text-2xl sm:text-3xl md:text-4xl'
              : 'text-3xl sm:text-4xl md:text-5xl'
          }`}
        >
          {value}
        </span>
      </div>

      {/* Bottom Personality / Face */}
      <div className="w-full flex items-center justify-center h-4">
        {value >= 3 && (
          <span className="text-[11px] sm:text-xs font-semibold text-[#9BA5B1] opacity-85 transition-opacity hover:opacity-100">
            {faceDetails.face}
          </span>
        )}
      </div>
    </div>
  );
};
