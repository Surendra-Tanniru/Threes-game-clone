import React from 'react';
import { Sparkles } from 'lucide-react';

interface NextTilePreviewProps {
  value: number;
  isBonusNext: boolean;
  deckCount: number;
}

export const NextTilePreview: React.FC<NextTilePreviewProps> = ({
  value,
  isBonusNext,
  deckCount,
}) => {
  let bgColor = 'bg-white';
  let textColor = 'text-[#414B57]';
  let shadowClass = 'tile-shadow-white';
  let label = `${value}`;

  if (value === 1) {
    bgColor = 'bg-[#65B2F1]';
    textColor = 'text-white';
    shadowClass = 'tile-shadow-blue';
  } else if (value === 2) {
    bgColor = 'bg-[#FF6B81]';
    textColor = 'text-white';
    shadowClass = 'tile-shadow-red';
  } else {
    if (isBonusNext) {
      shadowClass = 'tile-shadow-gold';
      label = '+';
    }
  }

  return (
    <div className="flex flex-col items-center">
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9BA5B1] mb-1.5">
        Next Tile
      </span>
      <div
        className={`w-12 h-14 sm:w-14 sm:h-16 rounded-xl ${bgColor} ${shadowClass} flex flex-col items-center justify-center relative transition-all duration-300 animate-pop-in`}
      >
        {isBonusNext && (
          <Sparkles className="w-3.5 h-3.5 text-amber-500 absolute top-1 right-1 animate-pulse" />
        )}
        <span
          className={`font-black ${textColor} ${
            label === '+' ? 'text-2xl text-amber-500' : 'text-xl sm:text-2xl'
          }`}
        >
          {label}
        </span>
      </div>
      <span className="text-[10px] text-[#9BA5B1] font-semibold mt-1">
        Bag: {deckCount}
      </span>
    </div>
  );
};
