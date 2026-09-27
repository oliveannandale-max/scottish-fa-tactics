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
  BridgedAlternative,
  MannequinNode,
  MannequinColor,
  EquipmentType,
  TacticalDrawing,
  DrawingType,
  AnimationKeyframe
} from '../types/tactics';
import { 
  Shield, 
  AlertTriangle,
  Move,
  Layers,
  Flag,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Trash2,
  Spline,
  GitCommit,
  ArrowRight,
  TrendingUp,
  Box,
  Repeat,
  ChevronLeft,
  ChevronRight,
  Palette,
  Eye,
  EyeOff,
  UserCheck,
  Edit2,
  X
} from 'lucide-react';

interface InteractivePitchProps {
  licenceTier: LicenceTier;
  phase: TacticalPhase;
  phaseRatio: number; // 0 (OOP) to 1 (IP)
  focusedUnit: TeamUnit;
  players: PlayerNode[];
  shadowPlayers: ShadowPlayerNode[];
  onPlayerMove: (playerId: string, newCoord: PitchCoordinates) => void;
  onRenamePlayer?: (playerId: string, newName: string, newNumber?: number) => void;
  onSelectPlayer: (player: PlayerNode) => void;
  selectedPlayerId?: string;
  ballCoord: PitchCoordinates;
  onBallMove: (newCoord: PitchCoordinates) => void;
  stoppages: LiveStoppagePin[];
  onSelectStoppage?: (pin: LiveStoppagePin) => void;
  premise?: TacticalPremise;
  bridgedAlternative?: BridgedAlternative;
  showRestDefence: boolean;
  pressingTrapActive: boolean;
  pressingTrapZone?: { minX: number; maxX: number; minY: number; maxY: number };
  isTrapTriggered?: boolean;
  // Equipment / Mannequins
  mannequins?: MannequinNode[];
  onUpdateMannequins?: (mannequins: MannequinNode[]) => void;
  // Drawings
  drawings?: TacticalDrawing[];
  onUpdateDrawings?: (drawings: TacticalDrawing[]) => void;
}

