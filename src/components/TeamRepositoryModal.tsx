import React, { useState } from 'react';
import { PlayerNode, TeamUnit } from '../types/tactics';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Shield, 
  Zap, 
  Brain, 
  HeartHandshake, 
  Award, 
  ArrowRightCircle, 
  Search, 
  Download, 
  Upload, 
  Plus,
  Compass,
  Activity
} from 'lucide-react';

interface TeamRepositoryModalProps {
  teamName: string;
  onUpdateTeamName: (name: string) => void;
  teamCategory: string;
  onUpdateTeamCategory: (cat: string) => void;
  players: PlayerNode[];
  onUpdatePlayer: (updated: PlayerNode) => void;
  onAddPlayer: (newPlayer: PlayerNode) => void;
  onDeletePlayer: (id: string) => void;
  onDeployToPitch: (player: PlayerNode) => void;
  onClose: () => void;
}

export const TeamRepositoryModal: React.FC<TeamRepositoryModalProps> = ({
  teamName,
  onUpdateTeamName,
  teamCategory,
  onUpdateTeamCategory,
  players,
  onUpdatePlayer,
  onAddPlayer,
  onDeletePlayer,
  onDeployToPitch,
  onClose
}) => {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>(players[0]?.id || '');
  const [filterUnit, setFilterUnit] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isEditingTeamName, setIsEditingTeamName] = useState<boolean>(false);
  const [tempTeamName, setTempTeamName] = useState<string>(teamName);

  // New Player Form State
  const [isAddingPlayer, setIsAddingPlayer] = useState<boolean>(false);
  const [newPlayerForm, setNewPlayerForm] = useState<{
    name: string;
    number: number;
    role: string;
    unit: TeamUnit;
    dominantFoot: 'Right' | 'Left' | 'Both';
  }>({
    name: '',
    number: players.length + 1,
    role: 'Central Midfielder',
    unit: 'MIDFIELD',
    dominantFoot: 'Right'
  });

  const selectedPlayer = players.find(p => p.id === selectedPlayerId) || players[0];

  // Filtered Players
  const filteredPlayers = players.filter(p => {
    const matchesUnit = filterUnit === 'ALL' || p.unit === filterUnit;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.number.toString().includes(searchQuery);
    return matchesUnit && matchesSearch;
  });

  // Calculate Team Averages
  const avgTech = Math.round(players.reduce((acc, p) => acc + (p.tpps.technical || 70), 0) / (players.length || 1));
  const avgPhys = Math.round(players.reduce((acc, p) => acc + (p.tpps.physical || 70), 0) / (players.length || 1));
  const avgPsych = Math.round(players.reduce((acc, p) => acc + (p.tpps.psychological || 70), 0) / (players.length || 1));
  const avgSocial = Math.round(players.reduce((acc, p) => acc + (p.tpps.social || 70), 0) / (players.length || 1));
  const overallTeamRating = Math.round((avgTech + avgPhys + avgPsych + avgSocial) / 4);

  // Handle Form Change for Selected Player
  const handleUpdateSelected = (field: string, value: any) => {
    if (!selectedPlayer) return;
    const updated = { ...selectedPlayer, [field]: value };
    onUpdatePlayer(updated);
  };

  const handleUpdateCompetency = (key: string, value: number) => {
    if (!selectedPlayer) return;
    const comp = selectedPlayer.tpps.competencies || {
      passingRange: selectedPlayer.tpps.technical,
      firstTouch: selectedPlayer.tpps.technical,
      dribbling1v1: selectedPlayer.tpps.technical,
      ballStriking: selectedPlayer.tpps.technical,
      speedAcceleration: selectedPlayer.tpps.physical,
      aerobicEndurance: selectedPlayer.tpps.physical,
      duelStrength: selectedPlayer.tpps.physical,
      agilityDeceleration: selectedPlayer.tpps.physical,
      scanningFrequency: selectedPlayer.tpps.psychological,
      decisionSpeed: selectedPlayer.tpps.psychological,
      composureUnderPress: selectedPlayer.tpps.psychological,
      positionalAwareness: selectedPlayer.tpps.psychological,
      leadership: selectedPlayer.tpps.social,
      communication: selectedPlayer.tpps.social,
      workRate: selectedPlayer.tpps.social,
      coachability: selectedPlayer.tpps.social,
    };

    const newComp = { ...comp, [key]: value };
    
    // Recompute pillar averages
    const techAvg = Math.round((newComp.passingRange + newComp.firstTouch + newComp.dribbling1v1 + newComp.ballStriking) / 4);
    const physAvg = Math.round((newComp.speedAcceleration + newComp.aerobicEndurance + newComp.duelStrength + newComp.agilityDeceleration) / 4);
    const psychAvg = Math.round((newComp.scanningFrequency + newComp.decisionSpeed + newComp.composureUnderPress + newComp.positionalAwareness) / 4);
    const socAvg = Math.round((newComp.leadership + newComp.communication + newComp.workRate + newComp.coachability) / 4);

    const updated: PlayerNode = {
      ...selectedPlayer,
      tpps: {
        ...selectedPlayer.tpps,
        technical: techAvg,
        physical: physAvg,
        psychological: psychAvg,
        social: socAvg,
        competencies: newComp
      }
    };
    onUpdatePlayer(updated);
  };

  const handleCreatePlayerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerForm.name.trim()) return;

    const newP: PlayerNode = {
      id: `p-${Date.now()}`,
      name: newPlayerForm.name.trim(),
      number: Number(newPlayerForm.number) || (players.length + 1),
      role: newPlayerForm.role,
      unit: newPlayerForm.unit,
      oopCoord: { x: 50, y: 50 },
      ipCoord: { x: 55, y: 50 },
      currentCoord: { x: 50, y: 50 },
      tpps: {
        technical: 75,
        physical: 75,
        psychological: 75,
        social: 75,
        dominantFoot: newPlayerForm.dominantFoot,
        preferredRole: newPlayerForm.role,
        competencies: {
          passingRange: 75,
          firstTouch: 78,
          dribbling1v1: 72,
          ballStriking: 74,
          speedAcceleration: 76,
          aerobicEndurance: 77,
          duelStrength: 73,
          agilityDeceleration: 76,
          scanningFrequency: 75,
          decisionSpeed: 74,
          composureUnderPress: 76,
          positionalAwareness: 75,
          leadership: 70,
          communication: 72,
          workRate: 80,
          coachability: 82
        },
        history: []
      }
    };

    onAddPlayer(newP);
    setSelectedPlayerId(newP.id);
    setIsAddingPlayer(false);
    setNewPlayerForm({
      name: '',
      number: players.length + 2,
      role: 'Central Midfielder',
      unit: 'MIDFIELD',
      dominantFoot: 'Right'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="w-full max-w-6xl max-h-[92vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-700 to-sky-500 p-0.5 shadow-lg shadow-sky-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                {isEditingTeamName ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={tempTeamName}
                      onChange={(e) => setTempTeamName(e.target.value)}
                      className="bg-slate-800 border border-sky-500 rounded px-2.5 py-0.5 text-sm font-extrabold text-white focus:outline-none"
                    />
                    <button
                      onClick={() => {
                        onUpdateTeamName(tempTeamName);
                        setIsEditingTeamName(false);
                      }}
                      className="p-1 rounded bg-sky-600 hover:bg-sky-500 text-white"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black tracking-tight text-white font-heading">
                      {teamName}
                    </h2>
                    <button
                      onClick={() => {
                        setTempTeamName(teamName);
                        setIsEditingTeamName(true);
                      }}
                      className="p-1 rounded text-slate-400 hover:text-sky-300 transition-colors"
                      title="Rename Team"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40 font-mono">
                  {players.length} Players
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Scottish FA Team Repository & Core Competencies Matrix
              </p>
            </div>
          </div>

          {/* Team Competency Quick Meters */}
          <div className="hidden lg:flex items-center gap-3 bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2 text-xs">
            <div className="flex flex-col items-center border-r border-slate-800 pr-3">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Overall</span>
              <span className="text-base font-black text-amber-400 font-mono">{overallTeamRating}</span>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono">
              <div className="flex flex-col">
                <span className="text-sky-400 font-bold">TECH {avgTech}</span>
                <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1">
                  <div className="h-full bg-sky-400" style={{ width: `${avgTech}%` }}></div>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-emerald-400 font-bold">PHYS {avgPhys}</span>
                <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1">
                  <div className="h-full bg-emerald-400" style={{ width: `${avgPhys}%` }}></div>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-purple-400 font-bold">COGN {avgPsych}</span>
                <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1">
                  <div className="h-full bg-purple-400" style={{ width: `${avgPsych}%` }}></div>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-amber-400 font-bold">SOC {avgSocial}</span>
                <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1">
                  <div className="h-full bg-amber-400" style={{ width: `${avgSocial}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Left Roster List + Right Competency Inspector */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
          
          {/* Left Roster Column (340px) */}
          <div className="w-full md:w-80 lg:w-96 border-r border-slate-800 flex flex-col bg-slate-950/60 shrink-0">
            {/* Search & Actions Bar */}
            <div className="p-3 border-b border-slate-800 flex flex-col gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search player, role, or #..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Unit Filter Tabs */}
              <div className="flex items-center justify-between gap-1 text-[11px] font-semibold">
                {['ALL', 'GK_DEFENCE', 'MIDFIELD', 'ATTACK'].map((unit) => (
                  <button
                    key={unit}
                    onClick={() => setFilterUnit(unit)}
                    className={`flex-1 py-1 rounded text-center transition-all cursor-pointer ${
                      filterUnit === unit 
                        ? 'bg-sky-600 text-white font-bold shadow-sm' 
                        : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {unit === 'ALL' ? 'All' : unit === 'GK_DEFENCE' ? 'Def' : unit === 'MIDFIELD' ? 'Mid' : 'Att'}
                  </button>
                ))}
              </div>

              {/* Add Player Trigger Button */}
              <button
                onClick={() => setIsAddingPlayer(true)}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add Player to Repository</span>
              </button>
            </div>

            {/* Players Scrollable List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5 custom-scrollbar">
              {filteredPlayers.map(p => {
                const isSelected = p.id === selectedPlayer?.id;
                const overall = Math.round((p.tpps.technical + p.tpps.physical + p.tpps.psychological + p.tpps.social) / 4);

                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPlayerId(p.id)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-2.5 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-sky-950/70 border-sky-500 text-white shadow-md'
                        : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Squad Number Avatar */}
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 shadow ${
                        p.unit === 'GK_DEFENCE' 
                          ? 'bg-blue-600 text-white' 
                          : p.unit === 'MIDFIELD' 
                          ? 'bg-sky-500 text-slate-950 font-black' 
                          : 'bg-amber-500 text-slate-950 font-black'
                      }`}>
                        {p.number}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs truncate">{p.name}</span>
                          <span className="text-[10px] font-mono text-slate-400">({p.tpps.dominantFoot?.[0] || 'R'})</span>
                        </div>
                        <span className="text-[11px] text-slate-400 truncate block">
                          {p.role}
                        </span>
                      </div>
                    </div>

                    {/* Overall Rating Badge */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex flex-col items-end">
                        <span className={`font-mono font-black text-xs ${
                          overall >= 80 ? 'text-emerald-400' : overall >= 70 ? 'text-sky-400' : 'text-amber-400'
                        }`}>
                          {overall}
                        </span>
                        <span className="text-[9px] text-slate-500 uppercase font-bold">OVR</span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredPlayers.length === 0 && (
                <div className="p-6 text-center text-slate-500 text-xs">
                  No players found matching your filter criteria.
                </div>
              )}
            </div>
          </div>

          {/* Right Core Competencies Inspector Column */}
          <div className="flex-1 flex flex-col overflow-y-auto bg-slate-900/40 p-5 custom-scrollbar">
            {selectedPlayer ? (
              <div className="flex flex-col gap-5 max-w-4xl mx-auto w-full">
                
                {/* Player Identity Bar */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-lg">
                  <div className="flex items-center gap-3.5">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-600 to-blue-800 flex items-center justify-center font-black text-2xl text-white shadow-xl shadow-sky-600/20">
                      {selectedPlayer.number}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={selectedPlayer.name}
                          onChange={(e) => handleUpdateSelected('name', e.target.value)}
                          className="text-lg font-black text-white bg-transparent border-b border-dashed border-slate-700 hover:border-sky-500 focus:border-sky-500 focus:outline-none px-1 py-0.5"
                          placeholder="Player Name"
                        />
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-sky-950 border border-sky-500/40 text-sky-300">
                          {selectedPlayer.unit.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                        <div className="flex items-center gap-1">
                          <span>Role:</span>
                          <input
                            type="text"
                            value={selectedPlayer.role}
                            onChange={(e) => handleUpdateSelected('role', e.target.value)}
                            className="bg-slate-800/80 rounded px-2 py-0.5 text-xs text-white focus:outline-none border border-slate-700"
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <span>Foot:</span>
                          <select
                            value={selectedPlayer.tpps.dominantFoot || 'Right'}
                            onChange={(e) => {
                              onUpdatePlayer({
                                ...selectedPlayer,
                                tpps: { ...selectedPlayer.tpps, dominantFoot: e.target.value as any }
                              });
                            }}
                            className="bg-slate-800/80 rounded px-2 py-0.5 text-xs text-white focus:outline-none border border-slate-700 cursor-pointer"
                          >
                            <option value="Right">Right</option>
                            <option value="Left">Left</option>
                            <option value="Both">Both Feet</option>
                          </select>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>Squad #:</span>
                          <input
                            type="number"
                            min="1"
                            max="99"
                            value={selectedPlayer.number}
                            onChange={(e) => handleUpdateSelected('number', Number(e.target.value))}
                            className="w-14 bg-slate-800/80 rounded px-2 py-0.5 text-xs text-white focus:outline-none border border-slate-700 font-mono font-bold"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Deploy to Pitch / Delete */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onDeployToPitch(selectedPlayer)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white font-bold text-xs shadow-lg shadow-sky-600/30 transition-all cursor-pointer"
                      title="Deploy this player's active position to tactical pitch"
                    >
                      <ArrowRightCircle className="w-4 h-4 text-amber-300" />
                      <span>Deploy to Pitch Lineup</span>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Remove ${selectedPlayer.name} from team repository?`)) {
                          onDeletePlayer(selectedPlayer.id);
                        }
                      }}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-600/50 transition-colors cursor-pointer"
                      title="Delete Player"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Core Competencies 4-Pillar Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* 1. Technical Competencies */}
                  <div className="bg-slate-950/70 border border-sky-900/40 rounded-2xl p-4 flex flex-col gap-3 shadow-md">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2 text-sky-400">
                        <Compass className="w-4 h-4" />
                        <h4 className="font-bold text-xs uppercase tracking-wider font-heading">
                          1. Technical Competencies (T)
                        </h4>
                      </div>
                      <span className="font-mono font-black text-sm text-sky-400">
                        {selectedPlayer.tpps.technical}/100
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {[
                        { key: 'passingRange', label: 'Passing Range & Accuracy', defaultVal: selectedPlayer.tpps.technical },
                        { key: 'firstTouch', label: '1st Touch / Directional Receiving', defaultVal: selectedPlayer.tpps.technical + 2 },
                        { key: 'dribbling1v1', label: '1v1 Ball Mastery & Retention', defaultVal: selectedPlayer.tpps.technical - 3 },
                        { key: 'ballStriking', label: 'Ball Striking & Finishing', defaultVal: selectedPlayer.tpps.technical }
                      ].map(item => {
                        const val = (selectedPlayer.tpps.competencies as any)?.[item.key] ?? Math.min(99, Math.max(40, item.defaultVal));
                        return (
                          <div key={item.key} className="flex flex-col gap-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-300 font-medium">{item.label}</span>
                              <span className="font-mono font-bold text-sky-400">{val}</span>
                            </div>
                            <input
                              type="range"
                              min="40"
                              max="99"
                              value={val}
                              onChange={(e) => handleUpdateCompetency(item.key, Number(e.target.value))}
                              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Physical Competencies */}
                  <div className="bg-slate-950/70 border border-emerald-900/40 rounded-2xl p-4 flex flex-col gap-3 shadow-md">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2 text-emerald-400">
                        <Zap className="w-4 h-4" />
                        <h4 className="font-bold text-xs uppercase tracking-wider font-heading">
                          2. Physical Competencies (P)
                        </h4>
                      </div>
                      <span className="font-mono font-black text-sm text-emerald-400">
                        {selectedPlayer.tpps.physical}/100
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {[
                        { key: 'speedAcceleration', label: 'Sprint Speed & Acceleration', defaultVal: selectedPlayer.tpps.physical },
                        { key: 'aerobicEndurance', label: 'Match Running Capacity / VO2', defaultVal: selectedPlayer.tpps.physical + 4 },
                        { key: 'duelStrength', label: 'Physical Shielding & Duel Strength', defaultVal: selectedPlayer.tpps.physical - 2 },
                        { key: 'agilityDeceleration', label: 'Agility & Change of Direction', defaultVal: selectedPlayer.tpps.physical + 1 }
                      ].map(item => {
                        const val = (selectedPlayer.tpps.competencies as any)?.[item.key] ?? Math.min(99, Math.max(40, item.defaultVal));
                        return (
                          <div key={item.key} className="flex flex-col gap-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-300 font-medium">{item.label}</span>
                              <span className="font-mono font-bold text-emerald-400">{val}</span>
                            </div>
                            <input
                              type="range"
                              min="40"
                              max="99"
                              value={val}
                              onChange={(e) => handleUpdateCompetency(item.key, Number(e.target.value))}
                              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3. Psychological / Cognitive Competencies */}
                  <div className="bg-slate-950/70 border border-purple-900/40 rounded-2xl p-4 flex flex-col gap-3 shadow-md">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2 text-purple-400">
                        <Brain className="w-4 h-4" />
                        <h4 className="font-bold text-xs uppercase tracking-wider font-heading">
                          3. Cognitive & Psychological (P)
                        </h4>
                      </div>
                      <span className="font-mono font-black text-sm text-purple-400">
                        {selectedPlayer.tpps.psychological}/100
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {[
                        { key: 'scanningFrequency', label: 'Off-Ball Scanning Frequency', defaultVal: selectedPlayer.tpps.psychological + 3 },
                        { key: 'decisionSpeed', label: 'Decision-Making Speed Under Pressure', defaultVal: selectedPlayer.tpps.psychological },
                        { key: 'composureUnderPress', label: 'Composure in High-Press Moments', defaultVal: selectedPlayer.tpps.psychological - 2 },
                        { key: 'positionalAwareness', label: 'Spatial & Positional Awareness', defaultVal: selectedPlayer.tpps.psychological + 1 }
                      ].map(item => {
                        const val = (selectedPlayer.tpps.competencies as any)?.[item.key] ?? Math.min(99, Math.max(40, item.defaultVal));
                        return (
                          <div key={item.key} className="flex flex-col gap-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-300 font-medium">{item.label}</span>
                              <span className="font-mono font-bold text-purple-400">{val}</span>
                            </div>
                            <input
                              type="range"
                              min="40"
                              max="99"
                              value={val}
                              onChange={(e) => handleUpdateCompetency(item.key, Number(e.target.value))}
                              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 4. Social & Behavioural Competencies */}
                  <div className="bg-slate-950/70 border border-amber-900/40 rounded-2xl p-4 flex flex-col gap-3 shadow-md">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2 text-amber-400">
                        <HeartHandshake className="w-4 h-4" />
                        <h4 className="font-bold text-xs uppercase tracking-wider font-heading">
                          4. Social & Behavioural (S)
                        </h4>
                      </div>
                      <span className="font-mono font-black text-sm text-amber-400">
                        {selectedPlayer.tpps.social}/100
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {[
                        { key: 'leadership', label: 'Tactical Leadership & Command', defaultVal: selectedPlayer.tpps.social },
                        { key: 'communication', label: 'Vocal Presence & Communication', defaultVal: selectedPlayer.tpps.social + 2 },
                        { key: 'workRate', label: 'Defensive Transition Work-Rate', defaultVal: selectedPlayer.tpps.social + 4 },
                        { key: 'coachability', label: 'Coachability & Tactical Adaptability', defaultVal: selectedPlayer.tpps.social + 3 }
                      ].map(item => {
                        const val = (selectedPlayer.tpps.competencies as any)?.[item.key] ?? Math.min(99, Math.max(40, item.defaultVal));
                        return (
                          <div key={item.key} className="flex flex-col gap-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-300 font-medium">{item.label}</span>
                              <span className="font-mono font-bold text-amber-400">{val}</span>
                            </div>
                            <input
                              type="range"
                              min="40"
                              max="99"
                              value={val}
                              onChange={(e) => handleUpdateCompetency(item.key, Number(e.target.value))}
                              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>

                {/* Scottish FA Individual Development Plan (IDP) Notes */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2 shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-heading">
                      Scottish FA Individual Development Plan (IDP) & Coach Notes
                    </span>
                    <span className="text-[11px] text-sky-400 font-mono">
                      Target Role: {selectedPlayer.role}
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    value={selectedPlayer.tpps.notes || ''}
                    onChange={(e) => {
                      onUpdatePlayer({
                        ...selectedPlayer,
                        tpps: { ...selectedPlayer.tpps, notes: e.target.value }
                      });
                    }}
                    placeholder="Enter coaching interventions, individual learning objectives, or tactical constraints for this player..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500 resize-none font-sans"
                  />
                </div>

              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                <Users className="w-12 h-12 mb-3 text-slate-600" />
                <p className="text-sm font-semibold">Select a player from the repository or create a new one.</p>
              </div>
            )}
          </div>

        </div>

        {/* Add Player Modal Sheet */}
        {isAddingPlayer && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-bold text-base text-white">Add New Player</h3>
                </div>
                <button
                  onClick={() => setIsAddingPlayer(false)}
                  className="p-1 rounded text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreatePlayerSubmit} className="flex flex-col gap-3.5 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lewis Ferguson"
                    value={newPlayerForm.name}
                    onChange={(e) => setNewPlayerForm({ ...newPlayerForm, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Squad Number</label>
                    <input
                      type="number"
                      min="1"
                      max="99"
                      value={newPlayerForm.number}
                      onChange={(e) => setNewPlayerForm({ ...newPlayerForm, number: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Dominant Foot</label>
                    <select
                      value={newPlayerForm.dominantFoot}
                      onChange={(e) => setNewPlayerForm({ ...newPlayerForm, dominantFoot: e.target.value as any })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="Right">Right</option>
                      <option value="Left">Left</option>
                      <option value="Both">Both Feet</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Unit</label>
                    <select
                      value={newPlayerForm.unit}
                      onChange={(e) => setNewPlayerForm({ ...newPlayerForm, unit: e.target.value as TeamUnit })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="GK_DEFENCE">Goalkeeper / Defence</option>
                      <option value="MIDFIELD">Midfield Unit</option>
                      <option value="ATTACK">Attacking Unit</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Primary Role</label>
                    <input
                      type="text"
                      placeholder="e.g. Box-to-Box Midfielder"
                      value={newPlayerForm.role}
                      onChange={(e) => setNewPlayerForm({ ...newPlayerForm, role: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsAddingPlayer(false)}
                    className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-600/30 cursor-pointer"
                  >
                    Create Player
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
