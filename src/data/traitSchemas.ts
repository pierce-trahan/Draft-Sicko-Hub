import { TraitDef } from '../types';

// Spec 03 — per-position trait schemas. Each position defines its own sub-traits,
// each rolling up under one of the five pillars, with relative weights (~sum to 1).
//
// NOTE (T-1): these lists + weights are a working DRAFT. The authoritative
// per-position traits are a scouting-judgment content task to finalize with the
// user. See docs/specs/03-position-aware-trait-model.md (open item T-1).

export const TRAIT_SCHEMAS: Record<string, TraitDef[]> = {
  QB: [
    { key: 'arm_strength', label: 'Arm Strength', pillar: 'athleticism', weight: 0.15 },
    { key: 'deep_accuracy', label: 'Deep Accuracy', pillar: 'technique', weight: 0.10 },
    { key: 'short_med_accuracy', label: 'Short/Med Accuracy', pillar: 'technique', weight: 0.15 },
    { key: 'processing', label: 'Processing & Anticipation', pillar: 'footballIQ', weight: 0.20 },
    { key: 'pocket_presence', label: 'Pocket Presence', pillar: 'footballIQ', weight: 0.15 },
    { key: 'mobility', label: 'Mobility & Off-Script', pillar: 'athleticism', weight: 0.05 },
    { key: 'mechanics', label: 'Mechanics & Release', pillar: 'technique', weight: 0.05 },
    { key: 'decision_making', label: 'Decision Making', pillar: 'footballIQ', weight: 0.05 },
    { key: 'production', label: 'College Production', pillar: 'production', weight: 0.05 },
    { key: 'size_frame', label: 'Size & Frame', pillar: 'sizeAndFrame', weight: 0.05 },
  ],
  RB: [
    { key: 'vision', label: 'Vision & Patience', pillar: 'footballIQ', weight: 0.20 },
    { key: 'contact_balance', label: 'Contact Balance', pillar: 'technique', weight: 0.15 },
    { key: 'elusiveness', label: 'Elusiveness & Agility', pillar: 'athleticism', weight: 0.15 },
    { key: 'burst_speed', label: 'Burst & Top Speed', pillar: 'athleticism', weight: 0.15 },
    { key: 'pass_catching', label: 'Pass Catching', pillar: 'technique', weight: 0.10 },
    { key: 'pass_protection', label: 'Pass Protection', pillar: 'technique', weight: 0.05 },
    { key: 'production', label: 'College Production', pillar: 'production', weight: 0.10 },
    { key: 'size_frame', label: 'Size & Durability', pillar: 'sizeAndFrame', weight: 0.10 },
  ],
  WR: [
    { key: 'route_running', label: 'Route Running', pillar: 'technique', weight: 0.20 },
    { key: 'separation', label: 'Separation Ability', pillar: 'athleticism', weight: 0.15 },
    { key: 'hands', label: 'Hands & Catch Radius', pillar: 'technique', weight: 0.15 },
    { key: 'yac', label: 'YAC & Open Field', pillar: 'athleticism', weight: 0.10 },
    { key: 'release_press', label: 'Release vs Press', pillar: 'technique', weight: 0.10 },
    { key: 'deep_speed', label: 'Deep Speed', pillar: 'athleticism', weight: 0.10 },
    { key: 'contested_catch', label: 'Contested Catch', pillar: 'technique', weight: 0.05 },
    { key: 'production', label: 'College Production', pillar: 'production', weight: 0.10 },
    { key: 'size_frame', label: 'Length & Frame', pillar: 'sizeAndFrame', weight: 0.05 },
  ],
  TE: [
    { key: 'hands', label: 'Catching & Radius', pillar: 'technique', weight: 0.20 },
    { key: 'route_running', label: 'Route Running', pillar: 'technique', weight: 0.15 },
    { key: 'inline_blocking', label: 'In-Line Blocking', pillar: 'technique', weight: 0.15 },
    { key: 'athleticism', label: 'Athleticism & Speed', pillar: 'athleticism', weight: 0.15 },
    { key: 'yac', label: 'YAC Ability', pillar: 'athleticism', weight: 0.10 },
    { key: 'size_frame', label: 'Size & Frame', pillar: 'sizeAndFrame', weight: 0.10 },
    { key: 'football_iq', label: 'Coverage Processing', pillar: 'footballIQ', weight: 0.05 },
    { key: 'production', label: 'College Production', pillar: 'production', weight: 0.10 },
  ],
  OT: [
    { key: 'pass_protect', label: 'Pass Protection Mechanics', pillar: 'technique', weight: 0.25 },
    { key: 'anchor', label: 'Anchor & Core Power', pillar: 'sizeAndFrame', weight: 0.15 },
    { key: 'footwork', label: 'Footwork & Agility', pillar: 'athleticism', weight: 0.15 },
    { key: 'length_frame', label: 'Arm Length & Frame', pillar: 'sizeAndFrame', weight: 0.15 },
    { key: 'run_blocking', label: 'Run Blocking Drive', pillar: 'technique', weight: 0.15 },
    { key: 'processing', label: 'Stunt & Blitz Recognition', pillar: 'footballIQ', weight: 0.10 },
    { key: 'production', label: 'College Production', pillar: 'production', weight: 0.05 },
  ],
  IOL: [
    { key: 'anchor', label: 'Anchor & Functional Power', pillar: 'sizeAndFrame', weight: 0.20 },
    { key: 'run_blocking', label: 'Interior Run Blocking', pillar: 'technique', weight: 0.20 },
    { key: 'pass_protect', label: 'Pass Protection Technique', pillar: 'technique', weight: 0.20 },
    { key: 'mobility', label: 'Pulling & Second-Level Range', pillar: 'athleticism', weight: 0.10 },
    { key: 'processing', label: 'Blitz Recognition & Calls', pillar: 'footballIQ', weight: 0.15 },
    { key: 'technique_frame', label: 'Hand Placement & Pad Level', pillar: 'technique', weight: 0.10 },
    { key: 'production', label: 'College Production', pillar: 'production', weight: 0.05 },
  ],
  EDGE: [
    { key: 'get_off', label: 'First Step Get-off', pillar: 'athleticism', weight: 0.20 },
    { key: 'bend', label: 'Bend & Cornering', pillar: 'athleticism', weight: 0.15 },
    { key: 'power', label: 'Power & Bull Rush', pillar: 'sizeAndFrame', weight: 0.15 },
    { key: 'hand_usage', label: 'Hand Usage & Rush Plan', pillar: 'technique', weight: 0.15 },
    { key: 'run_defense', label: 'Run Defense & Edge Setting', pillar: 'technique', weight: 0.15 },
    { key: 'length_frame', label: 'Length & Frame', pillar: 'sizeAndFrame', weight: 0.10 },
    { key: 'motor_iq', label: 'Pursuit Motor & IQ', pillar: 'footballIQ', weight: 0.05 },
    { key: 'production', label: 'Sack & Pressure Production', pillar: 'production', weight: 0.05 },
  ],
  DT: [
    { key: 'block_shedding', label: 'Block Shedding & Power', pillar: 'technique', weight: 0.20 },
    { key: 'anchor', label: 'Anchor & Double-Team Resistance', pillar: 'sizeAndFrame', weight: 0.20 },
    { key: 'first_step', label: 'Interior First Step', pillar: 'athleticism', weight: 0.15 },
    { key: 'hand_usage', label: 'Hand Usage & Pad Level', pillar: 'technique', weight: 0.15 },
    { key: 'run_defense', label: 'Gap Discipline & Run Defense', pillar: 'footballIQ', weight: 0.15 },
    { key: 'size_frame', label: 'Mass & Frame', pillar: 'sizeAndFrame', weight: 0.10 },
    { key: 'production', label: 'College Production', pillar: 'production', weight: 0.05 },
  ],
  LB: [
    { key: 'instincts', label: 'Instincts & Diagnosing', pillar: 'footballIQ', weight: 0.25 },
    { key: 'range_speed', label: 'Sideline-to-Sideline Range', pillar: 'athleticism', weight: 0.20 },
    { key: 'tackling', label: 'Open-Field Tackling', pillar: 'technique', weight: 0.15 },
    { key: 'coverage', label: 'Zone & Man Coverage', pillar: 'technique', weight: 0.15 },
    { key: 'block_shedding', label: 'Taking on Blocks', pillar: 'technique', weight: 0.10 },
    { key: 'size_frame', label: 'Frame & Length', pillar: 'sizeAndFrame', weight: 0.10 },
    { key: 'production', label: 'Tackles & Production', pillar: 'production', weight: 0.05 },
  ],
  CB: [
    { key: 'man_coverage', label: 'Man Coverage & Feet', pillar: 'technique', weight: 0.20 },
    { key: 'zone_instincts', label: 'Zone Recognition & Eyes', pillar: 'footballIQ', weight: 0.15 },
    { key: 'ball_skills', label: 'Ball Skills & Interceptions', pillar: 'production', weight: 0.15 },
    { key: 'press_technique', label: 'Press Technique & Jam', pillar: 'technique', weight: 0.15 },
    { key: 'fluidity_speed', label: 'Hip Fluidity & Speed', pillar: 'athleticism', weight: 0.15 },
    { key: 'tackling', label: 'Run Support & Tackling', pillar: 'technique', weight: 0.10 },
    { key: 'size_length', label: 'Length & Frame', pillar: 'sizeAndFrame', weight: 0.10 },
  ],
  S: [
    { key: 'range_speed', label: 'Deep Field Range & Speed', pillar: 'athleticism', weight: 0.20 },
    { key: 'instincts', label: 'Route Recognition & Instincts', pillar: 'footballIQ', weight: 0.20 },
    { key: 'tackling', label: 'Open-Field Tackling', pillar: 'technique', weight: 0.15 },
    { key: 'ball_skills', label: 'Ball Skills & Turnovers', pillar: 'production', weight: 0.15 },
    { key: 'coverage', label: 'Slot & TE Coverage', pillar: 'technique', weight: 0.15 },
    { key: 'size_frame', label: 'Frame & Physicality', pillar: 'sizeAndFrame', weight: 0.15 },
  ],
  FLEX: [
    { key: 'versatility_instincts', label: 'Versatility & Football IQ', pillar: 'footballIQ', weight: 0.20 },
    { key: 'athleticism', label: 'Athletic Profile & Explosiveness', pillar: 'athleticism', weight: 0.20 },
    { key: 'primary_technique', label: 'Primary Role Technique', pillar: 'technique', weight: 0.20 },
    { key: 'secondary_technique', label: 'Secondary/Hybrid Skillset', pillar: 'technique', weight: 0.15 },
    { key: 'size_length', label: 'Frame & Physical Alignment', pillar: 'sizeAndFrame', weight: 0.15 },
    { key: 'production', label: 'Multi-Role Production', pillar: 'production', weight: 0.10 },
  ],
};

