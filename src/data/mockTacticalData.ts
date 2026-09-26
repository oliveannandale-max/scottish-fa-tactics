import type { PlayerNode, ShadowPlayerNode, RoleTemplate, TeamUnit } from '../types/tactics';

export const INITIAL_BLUE_PLAYERS: PlayerNode[] = [
  // Goalkeeper
  {
    id: 'p1',
    number: 1,
    name: 'Angus Gunn',
    role: 'Sweeper Keeper',
    unit: 'GK_DEFENCE',
    oopCoord: { x: 5, y: 50 },
    ipCoord: { x: 12, y: 50 },
    currentCoord: { x: 5, y: 50 },
    targetRoleFit: 'Sweeper Keeper',
    tpps: {
      technical: 78,
      physical: 82,
      psychological: 85,
      social: 84,
      history: [
        { date: '2026-08-15', phase: 'UEFA B Block', technical: 75, physical: 80, psychological: 82, social: 80, notes: 'Improved distribution under high press' },
        { date: '2026-09-10', phase: 'UEFA A Block', technical: 78, physical: 82, psychological: 85, social: 84, notes: 'Proactive sweeping distance calibrated' }
      ]
    }
  },
  // Back Four
  {
    id: 'p2',
    number: 2,
    name: 'Nathan Patterson',
    role: 'Attacking Full-Back (Right)',
    unit: 'GK_DEFENCE',
    oopCoord: { x: 22, y: 15 },
    ipCoord: { x: 62, y: 10 },
    currentCoord: { x: 22, y: 15 },
    targetRoleFit: 'Attacking Full-Back',
    tpps: {
      technical: 84,
      physical: 90,
      psychological: 76,
      social: 79,
      history: [
        { date: '2026-08-15', phase: 'UEFA B Block', technical: 82, physical: 88, psychological: 74, social: 76, notes: 'Sprint repeatability top percentile' },
        { date: '2026-09-10', phase: 'UEFA A Block', technical: 84, physical: 90, psychological: 76, social: 79, notes: 'Overlap timing refined' }
      ]
    }
  },
  {
    id: 'p4',
    number: 4,
    name: 'Grant Hanley',
    role: 'Central Defender (Right)',
    unit: 'GK_DEFENCE',
    oopCoord: { x: 20, y: 38 },
    ipCoord: { x: 38, y: 35 },
    currentCoord: { x: 20, y: 38 },
    targetRoleFit: 'Stopper Center-Back',
    tpps: {
      technical: 74,
      physical: 88,
      psychological: 86,
      social: 88,
      history: [
        { date: '2026-08-15', phase: 'UEFA B Block', technical: 72, physical: 88, psychological: 84, social: 86, notes: 'Dominant aerial duel presence' },
        { date: '2026-09-10', phase: 'UEFA A Block', technical: 74, physical: 88, psychological: 86, social: 88, notes: 'Rest-defence tracking improved' }
      ]
    }
  },
  {
    id: 'p5',
    number: 5,
    name: 'Jack Hendry',
    role: 'Ball-Playing Defender (Left)',
    unit: 'GK_DEFENCE',
    oopCoord: { x: 20, y: 62 },
    ipCoord: { x: 40, y: 65 },
    currentCoord: { x: 20, y: 62 },
    targetRoleFit: 'Ball-Playing Defender',
    tpps: {
      technical: 82,
      physical: 84,
      psychological: 80,
      social: 82,
      history: [
        { date: '2026-08-15', phase: 'UEFA B Block', technical: 80, physical: 82, psychological: 78, social: 80, notes: 'Line-breaking passes executed cleanly' },
        { date: '2026-09-10', phase: 'UEFA A Block', technical: 82, physical: 84, psychological: 80, social: 82, notes: 'Stepping into midfield when unopposed' }
      ]
    }
  },
  {
    id: 'p3',
    number: 3,
    name: 'Andy Robertson (C)',
    role: 'Inverted / Overlapping Full-Back',
    unit: 'GK_DEFENCE',
    oopCoord: { x: 22, y: 85 },
    ipCoord: { x: 65, y: 90 },
    currentCoord: { x: 22, y: 85 },
    targetRoleFit: 'Inverted Full-Back',
    tpps: {
      technical: 90,
      physical: 92,
      psychological: 91,
      social: 95,
      history: [
        { date: '2026-08-15', phase: 'UEFA B Block', technical: 89, physical: 91, psychological: 90, social: 94, notes: 'Exceptional vocality and tactical cues' },
        { date: '2026-09-10', phase: 'UEFA A Block', technical: 90, physical: 92, psychological: 91, social: 95, notes: 'Rest-defence communication beacon' }
      ]
    }
  },
  // Midfield Three
  {
    id: 'p6',
    number: 6,
    name: 'Billy Gilmour',
    role: 'Single Pivot (Regista)',
    unit: 'MIDFIELD',
    oopCoord: { x: 34, y: 50 },
    ipCoord: { x: 50, y: 50 },
    currentCoord: { x: 34, y: 50 },
    targetRoleFit: 'No. 6 Single Pivot',
    tpps: {
      technical: 93,
      physical: 76,
      psychological: 94,
      social: 88,
      history: [
        { date: '2026-08-15', phase: 'UEFA B Block', technical: 91, physical: 74, psychological: 92, social: 85, notes: '360 scanning before receiving: 0.8 scans/sec' },
        { date: '2026-09-10', phase: 'UEFA A Block', technical: 93, physical: 76, psychological: 94, social: 88, notes: 'Bypassing opponent first line with half-turn' }
      ]
    }
  },
  {
    id: 'p8',
    number: 8,
    name: 'Callum McGregor',
    role: 'Interior / Box-to-Box Midfielder',
    unit: 'MIDFIELD',
    oopCoord: { x: 42, y: 35 },
    ipCoord: { x: 62, y: 35 },
    currentCoord: { x: 42, y: 35 },
    targetRoleFit: 'Box-to-Box 8',
    tpps: {
      technical: 88,
      physical: 89,
      psychological: 89,
      social: 92,
      history: [
        { date: '2026-08-15', phase: 'UEFA B Block', technical: 86, physical: 88, psychological: 87, social: 90, notes: 'Connecting passes in right half-space' },
        { date: '2026-09-10', phase: 'UEFA A Block', technical: 88, physical: 89, psychological: 89, social: 92, notes: 'Underlap penetrations into box' }
      ]
    }
  },
  {
    id: 'p10',
    number: 10,
    name: 'Scott McTominay',
    role: 'Advanced Midfielder / Shadow Striker',
    unit: 'MIDFIELD',
    oopCoord: { x: 42, y: 65 },
    ipCoord: { x: 74, y: 58 },
    currentCoord: { x: 42, y: 65 },
    targetRoleFit: 'Advanced 10 / Shadow Striker',
    tpps: {
      technical: 84,
      physical: 95,
      psychological: 88,
      social: 86,
      history: [
        { date: '2026-08-15', phase: 'UEFA B Block', technical: 82, physical: 94, psychological: 85, social: 84, notes: 'Late arriving runs into 18-yard box' },
        { date: '2026-09-10', phase: 'UEFA A Block', technical: 84, physical: 95, psychological: 88, social: 86, notes: 'Physical dominance in attacking transitions' }
      ]
    }
  },
  // Front Three
  {
    id: 'p7',
    number: 7,
    name: 'John McGinn',
    role: 'Inverted Winger / Half-Space Raider',
    unit: 'ATTACK',
    oopCoord: { x: 55, y: 22 },
    ipCoord: { x: 78, y: 28 },
    currentCoord: { x: 55, y: 22 },
    targetRoleFit: 'Inverted Winger',
    tpps: {
      technical: 87,
      physical: 91,
      psychological: 92,
      social: 91,
      history: [
        { date: '2026-08-15', phase: 'UEFA B Block', technical: 85, physical: 90, psychological: 90, social: 89, notes: 'Using body shielding to retain possession' },
        { date: '2026-09-10', phase: 'UEFA A Block', technical: 87, physical: 91, psychological: 92, social: 91, notes: 'Aggressive counter-pressing reaction: 2.1s' }
      ]
    }
  },
  {
    id: 'p9',
    number: 9,
    name: 'Che Adams',
    role: 'Complete Center-Forward',
    unit: 'ATTACK',
    oopCoord: { x: 58, y: 50 },
    ipCoord: { x: 86, y: 50 },
    currentCoord: { x: 58, y: 50 },
    targetRoleFit: 'Target Forward',
    tpps: {
      technical: 81,
      physical: 87,
      psychological: 82,
      social: 83,
      history: [
        { date: '2026-08-15', phase: 'UEFA B Block', technical: 80, physical: 85, psychological: 80, social: 81, notes: 'Stretching defensive lines with blindside runs' },
        { date: '2026-09-10', phase: 'UEFA A Block', technical: 81, physical: 87, psychological: 82, social: 83, notes: 'Hold-up link play with interior midfielders' }
      ]
    }
  },
  {
    id: 'p11',
    number: 11,
    name: 'Ben Doak',
    role: 'Direct 1v1 Winger',
    unit: 'ATTACK',
    oopCoord: { x: 55, y: 78 },
    ipCoord: { x: 80, y: 82 },
    currentCoord: { x: 55, y: 78 },
    targetRoleFit: '1v1 Direct Winger',
    tpps: {
      technical: 86,
      physical: 93,
      psychological: 77,
      social: 74,
      history: [
        { date: '2026-08-15', phase: 'UEFA B Block', technical: 84, physical: 91, psychological: 75, social: 72, notes: 'Explosive burst in isolated wide channels' },
        { date: '2026-09-10', phase: 'UEFA A Block', technical: 86, physical: 93, psychological: 77, social: 74, notes: 'End-product delivery off byline' }
      ]
    }
  }
];

