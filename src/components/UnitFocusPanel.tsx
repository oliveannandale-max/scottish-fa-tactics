import React from 'react';
import { TeamUnit, LicenceTier } from '../types/tactics';
import { UNIT_DETAILS } from '../data/mockTacticalData';
import { 
  Users, 
  Shield, 
  Activity, 
  Target, 
  HelpCircle, 
  Compass, 
  BookOpen,
  UserCheck
} from 'lucide-react';

interface UnitFocusPanelProps {
  focusedUnit: TeamUnit;
  onSelectUnit: (unit: TeamUnit) => void;
  licenceTier: LicenceTier;
}

export const UnitFocusPanel: React.FC<UnitFocusPanelProps> = ({
  focusedUnit,
  onSelectUnit,
  licenceTier
}) => {
  const details = UNIT_DETAILS[focusedUnit];

  return (
    <div className="w-full tactical-glass p-5 rounded-xl border border-slate-800 shadow-xl flex flex-col gap-4">
      {/* Unit Selector Tabs */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-sky-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Unit Focus Mode (UEFA Criteria)
            </h3>
          </div>
          <span className="text-[10px] text-sky-400 font-mono px-2 py-0.5 rounded bg-sky-950/60 border border-sky-800">
            {licenceTier === 'UEFA_C' ? 'UEFA C Unit Focus' : 'Functional Interactions'}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-1.5 p-1 rounded-lg bg-slate-900 border border-slate-800 text-xs">
          <button
            onClick={() => onSelectUnit('ALL')}
            className={`py-1.5 px-2 rounded font-medium transition-all ${
              focusedUnit === 'ALL'
                ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Full Team
          </button>

          <button
            onClick={() => onSelectUnit('GK_DEFENCE')}
            className={`py-1.5 px-2 rounded font-medium transition-all ${
              focusedUnit === 'GK_DEFENCE'
                ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Back 4 & GK
          </button>

          <button
            onClick={() => onSelectUnit('MIDFIELD')}
            className={`py-1.5 px-2 rounded font-medium transition-all ${
              focusedUnit === 'MIDFIELD'
                ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Midfield 3
          </button>

          <button
            onClick={() => onSelectUnit('ATTACK')}
            className={`py-1.5 px-2 rounded font-medium transition-all ${
              focusedUnit === 'ATTACK'
                ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Front 3
          </button>
        </div>
      </div>

      {/* Focused Unit Header & UEFA Requirements */}
      <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800/80">
        <div className="flex items-center gap-2 mb-1.5 text-sky-400 font-semibold text-sm">
          <Target className="w-4 h-4 text-sky-400" />
          {details.name}
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          {details.uefaFocus}
        </p>

        {/* Physical & Physiological Profile */}
        <div className="mt-3 pt-3 border-t border-slate-800 flex items-start gap-2 text-xs">
          <Activity className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-300">Physical Profile & KPIs: </span>
            <span className="text-slate-400">{details.physicalKpi}</span>
          </div>
        </div>
      </div>

      {/* Scottish FA 4 Pillars Matrix */}
      <div>
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-sky-400" />
          Scottish FA Coaching Pillars
        </h4>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
            <span className="font-bold text-sky-400 block mb-1">The Coach</span>
            <span className="text-slate-300 text-[11px] leading-tight">
              {details.scottishFaMethodology.coach}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
            <span className="font-bold text-emerald-400 block mb-1">The Environment</span>
            <span className="text-slate-300 text-[11px] leading-tight">
              {details.scottishFaMethodology.environment}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
            <span className="font-bold text-amber-400 block mb-1">The Player</span>
            <span className="text-slate-300 text-[11px] leading-tight">
              {details.scottishFaMethodology.player}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
            <span className="font-bold text-purple-400 block mb-1">The Game</span>
            <span className="text-slate-300 text-[11px] leading-tight">
              {details.scottishFaMethodology.game}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
