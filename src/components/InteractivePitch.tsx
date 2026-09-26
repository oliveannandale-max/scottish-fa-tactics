import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { 
  LicenceTier, 
  TacticalPhase, 
  TeamUnit, 
  PlayerNode, 
  ShadowPlayerNode, 
  PitchCoordinates,
  LiveStoppagePin,
  TacticalPremise,
  BridgedAlternative
} from '../types/tactics';
import { 
  Shield, 
  Flag, 
  AlertTriangle,
  Move,
  Layers
} from 'lucide-react';

interface InteractivePitchProps {
  licenceTier: LicenceTier;
  phase: TacticalPhase;
  phaseRatio: number; // 0 (OOP) to 1 (IP)
  focusedUnit: TeamUnit;
  players: PlayerNode[];
  shadowPlayers: ShadowPlayerNode[];
  onPlayerMove: (playerId: string, newCoord: PitchCoordinates) => void;
  onSelectPlayer: (player: PlayerNode) => void;
  selectedPlayerId?: string;
  ballCoord: PitchCoordinates;
  onBallMove: (newCoord: PitchCoordinates) => void;
  stoppages: LiveStoppagePin[];
  onAddStoppage?: (pin: Omit<LiveStoppagePin, 'id' | 'timestamp'>) => void;
  onSelectStoppage?: (pin: LiveStoppagePin) => void;
  premise?: TacticalPremise;
  bridgedAlternative?: BridgedAlternative;
  showRestDefence: boolean;
  pressingTrapActive: boolean;
  pressingTrapZone?: { minX: number; maxX: number; minY: number; maxY: number };
  isTrapTriggered?: boolean;
}

