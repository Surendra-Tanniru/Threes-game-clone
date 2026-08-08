import React from 'react';
import { X, HelpCircle, ArrowRight } from 'lucide-react';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-pop-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 flex flex-col gap-5 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-sky-100 text-sky-600 rounded-2xl">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800">
              How to Play Threes!
            </h2>
            <p className="text-xs text-slate-500">
              Swipe to shift tiles and combine identical values.
            </p>
          </div>
        </div>

        {/* Rule 1: 1 + 2 = 3 */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2">
          <h3 className="text-sm font-extrabold text-slate-700 uppercase tracking-wider">
            1. Blue + Red = Three
          </h3>
          <p className="text-xs text-slate-600">
            A <strong>1 (Blue)</strong> can ONLY merge with a <strong>2 (Red)</strong> to form a <strong>3 (White)</strong>.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <span className="w-10 h-12 bg-[#65B2F1] text-white font-bold rounded-xl flex items-center justify-center text-lg tile-shadow-blue">
              1
            </span>
            <span className="font-bold text-slate-400 text-lg">+</span>
            <span className="w-10 h-12 bg-[#FF6B81] text-white font-bold rounded-xl flex items-center justify-center text-lg tile-shadow-red">
              2
            </span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
            <span className="w-10 h-12 bg-white text-slate-800 font-bold rounded-xl flex items-center justify-center text-lg tile-shadow-white border border-slate-100">
              3
            </span>
          </div>
        </div>

        {/* Rule 2: Identical Twins */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2">
          <h3 className="text-sm font-extrabold text-slate-700 uppercase tracking-wider">
            2. Match Identical Twins
          </h3>
          <p className="text-xs text-slate-600">
            Tiles 3 and larger can ONLY merge with an identical twin (3+3=6, 6+6=12, 12+12=24).
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <span className="w-10 h-12 bg-white text-slate-800 font-bold rounded-xl flex items-center justify-center text-lg tile-shadow-white border border-slate-100">
              3
            </span>
            <span className="font-bold text-slate-400 text-lg">+</span>
            <span className="w-10 h-12 bg-white text-slate-800 font-bold rounded-xl flex items-center justify-center text-lg tile-shadow-white border border-slate-100">
              3
            </span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
            <span className="w-10 h-12 bg-white text-slate-800 font-bold rounded-xl flex items-center justify-center text-lg tile-shadow-white border border-slate-100">
              6
            </span>
          </div>
        </div>

        {/* Rule 3: 1-Step Shift */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-1">
          <h3 className="text-sm font-extrabold text-slate-700 uppercase tracking-wider">
            3. One Square Shift
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Unlike 2048, a swipe moves tiles <strong>ONLY ONE square</strong> at a time. The preview card on top spawns on the edge opposite to your swipe direction!
          </p>
        </div>

        {/* Controls */}
        <div className="bg-sky-50 rounded-2xl p-4 border border-sky-100 space-y-1">
          <h3 className="text-sm font-extrabold text-sky-800 uppercase tracking-wider">
            Controls
          </h3>
          <p className="text-xs text-sky-700">
            • Touch & drag on mobile screens.<br />
            • Arrow keys or WASD on desktop.<br />
            • Onscreen control arrows available at the bottom.
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-sm transition-colors cursor-pointer"
        >
          Got It, Let's Play!
        </button>
      </div>
    </div>
  );
};
