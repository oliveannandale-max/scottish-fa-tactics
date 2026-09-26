import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  LicenceTier, 
  TacticalPhase, 
  TeamUnit, 
  FormationName, 
  BlockHeight, 
  PitchCoordinates, 
  PlayerNode, 
  ShadowPlayerNode, 
  LiveStoppagePin, 
  SessionStage, 
  SessionPlan 
} from './types/tactics';
import { 
  INITIAL_BLUE_PLAYERS, 
  INITIAL_SHADOW_PLAYERS 
} from './data/mockTacticalData';
import { LicenceTierHeader } from './components/LicenceTierHeader';
import { InteractivePitch } from './components/InteractivePitch';
import { PhaseSlider } from './components/PhaseSlider';
import { UnitFocusPanel } from './components/UnitFocusPanel';
import { OpponentAIEngine } from './components/OpponentAIEngine';
import { SessionEngine } from './components/SessionEngine';
import { TPPSRadarModal } from './components/TPPSRadarModal';
import { SFAMentorAIModal } from './components/SFAMentorAIModal';
import { 
  Activity, 
  Layers, 
  UserCheck, 
  Sparkles, 
  ChevronRight,
  Info
} from 'lucide-react';

export function App() {
  // Core Scaffolding State
  const [licenceTier, setLicenceTier] = useState<LicenceTier>('UEFA_C');
  const [formation, setFormation] = useState<FormationName>('1-4-3-3');
  
  // Tactical Phase & Slider (0 = OOP, 0.5 = TRANSITION, 1 = IP)
  const [phaseRatio, setPhaseRatio] = useState<number>(0);
  const phase: TacticalPhase = useMemo(() => {
    if (phaseRatio <= 0.25) return 'OOP';
    if (phaseRatio >= 0.75) return 'IP';
    return 'TRANSITION';
  }, [phaseRatio]);

  // Pitch Focus & Selection
  const [focusedUnit, setFocusedUnit] = useState<TeamUnit>('ALL');
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerNode | null>(null);

  // Tactical Pitch Entities
  const [players, setPlayers] = useState<PlayerNode[]>(INITIAL_BLUE_PLAYERS);
  const [shadowPlayers, setShadowPlayers] = useState<ShadowPlayerNode[]>(INITIAL_SHADOW_PLAYERS);
  const [ballCoord, setBallCoord] = useState<PitchCoordinates>({ x: 50, y: 50 });

  // Opponent AI Engine State
  const [blockHeight, setBlockHeight] = useState<BlockHeight>('MID_BLOCK');
  const [ballMagnetActive, setBallMagnetActive] = useState<boolean>(true);
  const [pressingTrapActive, setPressingTrapActive] = useState<boolean>(false);
  const [showRestDefence, setShowRestDefence] = useState<boolean>(false);

  // UEFA A Pressing Trap Zone bounds
  const pressingTrapZone = useMemo(() => ({
    minX: 48,
    maxX: 78,
    minY: 15,
    maxY: 45
  }), []);

  const isTrapTriggered = useMemo(() => {
    if (!pressingTrapActive) return false;
    return (
      ballCoord.x >= pressingTrapZone.minX &&
      ballCoord.x <= pressingTrapZone.maxX &&
      ballCoord.y >= pressingTrapZone.minY &&
      ballCoord.y <= pressingTrapZone.maxY
    );
  }, [pressingTrapActive, ballCoord, pressingTrapZone]);

  // Session Engine State (Plan -> Coach -> Reflect)
  const [stage, setStage] = useState<SessionStage>('PLAN');
  const [isPitchUnlocked, setIsPitchUnlocked] = useState<boolean>(false);
  const [session, setSession] = useState<SessionPlan>({
    id: 'sfa-session-01',
    licenceTier: 'UEFA_C',
    title: 'Midfield Unit Rotation & Line-Breaking Progression',
    pillar: 'THE_COACH',
    phase: 'IP',
    focusedUnit: 'MIDFIELD',
    primaryObjective: 'Developing 3rd-Man Passing Channels through Central Pivot into Half-Spaces',
    unlocked: false,
    timings: {
      drillMinutes: 7,
      grpMinutes: 7,
      gameMinutes: 12
    },
    stoppages: []
  });

  // AI Modal
  const [isAIModalOpen, setIsAIModalOpen] = useState<boolean>(false);

  // Handle Licence Tier Switch
  const handleSelectTier = (tier: LicenceTier) => {
    setLicenceTier(tier);
    if (tier === 'UEFA_C') {
      setFormation('1-4-3-3'); // Enforced lock
      setShowRestDefence(false);
      setPressingTrapActive(false);
    } else if (tier === 'UEFA_B') {
      setPressingTrapActive(false);
    } else if (tier === 'UEFA_A') {
      setShowRestDefence(true);
    }
  };

  // Shadow Team Ball Magnet Algorithm
  // Shifts shadow players towards the ball coordinate, factoring in block height
  useEffect(() => {
    if (!ballMagnetActive) return;

    setShadowPlayers(prevShadows => {
      return prevShadows.map(shadow => {
        // Base coordinate
        const base = shadow.baseCoord;

        // Block height vertical modifier (x-axis in pitch horizontal view)
        let blockXOffset = 0;
        if (blockHeight === 'LOW_BLOCK') blockXOffset = 8;     // Drop back towards their goal
        if (blockHeight === 'HIGH_PRESS') blockXOffset = -12;  // Push up aggressively towards center

        // Ball magnet shift: pull towards ball X and ball Y
        const dx = (ballCoord.x - base.x) * 0.18;
        const dy = (ballCoord.y - base.y) * 0.22;

        // Overload shift if pressing trap is triggered
        let trapXShift = 0;
        let trapYShift = 0;
        if (isTrapTriggered) {
          trapXShift = (ballCoord.x - base.x) * 0.35;
          trapYShift = (ballCoord.y - base.y) * 0.40;
        }

        const newX = Math.max(30, Math.min(95, base.x + blockXOffset + dx + trapXShift));
        const newY = Math.max(8, Math.min(92, base.y + dy + trapYShift));

        return {
          ...shadow,
          currentCoord: {
            x: Math.round(newX),
            y: Math.round(newY)
          }
        };
      });
    });
  }, [ballCoord, blockHeight, ballMagnetActive, isTrapTriggered]);

  // Player drag movement handler
  const handlePlayerMove = useCallback((playerId: string, newCoord: PitchCoordinates) => {
    setPlayers(prev => prev.map(p => {
      if (p.id !== playerId) return p;
      if (phaseRatio >= 0.5) {
        return { ...p, ipCoord: newCoord, currentCoord: newCoord };
      } else {
        return { ...p, oopCoord: newCoord, currentCoord: newCoord };
      }
    }));
  }, [phaseRatio]);

  // Add constraint tag to shadow player
  const handleAddConstraint = (nodeId: string, constraint: string) => {
    setShadowPlayers(prev => prev.map(s => {
      if (s.id !== nodeId) return s;
      const current = s.constraints || [];
      if (current.includes(constraint)) return s;
      return { ...s, constraints: [...current, constraint] };
    }));
  };

  const handleRemoveConstraint = (nodeId: string, constraint: string) => {
    setShadowPlayers(prev => prev.map(s => {
      if (s.id !== nodeId) return s;
      return { ...s, constraints: (s.constraints || []).filter(c => c !== constraint) };
    }));
  };

  // Add Stoppage Pin
  const handleAddStoppagePin = (pin: LiveStoppagePin) => {
    setSession(prev => ({
      ...prev,
      stoppages: [...prev.stoppages, pin]
    }));
  };

  // Reflection completed
  const handleSessionReflected = (reflectionData: { wasBridgedRecognized: boolean; successRate: number; feedback: string }) => {
    setSession(prev => ({
      ...prev,
      reflection: {
        wasBridgedRecognized: reflectionData.wasBridgedRecognized,
        successRate: reflectionData.successRate,
        coachNotes: reflectionData.feedback,
        playerFeedback: 'Unit cohesion verified under match conditions.',
        completedAt: new Date().toLocaleTimeString()
      }
    }));

    // Update player TPPS growth logs dynamically based on reflection!
    setPlayers(prev => prev.map(p => {
      const delta = reflectionData.wasBridgedRecognized ? 2 : 0;
      return {
        ...p,
        tpps: {
          ...p.tpps,
          psychological: Math.min(99, p.tpps.psychological + delta),
          social: Math.min(99, p.tpps.social + 1),
          history: [
            ...p.tpps.history,
            {
              date: new Date().toISOString().split('T')[0],
              phase: `Session: ${session.primaryObjective.slice(0, 24)}...`,
              technical: p.tpps.technical,
              physical: p.tpps.physical,
              psychological: Math.min(99, p.tpps.psychological + delta),
              social: Math.min(99, p.tpps.social + 1),
              notes: `Post-Session Reflection: ${reflectionData.feedback.slice(0, 60)}`
            }
          ]
        }
      };
    }));

    alert('Scottish FA Session Reflection Saved! Player TPPS development snapshots successfully updated.');
  };

  // Reset Pitch to default formation
  const handleResetPitch = () => {
    setPlayers(INITIAL_BLUE_PLAYERS);
    setShadowPlayers(INITIAL_SHADOW_PLAYERS);
    setBallCoord({ x: 50, y: 50 });
    setPhaseRatio(0);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation & Licence Tier Header */}
      <LicenceTierHeader
        currentTier={licenceTier}
        onSelectTier={handleSelectTier}
        formation={formation}
        onSelectFormation={setFormation}
        onOpenAIModal={() => setIsAIModalOpen(true)}
        onResetPitch={handleResetPitch}
      />

      {/* Main Tactical Cockpit */}
      <main className="flex-1 w-full px-4 lg:px-6 py-4 flex flex-col xl:flex-row gap-5 max-w-[1920px] mx-auto">
        {/* Left Column: Interactive Pitch & Phase Controls (The Core Dashboard) */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          {/* 2D Interactive Pitch */}
          <div className="relative w-full">
            <InteractivePitch
              licenceTier={licenceTier}
              phase={phase}
              phaseRatio={phaseRatio}
              focusedUnit={focusedUnit}
              players={players}
              shadowPlayers={shadowPlayers}
              onPlayerMove={handlePlayerMove}
              onSelectPlayer={setSelectedPlayer}
              selectedPlayerId={selectedPlayer?.id}
              ballCoord={ballCoord}
              onBallMove={setBallCoord}
              stoppages={session.stoppages}
              premise={session.premise}
              bridgedAlternative={session.bridgedAlternative}
              showRestDefence={showRestDefence}
              pressingTrapActive={pressingTrapActive}
              pressingTrapZone={pressingTrapZone}
              isTrapTriggered={isTrapTriggered}
            />

            {/* Pitch Locked Overlay during Plan Gate */}
            {!isPitchUnlocked && (
              <div className="absolute inset-0 z-30 bg-slate-950/75 backdrop-blur-[2px] rounded-2xl flex flex-col items-center justify-center p-6 text-center">
                <div className="p-4 rounded-full bg-sky-950/80 border border-sky-500/50 mb-3 text-sky-400">
                  <Activity className="w-8 h-8 animate-pulse" />
                </div>
                <h3 className="text-base font-bold text-white mb-1">
                  Tactical Board Locked — Scottish FA Gate Required
                </h3>
                <p className="text-xs text-slate-300 max-w-md mb-4 leading-relaxed">
                  Before free-drawing or moving nodes, you must complete the <span className="text-sky-400 font-bold">1. Plan</span> stage in the Session Engine panel to declare your Tactical Phase, Focused Unit, and Primary Objective.
                </p>
                <button
                  onClick={() => setIsPitchUnlocked(true)}
                  className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/30 transition-all cursor-pointer"
                >
                  Quick Unlock / Proceed to Coaching
                </button>
              </div>
            )}
          </div>

          {/* Phase Transition Slider (OOP <-> Transition <-> IP) */}
          <PhaseSlider
            phase={phase}
            phaseRatio={phaseRatio}
            onPhaseRatioChange={setPhaseRatio}
            showRestDefence={showRestDefence}
            onToggleRestDefence={() => setShowRestDefence(!showRestDefence)}
            licenceTier={licenceTier}
          />
        </div>

        {/* Right Sidebar: Methodology, Opponent AI, and Session Engine */}
        <div className="w-full xl:w-[480px] flex flex-col gap-4 shrink-0">
          {/* SFA Session Engine (Plan, Coach, Reflect) */}
          <SessionEngine
            licenceTier={licenceTier}
            session={session}
            onUpdateSession={(updated) => setSession(prev => ({ ...prev, ...updated }))}
            stage={stage}
            onSetStage={setStage}
            players={players}
            onAddStoppagePin={handleAddStoppagePin}
            onSessionReflected={handleSessionReflected}
            isPitchUnlocked={isPitchUnlocked}
            onUnlockPitch={() => setIsPitchUnlocked(true)}
          />

          {/* Unit Focus Panel */}
          <UnitFocusPanel
            focusedUnit={focusedUnit}
            onSelectUnit={setFocusedUnit}
            licenceTier={licenceTier}
          />

          {/* Opponent AI Engine (The Shadow Team) */}
          <OpponentAIEngine
            licenceTier={licenceTier}
            blockHeight={blockHeight}
            onBlockHeightChange={setBlockHeight}
            ballMagnetActive={ballMagnetActive}
            onToggleBallMagnet={() => setBallMagnetActive(!ballMagnetActive)}
            pressingTrapActive={pressingTrapActive}
            onTogglePressingTrap={() => setPressingTrapActive(!pressingTrapActive)}
            isTrapTriggered={isTrapTriggered}
            shadowPlayers={shadowPlayers}
            onAddConstraint={handleAddConstraint}
            onRemoveConstraint={handleRemoveConstraint}
          />
        </div>
      </main>

      {/* Holistic Player TPPS Radar Modal */}
      {selectedPlayer && (
        <TPPSRadarModal
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
        />
      )}

      {/* Scottish FA AI Coaching Advisor Modal */}
      {isAIModalOpen && (
        <SFAMentorAIModal
          licenceTier={licenceTier}
          phase={phase}
          focusedUnit={focusedUnit}
          primaryObjective={session.primaryObjective}
          onClose={() => setIsAIModalOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