export const INITIAL_SHADOW_PLAYERS: ShadowPlayerNode[] = [
  { id: 's1', number: 1, role: 'GK', baseCoord: { x: 95, y: 50 }, currentCoord: { x: 95, y: 50 } },
  { id: 's2', number: 2, role: 'RB', baseCoord: { x: 82, y: 20 }, currentCoord: { x: 82, y: 20 } },
  { id: 's4', number: 4, role: 'CB', baseCoord: { x: 80, y: 40 }, currentCoord: { x: 80, y: 40 } },
  { id: 's5', number: 5, role: 'CB', baseCoord: { x: 80, y: 60 }, currentCoord: { x: 80, y: 60 } },
  { id: 's3', number: 3, role: 'LB', baseCoord: { x: 82, y: 80 }, currentCoord: { x: 82, y: 80 } },
  { id: 's6', number: 6, role: 'DM', baseCoord: { x: 68, y: 42 }, currentCoord: { x: 68, y: 42 }, constraints: ['Max 2 touches', 'Screen passing lane'] },
  { id: 's8', number: 8, role: 'CM', baseCoord: { x: 68, y: 58 }, currentCoord: { x: 68, y: 58 }, constraints: ['Passive Jockey'] },
  { id: 's7', number: 7, role: 'RW', baseCoord: { x: 55, y: 22 }, currentCoord: { x: 55, y: 22 } },
  { id: 's10', number: 10, role: 'AM', baseCoord: { x: 58, y: 50 }, currentCoord: { x: 58, y: 50 } },
  { id: 's11', number: 11, role: 'LW', baseCoord: { x: 55, y: 78 }, currentCoord: { x: 55, y: 78 } },
  { id: 's9', number: 9, role: 'CF', baseCoord: { x: 44, y: 50 }, currentCoord: { x: 44, y: 50 } }
];