export const InteractivePitch: React.FC<InteractivePitchProps> = ({
  licenceTier,
  phase,
  phaseRatio,
  focusedUnit,
  players,
  shadowPlayers,
  onPlayerMove,
  onSelectPlayer,
  selectedPlayerId,
  ballCoord,
  onBallMove,
  stoppages,
  onSelectStoppage,
  premise,
  bridgedAlternative,
  showRestDefence,
  pressingTrapActive,
  pressingTrapZone = { minX: 45, maxX: 75, minY: 15, maxY: 45 },
  isTrapTriggered = false
}) => {
  const pitchRef = useRef<SVGSVGElement | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [isDraggingBall, setIsDraggingBall] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const isHalfPitch = licenceTier === 'UEFA_C';

  // Helper to map 0-100 coordinates to pitch SVG viewBox
  // Full pitch: 0 to 1050 width, 0 to 680 height
  // Half pitch: 525 to 1050 width, 0 to 680 height (or scaled)
  const pitchWidth = 1050;
  const pitchHeight = 680;

  const toSvgX = useCallback((xPercent: number) => {
    if (isHalfPitch) {
      // Half pitch takes x from 45% to 100% and scales across view
      return 50 + (xPercent / 100) * (pitchWidth - 100);
    }
    return (xPercent / 100) * pitchWidth;
  }, [isHalfPitch]);

  const toSvgY = useCallback((yPercent: number) => {
    return (yPercent / 100) * pitchHeight;
  }, []);

  const fromSvgToPercent = useCallback((clientX: number, clientY: number) => {
    if (!pitchRef.current) return { x: 50, y: 50 };
    const rect = pitchRef.current.getBoundingClientRect();
    const xRatio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const yRatio = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    return {
      x: Math.round(xRatio * 100),
      y: Math.round(yRatio * 100)
    };
  }, []);

  // Handle Dragging
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (isDraggingBall) {
        const coords = fromSvgToPercent(e.clientX, e.clientY);
        onBallMove(coords);
      } else if (draggingId) {
        const coords = fromSvgToPercent(e.clientX, e.clientY);
        onPlayerMove(draggingId, coords);
      }
    };

    const handlePointerUp = () => {
      setDraggingId(null);
      setIsDraggingBall(false);
    };

    if (draggingId || isDraggingBall) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [draggingId, isDraggingBall, fromSvgToPercent, onBallMove, onPlayerMove]);

  // Interpolated player positions based on phaseRatio (0 = OOP, 1 = IP)
  const getInterpolatedCoord = (p: PlayerNode): PitchCoordinates => {
    const oop = p.oopCoord;
    const ip = p.ipCoord;
    return {
      x: oop.x + (ip.x - oop.x) * phaseRatio,
      y: oop.y + (ip.y - oop.y) * phaseRatio
    };
  };

  // Rest-Defence polygon: In UEFA A, 4-5 players stay behind the ball in IP (typically GK, CB1, CB2, FB, No. 6)
  const restDefencePlayers = players.filter(p => 
    p.unit === 'GK_DEFENCE' || (p.unit === 'MIDFIELD' && p.role.includes('Pivot'))
  );

  const restDefencePoints = restDefencePlayers
    .map(p => {
      const coord = getInterpolatedCoord(p);
      return `${toSvgX(coord.x)},${toSvgY(coord.y)}`;
    })
    .join(' ');

  // Premise line coordinates
  const premiseFrom = players.find(p => p.id === premise?.fromPlayerId);
  const premiseTo = players.find(p => p.id === premise?.toPlayerId);

  // Bridged Alternative line coordinates
  const bridgedFrom = players.find(p => p.id === bridgedAlternative?.fromPlayerId);
  const bridgedTo = players.find(p => p.id === bridgedAlternative?.toPlayerId);

  return (
    <div className="relative w-full h-full flex flex-col items-center select-none overflow-hidden rounded-2xl border border-slate-700/60 shadow-2xl bg-slate-950">
      {/* Top Tactical HUD Bar */}
      <div className="w-full flex items-center justify-between px-5 py-2.5 bg-slate-900/90 backdrop-blur border-b border-slate-800 text-xs">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-sky-950 border border-sky-500/40 text-sky-300 font-mono font-bold tracking-wider">
            <Shield className="w-3.5 h-3.5 text-sky-400" />
            {licenceTier.replace('_', ' ')}
          </span>
          <span className="text-slate-400">
            {isHalfPitch ? 'Tactical Half-Pitch (16 Players Enforced)' : 'Full Pitch 11v11 Model'}
          </span>
        </div>

        {/* Dynamic Pitch Grid Indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-slate-300">
            <span className={`w-2 h-2 rounded-full ${phase === 'IP' ? 'bg-amber-400 animate-pulse' : phase === 'OOP' ? 'bg-sky-400 animate-pulse' : 'bg-purple-400'}`}></span>
            <span className="font-semibold uppercase tracking-wider">
              {phase === 'IP' ? 'In Possession (IP) - Width & Penetration' : phase === 'OOP' ? 'Out of Possession (OOP) - Compact Block' : 'Transition Phase'}
            </span>
          </div>

          {pressingTrapActive && (
            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-semibold ${isTrapTriggered ? 'bg-red-600/30 text-red-300 border border-red-500/60 animate-bounce' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'}`}>
              <AlertTriangle className="w-3 h-3 text-red-400" />
              {isTrapTriggered ? 'TRAP TRIGGERED!' : 'PRESS TRAP ARMED'}
            </div>
          )}

          {showRestDefence && phaseRatio > 0.4 && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 text-[11px] font-mono">
              <Layers className="w-3 h-3" />
              REST-DEFENCE 3+2
            </div>
          )}
        </div>
      </div>

      {/* Main Pitch SVG Container */}
      <div className="relative w-full flex-1 flex items-center justify-center p-3 bg-slate-950">
        <svg
          ref={pitchRef}
          viewBox={`0 0 ${pitchWidth} ${pitchHeight}`}
          className="w-full h-auto max-h-[78vh] rounded-xl shadow-2xl pitch-turf border-2 border-emerald-600/40"
          style={{ aspectRatio: '1050/680' }}
        >
          <defs>
            {/* Turf pattern lines */}
            <linearGradient id="grassStripe" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#0d552d" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#08381d" stopOpacity="0.9" />
            </linearGradient>

            {/* Glowing marker arrows */}
            <marker id="premiseArrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <polygon points="0 0, 7 3, 0 6" fill="#38bdf8" />
            </marker>
            <marker id="bridgedArrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <polygon points="0 0, 7 3, 0 6" fill="#f59e0b" />
            </marker>
            <marker id="ghostVector" markerWidth="6" markerHeight="6" refX="5" refY="2.5" orient="auto">
              <polygon points="0 0, 5 2.5, 0 5" fill="#94a3b8" />
            </marker>
          </defs>

          {/* Grass Alternating Stripes */}
          {[...Array(12)].map((_, i) => (
            <rect
              key={i}
              x={(pitchWidth / 12) * i}
              y={0}
              width={pitchWidth / 12}
              height={pitchHeight}
              fill={i % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'rgba(0,0,0,0.06)'}
            />
          ))}

          {/* Dynamic Grid: Horizontal Channels */}
          {/* Channel 1: Left Wide (0% - 18%) */}
          <rect
            x={0}
            y={0}
            width={pitchWidth}
            height={pitchHeight * 0.18}
            fill={phaseRatio > 0.6 ? 'rgba(56, 189, 248, 0.05)' : 'transparent'}
            stroke="rgba(255, 255, 255, 0.05)"
            strokeDasharray="4 6"
          />
          {/* Channel 2: Left Half-Space (18% - 36%) */}
          <rect
            x={0}
            y={pitchHeight * 0.18}
            width={pitchWidth}
            height={pitchHeight * 0.18}
            fill={phaseRatio > 0.6 ? 'rgba(245, 158, 11, 0.04)' : 'transparent'}
            stroke="rgba(255, 255, 255, 0.06)"
            strokeDasharray="4 6"
          />
          {/* Channel 3: Central Corridor (36% - 64%) */}
          <rect
            x={0}
            y={pitchHeight * 0.36}
            width={pitchWidth}
            height={pitchHeight * 0.28}
            fill={phaseRatio < 0.4 ? 'rgba(56, 189, 248, 0.08)' : 'transparent'}
            stroke="rgba(255, 255, 255, 0.08)"
            strokeDasharray="4 6"
          />
          {/* Channel 4: Right Half-Space (64% - 82%) */}
          <rect
            x={0}
            y={pitchHeight * 0.64}
            width={pitchWidth}
            height={pitchHeight * 0.18}
            fill={phaseRatio > 0.6 ? 'rgba(245, 158, 11, 0.04)' : 'transparent'}
            stroke="rgba(255, 255, 255, 0.06)"
            strokeDasharray="4 6"
          />
          {/* Channel 5: Right Wide (82% - 100%) */}
          <rect
            x={0}
            y={pitchHeight * 0.82}
            width={pitchWidth}
            height={pitchHeight * 0.18}
            fill={phaseRatio > 0.6 ? 'rgba(56, 189, 248, 0.05)' : 'transparent'}
            stroke="rgba(255, 255, 255, 0.05)"
            strokeDasharray="4 6"
          />

          {/* Vertical Thirds (Defensive, Middle, Attacking) */}
          <line
            x1={pitchWidth * 0.333}
            y1={0}
            x2={pitchWidth * 0.333}
            y2={pitchHeight}
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth="1.5"
            strokeDasharray="6 8"
          />
          <line
            x1={pitchWidth * 0.666}
            y1={0}
            x2={pitchWidth * 0.666}
            y2={pitchHeight}
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth="1.5"
            strokeDasharray="6 8"
          />

          {/* Thirds Labels */}
          <text x={pitchWidth * 0.166} y={30} fill="rgba(255,255,255,0.25)" fontSize="12" fontWeight="600" textAnchor="middle" letterSpacing="2">DEFENSIVE THIRD</text>
          <text x={pitchWidth * 0.5} y={30} fill="rgba(255,255,255,0.25)" fontSize="12" fontWeight="600" textAnchor="middle" letterSpacing="2">MIDDLE THIRD</text>
          <text x={pitchWidth * 0.833} y={30} fill="rgba(255,255,255,0.25)" fontSize="12" fontWeight="600" textAnchor="middle" letterSpacing="2">ATTACKING THIRD</text>

          {/* Outer Boundary Line */}
          <rect
            x={30}
            y={30}
            width={pitchWidth - 60}
            height={pitchHeight - 60}
            fill="none"
            stroke="rgba(255, 255, 255, 0.8)"
            strokeWidth="2.5"
          />

          {/* Halfway Line */}
          <line
            x1={pitchWidth / 2}
            y1={30}
            x2={pitchWidth / 2}
            y2={pitchHeight - 30}
            stroke="rgba(255, 255, 255, 0.8)"
            strokeWidth="2.5"
          />

          {/* Center Circle & Spot */}
          <circle
            cx={pitchWidth / 2}
            cy={pitchHeight / 2}
            r={85}
            fill="none"
            stroke="rgba(255, 255, 255, 0.8)"
            strokeWidth="2.5"
          />
          <circle
            cx={pitchWidth / 2}
            cy={pitchHeight / 2}
            r={4}
            fill="rgba(255, 255, 255, 0.9)"
          />

          {/* Left Penalty Area (Defending End) */}
          <rect
            x={30}
            y={pitchHeight / 2 - 170}
            width={160}
            height={340}
            fill="none"
            stroke="rgba(255, 255, 255, 0.8)"
            strokeWidth="2.5"
          />
          {/* Left 6-Yard Box */}
          <rect
            x={30}
            y={pitchHeight / 2 - 85}
            width={55}
            height={170}
            fill="none"
            stroke="rgba(255, 255, 255, 0.8)"
            strokeWidth="2.5"
          />
          {/* Left Penalty Spot */}
          <circle cx={145} cy={pitchHeight / 2} r={3.5} fill="rgba(255, 255, 255, 0.9)" />
          {/* Left Goal */}
          <rect x={16} y={pitchHeight / 2 - 42} width={14} height={84} fill="none" stroke="rgba(255, 255, 255, 0.9)" strokeWidth="3" />

          {/* Right Penalty Area (Attacking End) */}
          <rect
            x={pitchWidth - 190}
            y={pitchHeight / 2 - 170}
            width={160}
            height={340}
            fill="none"
            stroke="rgba(255, 255, 255, 0.8)"
            strokeWidth="2.5"
          />
          {/* Right 6-Yard Box */}
          <rect
            x={pitchWidth - 85}
            y={pitchHeight / 2 - 85}
            width={55}
            height={170}
            fill="none"
            stroke="rgba(255, 255, 255, 0.8)"
            strokeWidth="2.5"
          />
          {/* Right Penalty Spot */}
          <circle cx={pitchWidth - 145} cy={pitchHeight / 2} r={3.5} fill="rgba(255, 255, 255, 0.9)" />
          {/* Right Goal */}
          <rect x={pitchWidth - 30} y={pitchHeight / 2 - 42} width={14} height={84} fill="none" stroke="rgba(255, 255, 255, 0.9)" strokeWidth="3" />

          {/* UEFA C Constraint Overlay (Half Pitch Restriction Shading) */}
          {isHalfPitch && (
            <rect
              x={0}
              y={0}
              width={pitchWidth / 2}
              height={pitchHeight}
              fill="rgba(2, 6, 23, 0.75)"
              stroke="rgba(239, 68, 68, 0.3)"
              strokeDasharray="8 8"
            />
          )}
          {isHalfPitch && (
            <text
              x={pitchWidth / 4}
              y={pitchHeight / 2}
              fill="rgba(239, 68, 68, 0.6)"
              fontSize="16"
              fontWeight="bold"
              textAnchor="middle"
            >
              UEFA C: LOCKED TO HALF-PITCH (16 PLAYERS)
            </text>
          )}

          {/* Pressing Trap Trigger Zone (UEFA A) */}
          {pressingTrapActive && (
            <g>
              <rect
                x={toSvgX(pressingTrapZone.minX)}
                y={toSvgY(pressingTrapZone.minY)}
                width={toSvgX(pressingTrapZone.maxX) - toSvgX(pressingTrapZone.minX)}
                height={toSvgY(pressingTrapZone.maxY) - toSvgY(pressingTrapZone.minY)}
                fill={isTrapTriggered ? 'rgba(239, 68, 68, 0.35)' : 'rgba(245, 158, 11, 0.2)'}
                stroke={isTrapTriggered ? '#ef4444' : '#f59e0b'}
                strokeWidth="2.5"
                strokeDasharray="6 4"
                rx={8}
                className={isTrapTriggered ? 'animate-pulse' : ''}
              />
              <text
                x={(toSvgX(pressingTrapZone.minX) + toSvgX(pressingTrapZone.maxX)) / 2}
                y={toSvgY(pressingTrapZone.minY) + 20}
                fill={isTrapTriggered ? '#fca5a5' : '#fde68a'}
                fontSize="11"
                fontWeight="700"
                textAnchor="middle"
                letterSpacing="1"
              >
                {isTrapTriggered ? 'OVERLOAD COLLAPSE TRIGGERED' : 'SFA PRESSING TRAP ZONE'}
              </text>
            </g>
          )}

          {/* Rest-Defence Overlay Polygon (UEFA A) */}
          {showRestDefence && phaseRatio > 0.3 && restDefencePoints && (
            <g>
              <polygon
                points={restDefencePoints}
                fill="rgba(16, 185, 129, 0.16)"
                stroke="#10b981"
                strokeWidth="2"
                strokeDasharray="5 5"
              />
              <text
                x={pitchWidth * 0.28}
                y={pitchHeight * 0.88}
                fill="#34d399"
                fontSize="12"
                fontWeight="700"
                letterSpacing="1.5"
              >
                REST-DEFENCE SHIELD (3+2 STRUCTURE)
              </text>
            </g>
          )}

          {/* Ghosting & Vectors: Lines connecting OOP starting position to current/IP position */}
          {phaseRatio > 0.05 && players.map(p => {
            const current = getInterpolatedCoord(p);
            const oop = p.oopCoord;
            const dist = Math.hypot(current.x - oop.x, current.y - oop.y);
            if (dist < 4) return null;

            return (
              <g key={`ghost-${p.id}`} opacity={0.65}>
                {/* Dashed vector path */}
                <line
                  x1={toSvgX(oop.x)}
                  y1={toSvgY(oop.y)}
                  x2={toSvgX(current.x)}
                  y2={toSvgY(current.y)}
                  stroke="#94a3b8"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  markerEnd="url(#ghostVector)"
                />
                {/* Ghost Silhouette */}
                <circle
                  cx={toSvgX(oop.x)}
                  cy={toSvgY(oop.y)}
                  r={14}
                  fill="rgba(15, 23, 42, 0.4)"
                  stroke="#94a3b8"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
                <text
                  x={toSvgX(oop.x)}
                  y={toSvgY(oop.y) + 4}
                  fill="#94a3b8"
                  fontSize="10"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {p.number}
                </text>
              </g>
            );
          })}

          {/* Premise Passing/Movement Arrow */}
          {premise && premiseFrom && premiseTo && (
            <g>
              <line
                x1={toSvgX(getInterpolatedCoord(premiseFrom).x)}
                y1={toSvgY(getInterpolatedCoord(premiseFrom).y)}
                x2={toSvgX(getInterpolatedCoord(premiseTo).x)}
                y2={toSvgY(getInterpolatedCoord(premiseTo).y)}
                stroke="#38bdf8"
                strokeWidth="3.5"
                markerEnd="url(#premiseArrow)"
                strokeLinecap="round"
              />
              <rect
                x={(toSvgX(getInterpolatedCoord(premiseFrom).x) + toSvgX(getInterpolatedCoord(premiseTo).x)) / 2 - 35}
                y={(toSvgY(getInterpolatedCoord(premiseFrom).y) + toSvgY(getInterpolatedCoord(premiseTo).y)) / 2 - 12}
                width={70}
                height={22}
                rx={4}
                fill="#0369a1"
                stroke="#38bdf8"
                strokeWidth="1"
              />
              <text
                x={(toSvgX(getInterpolatedCoord(premiseFrom).x) + toSvgX(getInterpolatedCoord(premiseTo).x)) / 2}
                y={(toSvgY(getInterpolatedCoord(premiseFrom).y) + toSvgY(getInterpolatedCoord(premiseTo).y)) / 2 + 3}
                fill="#ffffff"
                fontSize="9"
                fontWeight="bold"
                textAnchor="middle"
              >
                PREMISE (A)
              </text>
            </g>
          )}

          {/* Bridged Alternative Passing/Movement Arrow */}
          {bridgedAlternative && bridgedFrom && bridgedTo && (
            <g>
              <line
                x1={toSvgX(getInterpolatedCoord(bridgedFrom).x)}
                y1={toSvgY(getInterpolatedCoord(bridgedFrom).y)}
                x2={toSvgX(getInterpolatedCoord(bridgedTo).x)}
                y2={toSvgY(getInterpolatedCoord(bridgedTo).y)}
                stroke="#f59e0b"
                strokeWidth="3"
                strokeDasharray="6 4"
                markerEnd="url(#bridgedArrow)"
                strokeLinecap="round"
              />
              <rect
                x={(toSvgX(getInterpolatedCoord(bridgedFrom).x) + toSvgX(getInterpolatedCoord(bridgedTo).x)) / 2 - 40}
                y={(toSvgY(getInterpolatedCoord(bridgedFrom).y) + toSvgY(getInterpolatedCoord(bridgedTo).y)) / 2 - 12}
                width={80}
                height={22}
                rx={4}
                fill="#b45309"
                stroke="#f59e0b"
                strokeWidth="1"
              />
              <text
                x={(toSvgX(getInterpolatedCoord(bridgedFrom).x) + toSvgX(getInterpolatedCoord(bridgedTo).x)) / 2}
                y={(toSvgY(getInterpolatedCoord(bridgedFrom).y) + toSvgY(getInterpolatedCoord(bridgedTo).y)) / 2 + 3}
                fill="#ffffff"
                fontSize="9"
                fontWeight="bold"
                textAnchor="middle"
              >
                BRIDGED (B)
              </text>
            </g>
          )}

          {/* Shadow Team Players (Opponent AI) */}
          {shadowPlayers.map(s => {
            const isHovered = hoveredNode === s.id;
            return (
              <g
                key={`shadow-${s.id}`}
                transform={`translate(${toSvgX(s.currentCoord.x)}, ${toSvgY(s.currentCoord.y)})`}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredNode(s.id)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                <circle
                  cx={0}
                  cy={0}
                  r={16}
                  fill="#dc2626"
                  stroke="#fecaca"
                  strokeWidth="2"
                  opacity={isHovered ? 1 : 0.9}
                  className="transition-all duration-300"
                />
                <text
                  cx={0}
                  cy={0}
                  y={4}
                  fill="#ffffff"
                  fontSize="11"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {s.number}
                </text>
                {/* Constraint tags if assigned */}
                {s.constraints && s.constraints.length > 0 && (
                  <circle
                    cx={12}
                    cy={-12}
                    r={6}
                    fill="#f59e0b"
                    stroke="#ffffff"
                    strokeWidth="1"
                  />
                )}
                {/* Tooltip on hover */}
                {isHovered && (
                  <g transform="translate(0, -28)">
                    <rect x={-45} y={-14} width={90} height={20} rx={4} fill="#1e293b" stroke="#ef4444" strokeWidth="1" />
                    <text x={0} y={0} fill="#ffffff" fontSize="9" fontWeight="600" textAnchor="middle">
                      {s.role} {s.constraints ? `(${s.constraints[0]})` : ''}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Scottish FA / Blue Team Players */}
          {players.map(p => {
            const coord = getInterpolatedCoord(p);
            const isSelected = selectedPlayerId === p.id;
            const isUnitFocused = focusedUnit === 'ALL' || focusedUnit === p.unit;
            const isHovered = hoveredNode === p.id;

            return (
              <g
                key={`player-${p.id}`}
                transform={`translate(${toSvgX(coord.x)}, ${toSvgY(coord.y)})`}
                className="cursor-grab active:cursor-grabbing transition-opacity duration-300"
                opacity={isUnitFocused ? 1 : 0.28}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  setDraggingId(p.id);
                  onSelectPlayer(p);
                }}
                onMouseEnter={() => setHoveredNode(p.id)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                {/* Selection / Focus glow ring */}
                {isSelected && (
                  <circle
                    cx={0}
                    cy={0}
                    r={26}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="3"
                    strokeDasharray="4 2"
                    className="animate-spin"
                    style={{ animationDuration: '6s' }}
                  />
                )}
                {isUnitFocused && focusedUnit !== 'ALL' && (
                  <circle
                    cx={0}
                    cy={0}
                    r={22}
                    fill="rgba(56, 189, 248, 0.2)"
                    stroke="#0284c7"
                    strokeWidth="1.5"
                  />
                )}

                {/* Player Node Circle */}
                <circle
                  cx={0}
                  cy={0}
                  r={18}
                  fill="#005eb8"
                  stroke={isSelected ? '#38bdf8' : isHovered ? '#f59e0b' : '#ffffff'}
                  strokeWidth={isSelected ? '3' : isHovered ? '2.5' : '2'}
                  className="filter drop-shadow-md transition-all duration-150"
                />

                {/* Squad Number */}
                <text
                  x={0}
                  y={4}
                  fill="#ffffff"
                  fontSize="12"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {p.number}
                </text>

                {/* Name Label Badge */}
                <g transform="translate(0, 26)">
                  <rect
                    x={-42}
                    y={-8}
                    width={84}
                    height={16}
                    rx={3}
                    fill="rgba(15, 23, 42, 0.9)"
                    stroke={isSelected ? '#38bdf8' : 'rgba(255, 255, 255, 0.2)'}
                    strokeWidth="1"
                  />
                  <text
                    x={0}
                    y={4}
                    fill="#f8fafc"
                    fontSize="9"
                    fontWeight="600"
                    textAnchor="middle"
                  >
                    {p.name.split(' ').pop()}
                  </text>
                </g>
              </g>
            );
          })}

          {/* Interactive Ball */}
          <g
            transform={`translate(${toSvgX(ballCoord.x)}, ${toSvgY(ballCoord.y)})`}
            className="cursor-move filter drop-shadow-lg"
            onPointerDown={(e) => {
              e.stopPropagation();
              setIsDraggingBall(true);
            }}
          >
            <circle cx={0} cy={0} r={14} fill="rgba(245, 168, 0, 0.3)" className="animate-ping" />
            <circle cx={0} cy={0} r={10} fill="#ffffff" stroke="#000000" strokeWidth="2" />
            <circle cx={0} cy={0} r={5} fill="#f59e0b" />
          </g>

          {/* Live Stoppage Intervention Pins */}
          {stoppages.map(pin => (
            <g
              key={pin.id}
              transform={`translate(${toSvgX(pin.x)}, ${toSvgY(pin.y)})`}
              className="cursor-pointer"
              onClick={() => onSelectStoppage && onSelectStoppage(pin)}
            >
              <circle cx={0} cy={0} r={16} fill="rgba(239, 68, 68, 0.3)" className="animate-ping" />
              <circle cx={0} cy={-12} r={12} fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
              <Flag className="w-3 h-3 text-white" x={-6} y={-18} />
              <rect x={-35} y={4} width={70} height={16} rx={3} fill="#1e293b" stroke="#ef4444" strokeWidth="1" />
              <text x={0} y={15} fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle">
                {pin.type.replace('_', ' ')}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Bottom Pitch Status Legend */}
      <div className="w-full flex items-center justify-between px-5 py-2 bg-slate-900/90 border-t border-slate-800 text-[11px] text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-600 border border-white"></span>
            <span>Scottish FA Squad (Blue)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-600 border border-white"></span>
            <span>Shadow Team (Opponent AI)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-black"></span>
            <span>Match Ball (Drag to test Ball Magnetism)</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-slate-400">
            <Move className="w-3 h-3" /> Drag nodes to adjust shapes
          </span>
          <span className="flex items-center gap-1 text-sky-400 font-mono">
            Ball: [{ballCoord.x}%, {ballCoord.y}%]
          </span>
        </div>
      </div>
    </div>
  );
};