export const InteractivePitch: React.FC<InteractivePitchProps> = ({
  licenceTier,
  phase,
  phaseRatio,
  focusedUnit,
  players,
  shadowPlayers,
  onPlayerMove,
  onRenamePlayer,
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
  isTrapTriggered = false,
  mannequins: externalMannequins,
  onUpdateMannequins,
  drawings: externalDrawings,
  onUpdateDrawings
}) => {
  const pitchRef = useRef<SVGSVGElement | null>(null);
  const [activeTool, setActiveTool] = useState<DrawingType | 'MOVE'>('MOVE');
  const [activeColor, setActiveColor] = useState<string>('#38bdf8');
  
  // Dragging States
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [isDraggingBall, setIsDraggingBall] = useState<boolean>(false);
  const [draggingMannequinId, setDraggingMannequinId] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Equipment & Mannequins Internal/External Fallback
  const [localMannequins, setLocalMannequins] = useState<MannequinNode[]>(externalMannequins || [
    { id: 'm1', x: 66, y: 34, type: 'mannequin', color: 'yellow', rotation: 0, label: 'Wall 1' },
    { id: 'm2', x: 66, y: 41, type: 'mannequin', color: 'yellow', rotation: 0, label: 'Wall 2' },
    { id: 'm3', x: 66, y: 48, type: 'mannequin', color: 'yellow', rotation: 0, label: 'Wall 3' },
    { id: 'm4', x: 50, y: 24, type: 'mannequin', color: 'orange', rotation: 15, label: 'Mid Screen' },
    { id: 'm5', x: 78, y: 68, type: 'mannequin', color: 'red', rotation: -10, label: 'Passive CB' },
    { id: 'c1', x: 42, y: 16, type: 'cone', color: 'neon', label: 'Gate' }
  ]);

  const mannequins = externalMannequins || localMannequins;
  const setMannequins = (list: MannequinNode[]) => {
    setLocalMannequins(list);
    if (onUpdateMannequins) onUpdateMannequins(list);
  };

  // Tactical Drawings Internal/External Fallback
  const [localDrawings, setLocalDrawings] = useState<TacticalDrawing[]>(externalDrawings || [
    {
      id: 'd1',
      type: 'CURVED_ARROW',
      points: [{ x: 38, y: 50 }, { x: 74, y: 18 }],
      controlPoint: { x: 54, y: 22 },
      color: '#38bdf8',
      label: 'Curved Switch'
    },
    {
      id: 'd2',
      type: 'STAGGERED_ARROW',
      points: [{ x: 22, y: 15 }, { x: 34, y: 12 }, { x: 48, y: 14 }, { x: 68, y: 10 }],
      color: '#f59e0b',
      label: 'Staggered Overlap'
    }
  ]);

  const drawings = externalDrawings || localDrawings;
  const setDrawings = (d: TacticalDrawing[]) => {
    setLocalDrawings(d);
    if (onUpdateDrawings) onUpdateDrawings(d);
  };

  // Drawing in progress
  const [drawingStart, setDrawingStart] = useState<PitchCoordinates | null>(null);
  const [drawingCurrent, setDrawingCurrent] = useState<PitchCoordinates | null>(null);

  // Equipment Drawer open state
  const [isEquipmentDrawerOpen, setIsEquipmentDrawerOpen] = useState<boolean>(false);
  const [selectedMannequinColor, setSelectedMannequinColor] = useState<MannequinColor>('yellow');

  // Inline Player Rename Popover
  const [renamingPlayerId, setRenamingPlayerId] = useState<string | null>(null);
  const [inlineName, setInlineName] = useState<string>('');
  const [inlineNumber, setInlineNumber] = useState<number>(1);

  // Animation & Keyframe Studio
  const [keyframes, setKeyframes] = useState<AnimationKeyframe[]>([
    {
      id: 'kf-1',
      frameIndex: 0,
      label: '1. Initial Shape',
      playerCoords: players.reduce((acc, p) => ({ ...acc, [p.id]: p.oopCoord }), {}),
      ballCoord: { x: 30, y: 50 }
    },
    {
      id: 'kf-2',
      frameIndex: 1,
      label: '2. Progression & Overload',
      playerCoords: players.reduce((acc, p) => ({ ...acc, [p.id]: p.ipCoord }), {}),
      ballCoord: { x: 72, y: 25 }
    }
  ]);
  const [currentKeyframeIdx, setCurrentKeyframeIdx] = useState<number>(0);
  const [isPlayingAnimation, setIsPlayingAnimation] = useState<boolean>(false);
  const [animProgress, setAnimProgress] = useState<number>(0); // 0 to 1 between keyframes
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isLooping, setIsLooping] = useState<boolean>(true);
  const [showMotionTrails, setShowMotionTrails] = useState<boolean>(true);

  const pitchWidth = 1050;
  const pitchHeight = 680;
  const isHalfPitch = licenceTier === 'UEFA_C';

  // Coordinate conversion helpers
  const toSvgX = useCallback((xPercent: number) => {
    return (xPercent / 100) * pitchWidth;
  }, []);

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

  // Global Pointer Event Listeners for Dragging & Drawing
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (activeTool !== 'MOVE' && drawingStart) {
        setDrawingCurrent(fromSvgToPercent(e.clientX, e.clientY));
        return;
      }

      if (isDraggingBall) {
        const coords = fromSvgToPercent(e.clientX, e.clientY);
        onBallMove(coords);
      } else if (draggingId) {
        const coords = fromSvgToPercent(e.clientX, e.clientY);
        onPlayerMove(draggingId, coords);
      } else if (draggingMannequinId) {
        const coords = fromSvgToPercent(e.clientX, e.clientY);
        setMannequins(mannequins.map(m => m.id === draggingMannequinId ? { ...m, x: coords.x, y: coords.y } : m));
      }
    };

    const handlePointerUp = () => {
      if (activeTool !== 'MOVE' && drawingStart && drawingCurrent) {
        // Complete the new tactical drawing
        const newDrawing: TacticalDrawing = {
          id: `draw-${Date.now()}`,
          type: activeTool,
          points: [drawingStart, drawingCurrent],
          color: activeColor,
          controlPoint: activeTool === 'CURVED_ARROW' 
            ? { x: (drawingStart.x + drawingCurrent.x) / 2, y: Math.max(5, (drawingStart.y + drawingCurrent.y) / 2 - 12) }
            : undefined
        };
        setDrawings([...drawings, newDrawing]);
        setDrawingStart(null);
        setDrawingCurrent(null);
      }

      setDraggingId(null);
      setIsDraggingBall(false);
      setDraggingMannequinId(null);
    };

    if (draggingId || isDraggingBall || draggingMannequinId || (activeTool !== 'MOVE' && drawingStart)) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [
    activeTool, 
    drawingStart, 
    drawingCurrent, 
    activeColor, 
    drawings, 
    draggingId, 
    isDraggingBall, 
    draggingMannequinId, 
    mannequins, 
    fromSvgToPercent, 
    onBallMove, 
    onPlayerMove
  ]);

  // Animation Playback Engine
  useEffect(() => {
    if (!isPlayingAnimation || keyframes.length < 2) return;

    let animationFrameId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      setAnimProgress(prev => {
        const next = prev + delta * (0.6 * playbackSpeed);
        if (next >= 1) {
          // Advance to next keyframe
          setCurrentKeyframeIdx(currIdx => {
            const nextIdx = currIdx + 1;
            if (nextIdx >= keyframes.length) {
              if (isLooping) return 0;
              setIsPlayingAnimation(false);
              return currIdx;
            }
            return nextIdx;
          });
          return 0;
        }
        return next;
      });

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlayingAnimation, keyframes.length, playbackSpeed, isLooping]);

  // Interpolated player positions factoring in Phase Ratio OR Keyframe Animation
  const getInterpolatedCoord = (p: PlayerNode): PitchCoordinates => {
    if (isPlayingAnimation && keyframes.length >= 2) {
      const fromKf = keyframes[currentKeyframeIdx];
      const nextIdx = (currentKeyframeIdx + 1) % keyframes.length;
      const toKf = keyframes[nextIdx];

      const fromPos = fromKf.playerCoords[p.id] || p.oopCoord;
      const toPos = toKf.playerCoords[p.id] || p.ipCoord;

      return {
        x: Math.round(fromPos.x + (toPos.x - fromPos.x) * animProgress),
        y: Math.round(fromPos.y + (toPos.y - fromPos.y) * animProgress)
      };
    }

    const oop = p.oopCoord;
    const ip = p.ipCoord;
    return {
      x: Math.round(oop.x + (ip.x - oop.x) * phaseRatio),
      y: Math.round(oop.y + (ip.y - oop.y) * phaseRatio)
    };
  };

  // Add Mannequin / Equipment
  const handleAddEquipment = (type: EquipmentType, color: MannequinColor) => {
    const newM: MannequinNode = {
      id: `eq-${Date.now()}`,
      x: 50 + Math.floor(Math.random() * 16 - 8),
      y: 50 + Math.floor(Math.random() * 16 - 8),
      type,
      color,
      rotation: 0,
      label: type === 'mannequin' ? 'Mannequin' : type === 'cone' ? 'Cone' : 'Pole'
    };
    setMannequins([...mannequins, newM]);
  };

  // Capture Current Keyframe
  const handleCaptureKeyframe = () => {
    const newKf: AnimationKeyframe = {
      id: `kf-${Date.now()}`,
      frameIndex: keyframes.length,
      label: `Frame ${keyframes.length + 1}`,
      playerCoords: players.reduce((acc, p) => ({ ...acc, [p.id]: p.currentCoord }), {}),
      ballCoord: { ...ballCoord },
      mannequinCoords: mannequins.reduce((acc, m) => ({ ...acc, [m.id]: { x: m.x, y: m.y } }), {})
    };
    setKeyframes([...keyframes, newKf]);
  };

  // Color mapping helper for Mannequins
  const getMannequinColorCode = (color: MannequinColor) => {
    switch (color) {
      case 'yellow': return '#eab308';
      case 'orange': return '#f97316';
      case 'red': return '#ef4444';
      case 'blue': return '#0284c7';
      case 'neon': return '#22c55e';
      case 'white': return '#f8fafc';
      case 'dark': return '#334155';
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center select-none overflow-hidden rounded-2xl border border-slate-700/80 shadow-2xl bg-slate-950">
      
      {/* 1. Tactical Studio Top Toolbar */}
      <div className="w-full flex flex-wrap items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs gap-3 z-20">
        
        {/* Left: Mode & Drawing Tools */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 rounded-xl p-1">
          <button
            onClick={() => setActiveTool('MOVE')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
              activeTool === 'MOVE' ? 'bg-sky-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Move / Select Mode (Drag players, ball, and mannequins)"
          >
            <Move className="w-3.5 h-3.5" />
            <span>Select & Move</span>
          </button>

          <div className="h-4 w-px bg-slate-800 mx-0.5" />

          {/* Curved Arrow */}
          <button
            onClick={() => setActiveTool('CURVED_ARROW')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-semibold text-xs transition-all cursor-pointer ${
              activeTool === 'CURVED_ARROW' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Curved Tactical Arrow (Sweeping pass / Overlapping curved run)"
          >
            <Spline className="w-3.5 h-3.5 text-amber-400" />
            <span>Curved Arrow</span>
          </button>

          {/* Staggered Arrow */}
          <button
            onClick={() => setActiveTool('STAGGERED_ARROW')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-semibold text-xs transition-all cursor-pointer ${
              activeTool === 'STAGGERED_ARROW' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Staggered Arrow (Stepped pressing angle / Agility cut run)"
          >
            <GitCommit className="w-3.5 h-3.5 text-purple-400" />
            <span>Staggered</span>
          </button>

          {/* Straight Pass */}
          <button
            onClick={() => setActiveTool('PASS_ARROW')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-semibold text-xs transition-all cursor-pointer ${
              activeTool === 'PASS_ARROW' ? 'bg-sky-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Solid Pass Vector"
          >
            <ArrowRight className="w-3.5 h-3.5 text-sky-400" />
            <span>Pass</span>
          </button>

          {/* Dashed Movement Run */}
          <button
            onClick={() => setActiveTool('RUN_ARROW')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-semibold text-xs transition-all cursor-pointer ${
              activeTool === 'RUN_ARROW' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Dashed Off-the-Ball Run"
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>Run</span>
          </button>

          {/* Shaded Pressing Zone */}
          <button
            onClick={() => setActiveTool('PRESS_ZONE')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-semibold text-xs transition-all cursor-pointer ${
              activeTool === 'PRESS_ZONE' ? 'bg-red-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Shaded Pressing Zone / Overload Box"
          >
            <Box className="w-3.5 h-3.5 text-red-400" />
            <span>Press Box</span>
          </button>
        </div>

        {/* Center: Drawing Color Picker */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 rounded-xl px-2.5 py-1">
          <Palette className="w-3.5 h-3.5 text-slate-400 mr-1" />
          {[
            { color: '#38bdf8', label: 'Sky' },
            { color: '#f59e0b', label: 'Amber' },
            { color: '#ef4444', label: 'Red' },
            { color: '#10b981', label: 'Green' },
            { color: '#ffffff', label: 'White' },
          ].map(c => (
            <button
              key={c.color}
              onClick={() => setActiveColor(c.color)}
              className={`w-4 h-4 rounded-full border transition-all cursor-pointer ${
                activeColor === c.color ? 'scale-125 border-white ring-2 ring-sky-500' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
              style={{ backgroundColor: c.color }}
              title={c.label}
            />
          ))}

          {drawings.length > 0 && (
            <button
              onClick={() => setDrawings([])}
              className="ml-2 flex items-center gap-1 px-2 py-0.5 rounded text-[11px] text-red-400 hover:bg-red-950/60 transition-colors"
              title="Clear all tactical drawings"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear</span>
            </button>
          )}
        </div>

        {/* Right: Mannequins & Equipment Drawer Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEquipmentDrawerOpen(!isEquipmentDrawerOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
              isEquipmentDrawerOpen 
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20' 
                : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Equipment & Mannequins ({mannequins.length})</span>
          </button>
        </div>
      </div>

      {/* Equipment Drawer Modal Bar */}
      {isEquipmentDrawerOpen && (
        <div className="w-full bg-slate-900/95 border-b border-slate-800 px-5 py-3 flex flex-wrap items-center justify-between gap-4 text-xs z-20 backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-300">Add Mannequin Color:</span>
            <div className="flex items-center gap-2">
              {[
                { color: 'yellow', bg: '#eab308', name: 'Yellow' },
                { color: 'orange', bg: '#f97316', name: 'Orange' },
                { color: 'red', bg: '#ef4444', name: 'Red' },
                { color: 'blue', bg: '#0284c7', name: 'Blue' },
                { color: 'neon', bg: '#22c55e', name: 'Neon Green' },
                { color: 'dark', bg: '#334155', name: 'Dark' },
              ].map(c => (
                <button
                  key={c.color}
                  onClick={() => handleAddEquipment('mannequin', c.color as MannequinColor)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-700 hover:border-slate-500 bg-slate-950 transition-all cursor-pointer"
                >
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.bg }} />
                  <span className="font-medium text-[11px] text-slate-200">+{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">Other Equipment:</span>
            <button
              onClick={() => handleAddEquipment('cone', 'neon')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium transition-colors"
            >
              + Cone / Disc
            </button>
            <button
              onClick={() => handleAddEquipment('pole', 'blue')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium transition-colors"
            >
              + Slalom Pole
            </button>
            <button
              onClick={() => handleAddEquipment('mini_goal', 'white')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium transition-colors"
            >
              + Mini Goal
            </button>
            {mannequins.length > 0 && (
              <button
                onClick={() => setMannequins([])}
                className="px-2.5 py-1 rounded-lg bg-red-950/70 hover:bg-red-900 text-red-300 text-[11px] font-medium border border-red-800 transition-colors ml-2"
              >
                Clear Equipment
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Pitch SVG Canvas */}
      <div className="relative w-full flex-1 flex items-center justify-center p-3 bg-slate-950">
        <svg
          ref={pitchRef}
          viewBox={`0 0 ${pitchWidth} ${pitchHeight}`}
          className="w-full h-auto max-h-[72vh] rounded-xl shadow-2xl pitch-turf border-2 border-emerald-600/40 cursor-crosshair"
          style={{ aspectRatio: '1050/680' }}
          onPointerDown={(e) => {
            if (activeTool !== 'MOVE') {
              const coords = fromSvgToPercent(e.clientX, e.clientY);
              setDrawingStart(coords);
              setDrawingCurrent(coords);
            }
          }}
        >
          <defs>
            <linearGradient id="grassStripe" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#0d552d" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#08381d" stopOpacity="0.9" />
            </linearGradient>

            {/* Glowing marker arrows */}
            <marker id="passArrowHead" markerWidth="8" markerHeight="8" refX="7" refY="3.5" orient="auto">
              <polygon points="0 0, 7 3.5, 0 7" fill={activeColor} />
            </marker>
            <marker id="curvedArrowHead" markerWidth="8" markerHeight="8" refX="7" refY="3.5" orient="auto">
              <polygon points="0 0, 7 3.5, 0 7" fill="#38bdf8" />
            </marker>
            <marker id="staggeredArrowHead" markerWidth="8" markerHeight="8" refX="7" refY="3.5" orient="auto">
              <polygon points="0 0, 7 3.5, 0 7" fill="#f59e0b" />
            </marker>
          </defs>

          {/* Grass Alternating Stripes */}
          {[...Array(14)].map((_, i) => (
            <rect
              key={i}
              x={(pitchWidth / 14) * i}
              y={0}
              width={pitchWidth / 14}
              height={pitchHeight}
              fill={i % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'rgba(0,0,0,0.06)'}
            />
          ))}

          {/* Standard Pitch Markings */}
          {/* Outer Boundary Line */}
          <rect x={35} y={35} width={pitchWidth - 70} height={pitchHeight - 70} fill="none" stroke="#ffffff" strokeWidth="2.5" opacity="0.85" />
          
          {/* Halfway Line */}
          <line x1={pitchWidth / 2} y1={35} x2={pitchWidth / 2} y2={pitchHeight - 35} stroke="#ffffff" strokeWidth="2" opacity="0.8" />
          
          {/* Center Circle & Spot */}
          <circle cx={pitchWidth / 2} cy={pitchHeight / 2} r={75} fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.8" />
          <circle cx={pitchWidth / 2} cy={pitchHeight / 2} r={4} fill="#ffffff" opacity="0.9" />

          {/* Left Penalty Area */}
          <rect x={35} y={150} width={160} height={380} fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.8" />
          <rect x={35} y={235} width={55} height={210} fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.8" />
          <circle cx={145} cy={pitchHeight / 2} r={4} fill="#ffffff" opacity="0.9" />
          <path d="M 195 285 A 75 75 0 0 1 195 395" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.8" />

          {/* Right Penalty Area */}
          <rect x={pitchWidth - 195} y={150} width={160} height={380} fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.8" />
          <rect x={pitchWidth - 90} y={235} width={55} height={210} fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.8" />
          <circle cx={pitchWidth - 145} cy={pitchHeight / 2} r={4} fill="#ffffff" opacity="0.9" />
          <path d="M 855 285 A 75 75 0 0 0 855 395" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.8" />

          {/* Full Regulation Goals */}
          <rect x={12} y={290} width={23} height={100} fill="rgba(255,255,255,0.2)" stroke="#ffffff" strokeWidth="2" />
          <rect x={pitchWidth - 35} y={290} width={23} height={100} fill="rgba(255,255,255,0.2)" stroke="#ffffff" strokeWidth="2" />

          {/* Tactical Channels (UEFA B & A Corridors) */}
          {licenceTier !== 'UEFA_C' && (
            <>
              {/* Half Space Top (18% - 36%) */}
              <line x1={35} y1={pitchHeight * 0.22} x2={pitchWidth - 35} y2={pitchHeight * 0.22} stroke="rgba(56, 189, 248, 0.25)" strokeDasharray="6 6" strokeWidth="1.5" />
              {/* Half Space Bottom (64% - 82%) */}
              <line x1={35} y1={pitchHeight * 0.78} x2={pitchWidth - 35} y2={pitchHeight * 0.78} stroke="rgba(56, 189, 248, 0.25)" strokeDasharray="6 6" strokeWidth="1.5" />
              {/* Thirds Vertical Lines */}
              <line x1={pitchWidth * 0.35} y1={35} x2={pitchWidth * 0.35} y2={pitchHeight - 35} stroke="rgba(245, 168, 0, 0.2)" strokeDasharray="4 6" strokeWidth="1.5" />
              <line x1={pitchWidth * 0.65} y1={35} x2={pitchWidth * 0.65} y2={pitchHeight - 35} stroke="rgba(245, 168, 0, 0.2)" strokeDasharray="4 6" strokeWidth="1.5" />
            </>
          )}

          {/* Motion Trails between keyframes */}
          {showMotionTrails && keyframes.length >= 2 && players.map(p => {
            const pathPoints = keyframes.map(kf => {
              const c = kf.playerCoords[p.id] || p.oopCoord;
              return `${toSvgX(c.x)},${toSvgY(c.y)}`;
            }).join(' ');

            return (
              <polyline
                key={`trail-${p.id}`}
                points={pathPoints}
                fill="none"
                stroke="rgba(56, 189, 248, 0.25)"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
            );
          })}

          {/* Tactical Drawings Rendered on the Pitch */}
          {drawings.map(d => {
            if (d.type === 'CURVED_ARROW' && d.points.length >= 2) {
              const start = d.points[0];
              const end = d.points[1];
              const ctrl = d.controlPoint || {
                x: (start.x + end.x) / 2,
                y: Math.max(5, (start.y + end.y) / 2 - 12)
              };

              return (
                <g key={d.id} className="cursor-pointer group">
                  <path
                    d={`M ${toSvgX(start.x)} ${toSvgY(start.y)} Q ${toSvgX(ctrl.x)} ${toSvgY(ctrl.y)} ${toSvgX(end.x)} ${toSvgY(end.y)}`}
                    fill="none"
                    stroke={d.color}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    markerEnd="url(#curvedArrowHead)"
                    className="filter drop-shadow"
                  />
                  {d.label && (
                    <text
                      x={toSvgX(ctrl.x)}
                      y={toSvgY(ctrl.y) - 8}
                      fill="#ffffff"
                      fontSize="10"
                      fontWeight="bold"
                      textAnchor="middle"
                      className="bg-slate-900"
                    >
                      {d.label}
                    </text>
                  )}
                </g>
              );
            }

            if (d.type === 'STAGGERED_ARROW' && d.points.length >= 2) {
              // Staggered stepped line
              const start = d.points[0];
              const end = d.points[d.points.length - 1];
              const midX = (start.x + end.x) / 2;

              const pointsStr = `
                ${toSvgX(start.x)},${toSvgY(start.y)} 
                ${toSvgX(midX)},${toSvgY(start.y)} 
                ${toSvgX(midX)},${toSvgY(end.y)} 
                ${toSvgX(end.x)},${toSvgY(end.y)}
              `;

              return (
                <g key={d.id}>
                  <polyline
                    points={pointsStr}
                    fill="none"
                    stroke={d.color}
                    strokeWidth="3"
                    strokeDasharray="8 4"
                    strokeLinecap="round"
                    markerEnd="url(#staggeredArrowHead)"
                  />
                  {d.label && (
                    <text
                      x={toSvgX(midX)}
                      y={toSvgY(start.y) - 6}
                      fill={d.color}
                      fontSize="9"
                      fontWeight="bold"
                    >
                      {d.label}
                    </text>
                  )}
                </g>
              );
            }

            if (d.type === 'PASS_ARROW' && d.points.length >= 2) {
              return (
                <line
                  key={d.id}
                  x1={toSvgX(d.points[0].x)}
                  y1={toSvgY(d.points[0].y)}
                  x2={toSvgX(d.points[1].x)}
                  y2={toSvgY(d.points[1].y)}
                  stroke={d.color}
                  strokeWidth="3.5"
                  markerEnd="url(#passArrowHead)"
                />
              );
            }

            if (d.type === 'RUN_ARROW' && d.points.length >= 2) {
              return (
                <line
                  key={d.id}
                  x1={toSvgX(d.points[0].x)}
                  y1={toSvgY(d.points[0].y)}
                  x2={toSvgX(d.points[1].x)}
                  y2={toSvgY(d.points[1].y)}
                  stroke={d.color}
                  strokeWidth="2.5"
                  strokeDasharray="6 4"
                  markerEnd="url(#passArrowHead)"
                />
              );
            }

            if (d.type === 'PRESS_ZONE' && d.points.length >= 2) {
              const x1 = Math.min(d.points[0].x, d.points[1].x);
              const y1 = Math.min(d.points[0].y, d.points[1].y);
              const w = Math.abs(d.points[1].x - d.points[0].x);
              const h = Math.abs(d.points[1].y - d.points[0].y);

              return (
                <rect
                  key={d.id}
                  x={toSvgX(x1)}
                  y={toSvgY(y1)}
                  width={toSvgX(w)}
                  height={toSvgY(h)}
                  fill="rgba(239, 68, 68, 0.2)"
                  stroke="#ef4444"
                  strokeWidth="2"
                  strokeDasharray="6 6"
                  rx="6"
                />
              );
            }

            return null;
          })}

          {/* Active Drawing Preview */}
          {activeTool !== 'MOVE' && drawingStart && drawingCurrent && (
            <line
              x1={toSvgX(drawingStart.x)}
              y1={toSvgY(drawingStart.y)}
              x2={toSvgX(drawingCurrent.x)}
              y2={toSvgY(drawingCurrent.y)}
              stroke={activeColor}
              strokeWidth="2.5"
              strokeDasharray="4 4"
            />
          )}

          {/* Equipment & Mannequins */}
          {mannequins.map(m => {
            const colorCode = getMannequinColorCode(m.color);
            return (
              <g
                key={m.id}
                transform={`translate(${toSvgX(m.x)}, ${toSvgY(m.y)}) rotate(${m.rotation || 0})`}
                className="cursor-grab active:cursor-grabbing group"
                onPointerDown={(e) => {
                  e.stopPropagation();
                  setDraggingMannequinId(m.id);
                }}
              >
                {m.type === 'mannequin' && (
                  // Humanoid Training Mannequin Silhouette
                  <g transform="translate(0, 0)">
                    {/* Weighted Base Stand */}
                    <ellipse cx={0} cy={14} rx={14} ry={5} fill="#1e293b" stroke="#475569" strokeWidth="1" />
                    {/* Metal Support Poles */}
                    <line x1={-7} y1={-8} x2={-7} y2={14} stroke="#64748b" strokeWidth="2" />
                    <line x1={7} y1={-8} x2={7} y2={14} stroke="#64748b" strokeWidth="2" />
                    {/* Mannequin Torso Frame */}
                    <rect x={-11} y={-18} width={22} height={26} rx={4} fill={colorCode} stroke="#ffffff" strokeWidth="1.5" />
                    {/* Rib slots */}
                    <line x1={-8} y1={-12} x2={8} y2={-12} stroke="#ffffff" strokeWidth="1.5" opacity="0.6" />
                    <line x1={-8} y1={-6} x2={8} y2={-6} stroke="#ffffff" strokeWidth="1.5" opacity="0.6" />
                    <line x1={-8} y1={0} x2={8} y2={0} stroke="#ffffff" strokeWidth="1.5" opacity="0.6" />
                    {/* Mannequin Head Oval */}
                    <ellipse cx={0} cy={-24} rx={7} ry={9} fill={colorCode} stroke="#ffffff" strokeWidth="1.5" />
                  </g>
                )}

                {m.type === 'cone' && (
                  // Training Cone Disc
                  <g>
                    <ellipse cx={0} cy={2} rx={9} ry={5} fill="#1e293b" />
                    <polygon points="-7,2 7,2 0,-12" fill={colorCode} stroke="#ffffff" strokeWidth="1" />
                    <circle cx={0} cy={-12} r={1.5} fill="#ffffff" />
                  </g>
                )}

                {m.type === 'pole' && (
                  // Slalom Agility Pole
                  <g>
                    <ellipse cx={0} cy={2} rx={6} ry={3} fill="#0f172a" />
                    <line x1={0} y1={2} x2={0} y2={-26} stroke={colorCode} strokeWidth="3.5" strokeLinecap="round" />
                    <circle cx={0} cy={-26} r={3} fill="#ffffff" stroke={colorCode} strokeWidth="1.5" />
                  </g>
                )}

                {m.type === 'mini_goal' && (
                  // Mini BowNet Goal
                  <g>
                    <rect x={-16} y={-10} width={32} height={20} rx={2} fill="rgba(255,255,255,0.15)" stroke="#ffffff" strokeWidth="2" />
                    <line x1={-16} y1={-10} x2={16} y2={10} stroke="#ffffff" strokeWidth="0.5" strokeDasharray="2 2" />
                    <line x1={-16} y1={10} x2={16} y2={-10} stroke="#ffffff" strokeWidth="0.5" strokeDasharray="2 2" />
                  </g>
                )}

                {/* Quick delete button on hover */}
                <circle
                  cx={14}
                  cy={-22}
                  r={7}
                  fill="#ef4444"
                  className="opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMannequins(mannequins.filter(item => item.id !== m.id));
                  }}
                />
                <text
                  x={14}
                  y={-19}
                  fill="#ffffff"
                  fontSize="9"
                  fontWeight="bold"
                  textAnchor="middle"
                  className="opacity-0 group-hover:opacity-100 pointer-events-none"
                >
                  ×
                </text>
              </g>
            );
          })}

          {/* Shadow / Red Team Players */}
          {shadowPlayers.map(s => (
            <g
              key={`shadow-${s.id}`}
              transform={`translate(${toSvgX(s.currentCoord.x)}, ${toSvgY(s.currentCoord.y)})`}
              className="cursor-pointer"
            >
              <circle
                cx={0}
                cy={0}
                r={16}
                fill="#dc2626"
                stroke="#fecaca"
                strokeWidth="2"
                opacity="0.9"
              />
              <text x={0} y={4} fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">
                {s.number}
              </text>
            </g>
          ))}

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
                  if (activeTool === 'MOVE') {
                    setDraggingId(p.id);
                    onSelectPlayer(p);
                  }
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setRenamingPlayerId(p.id);
                  setInlineName(p.name);
                  setInlineNumber(p.number);
                }}
                onMouseEnter={() => setHoveredNode(p.id)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                {/* Glow ring on selection */}
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

                {/* Player Circle */}
                <circle
                  cx={0}
                  cy={0}
                  r={18}
                  fill="#005eb8"
                  stroke={isSelected ? '#38bdf8' : isHovered ? '#f59e0b' : '#ffffff'}
                  strokeWidth={isSelected ? '3' : '2'}
                  className="filter drop-shadow-md"
                />

                {/* Squad Number */}
                <text x={0} y={4} fill="#ffffff" fontSize="12" fontWeight="bold" textAnchor="middle">
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
                  <text x={0} y={4} fill="#f8fafc" fontSize="9" fontWeight="600" textAnchor="middle">
                    {p.name.split(' ').pop()}
                  </text>
                </g>
              </g>
            );
          })}

          {/* Interactive Match Ball */}
          <g
            transform={`translate(${toSvgX(ballCoord.x)}, ${toSvgY(ballCoord.y)})`}
            className="cursor-move filter drop-shadow-lg"
            onPointerDown={(e) => {
              e.stopPropagation();
              if (activeTool === 'MOVE') {
                setIsDraggingBall(true);
              }
            }}
          >
            <circle cx={0} cy={0} r={14} fill="rgba(245, 168, 0, 0.3)" className="animate-ping" />
            <circle cx={0} cy={0} r={10} fill="#ffffff" stroke="#000000" strokeWidth="2" />
            <circle cx={0} cy={0} r={5} fill="#f59e0b" />
          </g>

          {/* Stoppage Pins */}
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
            </g>
          ))}
        </svg>

        {/* Inline Rename Popover Modal */}
        {renamingPlayerId && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40 bg-slate-900 border border-sky-500 rounded-xl p-4 shadow-2xl flex flex-col gap-3 min-w-[260px]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-xs text-white flex items-center gap-1.5">
                <Edit2 className="w-3.5 h-3.5 text-sky-400" />
                Rename Pitch Player
              </span>
              <button onClick={() => setRenamingPlayerId(null)} className="text-slate-400 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex flex-col gap-2 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Player Name</label>
                <input
                  type="text"
                  value={inlineName}
                  onChange={(e) => setInlineName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white font-bold focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Squad Number</label>
                <input
                  type="number"
                  min="1"
                  max="99"
                  value={inlineNumber}
                  onChange={(e) => setInlineNumber(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono font-bold focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex justify-end gap-2 mt-1">
                <button
                  onClick={() => setRenamingPlayerId(null)}
                  className="px-3 py-1 rounded bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (onRenamePlayer && renamingPlayerId) {
                      onRenamePlayer(renamingPlayerId, inlineName, inlineNumber);
                    }
                    setRenamingPlayerId(null);
                  }}
                  className="px-3 py-1 rounded bg-sky-600 hover:bg-sky-500 text-white font-bold"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Animation & Keyframe Studio Timeline */}
      <div className="w-full flex flex-wrap items-center justify-between px-4 py-2.5 bg-slate-900/95 border-t border-slate-800 text-xs gap-3">
        
        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlayingAnimation(!isPlayingAnimation)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs shadow-md transition-all cursor-pointer ${
              isPlayingAnimation 
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/30' 
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
            }`}
          >
            {isPlayingAnimation ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isPlayingAnimation ? 'Pause' : 'Play Animation'}</span>
          </button>

          <button
            onClick={() => {
              setIsPlayingAnimation(false);
              setCurrentKeyframeIdx(0);
              setAnimProgress(0);
            }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Reset to Frame 1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Keyframe Selector Chips */}
          <div className="flex items-center gap-1 bg-slate-950 rounded-lg p-0.5 border border-slate-800">
            {keyframes.map((kf, idx) => (
              <button
                key={kf.id}
                onClick={() => {
                  setIsPlayingAnimation(false);
                  setCurrentKeyframeIdx(idx);
                  setAnimProgress(0);
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold transition-all cursor-pointer ${
                  currentKeyframeIdx === idx 
                    ? 'bg-sky-600 text-white' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          {/* Add Keyframe */}
          <button
            onClick={handleCaptureKeyframe}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-sky-950 hover:text-sky-300 border border-slate-700 text-slate-300 font-semibold text-[11px] transition-all cursor-pointer"
            title="Capture current tactical positions as a new keyframe"
          >
            <Plus className="w-3 h-3" />
            <span>Capture Frame</span>
          </button>
        </div>

        {/* Speed & Options */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-slate-400">
            <span>Speed:</span>
            {[0.5, 1.0, 2.0].map(s => (
              <button
                key={s}
                onClick={() => setPlaybackSpeed(s)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  playbackSpeed === s ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsLooping(!isLooping)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-colors ${
              isLooping ? 'bg-sky-950 text-sky-400 border border-sky-500/40' : 'text-slate-500 hover:text-slate-400'
            }`}
            title="Loop animation"
          >
            <Repeat className="w-3 h-3" />
            <span>Loop</span>
          </button>

          <button
            onClick={() => setShowMotionTrails(!showMotionTrails)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-colors ${
              showMotionTrails ? 'bg-sky-950 text-sky-400 border border-sky-500/40' : 'text-slate-500 hover:text-slate-400'
            }`}
            title="Toggle player motion path vectors"
          >
            {showMotionTrails ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            <span>Vectors</span>
          </button>
        </div>
      </div>

    </div>
  );
};