export const ROLE_TEMPLATES: Record<string, RoleTemplate> = {
  'No. 6 Single Pivot': {
    roleName: 'No. 6 Single Pivot (Regista / Controller)',
    description: 'Dictates game tempo, creates passing angles behind the first line of press, connects units, and establishes rest-defence equilibrium.',
    idealTPPS: {
      technical: 92,
      physical: 78,
      psychological: 94,
      social: 88
    },
    recommendedConditionedGames: [
      'SFA 4v4 + 3 Float Midfield Retention (2 touches, 3-zone progression)',
      'Bridged Alternative Gate Game: Force Central Pivot or Pivot-to-Fullback bounce',
      'Cognitive Press Simulation: Visual audio cues for immediate scan before reception'
    ]
  },
  'Inverted Full-Back': {
    roleName: 'Inverted Full-Back',
    description: 'Steps into central midfield in possession to form a 3+2 rest-defence structure, preventing central counters while opening wide isolation for wingers.',
    idealTPPS: {
      technical: 88,
      physical: 90,
      psychological: 89,
      social: 86
    },
    recommendedConditionedGames: [
      'Overload-to-Isolate 8v8: Fullback tucks into half-space, triggers diagonal switch',
      'Rest-Defence Reaction Drill: On turnover whistle, nearest fullback sprint-traps central corridor'
    ]
  },
  'Target Forward': {
    roleName: 'Target Forward / Complete Striker',
    description: 'Occupies both opposing center-backs, provides depth, secures hold-up transitions, and executes blindside attacking runs into the 6-yard box.',
    idealTPPS: {
      technical: 84,
      physical: 92,
      psychological: 85,
      social: 84
    },
    recommendedConditionedGames: [
      '3v2 Box Entry Finishing with Back-to-Goal Hold-up Constraint',
      'Third-Man Run Pattern: Striker lays off to No. 10, sprinting into penalty box channel'
    ]
  },
  'Stopper Center-Back': {
    roleName: 'Stopper Center-Back',
    description: 'Dominates aerial and ground duels, commands defensive line height, communicates drop/step cues, and tracks blindside runners.',
    idealTPPS: {
      technical: 75,
      physical: 92,
      psychological: 88,
      social: 90
    },
    recommendedConditionedGames: [
      'Defending the Box 4v3 Under Wave Crosses',
      'Step-and-Drop Line Compression under Ball-Free Pressure'
    ]
  }
};

