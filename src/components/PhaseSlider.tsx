import React from 'react';
import { TacticalPhase, LicenceTier } from '../types/tactics';
import { Shield, ArrowRightLeft, Crosshair, Layers, Zap } from 'lucide-react';

interface PhaseSliderProps {
  phase: TacticalPhase;
  phaseRatio: number; // 0 to 1
  onPhaseRatioChange: (ratio: number) => void;
  showRestDefence: boolean;
  onToggleRestDefence: () => void;
  licenceTier: LicenceTier;
}

export const PhaseSlider: React.FC<PhaseSliderProps> = ({
  phase,
  phaseRatio,
  onPhaseRatioChange,
  showRestDefence,
  onToggleRestDefence,
  licenceTier
}) => {
  const isUefaA = licenceTier === 'UEFA_A';

  return (
    <div className="w-full tactical-glass p-4 rounded-xl border border-slate-800 shadow-xl flex flex-col gap-3">
      {/* Top Labels */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ArrowRightLeft className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Tactical Phase Transition Slider
          </span>
        </div>

        <div className="flex items-center gap-3">
          {isUefaA && (
            <button
              onClick={onToggleRestDefence}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                showRestDefence 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/60 shadow-sm shadow-emerald-500/30' 
                  : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Rest-Defence Overlay (3+2)
            </button>
          )}

          <div className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-700 text-xs font-mono text-sky-400">
            Phase: <span className="font-bold text-white">{phase}</span> ({Math.round(phaseRatio * 100)}%)
          </div>
        </div>
      </div>

      {/* Slider Control */}
      <div className="relative flex items-center px-1">
        {/* Track gradient */}
        <div className="absolute left-0 right-0 h-3 rounded-full bg-gradient-to-r from-sky-900 via-purple-900 to-amber-900 opacity-60"></div>

        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={phaseRatio}
          onChange={(e) => onPhaseRatioChange(parseFloat(e.target.value))}
          className="relative z-10 w-full h-3 bg-transparent appearance-none cursor-pointer accent-sky-400 focus:outline-none"
        />
      </div>

      {/* Snap Buttons & Tactical Highlights */}
      <div className="grid grid-cols-3 gap-2 pt-1 text-center">
        <button
          onClick={() => onPhaseRatioChange(0)}
          className={`flex flex-col items-center p-2 rounded-lg border text-xs transition-all ${
            phaseRatio <= 0.15
              ? 'bg-sky-500/20 border-sky-400 text-sky-200 shadow-md shadow-sky-500/20'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/60'
          }`}
        >
          <div className="flex items-center gap-1 font-bold text-sky-400">
            <Shield className="w-3.5 h-3.5" /> Out of Possession (OOP)
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5">Compact lines, protect central corridor</span>
        </button>

        <button
          onClick={() => onPhaseRatioChange(0.5)}
          className={`flex flex-col items-center p-2 rounded-lg border text-xs transition-all ${
            phaseRatio > 0.15 && phaseRatio < 0.85
              ? 'bg-purple-500/20 border-purple-400 text-purple-200 shadow-md shadow-purple-500/20'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/60'
          }`}
        >
          <div className="flex items-center gap-1 font-bold text-purple-400">
            <Zap className="w-3.5 h-3.5" /> Transition Phase
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5">Ghosting vectors & recovery sprint paths</span>
        </button>

        <button
          onClick={() => onPhaseRatioChange(1)}
          className={`flex flex-col items-center p-2 rounded-lg border text-xs transition-all ${
            phaseRatio >= 0.85
              ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-md shadow-amber-500/20'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/60'
          }`}
        >
          <div className="flex items-center gap-1 font-bold text-amber-400">
            <Crosshair className="w-3.5 h-3.5" /> In Possession (IP)
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5">Maximal width, half-space penetration</span>
        </button>
      </div>
    </div>
  );
};