export const DEFAULT_PILLAR_SCHEMA: TraitDef[] = [
  { key: 'athleticism', label: 'Athleticism', pillar: 'athleticism', weight: 0.20 },
  { key: 'technique', label: 'Technique', pillar: 'technique', weight: 0.20 },
  { key: 'production', label: 'Production', pillar: 'production', weight: 0.20 },
  { key: 'footballIQ', label: 'Football IQ', pillar: 'footballIQ', weight: 0.20 },
  { key: 'sizeAndFrame', label: 'Size & Frame', pillar: 'sizeAndFrame', weight: 0.20 },
];

// Map a player's position string (incl. common PFR/scheme aliases) to a schema.
// NOTE (T-1): the OLB/DB alias targets below default to EDGE/CB for trait purposes;
// revisit against the G-3 FLEX decision when finalizing trait content.
export function getTraitSchemaForPosition(position?: string): TraitDef[] {
  if (!position) return DEFAULT_PILLAR_SCHEMA;
  const p = position.trim().toUpperCase();

  if (TRAIT_SCHEMAS[p]) return TRAIT_SCHEMAS[p];

  if (['OG', 'C', 'G', 'OL', 'CENTER', 'GUARD'].includes(p)) return TRAIT_SCHEMAS.IOL;
  if (['DE', 'OLB', 'RUSH'].includes(p)) return TRAIT_SCHEMAS.EDGE;
  if (['NT', 'IDL', 'DL', 'DEFENSIVE TACKLE'].includes(p)) return TRAIT_SCHEMAS.DT;
  if (['ILB', 'MLB', 'LINEBACKER'].includes(p)) return TRAIT_SCHEMAS.LB;
  if (['DB', 'CORNERBACK', 'CORNER'].includes(p)) return TRAIT_SCHEMAS.CB;
  if (['SS', 'FS', 'SAF', 'SAFETY'].includes(p)) return TRAIT_SCHEMAS.S;
  if (['T', 'TACKLE', 'OFFENSIVE TACKLE'].includes(p)) return TRAIT_SCHEMAS.OT;
  if (['ATH', 'TWEENER', 'HYBRID', 'WR/RB', 'DE/OLB'].includes(p)) return TRAIT_SCHEMAS.FLEX;

  return DEFAULT_PILLAR_SCHEMA;
}
