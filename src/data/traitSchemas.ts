import { PlayerTraits } from '../types';

// ==========================================================================
// Spec 03 — Position-Aware Trait System : Position Sub-Trait Schemas
// ==========================================================================
//
// Each app position (QB, RB, WR, TE, OT, IOL, EDGE, DT, LB, CB, S, FLEX) maps
// to an ordered list of scouting sub-traits. Every sub-trait declares:
//
//   key    - stable identifier stored in Player.positionTraits[key]
//   label  - human-readable name shown in the UI
//   pillar - which of the 5 core PlayerTraits this sub-trait rolls up into
//   weight - relative importance within the position (weights sum to ~1.0)
//
// The `pillar` field MUST be a real key of PlayerTraits so that, when a
// sub-trait is unpopulated, consumers can fall back to the owning pillar value
// (see traitGrading.ts: getValueForTrait / pillarRollup / computePositionGrade).
// ==========================================================================

export interface PositionTraitDef {
  key: string;
  label: string;
  pillar: keyof PlayerTraits;
  weight: number;
}

export type PositionTraitSchema = PositionTraitDef[];

// Weight at/above this threshold flags a sub-trait as a "key" trait (Key badge).
export const KEY_TRAIT_WEIGHT_THRESHOLD = 0.16;

export const POSITION_TRAIT_SCHEMAS: Record<string, PositionTraitSchema> = {
  QB: [
    { key: 'arm_talent', label: 'Arm Talent / Velocity', pillar: 'athleticism', weight: 0.15 },
    { key: 'accuracy_short', label: 'Short/Intermediate Accuracy', pillar: 'technique', weight: 0.15 },
    { key: 'accuracy_deep', label: 'Deep Ball Accuracy', pillar: 'technique', weight: 0.12 },
    { key: 'pocket_processing', label: 'Pocket Processing', pillar: 'footballIQ', weight: 0.18 },
    { key: 'mobility_creation', label: 'Mobility / Off-Script Creation', pillar: 'athleticism', weight: 0.12 },
    { key: 'decision_making', label: 'Decision Making / Ball Security', pillar: 'footballIQ', weight: 0.15 },
    { key: 'production_efficiency', label: 'Collegiate Production', pillar: 'production', weight: 0.13 },
  ],
  RB: [
    { key: 'vision_patience', label: 'Vision / Patience', pillar: 'footballIQ', weight: 0.16 },
    { key: 'contact_balance', label: 'Contact Balance', pillar: 'athleticism', weight: 0.16 },
    { key: 'burst_acceleration', label: 'Burst / Acceleration', pillar: 'athleticism', weight: 0.16 },
    { key: 'elusiveness', label: 'Elusiveness / Make-Miss', pillar: 'athleticism', weight: 0.14 },
    { key: 'receiving_ability', label: 'Receiving Ability', pillar: 'technique', weight: 0.12 },
    { key: 'pass_protection', label: 'Pass Protection', pillar: 'technique', weight: 0.12 },
    { key: 'production_volume', label: 'Production / Workload', pillar: 'production', weight: 0.14 },
  ],
  WR: [
    { key: 'release_vs_press', label: 'Release vs. Press', pillar: 'technique', weight: 0.14 },
    { key: 'route_running', label: 'Route Running', pillar: 'technique', weight: 0.18 },
    { key: 'hands_catching', label: 'Hands / Catch Reliability', pillar: 'technique', weight: 0.16 },
    { key: 'separation_quickness', label: 'Separation Quickness', pillar: 'athleticism', weight: 0.16 },
    { key: 'deep_speed', label: 'Deep Speed', pillar: 'athleticism', weight: 0.12 },
    { key: 'yac_ability', label: 'YAC Ability', pillar: 'athleticism', weight: 0.12 },
    { key: 'production_volume', label: 'Production / Volume', pillar: 'production', weight: 0.12 },
  ],
  TE: [
    { key: 'inline_blocking', label: 'Inline Blocking', pillar: 'sizeAndFrame', weight: 0.16 },
    { key: 'route_running', label: 'Route Running', pillar: 'technique', weight: 0.16 },
    { key: 'hands_catching', label: 'Hands / Catch Reliability', pillar: 'technique', weight: 0.16 },
    { key: 'contested_catch', label: 'Contested-Catch Radius', pillar: 'sizeAndFrame', weight: 0.14 },
    { key: 'athleticism_seam', label: 'Seam Athleticism', pillar: 'athleticism', weight: 0.14 },
    { key: 'yac_ability', label: 'YAC Ability', pillar: 'athleticism', weight: 0.10 },
    { key: 'production_volume', label: 'Production / Volume', pillar: 'production', weight: 0.14 },
  ],
  OT: [
    { key: 'pass_set_footwork', label: 'Pass-Set Footwork', pillar: 'technique', weight: 0.18 },
    { key: 'anchor_strength', label: 'Anchor Strength', pillar: 'sizeAndFrame', weight: 0.16 },
    { key: 'hand_technique', label: 'Hand Technique / Placement', pillar: 'technique', weight: 0.16 },
    { key: 'lateral_agility', label: 'Lateral Agility', pillar: 'athleticism', weight: 0.14 },
    { key: 'run_block_power', label: 'Run-Block Power', pillar: 'sizeAndFrame', weight: 0.14 },
    { key: 'second_level_climb', label: 'Second-Level Climbing', pillar: 'athleticism', weight: 0.10 },
    { key: 'iq_recognition', label: 'Stunt/Blitz Recognition', pillar: 'footballIQ', weight: 0.12 },
  ],
  IOL: [
    { key: 'drive_block_power', label: 'Drive-Block Power', pillar: 'sizeAndFrame', weight: 0.18 },
    { key: 'anchor_vs_bull', label: 'Anchor vs. Bull Rush', pillar: 'sizeAndFrame', weight: 0.16 },
    { key: 'hand_technique', label: 'Hand Technique / Placement', pillar: 'technique', weight: 0.16 },
    { key: 'pull_mobility', label: 'Pull / Climb Mobility', pillar: 'athleticism', weight: 0.14 },
    { key: 'pass_set_balance', label: 'Pass-Set Balance', pillar: 'technique', weight: 0.14 },
    { key: 'iq_recognition', label: 'Twist/Stunt Recognition', pillar: 'footballIQ', weight: 0.12 },
    { key: 'grip_finish', label: 'Grip Strength / Finish', pillar: 'technique', weight: 0.10 },
  ],
  EDGE: [
    { key: 'first_step_getoff', label: 'First-Step Get-Off', pillar: 'athleticism', weight: 0.18 },
    { key: 'bend_flexibility', label: 'Bend / Ankle Flexibility', pillar: 'athleticism', weight: 0.14 },
    { key: 'pass_rush_moves', label: 'Pass-Rush Move Arsenal', pillar: 'technique', weight: 0.16 },
    { key: 'power_conversion', label: 'Power Conversion / Bull', pillar: 'sizeAndFrame', weight: 0.14 },
    { key: 'run_defense_setedge', label: 'Run Defense / Set Edge', pillar: 'sizeAndFrame', weight: 0.14 },
    { key: 'motor_pursuit', label: 'Motor / Pursuit', pillar: 'footballIQ', weight: 0.10 },
    { key: 'production_pressures', label: 'Production / Pressures', pillar: 'production', weight: 0.14 },
  ],
  DT: [
    { key: 'first_step_quickness', label: 'First-Step Quickness', pillar: 'athleticism', weight: 0.16 },
    { key: 'anchor_vs_double', label: 'Anchor vs. Double Team', pillar: 'sizeAndFrame', weight: 0.18 },
    { key: 'pass_rush_power', label: 'Interior Pass-Rush Power', pillar: 'sizeAndFrame', weight: 0.14 },
    { key: 'hand_technique', label: 'Hand Technique / Shed', pillar: 'technique', weight: 0.16 },
    { key: 'gap_discipline', label: 'Gap Discipline', pillar: 'footballIQ', weight: 0.12 },
    { key: 'pursuit_range', label: 'Pursuit Range', pillar: 'athleticism', weight: 0.10 },
    { key: 'production_disruption', label: 'Production / Disruption', pillar: 'production', weight: 0.14 },
  ],
  LB: [
    { key: 'range_sideline', label: 'Sideline-to-Sideline Range', pillar: 'athleticism', weight: 0.16 },
    { key: 'tackling_form', label: 'Tackling Form / Reliability', pillar: 'technique', weight: 0.16 },
    { key: 'coverage_zone', label: 'Zone Coverage Feel', pillar: 'footballIQ', weight: 0.14 },
    { key: 'coverage_man', label: 'Man Coverage', pillar: 'technique', weight: 0.12 },
    { key: 'run_diagnosis', label: 'Run Diagnosis / Keys', pillar: 'footballIQ', weight: 0.16 },
    { key: 'blitz_ability', label: 'Blitz / Rush Ability', pillar: 'athleticism', weight: 0.12 },
    { key: 'production_tackles', label: 'Production / Tackles', pillar: 'production', weight: 0.14 },
  ],
  CB: [
    { key: 'man_coverage', label: 'Man Coverage', pillar: 'technique', weight: 0.18 },
    { key: 'press_technique', label: 'Press Technique', pillar: 'technique', weight: 0.14 },
    { key: 'hip_fluidity', label: 'Hip Fluidity / Transition', pillar: 'athleticism', weight: 0.16 },
    { key: 'recovery_speed', label: 'Recovery Speed', pillar: 'athleticism', weight: 0.14 },
    { key: 'ball_skills', label: 'Ball Skills', pillar: 'technique', weight: 0.14 },
    { key: 'zone_awareness', label: 'Zone Awareness', pillar: 'footballIQ', weight: 0.12 },
    { key: 'run_support_tackling', label: 'Run Support / Tackling', pillar: 'sizeAndFrame', weight: 0.12 },
  ],
  S: [
    { key: 'range_deep', label: 'Deep Range / Centerfield', pillar: 'athleticism', weight: 0.16 },
    { key: 'instincts_processing', label: 'Instincts / Processing', pillar: 'footballIQ', weight: 0.18 },
    { key: 'tackling_form', label: 'Tackling Form / Reliability', pillar: 'technique', weight: 0.14 },
    { key: 'run_support_trigger', label: 'Run-Support Trigger', pillar: 'footballIQ', weight: 0.14 },
    { key: 'coverage_versatility', label: 'Coverage Versatility', pillar: 'technique', weight: 0.14 },
    { key: 'ball_skills', label: 'Ball Skills', pillar: 'technique', weight: 0.12 },
    { key: 'physicality_frame', label: 'Physicality / Frame', pillar: 'sizeAndFrame', weight: 0.12 },
  ],
  FLEX: [
    { key: 'athletic_explosion', label: 'Athletic Explosion', pillar: 'athleticism', weight: 0.20 },
    { key: 'versatility_iq', label: 'Versatility / Football IQ', pillar: 'footballIQ', weight: 0.18 },
    { key: 'technique_refinement', label: 'Technique Refinement', pillar: 'technique', weight: 0.18 },
    { key: 'frame_size', label: 'Frame / Size', pillar: 'sizeAndFrame', weight: 0.16 },
    { key: 'production_impact', label: 'Production / Impact', pillar: 'production', weight: 0.16 },
    { key: 'special_teams_value', label: 'Special-Teams Value', pillar: 'athleticism', weight: 0.12 },
  ],
};

/**
 * Returns the sub-trait schema for a position. Unknown/blank positions fall back
 * to the FLEX (hybrid athlete) schema so callers always get a usable array.
 */
export function getPositionSchema(position: string | undefined): PositionTraitSchema {
  if (!position) return POSITION_TRAIT_SCHEMAS.FLEX;
  const normalized = position.trim().toUpperCase();
  return POSITION_TRAIT_SCHEMAS[normalized] ?? POSITION_TRAIT_SCHEMAS.FLEX;
}
