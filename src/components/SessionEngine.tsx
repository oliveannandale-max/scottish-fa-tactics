import React, { useState, useEffect } from 'react';
import { 
  LicenceTier, 
  TacticalPhase, 
  TeamUnit, 
  SessionStage, 
  SessionPlan, 
  LiveStoppagePin,
  InterventionType,
  TacticalPremise,
  BridgedAlternative,
  PlayerNode
} from '../types/tactics';
import { 
  ClipboardCheck, 
  Play, 
  CheckCircle2, 
  Lock, 
  Unlock, 
  Clock, 
  Flag, 
  Sparkles, 
  AlertCircle, 
  ArrowRight, 
  RotateCcw,
  BookOpen,
  Volume2
} from 'lucide-react';

interface SessionEngineProps {
  licenceTier: LicenceTier;
  session: SessionPlan;
  onUpdateSession: (updated: Partial<SessionPlan>) => void;
  stage: SessionStage;
  onSetStage: (stage: SessionStage) => void;
  players: PlayerNode[];
  onAddStoppagePin: (pin: LiveStoppagePin) => void;
  onSessionReflected: (reflectionData: { wasBridgedRecognized: boolean; successRate: number; feedback: string }) => void;
  isPitchUnlocked: boolean;
  onUnlockPitch: () => void;
}