export const UNIT_DETAILS: Record<TeamUnit, {
  name: string;
  uefaFocus: string;
  physicalKpi: string;
  scottishFaMethodology: {
    coach: string;
    environment: string;
    player: string;
    game: string;
  };
}> = {
  ALL: {
    name: 'Full Team (Game Model)',
    uefaFocus: 'Holistic synchronization across all 3 vertical thirds and 5 horizontal channels. Rest-defence balance in IP and compact block in OOP.',
    physicalKpi: 'Total team high-speed distance (>19.8 km/h), average block compactness width < 32m.',
    scottishFaMethodology: {
      coach: 'Intervene using Coaching in the Game; set clear visual references for line heights.',
      environment: 'Full 11v11 pitch with zoned horizontal channels & vertical thirds clearly designated.',
      player: 'Empower individual scanning, autonomy in recognition of triggers, and unit leadership.',
      game: 'Enforce realistic transition consequences: 6-second counter-press or drop-and-compact.'
    }
  },
  GK_DEFENCE: {
    name: 'Goalkeeper & Back Four Unit',
    uefaFocus: 'Defensive Line Height, compactness between CBs and FBs (10-12m max), defending the space behind vs defending the box.',
    physicalKpi: 'Explosive acceleration (<10m deceleration/recovery sprints), vertical jump in box duels.',
    scottishFaMethodology: {
      coach: 'Use Terminal interventions on breakdowns; ask "Where was your body shape angled?"',
      environment: 'Defensive half, 1 regulation goal + 2 mini counter-attack goals at midfield line.',
      player: 'Vocal communication from GK and central defenders; proactive body shape (45° angle).',
      game: 'Rest-defence 3+2 structure maintained whenever ball enters attacking final third.'
    }
  },
  MIDFIELD: {
    name: 'Midfield Three Unit (Pivot & Interiors)',
    uefaFocus: 'Staggered vertical depths (No. 6 lower, No. 8/10 higher), creating diagonal passing angles, 3rd man progression, and screening striker passes.',
    physicalKpi: 'Aerobic threshold VO2 max, change-of-direction agility, high-frequency scanning rate (>0.6 scans/sec).',
    scottishFaMethodology: {
      coach: 'Use Concurrent cues: "Check your shoulder", "Fix the opponent", "Half-turn".',
      environment: 'Middle third focus with central grid box (20m x 25m) highlighting passing lanes.',
      player: 'Body shape open to switch play; willingness to receive with an opponent on the back.',
      game: 'Must achieve minimum 1 line-breaking forward pass or switch before crossing.'
    }
  },
  ATTACK: {
    name: 'Attacking Three Unit (Wingers & Striker)',
    uefaFocus: 'Width in wide channels, blindside diagonal runs behind defensive line, 1v1 isolation, box occupation patterns (near post, penalty spot, far post).',
    physicalKpi: 'Max velocity sprinting (>25.2 km/h), repeated sprint ability (RSA) in counter-pressing.',
    scottishFaMethodology: {
      coach: 'Praise bold 1v1 execution; prompt "If the cross comes early, who attacks the near post?"',
      environment: 'Attacking half with wide channels (15m each) and central penalty box area.',
      player: 'Instinctive movement timing; coordinated runs (one short to drag CB, one long behind).',
      game: 'Goal scored from a Bridged Alternative pattern counts double.'
    }
  }
};
