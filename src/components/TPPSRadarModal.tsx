import React, { useState } from 'react';
import { PlayerNode, RoleTemplate } from '../types/tactics';
import { ROLE_TEMPLATES } from '../data/mockTacticalData';
import { 
  X, 
  TrendingUp, 
  TrendingDown, 
  Award, 
  Dumbbell, 
  Brain, 
  Users, 
  Crosshair,
  Lightbulb,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface TPPSRadarModalProps {
  player: PlayerNode | null;
  onClose: () => void;
}

export const TPPSRadarModal: React.FC<TPPSRadarModalProps> = ({
  player,
  onClose
}) => {
  if (!player) return null;

  const [selectedRole, setSelectedRole] = useState<string>(
    player.targetRoleFit || 'No. 6 Single Pivot'
  );

  const roleTemplate = ROLE_TEMPLATES[selectedRole] || ROLE_TEMPLATES['No. 6 Single Pivot'];

  // Calculate Tactical Unit Fit %
  // Weighted difference between player TPPS and ideal role template
  const ideal = roleTemplate.idealTPPS;
  const pTPPS = player.tpps;

  const diffTech = Math.max(0, 100 - Math.abs(pTPPS.technical - ideal.technical));
  const diffPhys = Math.max(0, 100 - Math.abs(pTPPS.physical - ideal.physical));
  const diffPsych = Math.max(0, 100 - Math.abs(pTPPS.psychological - ideal.psychological));
  const diffSoc = Math.max(0, 100 - Math.abs(pTPPS.social - ideal.social));

  const fitPercent = Math.round((diffTech + diffPhys + diffPsych + diffSoc) / 4);

  // Deficit identification
  const deficits: { label: string; deficit: number; icon: any }[] = [];
  if (pTPPS.technical < ideal.technical) {
    deficits.push({ label: 'Technical Execution', deficit: ideal.technical - pTPPS.technical, icon: Crosshair });
  }
  if (pTPPS.physical < ideal.physical) {
    deficits.push({ label: 'Physical Endurance / Duels', deficit: ideal.physical - pTPPS.physical, icon: Dumbbell });
  }
  if (pTPPS.psychological < ideal.psychological) {
    deficits.push({ label: 'Psychological Composure / Scanning', deficit: ideal.psychological - pTPPS.psychological, icon: Brain });
  }
  if (pTPPS.social < ideal.social) {
    deficits.push({ label: 'Social Leadership / Communication', deficit: ideal.social - pTPPS.social, icon: Users });
  }

  // Radar Chart Geometry (4 Axes: Top=Technical, Right=Physical, Bottom=Psychological, Left=Social)
  const size = 260;
  const center = size / 2;
  const radius = 100;

  const getCoordinates = (value: number, angleDeg: number) => {
    const angleRad = (angleDeg - 90) * (Math.PI / 180);
    const r = (value / 100) * radius;
    return {
      x: center + r * Math.cos(angleRad),
      y: center + r * Math.sin(angleRad)
    };
  };

  const pTechCoord = getCoordinates(pTPPS.technical, 0);       // Top
  const pPhysCoord = getCoordinates(pTPPS.physical, 90);       // Right
  const pPsychCoord = getCoordinates(pTPPS.psychological, 180);// Bottom
  const pSocCoord = getCoordinates(pTPPS.social, 270);        // Left
  const playerPolygon = `${pTechCoord.x},${pTechCoord.y} ${pPhysCoord.x},${pPhysCoord.y} ${pPsychCoord.x},${pPsychCoord.y} ${pSocCoord.x},${pSocCoord.y}`;

  const iTechCoord = getCoordinates(ideal.technical, 0);
  const iPhysCoord = getCoordinates(ideal.physical, 90);
  const iPsychCoord = getCoordinates(ideal.psychological, 180);
  const iSocCoord = getCoordinates(ideal.social, 270);
  const idealPolygon = `${iTechCoord.x},${iTechCoord.y} ${iPhysCoord.x},${iPhysCoord.y} ${iPsychCoord.x},${iPsychCoord.y} ${iSocCoord.x},${iSocCoord.y}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 border-2 border-sky-400 flex items-center justify-center text-white font-bold text-lg">
              {player.number}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">{player.name}</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-950 text-sky-300 border border-sky-800">
                  {player.unit}
                </span>
              </div>
              <p className="text-xs text-slate-400">{player.role}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: 4-Axis TPPS Radar Chart */}
          <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-950 border border-slate-800/80">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              TPPS 4-Corner Radar (Player vs Role Ideal)
            </span>

            <svg width={size} height={size} className="overflow-visible">
              {/* Concentric Guide Circles */}
              {[25, 50, 75, 100].map(level => (
                <circle
                  key={level}
                  cx={center}
                  cy={center}
                  r={(level / 100) * radius}
                  fill="none"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="1"
                />
              ))}

              {/* Axis Crosshairs */}
              <line x1={center} y1={center - radius} x2={center} y2={center + radius} stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
              <line x1={center - radius} y1={center} x2={center + radius} y2={center} stroke="rgba(255,255,255,0.12)" strokeWidth="1" />

              {/* Ideal Role Polygon (Dashed Gold) */}
              <polygon
                points={idealPolygon}
                fill="rgba(245, 158, 11, 0.12)"
                stroke="#f59e0b"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />

              {/* Player Current Polygon (Vibrant Blue/Cyan) */}
              <polygon
                points={playerPolygon}
                fill="rgba(56, 189, 248, 0.28)"
                stroke="#38bdf8"
                strokeWidth="2.5"
              />

              {/* Points */}
              {[pTechCoord, pPhysCoord, pPsychCoord, pSocCoord].map((pt, i) => (
                <circle key={i} cx={pt.x} cy={pt.y} r={4} fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
              ))}

              {/* Axis Labels */}
              <text x={center} y={center - radius - 10} fill="#38bdf8" fontSize="10" fontWeight="bold" textAnchor="middle">
                TECHNICAL ({pTPPS.technical})
              </text>
              <text x={center + radius + 15} y={center + 3} fill="#10b981" fontSize="10" fontWeight="bold" textAnchor="start">
                PHYSICAL ({pTPPS.physical})
              </text>
              <text x={center} y={center + radius + 18} fill="#a855f7" fontSize="10" fontWeight="bold" textAnchor="middle">
                PSYCHOLOGICAL ({pTPPS.psychological})
              </text>
              <text x={center - radius - 15} y={center + 3} fill="#f59e0b" fontSize="10" fontWeight="bold" textAnchor="end">
                SOCIAL ({pTPPS.social})
              </text>
            </svg>

            {/* Radar Legend */}
            <div className="flex items-center gap-4 mt-3 text-[11px]">
              <div className="flex items-center gap-1.5 text-sky-400">
                <span className="w-3 h-3 rounded bg-sky-500/50 border border-sky-400"></span>
                <span>Current Player</span>
              </div>
              <div className="flex items-center gap-1.5 text-amber-400">
                <span className="w-3 h-3 rounded bg-amber-500/30 border border-amber-400 border-dashed"></span>
                <span>Role Ideal Benchmark</span>
              </div>
            </div>
          </div>

          {/* Right Column: Tactical Unit Fit & SFA Conditioned Games */}
          <div className="flex flex-col gap-4">
            {/* Target Role Selector & Fit % */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">
                Benchmark Role Template
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-sky-400 mb-3"
              >
                {Object.keys(ROLE_TEMPLATES).map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800">
                <div>
                  <span className="text-xs text-slate-400 font-semibold block">Tactical Unit Fit</span>
                  <span className="text-[11px] text-slate-500">Compatibility with role demands</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`text-2xl font-mono font-bold ${fitPercent >= 80 ? 'text-emerald-400' : fitPercent >= 65 ? 'text-amber-400' : 'text-red-400'}`}>
                    {fitPercent}%
                  </div>
                  {fitPercent >= 80 ? (
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                  )}
                </div>
              </div>
            </div>

            {/* Recommended Conditioned Games for Deficits */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                SFA Conditioned Games to Train Deficits
              </div>

              {deficits.length > 0 ? (
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] text-slate-400">
                    Targeted training exercises to close the gap for <span className="font-semibold text-white">{selectedRole}</span>:
                  </span>
                  {roleTemplate.recommendedConditionedGames.map((game, i) => (
                    <div key={i} className="p-2 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300 flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center shrink-0 text-[10px]">
                        {i + 1}
                      </span>
                      <span>{game}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-emerald-400">
                  Player meets or exceeds all physical, technical, and psychological benchmarks for this role template!
                </p>
              )}
            </div>

            {/* Historical Snapshots */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-xs font-bold uppercase text-slate-400 block mb-2">
                Historical Development Log (Deltas)
              </span>
              <div className="flex flex-col gap-2">
                {player.tpps.history.map((h, idx) => (
                  <div key={idx} className="p-2 rounded bg-slate-900 border border-slate-800/80 text-[11px] flex flex-col gap-1">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="font-mono text-sky-400">{h.date}</span>
                      <span className="font-semibold text-slate-300">{h.phase}</span>
                    </div>
                    <p className="text-slate-300 italic">{h.notes}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