export const SessionEngine: React.FC<SessionEngineProps> = ({
  licenceTier,
  session,
  onUpdateSession,
  stage,
  onSetStage,
  players,
  onAddStoppagePin,
  onSessionReflected,
  isPitchUnlocked,
  onUnlockPitch
}) => {
  // Plan State
  const [phaseChoice, setPhaseChoice] = useState<TacticalPhase>(session.phase);
  const [unitChoice, setUnitChoice] = useState<TeamUnit>(session.focusedUnit);
  const [objectiveInput, setObjectiveInput] = useState<string>(
    session.primaryObjective || 'Break opposing Midfield Line via No. 6 Pivot into Right Half-Space'
  );

  // Coach Scenario Builder State
  const [premiseFrom, setPremiseFrom] = useState<string>(players[3]?.id || 'p4');
  const [premiseTo, setPremiseTo] = useState<string>(players[5]?.id || 'p6');
  const [bridgedProblem, setBridgedProblem] = useState<string>(
    'Opponent No. 10 cuts off central passing lane to Pivot No. 6'
  );
  const [bridgedFrom, setBridgedFrom] = useState<string>(players[3]?.id || 'p4');
  const [bridgedTo, setBridgedTo] = useState<string>(players[1]?.id || 'p2');
  const [isBridgedMapped, setIsBridgedMapped] = useState<boolean>(!!session.bridgedAlternative?.mapped);

  // Intervention Pin Form
  const [pinType, setPinType] = useState<InterventionType>('CONCURRENT');
  const [pinCue, setPinCue] = useState<string>('Check shoulder before receiving');
  const [pinQuestion, setPinQuestion] = useState<string>('What did you see before the pass was played?');

  // Enforced Practice Timer
  const [activeTimerIndex, setActiveTimerIndex] = useState<number>(0);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState<number>(7 * 60);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);

  const practicePhases = licenceTier === 'UEFA_C' 
    ? [
        { name: 'Drill / Technical Foundation', minutes: 7 },
        { name: 'Game Related Practice (GRP)', minutes: 7 },
        { name: 'Conditioned Game / Shaping', minutes: 12 }
      ]
    : [
        { name: 'Warm-up / Functional Activation', minutes: 7 },
        { name: 'Game Related Practice (GRP)', minutes: 7 },
        { name: 'Conditioned Match Practice', minutes: 6 }
      ];

  useEffect(() => {
    let interval: any = null;
    if (timerRunning && timerSecondsLeft > 0) {
      interval = setInterval(() => {
        setTimerSecondsLeft(prev => prev - 1);
      }, 1000);
    } else if (timerSecondsLeft === 0 && timerRunning) {
      setTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerSecondsLeft]);

  const switchPracticePhase = (index: number) => {
    setActiveTimerIndex(index);
    setTimerSecondsLeft(practicePhases[index].minutes * 60);
    setTimerRunning(false);
  };

  // Reflection Form State
  const [recognizedChoice, setRecognizedChoice] = useState<boolean>(true);
  const [successScore, setSuccessScore] = useState<number>(80);
  const [reflectionNotes, setReflectionNotes] = useState<string>(
    'Players successfully shifted to the bridged alternative (wide fullback outlet) when the central lane was blocked 8 out of 10 repetitions.'
  );

  const handleUnlockPitch = () => {
    if (!objectiveInput.trim()) return;
    onUpdateSession({
      phase: phaseChoice,
      focusedUnit: unitChoice,
      primaryObjective: objectiveInput,
      unlocked: true
    });
    onUnlockPitch();
    onSetStage('COACH');
  };

  const handleCommitPremise = () => {
    const premise: TacticalPremise = {
      id: 'premise-1',
      title: 'Primary Option (A)',
      description: 'Break line into central pivot',
      fromPlayerId: premiseFrom,
      toPlayerId: premiseTo,
      type: 'PASS'
    };
    onUpdateSession({ premise });
  };

  const handleCommitBridged = () => {
    const bridged: BridgedAlternative = {
      id: 'bridged-1',
      problemTrigger: bridgedProblem,
      actionSolution: 'Bounce wide or switch to weak-side FB',
      fromPlayerId: bridgedFrom,
      toPlayerId: bridgedTo,
      mapped: true
    };
    setIsBridgedMapped(true);
    onUpdateSession({ bridgedAlternative: bridged });
  };

  const handleDropInterventionPin = () => {
    const newPin: LiveStoppagePin = {
      id: `pin-${Date.now()}`,
      x: 50,
      y: 50,
      type: pinType,
      cueTrigger: pinCue,
      coachingQuestion: pinQuestion,
      unitInvolved: unitChoice,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    onAddStoppagePin(newPin);
  };

  const handleCompleteReflection = () => {
    onSessionReflected({
      wasBridgedRecognized: recognizedChoice,
      successRate: successScore,
      feedback: reflectionNotes
    });
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full tactical-glass p-5 rounded-xl border border-slate-800 shadow-xl flex flex-col gap-4">
      {/* Stage Navigation Stepper */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-sky-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            SFA Session Engine (Plan • Coach • Reflect)
          </h3>
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <button
            onClick={() => onSetStage('PLAN')}
            className={`px-3 py-1 rounded-md font-semibold transition-all ${
              stage === 'PLAN' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            1. Plan
          </button>
          <ArrowRight className="w-3 h-3 text-slate-600" />
          <button
            onClick={() => isPitchUnlocked && onSetStage('COACH')}
            disabled={!isPitchUnlocked}
            className={`px-3 py-1 rounded-md font-semibold transition-all ${
              stage === 'COACH' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white disabled:opacity-40'
            }`}
          >
            2. Coach
          </button>
          <ArrowRight className="w-3 h-3 text-slate-600" />
          <button
            onClick={() => isBridgedMapped && onSetStage('REFLECT')}
            disabled={!isBridgedMapped}
            className={`px-3 py-1 rounded-md font-semibold transition-all ${
              stage === 'REFLECT' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white disabled:opacity-40'
            }`}
          >
            3. Reflect
          </button>
        </div>
      </div>

      {/* STAGE 1: PLAN (Enforced Scaffolding Gate) */}
      {stage === 'PLAN' && (
        <div className="flex flex-col gap-3">
          <div className="p-3 rounded-lg bg-sky-950/40 border border-sky-800/60 flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300">
              <span className="font-bold text-sky-300">Scottish FA Enforced Gate: </span>
              In accordance with UEFA coaching methodology, you must explicitly declare your Tactical Phase, Coaching Unit, and SFA Primary Objective before the tactical pitch board unlocks.
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            {/* Tactical Phase Choice */}
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Tactical Phase</label>
              <select
                value={phaseChoice}
                onChange={(e) => setPhaseChoice(e.target.value as TacticalPhase)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-sky-400"
              >
                <option value="IP">In Possession (IP) - Attacking Shape</option>
                <option value="OOP">Out of Possession (OOP) - Defending Block</option>
                <option value="TRANSITION">Transition (A2D or D2A)</option>
              </select>
            </div>

            {/* Target Unit Choice */}
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Target Tactical Unit</label>
              <select
                value={unitChoice}
                onChange={(e) => setUnitChoice(e.target.value as TeamUnit)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-sky-400"
              >
                <option value="MIDFIELD">Midfield Three (Single Pivot + Interiors)</option>
                <option value="GK_DEFENCE">Back Four & Goalkeeper</option>
                <option value="ATTACK">Attacking Front Three</option>
                <option value="ALL">Full Team 11v11</option>
              </select>
            </div>
          </div>

          {/* Primary Objective Input */}
          <div>
            <label className="block text-slate-400 font-semibold text-xs mb-1">
              Scottish FA Primary Coaching Objective
            </label>
            <textarea
              rows={2}
              value={objectiveInput}
              onChange={(e) => setObjectiveInput(e.target.value)}
              placeholder="e.g. Breaking the midfield line through Central Pivot; developing 3rd-man runs into half-spaces..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-sky-400"
            />
          </div>

          <button
            onClick={handleUnlockPitch}
            className="w-full py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 transition-all cursor-pointer"
          >
            <Unlock className="w-4 h-4" />
            Validate Session Plan & Unlock Tactical Pitch
          </button>
        </div>
      )}

      {/* STAGE 2: COACH (The Scenario Builder & Practice Timings) */}
      {stage === 'COACH' && (
        <div className="flex flex-col gap-4">
          {/* Practice Timings Enforced Block */}
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                SFA Enforced Timings Clock
              </span>
              <div className="font-mono text-sm font-bold text-amber-400">
                {formatTimer(timerSecondsLeft)}
              </div>
            </div>

            {/* Practice Step Selector */}
            <div className="grid grid-cols-3 gap-1.5 mb-2.5">
              {practicePhases.map((phase, idx) => (
                <button
                  key={phase.name}
                  onClick={() => switchPracticePhase(idx)}
                  className={`p-1.5 rounded text-[11px] text-center font-medium border transition-all ${
                    activeTimerIndex === idx
                      ? 'bg-amber-500/20 border-amber-500 text-amber-200'
                      : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="block font-bold truncate">{phase.name}</span>
                  <span className="text-[10px] text-slate-500 font-mono">({phase.minutes}m)</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setTimerRunning(!timerRunning)}
              className={`w-full py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                timerRunning
                  ? 'bg-red-600 hover:bg-red-500 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              <Play className="w-3 h-3" />
              {timerRunning ? 'PAUSE PRACTICE TIMING' : 'START REPETITION TIMER'}
            </button>
          </div>

          {/* Premise & Bridged Alternative Mapping */}
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-400">
                Methodology Loop: Premise (A) → Bridged Alternative (B)
              </span>
              {isBridgedMapped ? (
                <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Bridged Mapped
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] text-amber-400 font-bold">
                  <AlertCircle className="w-3.5 h-3.5" /> Bridged Required
                </span>
              )}
            </div>

            {/* Premise Mapping */}
            <div className="p-2.5 rounded bg-slate-950/70 border border-slate-800 text-xs">
              <span className="font-bold text-sky-300 block mb-1">
                1. The Premise (Primary Passing Option)
              </span>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">From:</span>
                <select
                  value={premiseFrom}
                  onChange={(e) => setPremiseFrom(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-xs"
                >
                  {players.map(p => (
                    <option key={p.id} value={p.id}>#{p.number} {p.name}</option>
                  ))}
                </select>
                <span className="text-slate-400">To:</span>
                <select
                  value={premiseTo}
                  onChange={(e) => setPremiseTo(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-xs"
                >
                  {players.map(p => (
                    <option key={p.id} value={p.id}>#{p.number} {p.name}</option>
                  ))}
                </select>
                <button
                  onClick={handleCommitPremise}
                  className="ml-auto px-2.5 py-1 rounded bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs"
                >
                  Map Premise
                </button>
              </div>
            </div>

            {/* Bridged Alternative Mapping */}
            <div className="p-2.5 rounded bg-amber-950/20 border border-amber-800/40 text-xs">
              <span className="font-bold text-amber-300 block mb-1">
                2. Bridged Alternative ("What if primary option is blocked?")
              </span>
              <input
                type="text"
                value={bridgedProblem}
                onChange={(e) => setBridgedProblem(e.target.value)}
                placeholder="Trigger: Opponent cuts off pass..."
                className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-xs mb-2"
              />
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Solution From:</span>
                <select
                  value={bridgedFrom}
                  onChange={(e) => setBridgedFrom(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-xs"
                >
                  {players.map(p => (
                    <option key={p.id} value={p.id}>#{p.number} {p.name}</option>
                  ))}
                </select>
                <span className="text-slate-400">To:</span>
                <select
                  value={bridgedTo}
                  onChange={(e) => setBridgedTo(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-xs"
                >
                  {players.map(p => (
                    <option key={p.id} value={p.id}>#{p.number} {p.name}</option>
                  ))}
                </select>
                <button
                  onClick={handleCommitBridged}
                  className="ml-auto px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs"
                >
                  Commit Bridged
                </button>
              </div>
            </div>
          </div>

          {/* Live Stoppage Intervention Pin Dropper */}
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex flex-col gap-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Flag className="w-3.5 h-3.5 text-red-400" />
                Drop Live Stoppage Coaching Pin
              </span>
              <span className="text-[10px] text-slate-500">Scottish FA Cues</span>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {(['CONCURRENT', 'TERMINAL', 'COACHING_IN_THE_GAME'] as InterventionType[]).map(t => (
                <button
                  key={t}
                  onClick={() => setPinType(t)}
                  className={`py-1 px-2 rounded text-[10px] font-bold border transition-all ${
                    pinType === t
                      ? 'bg-red-500/20 border-red-500 text-red-300'
                      : 'bg-slate-800/40 border-slate-700 text-slate-400'
                  }`}
                >
                  {t.replace(/_/g, ' ')}
                </button>
              ))}
            </div>

            <input
              type="text"
              value={pinCue}
              onChange={(e) => setPinCue(e.target.value)}
              placeholder="SFA Coaching Cue (e.g. Body shape open)..."
              className="bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-white text-xs"
            />

            <input
              type="text"
              value={pinQuestion}
              onChange={(e) => setPinQuestion(e.target.value)}
              placeholder="Reflective Question (e.g. What were your passing options?)..."
              className="bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-white text-xs"
            />

            <button
              onClick={handleDropInterventionPin}
              className="w-full py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-1.5"
            >
              <Flag className="w-3.5 h-3.5" />
              Drop Pin onto Pitch
            </button>
          </div>

          {/* Proceed to Reflection Button (Locked until Bridged Alternative is mapped) */}
          <button
            onClick={() => onSetStage('REFLECT')}
            disabled={!isBridgedMapped}
            className={`w-full py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all ${
              isBridgedMapped
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
            }`}
          >
            {isBridgedMapped ? 'Conclude Practice & Open Reflection (Reflect Stage)' : 'Map Bridged Alternative to Unlock Reflection'}
          </button>
        </div>
      )}

      {/* STAGE 3: REFLECT (Post-Session Evaluation & TPPS Updating) */}
      {stage === 'REFLECT' && (
        <div className="flex flex-col gap-3 text-xs">
          <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/60">
            <span className="font-bold text-emerald-300 block mb-1">
              Scottish FA Mandatory Post-Session Reflection
            </span>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Did players recognize and execute the Bridged Alternative when the Premise was blocked? Your evaluation directly updates historical player development snapshots.
            </p>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">
              Was the Bridged Alternative recognized organically?
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setRecognizedChoice(true)}
                className={`py-2 px-3 rounded-lg border font-bold transition-all ${
                  recognizedChoice
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                Yes - Recognized
              </button>
              <button
                onClick={() => setRecognizedChoice(false)}
                className={`py-2 px-3 rounded-lg border font-bold transition-all ${
                  !recognizedChoice
                    ? 'bg-red-500/20 border-red-500 text-red-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                No - Required Coaching Stoppage
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-400 font-semibold">
                Unit Execution Success Rate:
              </label>
              <span className="font-mono font-bold text-emerald-400">{successScore}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={successScore}
              onChange={(e) => setSuccessScore(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">
              Coach Qualitative Reflection (The Player & The Game)
            </label>
            <textarea
              rows={3}
              value={reflectionNotes}
              onChange={(e) => setReflectionNotes(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-400"
            />
          </div>

          <button
            onClick={handleCompleteReflection}
            className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            Submit SFA Evaluation & Update Player TPPS Growth
          </button>
        </div>
      )}
    </div>
  );
};
