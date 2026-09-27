export type LicenceTier = 'UEFA_C' | 'UEFA_B' | 'UEFA_A';

export type TacticalPhase = 'OOP' | 'TRANSITION' | 'IP'; // Out of Possession, Transition, In Possession

export type TeamUnit = 'ALL' | 'GK_DEFENCE' | 'MIDFIELD' | 'ATTACK';

export type BlockHeight = 'LOW_BLOCK' | 'MID_BLOCK' | 'HIGH_PRESS';

export type FormationName = 
  | '1-4-3-3' 
  | '1-4-4-2' 
  | '1-4-2-3-1' 
  | '1-3-5-2' 
  | '1-4-4-2_TO_1-3-2-5'; // UEFA A Dynamic shape

export interface PitchCoordinates {
  x: number; // 0 to 100 percentage of pitch width
  y: number; // 0 to 100 percentage of pitch height
}

export interface GranularCompetencies {
  // Technical
  passingRange: number;
  firstTouch: number;
  dribbling1v1: number;
  ballStriking: number;
  // Physical
  speedAcceleration: number;
  aerobicEndurance: number;
  duelStrength: number;
  agilityDeceleration: number;
  // Cognitive / Psychological
  scanningFrequency: number;
  decisionSpeed: number;
  composureUnderPress: number;
  positionalAwareness: number;
  // Social / Behavioural
  leadership: number;
  communication: number;
  workRate: number;
  coachability: number;
}

export interface TPPSProfile {
  technical: number;     // 0 - 100 (Overall average)
  physical: number;      // 0 - 100
  psychological: number; // 0 - 100
  social: number;        // 0 - 100
  competencies?: GranularCompetencies;
  dominantFoot?: 'Right' | 'Left' | 'Both';
  preferredRole?: string;
  notes?: string;
  history: {
    date: string;
    phase: string;
    technical: number;
    physical: number;
    psychological: number;
    social: number;
    notes: string;
  }[];
}

export interface PlayerNode {
  id: string;
  number: number;
  name: string;
  role: string;
  unit: TeamUnit;
  oopCoord: PitchCoordinates; // Out of Possession starting position
  ipCoord: PitchCoordinates;  // In Possession target position
  currentCoord: PitchCoordinates;
  tpps: TPPSProfile;
  targetRoleFit?: string;
  isGhostVisible?: boolean;
}

export type MannequinColor = 'yellow' | 'orange' | 'red' | 'blue' | 'white' | 'dark' | 'neon';
export type EquipmentType = 'mannequin' | 'cone' | 'pole' | 'hurdle' | 'mini_goal';

export interface MannequinNode {
  id: string;
  x: number; // 0 - 100
  y: number; // 0 - 100
  type: EquipmentType;
  color: MannequinColor;
  rotation?: number; // degrees
  label?: string;
}

export type DrawingType = 
  | 'CURVED_ARROW' 
  | 'STAGGERED_ARROW' 
  | 'PASS_ARROW' 
  | 'RUN_ARROW' 
  | 'DRIBBLE_ARROW' 
  | 'PRESS_ZONE';

export interface TacticalDrawing {
  id: string;
  type: DrawingType;
  points: PitchCoordinates[];
  color: string;
  label?: string;
  controlPoint?: PitchCoordinates; // for curved bezier arrows
}

export interface AnimationKeyframe {
  id: string;
  frameIndex: number;
  label: string;
  playerCoords: Record<string, PitchCoordinates>;
  shadowCoords?: Record<string, PitchCoordinates>;
  ballCoord: PitchCoordinates;
  mannequinCoords?: Record<string, PitchCoordinates>;
}

export interface TeamRoster {
  id: string;
  teamName: string;
  category: string; // e.g. "Scottish FA UEFA B Cohort / U21 Squad"
  players: PlayerNode[];
}

export interface ShadowPlayerNode {
  id: string;
  number: number;
  role: string;
  baseCoord: PitchCoordinates;
  currentCoord: PitchCoordinates;
  constraints?: string[];
}

export interface TacticalPremise {
  id: string;
  title: string;
  description: string;
  fromPlayerId: string;
  toPlayerId: string;
  type: 'PASS' | 'DRIBBLE' | 'OVERLAP' | 'THIRD_MAN';
}

export interface BridgedAlternative {
  id: string;
  problemTrigger: string; // e.g. "Opponent No. 8 blocks passing lane to Single Pivot"
  actionSolution: string; // e.g. "No. 4 bounces to Inverted Fullback or plays diagonal to Winger"
  fromPlayerId: string;
  toPlayerId: string;
  mapped: boolean;
}

export type InterventionType = 'CONCURRENT' | 'TERMINAL' | 'COACHING_IN_THE_GAME';

export interface LiveStoppagePin {
  id: string;
  x: number;
  y: number;
  type: InterventionType;
  cueTrigger: string;
  coachingQuestion: string;
  unitInvolved: TeamUnit;
  timestamp: string;
}

export type SessionStage = 'PLAN' | 'COACH' | 'REFLECT';

export interface SessionPlan {
  id: string;
  licenceTier: LicenceTier;
  title: string;
  pillar: 'THE_COACH' | 'THE_ENVIRONMENT' | 'THE_PLAYER' | 'THE_GAME';
  phase: TacticalPhase;
  focusedUnit: TeamUnit;
  primaryObjective: string;
  unlocked: boolean;
  timings: {
    drillMinutes: number;       // e.g. 7m
    grpMinutes: number;         // Game Related Practice 7m
    gameMinutes: number;        // Conditioned Game 6m or Shaping 12m
  };
  premise?: TacticalPremise;
  bridgedAlternative?: BridgedAlternative;
  stoppages: LiveStoppagePin[];
  reflection?: {
    wasBridgedRecognized: boolean;
    successRate: number; // 0 - 100%
    playerFeedback: string;
    coachNotes: string;
    completedAt: string;
  };
}

export interface RoleTemplate {
  roleName: string;
  description: string;
  idealTPPS: {
    technical: number;
    physical: number;
    psychological: number;
    social: number;
  };
  recommendedConditionedGames: string[];
}
