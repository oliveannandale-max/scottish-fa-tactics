import React, { useState } from 'react';
import { 
  BlockHeight, 
  LicenceTier, 
  ShadowPlayerNode, 
  PitchCoordinates 
} from '../types/tactics';
import { 
  Bot, 
  Magnet, 
  SlidersVertical, 
  Tag, 
  AlertCircle, 
  ShieldAlert, 
  Zap, 
  Check,
  Plus
} from 'lucide-react';

interface OpponentAIEngineProps {
  licenceTier: LicenceTier;
  blockHeight: BlockHeight;
  onBlockHeightChange: (height: BlockHeight) => void;
  ballMagnetActive: boolean;
  onToggleBallMagnet: () => void;
  pressingTrapActive: boolean;
  onTogglePressingTrap: () => void;
  isTrapTriggered: boolean;
  shadowPlayers: ShadowPlayerNode[];
  onAddConstraint: (nodeId: string, constraint: string) => void;
  onRemoveConstraint: (nodeId: string, constraint: string) => void;
}

const AVAILABLE_CONSTRAINTS = [
  'Max 2 touches',
  'Passive Jockey',
  'Screen Central Pivot',
  'No tackling in half-spaces',
  'Force Play Wide',
  'Clear to Target Mini-Goal'
];

export const OpponentAIEngine: React.FC<OpponentAIEngineProps> = ({
  licenceTier,
  blockHeight,
  onBlockHeightChange,
  ballMagnetActive,
  onToggleBallMagnet,
  pressingTrapActive,
  onTogglePressingTrap,
  isTrapTriggered,
  shadowPlayers,
  onAddConstraint,
  onRemoveConstraint
}) => {
  const [selectedShadowId, setSelectedShadowId] = useState<string>(shadowPlayers[5]?.id || 's6');
  const [newConstraint, setNewConstraint] = useState<string>('Max 2 touches');

  const selectedNode = shadowPlayers.find(s => s.id === selectedShadowId);

  return (
    <div className="w-full tactical-glass p-5 rounded-xl border border-slate-800 shadow-xl flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-red-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Opponent AI Engine (The Shadow Team)
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleBallMagnet}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              ballMagnetActive
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/60 shadow-sm shadow-amber-500/30'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            <Magnet className="w-3.5 h-3.5" />
            Ball Magnet: {ballMagnetActive ? 'ACTIVE' : 'OFF'}
          </button>
        </div>
      </div>

      <p className="text-xs text-slate-400">
        The coach does not manually position 11 opponent nodes. Behavioral intents and tactical block heights automatically synchronize the defensive structure.
      </p>

      {/* Block Height Touchline Selector */}
      <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <SlidersVertical className="w-3.5 h-3.5 text-red-400" />
            Block Height Preset
          </span>
          <span className="text-[11px] font-mono font-bold text-red-400">
            {blockHeight.replace('_', ' ')}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onBlockHeightChange('LOW_BLOCK')}
            className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
              blockHeight === 'LOW_BLOCK'
                ? 'bg-red-500/20 border-red-500 text-red-200 shadow-md shadow-red-500/20'
                : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-white'
            }`}
          >
            <span className="block font-bold">Low Block</span>
            <span className="text-[10px] text-slate-400">Deep 18-yard box</span>
          </button>

          <button
            onClick={() => onBlockHeightChange('MID_BLOCK')}
            className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
              blockHeight === 'MID_BLOCK'
                ? 'bg-red-500/20 border-red-500 text-red-200 shadow-md shadow-red-500/20'
                : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-white'
            }`}
          >
            <span className="block font-bold">Mid Block</span>
            <span className="text-[10px] text-slate-400">Middle third compact</span>
          </button>

          <button
            onClick={() => onBlockHeightChange('HIGH_PRESS')}
            className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
              blockHeight === 'HIGH_PRESS'
                ? 'bg-red-500/20 border-red-500 text-red-200 shadow-md shadow-red-500/20'
                : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-white'
            }`}
          >
            <span className="block font-bold">High Press</span>
            <span className="text-[10px] text-slate-400">Aggressive step-up</span>
          </button>
        </div>
      </div>

      {/* UEFA A Feature: Pressing Traps */}
      {licenceTier === 'UEFA_A' && (
        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              UEFA A Pressing Trap Engine
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Opponent remains passive until ball enters trigger zone, triggering aggressive collapse.
            </p>
          </div>

          <button
            onClick={onTogglePressingTrap}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              pressingTrapActive
                ? isTrapTriggered
                  ? 'bg-red-600 text-white animate-pulse'
                  : 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
            }`}
          >
            {pressingTrapActive ? (isTrapTriggered ? 'TRAP ENGAGED!' : 'TRAP ARMED') : 'ACTIVATE TRAP'}
          </button>
        </div>
      )}

      {/* UEFA C & B: Constraint Tags */}
      <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-amber-400" />
            Shadow Node Constraint Tags (Pedagogical Conditions)
          </span>
          <span className="text-[10px] font-mono text-slate-400">UEFA C / B</span>
        </div>

        {/* Selected Shadow Node Selector */}
        <div className="flex items-center gap-2 mb-3">
          <select
            value={selectedShadowId}
            onChange={(e) => setSelectedShadowId(e.target.value)}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-red-400"
          >
            {shadowPlayers.map(s => (
              <option key={s.id} value={s.id}>
                #{s.number} {s.role} ({s.constraints?.length || 0} tags)
              </option>
            ))}
          </select>

          <select
            value={newConstraint}
            onChange={(e) => setNewConstraint(e.target.value)}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
          >
            {AVAILABLE_CONSTRAINTS.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <button
            onClick={() => {
              if (selectedShadowId && newConstraint) {
                onAddConstraint(selectedShadowId, newConstraint);
              }
            }}
            className="p-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white"
            title="Add constraint to selected node"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Active Constraints for Selected Node */}
        <div className="flex flex-wrap gap-1.5 min-h-[26px]">
          {selectedNode?.constraints && selectedNode.constraints.length > 0 ? (
            selectedNode.constraints.map(c => (
              <span
                key={c}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-red-950/80 border border-red-500/40 text-red-300 font-medium"
              >
                {c}
                <button
                  onClick={() => onRemoveConstraint(selectedNode.id, c)}
                  className="hover:text-white font-bold ml-1"
                >
                  ×
                </button>
              </span>
            ))
          ) : (
            <span className="text-[11px] text-slate-500 italic">No custom constraint tags on this node.</span>
          )}
        </div>
      </div>
    </div>
  );
};
