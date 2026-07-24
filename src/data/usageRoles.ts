import { Pillar } from '../types';

export interface RewardedTraitDef {
  traitKey: string;
  pillarFallback: Pillar;
  weight: number; // relative weight 0..1
}

export interface RoleCatalogItem {
  id: string;
  label: string;
  positions: string[]; // positions this candidate applies to, e.g. ['EDGE', 'LB', 'FLEX']
  schemeId?: string; // Matching real SCHEMES ids: 34defense, 43defense, pressman, quarters, westcoast, spread, zoneblock, gapblock
  formationSpot: string; // e.g. 'EDGE (wide-9)', 'SLOT', 'BOX safety'
  rewardedTraits: RewardedTraitDef[];
  baseRationaleTemplate: string;
}

export const ROLE_CATALOG: RoleCatalogItem[] = [
  // ----------------------------------------------------
  // EDGE / DE / LB / FLEX Roles
  // ----------------------------------------------------
  {
    id: 'edge_wide9',
    label: 'Stand-up 3-4 Wide-9 Rusher',
    positions: ['EDGE', 'LB', 'DT', 'FLEX'],
    schemeId: '34defense',
    formationSpot: 'EDGE (wide-9)',
    rewardedTraits: [
      { traitKey: 'first_step_getoff', pillarFallback: 'athleticism', weight: 0.35 },
      { traitKey: 'bend_flexibility', pillarFallback: 'athleticism', weight: 0.35 },
      { traitKey: 'pass_rush_moves', pillarFallback: 'technique', weight: 0.30 },
    ],
    baseRationaleTemplate: 'High explosion and cornering bend allow him to win off the edge in aggressive wide-alignment fronts.',
  },
  {
    id: 'edge_base43',
    label: 'Base 4-3 Defensive End',
    positions: ['EDGE', 'DT', 'FLEX'],
    schemeId: '43defense',
    formationSpot: 'EDGE (5-tech)',
    rewardedTraits: [
      { traitKey: 'run_defense_setedge', pillarFallback: 'sizeAndFrame', weight: 0.35 },
      { traitKey: 'power_conversion', pillarFallback: 'technique', weight: 0.35 },
      { traitKey: 'pass_rush_moves', pillarFallback: 'technique', weight: 0.30 },
    ],
    baseRationaleTemplate: 'Heavy hands and strong run anchoring make him ideal for setting the edge as a base 4-3 defensive end.',
  },
  {
    id: 'offball_sam',
    label: '3-4 SAM / Hybrid Off-Ball Linebacker',
    positions: ['LB', 'EDGE', 'FLEX'],
    schemeId: '34defense',
    formationSpot: 'LB (Off-Ball SAM)',
    rewardedTraits: [
      { traitKey: 'range_sideline', pillarFallback: 'athleticism', weight: 0.35 },
      { traitKey: 'tackling_form', pillarFallback: 'technique', weight: 0.35 },
      { traitKey: 'coverage_zone', pillarFallback: 'footballIQ', weight: 0.30 },
    ],
    baseRationaleTemplate: 'Fluid sideline-to-sideline range and coverage instincts project best as an off-ball linebacker with blitz versatility.',
  },

  // ----------------------------------------------------
  // DB / Safety / CB / FLEX Roles
  // ----------------------------------------------------
  {
    id: 'box_safety',
    label: 'Box Safety / In-the-Box Hybrid',
    positions: ['S', 'LB', 'CB', 'FLEX'],
    schemeId: 'pressman',
    formationSpot: 'BOX Safety / Apex',
    rewardedTraits: [
      { traitKey: 'tackling_form', pillarFallback: 'technique', weight: 0.35 },
      { traitKey: 'run_support_trigger', pillarFallback: 'footballIQ', weight: 0.35 },
      { traitKey: 'instincts_processing', pillarFallback: 'footballIQ', weight: 0.30 },
    ],
    baseRationaleTemplate: 'Physical trigger and aggressive run support make him a high-impact force player in the box.',
  },
  {
    id: 'nickel_slot',
    label: 'Nickel / Slot Cornerback',
    positions: ['CB', 'S', 'FLEX'],
    schemeId: 'quarters',
    formationSpot: 'SLOT Corner',
    rewardedTraits: [
      { traitKey: 'hip_fluidity', pillarFallback: 'athleticism', weight: 0.40 },
      { traitKey: 'press_technique', pillarFallback: 'technique', weight: 0.30 },
      { traitKey: 'man_coverage', pillarFallback: 'technique', weight: 0.30 },
    ],
    baseRationaleTemplate: 'Twitchy short-area agility and quick hip transitions enable him to match two-way route trees in the slot.',
  },
  {
    id: 'deep_safety',
    label: 'Single-High Free Safety',
    positions: ['S', 'CB', 'FLEX'],
    schemeId: 'quarters',
    formationSpot: 'DEEP Single-High Safety',
    rewardedTraits: [
      { traitKey: 'range_deep', pillarFallback: 'athleticism', weight: 0.40 },
      { traitKey: 'instincts_processing', pillarFallback: 'footballIQ', weight: 0.35 },
      { traitKey: 'ball_skills', pillarFallback: 'technique', weight: 0.25 },
    ],
    baseRationaleTemplate: 'Exceptional centerfield range and ball-tracking instincts make him a natural single-high post safety.',
  },

  // ----------------------------------------------------
  // WR / TE / FLEX Roles
  // ----------------------------------------------------
  {
    id: 'big_slot',
    label: 'Big Slot / Move TE Flex',
    positions: ['WR', 'TE', 'FLEX'],
    schemeId: 'spread',
    formationSpot: 'FLEX Slot / Move TE',
    rewardedTraits: [
      { traitKey: 'contested_catch', pillarFallback: 'sizeAndFrame', weight: 0.35 },
      { traitKey: 'route_running', pillarFallback: 'technique', weight: 0.35 },
      { traitKey: 'release_vs_press', pillarFallback: 'technique', weight: 0.30 },
    ],
    baseRationaleTemplate: 'Size mismatch and route precision allow him to dominate seam routes and middle-of-the-field zone voids.',
  },
  {
    id: 'inline_y',
    label: 'Traditional Y Inline Tight End',
    positions: ['TE', 'FLEX'],
    schemeId: 'gapblock',
    formationSpot: 'TE (Inline Y)',
    rewardedTraits: [
      { traitKey: 'inline_blocking', pillarFallback: 'sizeAndFrame', weight: 0.40 },
      { traitKey: 'contested_catch', pillarFallback: 'sizeAndFrame', weight: 0.30 },
      { traitKey: 'hands_catching', pillarFallback: 'technique', weight: 0.30 },
    ],
    baseRationaleTemplate: 'Stout inline blocking point-of-attack strength combined with reliable checkdown hands.',
  },
  {
    id: 'x_receiver',
    label: 'Boundary X Wide Receiver',
    positions: ['WR', 'FLEX'],
    schemeId: 'spread',
    formationSpot: 'WR (Boundary X)',
    rewardedTraits: [
      { traitKey: 'release_vs_press', pillarFallback: 'technique', weight: 0.35 },
      { traitKey: 'deep_speed', pillarFallback: 'athleticism', weight: 0.35 },
      { traitKey: 'hands_catching', pillarFallback: 'technique', weight: 0.30 },
    ],
    baseRationaleTemplate: 'Physical press release and deep ball tracking give him true isolated boundary WR capability.',
  },
  {
    id: 'slot_wr',
    label: 'Slot Receiver / Motion Weapon',
    positions: ['WR', 'RB', 'FLEX'],
    schemeId: 'westcoast',
    formationSpot: 'WR (Motion Slot)',
    rewardedTraits: [
      { traitKey: 'separation_quickness', pillarFallback: 'athleticism', weight: 0.40 },
      { traitKey: 'yac_ability', pillarFallback: 'athleticism', weight: 0.30 },
      { traitKey: 'route_running', pillarFallback: 'technique', weight: 0.30 },
    ],
    baseRationaleTemplate: 'Elusive open-field YAC ability and sharp break acceleration make him a weapon on jet sweeps and quick screens.',
  },

  // ----------------------------------------------------
  // RB / FLEX Roles
  // ----------------------------------------------------
  {
    id: 'three_down_rb',
    label: 'Three-Down Workhorse Running Back',
    positions: ['RB', 'FLEX'],
    schemeId: 'gapblock',
    formationSpot: 'RB (Singleback)',
    rewardedTraits: [
      { traitKey: 'vision_patience', pillarFallback: 'footballIQ', weight: 0.35 },
      { traitKey: 'pass_protection', pillarFallback: 'technique', weight: 0.35 },
      { traitKey: 'receiving_ability', pillarFallback: 'technique', weight: 0.30 },
    ],
    baseRationaleTemplate: 'Complete skill package with vision, blitz pickup toughness, and pass-catching viability.',
  },
  {
    id: 'third_down_back',
    label: 'Pass-Catching / 3rd Down Back',
    positions: ['RB', 'WR', 'FLEX'],
    schemeId: 'westcoast',
    formationSpot: 'RB (Shotgun Flex)',
    rewardedTraits: [
      { traitKey: 'receiving_ability', pillarFallback: 'technique', weight: 0.40 },
      { traitKey: 'elusiveness', pillarFallback: 'athleticism', weight: 0.30 },
      { traitKey: 'pass_protection', pillarFallback: 'technique', weight: 0.30 },
    ],
    baseRationaleTemplate: 'Dynamic receiving threat out of the backfield with crisp angle-route running.',
  },

  // ----------------------------------------------------
  // OL / FLEX Roles
  // ----------------------------------------------------
  {
    id: 'zone_tackle',
    label: 'Zone-Blocking Offensive Tackle',
    positions: ['OT', 'IOL', 'FLEX'],
    schemeId: 'zoneblock',
    formationSpot: 'OT (Left/Right Tackle)',
    rewardedTraits: [
      { traitKey: 'pass_set_footwork', pillarFallback: 'technique', weight: 0.35 },
      { traitKey: 'lateral_agility', pillarFallback: 'athleticism', weight: 0.35 },
      { traitKey: 'second_level_climb', pillarFallback: 'athleticism', weight: 0.30 },
    ],
    baseRationaleTemplate: 'Light footwork and climbing mobility suit outside-zone movement schemes.',
  },
  {
    id: 'power_guard',
    label: 'Power-Gap Interior Guard',
    positions: ['IOL', 'OT', 'FLEX'],
    schemeId: 'gapblock',
    formationSpot: 'IOL (Guard)',
    rewardedTraits: [
      { traitKey: 'drive_block_power', pillarFallback: 'sizeAndFrame', weight: 0.40 },
      { traitKey: 'anchor_vs_bull', pillarFallback: 'technique', weight: 0.30 },
      { traitKey: 'grip_finish', pillarFallback: 'technique', weight: 0.30 },
    ],
    baseRationaleTemplate: 'Mauling drive power and anchor stability project best in a heavy gap-pulling run game.',
  },
];