import React from 'react';
import { LicenceTier, FormationName } from '../types/tactics';
import { 
  Shield, 
  Sparkles, 
  RotateCcw, 
  ChevronDown, 
  Lock, 
  Layers, 
  HelpCircle,
  Award
} from 'lucide-react';

interface LicenceTierHeaderProps {
  currentTier: LicenceTier;
  onSelectTier: (tier: LicenceTier) => void;
  formation: FormationName;
  onSelectFormation: (formation: FormationName) => void;
  onOpenAIModal: () => void;
  onResetPitch: () => void;
}

export const LicenceTierHeader: React.FC<LicenceTierHeaderProps> = ({
  currentTier,
  onSelectTier,
  formation,
  onSelectFormation,
  onOpenAIModal,
  onResetPitch
}) => {
  // Formations allowed per tier
  const getAvailableFormations = (): FormationName[] => {
    switch (currentTier) {
      case 'UEFA_C':
        return ['1-4-3-3']; // Locked
      case 'UEFA_B':
        return ['1-4-3-3', '1-4-4-2', '1-4-2-3-1', '1-3-5-2'];
      case 'UEFA_A':
        return ['1-4-3-3', '1-4-4-2', '1-4-2-3-1', '1-3-5-2', '1-4-4-2_TO_1-3-2-5'];
    }
  };

  const availableFormations = getAvailableFormations();

  return (
    <header className="w-full bg-slate-950/95 border-b border-slate-800 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-40 backdrop-blur-md">
      {/* Brand & Title */}
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-700 via-sky-600 to-amber-500 p-0.5 shadow-lg shadow-sky-500/20 flex items-center justify-center">
          <div className="w-full h-full bg-[#001f3f] rounded-[10px] flex items-center justify-center">
            <span className="font-extrabold text-amber-400 text-sm tracking-tight font-heading">SFA</span>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-extrabold text-white tracking-tight font-heading">
              Scottish FA UEFA Licence Tactical Platform
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
              DYNAMIC SCAFFOLDING
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Enforcing SFA Pedagogical Frameworks across UEFA C, B & A Licences
          </p>
        </div>
      </div>

      {/* Tier Selection Buttons */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
        <button
          onClick={() => onSelectTier('UEFA_C')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
            currentTier === 'UEFA_C'
              ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          UEFA C
          <span className="text-[10px] font-normal opacity-80">(Shaping 1-4-3-3)</span>
        </button>

        <button
          onClick={() => onSelectTier('UEFA_B')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
            currentTier === 'UEFA_B'
              ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          UEFA B
          <span className="text-[10px] font-normal opacity-80">(Functional)</span>
        </button>

        <button
          onClick={() => onSelectTier('UEFA_A')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
            currentTier === 'UEFA_A'
              ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          UEFA A
          <span className="text-[10px] font-normal opacity-80">(Game Models)</span>
        </button>
      </div>

      {/* Formation & AI Action Controls */}
      <div className="flex items-center gap-3">
        {/* Formation Dropdown */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs">
          <span className="text-slate-400 font-semibold flex items-center gap-1">
            {currentTier === 'UEFA_C' && <Lock className="w-3 h-3 text-amber-400" />}
            Formation:
          </span>
          <select
            value={formation}
            onChange={(e) => onSelectFormation(e.target.value as FormationName)}
            disabled={currentTier === 'UEFA_C'}
            className="bg-transparent text-white font-mono font-bold focus:outline-none cursor-pointer disabled:cursor-not-allowed"
          >
            {availableFormations.map(f => (
              <option key={f} value={f} className="bg-slate-900 text-white">
                {f.replace('_TO_', ' → ')}
              </option>
            ))}
          </select>
        </div>

        {/* Scottish FA AI Advisor Button */}
        <button
          onClick={onOpenAIModal}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white font-bold text-xs shadow-md shadow-sky-500/20 transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
          SFA AI Advisor
        </button>

        {/* Reset Board */}
        <button
          onClick={onResetPitch}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
          title="Reset tactical positions to default formation"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
