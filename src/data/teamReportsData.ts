import { Team } from '../types';

export interface CapHit {
  player: string;
  amount: number; // in millions of dollars, e.g. 35.4
  position: string;
}

export interface SalaryCapBreakdown {
  totalCap: number; // in millions, e.g. 255.4
  activeCap: number;
  deadCap: number;
  capSpace: number;
  topCapHits: CapHit[];
}

export interface DraftAsset {
  year: number;
  round: number;
  pickName: string; // e.g. "Round 1, Pick 11"
}

export interface ExpiringDeal {
  player: string;
  position: string;
  age: number;
  currentSalary: number; // in millions
}

export interface CutTradeCandidate {
  player: string;
  position: string;
  capSavings: number; // in millions
  deadCap: number; // in millions
  reason: string;
}

export interface Transaction {
  date: string;
  type: 'signing' | 'trade' | 'release' | 'contract_extension';
  description: string;
}

export interface DepthChartFormation {
  name: string; // e.g. "11 Personnel" or "Nickel 4-2-5"
  positions: Array<{
    role: string; // e.g. "QB", "WR1", "CB"
    player: string; // e.g. "Patrick Mahomes"
  }>;
}

export interface TeamReport {
  teamId: string;
  salaryCap: SalaryCapBreakdown;
  draftAssets: DraftAsset[];
  expiringDeals: ExpiringDeal[];
  salaryCuts: CutTradeCandidate[];
  transactions: Transaction[];
  formations: DepthChartFormation[]; // 2 expected formations
}

// Prominent player lists to map real-life stars to each team
const TEAM_STARS: Record<string, {
  qb: string;
  rb: string;
  wr1: string;
  wr2: string;
  wr3: string;
  te: string;
  te2: string;
  ol: string[];
  dl: string[];
  lb: string[];
  db: string[];
  stars: CapHit[];
  expiring: ExpiringDeal[];
  cuts: CutTradeCandidate[];
  transactions: Transaction[];
}> = {
  ARI: {
    qb: "Kyler Murray", rb: "James Conner", wr1: "Marvin Harrison Jr.", wr2: "Michael Wilson", wr3: "Greg Dortch", te: "Trey McBride", te2: "Elijah Higgins",
    ol: ["Paris Johnson Jr.", "Evan Brown", "Hjalte Froholdt", "Will Hernandez", "Jonah Williams"],
    dl: ["Justin Jones", "Roy Lopez", "Bilal Nichols", "Darius Robinson"],
    lb: ["Kyzir White", "Mack Wilson", "Zaven Collins", "Dennis Gardeck"],
    db: ["Budda Baker", "Jalen Thompson", "Garrett Williams", "Sean Murphy-Bunting", "Max Melton"],
    stars: [
      { player: "Kyler Murray", amount: 49.1, position: "QB" },
      { player: "Budda Baker", amount: 19.0, position: "S" },
      { player: "Jonah Williams", amount: 15.0, position: "OT" },
      { player: "James Conner", amount: 8.9, position: "RB" },
      { player: "Kyzir White", amount: 7.5, position: "LB" }
    ],
    expiring: [
      { player: "James Conner", position: "RB", age: 31, currentSalary: 7.5 },
      { player: "Budda Baker", position: "S", age: 30, currentSalary: 14.1 },
      { player: "Kyzir White", position: "LB", age: 30, currentSalary: 5.5 }
    ],
    cuts: [
      { player: "Dennis Gardeck", position: "EDGE", capSavings: 3.2, deadCap: 0.8, reason: "Aged rotational pass rusher; high salary relative to snaps." }
    ],
    transactions: [
      { date: "2026-03-12", type: "signing", description: "Signed DT Justin Jones to a 3-year, $31M contract." },
      { date: "2026-03-15", type: "contract_extension", description: "Extended C Hjalte Froholdt for 2 years, $12M." }
    ]
  },
  ATL: {
    qb: "Kirk Cousins", rb: "Bijan Robinson", wr1: "Drake London", wr2: "Darnell Mooney", wr3: "Ray-Ray McCloud", te: "Kyle Pitts", te2: "Charlie Woerner",
    ol: ["Jake Matthews", "Matthew Bergeron", "Drew Dalman", "Chris Lindstrom", "Kaleb McGary"],
    dl: ["Grady Jarrett", "David Onyemata", "Ta'Quon Graham", "Arnold Ebiketie"],
    lb: ["Kaden Elliss", "Troy Andersen", "Nate Landman", "Lorenzo Carter"],
    db: ["Jessie Bates III", "Justin Simmons", "A.J. Terrell", "Dee Alford", "Mike Hughes"],
    stars: [
      { player: "Kirk Cousins", amount: 40.0, position: "QB" },
      { player: "Chris Lindstrom", amount: 20.5, position: "RG" },
      { player: "Jessie Bates III", amount: 16.0, position: "S" },
      { player: "Jake Matthews", amount: 15.8, position: "LT" },
      { player: "A.J. Terrell", amount: 15.0, position: "CB" }
    ],
    expiring: [
      { player: "Justin Simmons", position: "S", age: 32, currentSalary: 7.5 },
      { player: "Lorenzo Carter", position: "EDGE", age: 30, currentSalary: 4.5 }
    ],
    cuts: [
      { player: "Mike Hughes", position: "CB", capSavings: 3.1, deadCap: 1.0, reason: "Inconsistent backup; heavy contract savings possible." }
    ],
    transactions: [
      { date: "2026-03-11", type: "signing", description: "Signed S Justin Simmons to a 1-year, $7.5M deal." },
      { date: "2026-04-20", type: "contract_extension", description: "Signed CB A.J. Terrell to a 4-year, $81M extension." }
    ]
  },
  BAL: {
    qb: "Lamar Jackson", rb: "Derrick Henry", wr1: "Zay Flowers", wr2: "Rashod Bateman", wr3: "Nelson Agholor", te: "Mark Andrews", te2: "Isaiah Likely",
    ol: ["Roger Rosengarten", "Andrew Vorhees", "Tyler Linderbaum", "Daniel Faalele", "Patrick Mekari"],
    dl: ["Nnamdi Madubuike", "Travis Jones", "Broderick Washington", "Odafe Oweh"],
    lb: ["Roquan Smith", "Trenton Simpson", "Kyle Van Noy", "Tavius Robinson"],
    db: ["Kyle Hamilton", "Marcus Williams", "Marlon Humphrey", "Brandon Stephens", "Nate Wiggins"],
    stars: [
      { player: "Lamar Jackson", amount: 52.0, position: "QB" },
      { player: "Roquan Smith", amount: 20.0, position: "LB" },
      { player: "Marlon Humphrey", amount: 18.5, position: "CB" },
      { player: "Mark Andrews", amount: 14.0, position: "TE" },
      { player: "Nnamdi Madubuike", amount: 13.5, position: "DT" }
    ],
    expiring: [
      { player: "Brandon Stephens", position: "CB", age: 28, currentSalary: 3.5 },
      { player: "Nelson Agholor", position: "WR", age: 33, currentSalary: 2.1 }
    ],
    cuts: [
      { player: "Marcus Williams", position: "S", capSavings: 8.5, deadCap: 4.0, reason: "Injury history, high salary cap relief option." }
    ],
    transactions: [
      { date: "2026-03-14", type: "contract_extension", description: "Signed DT Nnamdi Madubuike to a 4-year, $98M deal." },
      { date: "2026-05-10", type: "trade", description: "Acquired a 2026 5th-round pick from CAR in exchange for depth OL." }
    ]
  },
  BUF: {
    qb: "Josh Allen", rb: "James Cook", wr1: "Khalil Shakir", wr2: "Keon Coleman", wr3: "Curtis Samuel", te: "Dalton Kincaid", te2: "Dawson Knox",
    ol: ["Dion Dawkins", "David Edwards", "Connor McGovern", "O'Cyrus Torrence", "Spencer Brown"],
    dl: ["Ed Oliver", "DaQuan Jones", "Greg Rousseau", "A.J. Epenesa"],
    lb: ["Terrel Bernard", "Matt Milano", "Dorian Williams", "Nicholas Morrow"],
    db: ["Taylor Rapp", "Cole Bishop", "Christian Benford", "Rasul Douglas", "Kaiir Elam"],
    stars: [
      { player: "Josh Allen", amount: 47.5, position: "QB" },
      { player: "Dion Dawkins", amount: 20.0, position: "LT" },
      { player: "Ed Oliver", amount: 17.5, position: "DT" },
      { player: "Matt Milano", amount: 14.3, position: "LB" },
      { player: "Dawson Knox", amount: 10.1, position: "TE" }
    ],
    expiring: [
      { player: "Rasul Douglas", position: "CB", age: 31, currentSalary: 6.2 },
      { player: "DaQuan Jones", position: "DT", age: 34, currentSalary: 4.5 }
    ],
    cuts: [
      { player: "Dawson Knox", position: "TE", capSavings: 5.5, deadCap: 4.6, reason: "Surplus with emergence of Dalton Kincaid as primary receiving TE." }
    ],
    transactions: [
      { date: "2026-03-11", type: "signing", description: "Signed WR Curtis Samuel to a 3-year, $24M contract." },
      { date: "2026-06-01", type: "release", description: "Released veteran backup safety after failing physical." }
    ]
  },
  KC: {
    qb: "Patrick Mahomes", rb: "Isiah Pacheco", wr1: "Rashee Rice", wr2: "Xavier Worthy", wr3: "Hollywood Brown", te: "Travis Kelce", te2: "Noah Gray",
    ol: ["Wanya Morris", "Joe Thuney", "Creed Humphrey", "Trey Smith", "Jawaan Taylor"],
    dl: ["Chris Jones", "George Karlaftis", "Mike Danna", "Felix Anudike-Uzomah"],
    lb: ["Nick Bolton", "Leo Chenal", "Drue Tranquill", "Cole Christiansen"],
    db: ["Trent McDuffie", "Justin Reid", "Bryan Cook", "Chamarri Conner", "Nazeeh Johnson"],
    stars: [
      { player: "Patrick Mahomes", amount: 56.4, position: "QB" },
      { player: "Chris Jones", amount: 31.2, position: "DT" },
      { player: "Jawaan Taylor", amount: 20.0, position: "RT" },
      { player: "Joe Thuney", amount: 16.0, position: "LG" },
      { player: "Travis Kelce", amount: 15.2, position: "TE" }
    ],
    expiring: [
      { player: "Trey Smith", position: "RG", age: 26, currentSalary: 5.2 },
      { player: "Justin Reid", position: "S", age: 29, currentSalary: 10.5 },
      { player: "Hollywood Brown", position: "WR", age: 29, currentSalary: 7.0 }
    ],
    cuts: [
      { player: "Joe Thuney", position: "LG", capSavings: 11.5, deadCap: 4.5, reason: "Potential salary cap casualty due to massive extensions for interior OL." }
    ],
    transactions: [
      { date: "2026-03-10", type: "contract_extension", description: "Extended Creed Humphrey for 5 years, $90M (Record C Contract)." },
      { date: "2026-03-18", type: "signing", description: "Signed LB Drue Tranquill to a 3-year, $19M extension." }
    ]
  },
  GB: {
    qb: "Jordan Love", rb: "Josh Jacobs", wr1: "Christian Watson", wr2: "Romeo Doubs", wr3: "Jayden Reed", te: "Tucker Kraft", te2: "Luke Musgrave",
    ol: ["Rasheed Walker", "Elgton Jenkins", "Josh Myers", "Sean Rhyan", "Zach Tom"],
    dl: ["Kenny Clark", "Devonte Wyatt", "Rashan Gary", "Preston Smith", "Lukas Van Ness"],
    lb: ["Quay Walker", "Edgerrin Cooper", "Isaiah McDuffie", "Eric Wilson"],
    db: ["Xavier McKinney", "Jaire Alexander", "Carrington Valentine", "Javon Bullard", "Evan Williams"],
    stars: [
      { player: "Jordan Love", amount: 55.0, position: "QB" },
      { player: "Jaire Alexander", amount: 21.0, position: "CB" },
      { player: "Rashan Gary", amount: 19.6, position: "EDGE" },
      { player: "Kenny Clark", amount: 16.5, position: "DT" },
      { player: "Josh Jacobs", amount: 12.0, position: "RB" }
    ],
    expiring: [
      { player: "Josh Myers", position: "C", age: 28, currentSalary: 3.2 },
      { player: "Preston Smith", position: "EDGE", age: 33, currentSalary: 12.5 }
    ],
    cuts: [
      { player: "Preston Smith", position: "EDGE", capSavings: 8.0, deadCap: 4.5, reason: "Aging veteran with heavy contract; snaps decreasing in favor of Lukas Van Ness." }
    ],
    transactions: [
      { date: "2026-03-11", type: "signing", description: "Signed S Xavier McKinney to a 4-year, $67M contract." },
      { date: "2026-03-12", type: "signing", description: "Signed RB Josh Jacobs to a 4-year, $48M contract." }
    ]
  },
  SF: {
    qb: "Brock Purdy", rb: "Christian McCaffrey", wr1: "Brandon Aiyuk", wr2: "Deebo Samuel", wr3: "Jauan Jennings", te: "George Kittle", te2: "Eric Saubert",
    ol: ["Trent Williams", "Aaron Banks", "Jake Brendel", "Dominick Puni", "Colton McKivitz"],
    dl: ["Nick Bosa", "Javon Hargrave", "Leonard Floyd", "Maliek Collins"],
    lb: ["Fred Warner", "De'Vondre Campbell", "Demetrius Flannigan-Fowles", "Dee Winters"],
    db: ["Charvarius Ward", "Deommodore Lenoir", "Talanoa Hufanga", "Ji'Ayir Brown", "Renardo Green"],
    stars: [
      { player: "Nick Bosa", amount: 34.0, position: "EDGE" },
      { player: "Brandon Aiyuk", amount: 30.0, position: "WR" },
      { player: "Trent Williams", amount: 27.5, position: "LT" },
      { player: "Christian McCaffrey", amount: 19.0, position: "RB" },
      { player: "Fred Warner", amount: 18.5, position: "LB" }
    ],
    expiring: [
      { player: "Charvarius Ward", position: "CB", age: 30, currentSalary: 13.5 },
      { player: "Talanoa Hufanga", position: "S", age: 27, currentSalary: 4.2 }
    ],
    cuts: [
      { player: "Deebo Samuel", position: "WR", capSavings: 9.0, deadCap: 15.0, reason: "Unlikely to cut outright due to high dead cap, but active trade candidate for draft assets." }
    ],
    transactions: [
      { date: "2026-03-08", type: "contract_extension", description: "Signed WR Brandon Aiyuk to a massive 4-year, $120M extension." },
      { date: "2026-03-15", type: "signing", description: "Signed Leonard Floyd to a 2-year, $20M defensive edge boost." }
    ]
  }
};

// Simple helper to generate generic details for other teams to ensure 32-team completeness
function generateGenericTeamStars(teamId: string, teamName: string): typeof TEAM_STARS[string] {
  const needs = ["OT", "WR", "EDGE", "DT", "CB", "IOL", "RB", "S"];
  const needsShuffled = [...needs].sort(() => 0.5 - Math.random());
  
  const qb = `${teamName} QB`;
  const rb = `${teamName} RB`;
  const wr1 = `${teamName} WR1`;
  const wr2 = `${teamName} WR2`;
  const wr3 = `${teamName} WR3`;
  const te = `${teamName} TE`;
  const te2 = `${teamName} TE2`;
  const ol = [`${teamName} LT`, `${teamName} LG`, `${teamName} C`, `${teamName} RG`, `${teamName} RT`];
  const dl = [`${teamName} DE1`, `${teamName} DT1`, `${teamName} DT2`, `${teamName} DE2`];
  const lb = [`${teamName} LB1`, `${teamName} LB2`, `${teamName} LB3`];
  const db = [`${teamName} CB1`, `${teamName} CB2`, `${teamName} S1`, `${teamName} S2`, `${teamName} NB`];

  return {
    qb, rb, wr1, wr2, wr3, te, te2, ol, dl, lb, db,
    stars: [
      { player: `${teamName} Star QB`, amount: 42.5, position: "QB" },
      { player: `${teamName} Star Tackle`, amount: 16.5, position: "OT" },
      { player: `${teamName} Star Defender`, amount: 15.0, position: "EDGE" },
      { player: `${teamName} Wideout`, amount: 11.2, position: "WR" },
      { player: `${teamName} Center`, amount: 8.5, position: "C" }
    ],
    expiring: [
      { player: `${teamName} starting guard`, position: "IOL", age: 29, currentSalary: 6.5 },
      { player: `${teamName} situational rusher`, position: "EDGE", age: 31, currentSalary: 4.2 }
    ],
    cuts: [
      { player: `${teamName} Backup Safety`, position: "S", capSavings: 3.5, deadCap: 1.1, reason: "Contract is heavily front-loaded; cutting saves $3.5M in immediate space." }
    ],
    transactions: [
      { date: "2026-03-11", type: "signing", description: `Signed free agent WR to a 2-year, $14M contract.` },
      { date: "2026-03-14", type: "release", description: `Released underperforming rotational tackle.` }
    ]
  };
}

const REAL_CAPS: Record<string, { activeCap: number; deadCap: number; capSpace: number }> = {
  ARI: { activeCap: 209.5, deadCap: 18.3, capSpace: 27.6 },
  ATL: { activeCap: 220.1, deadCap: 12.4, capSpace: 22.9 },
  BAL: { activeCap: 235.6, deadCap: 11.2, capSpace: 8.6 },
  BUF: { activeCap: 232.4, deadCap: 17.8, capSpace: 5.2 },
  KC: { activeCap: 238.1, deadCap: 10.5, capSpace: 6.8 },
  GB: { activeCap: 212.4, deadCap: 24.2, capSpace: 18.8 },
  SF: { activeCap: 231.5, deadCap: 27.2, capSpace: -3.3 }
};

// Dynamically generate report for the team
export function getTeamReport(team: Team): TeamReport {
  const data = TEAM_STARS[team.id] || generateGenericTeamStars(team.id, team.name);

  // Generate salary cap breakdown
  const totalCap = 255.4;
  let activeCap = 0;
  let deadCap = 0;
  let capSpace = 0;

  if (REAL_CAPS[team.id]) {
    activeCap = REAL_CAPS[team.id].activeCap;
    deadCap = REAL_CAPS[team.id].deadCap;
    capSpace = REAL_CAPS[team.id].capSpace;
  } else {
    // Generate slightly randomized but stable salary cap numbers centered around $255.4M
    deadCap = parseFloat((12.5 + (team.id.charCodeAt(0) % 15)).toFixed(1));
    activeCap = parseFloat((totalCap - deadCap - (team.id.charCodeAt(1) % 25) - 3).toFixed(1));
    capSpace = parseFloat((totalCap - activeCap - deadCap).toFixed(1));
  }

  // Generate 3 years of draft assets
  const draftAssets: DraftAsset[] = [];
  const years = [2026, 2027, 2028];
  
  years.forEach(year => {
    // Round 1
    draftAssets.push({
      year,
      round: 1,
      pickName: year === 2026 ? team.draftPicks[0] || `1.${15 + (team.id.charCodeAt(0) % 10)}` : `Round 1 Pick`
    });
    // Round 2
    draftAssets.push({
      year,
      round: 2,
      pickName: year === 2026 ? team.draftPicks[1] || `2.${47 + (team.id.charCodeAt(0) % 10)}` : `Round 2 Pick`
    });
    // Round 3
    draftAssets.push({
      year,
      round: 3,
      pickName: year === 2026 ? team.draftPicks[2] || `3.${79 + (team.id.charCodeAt(0) % 10)}` : `Round 3 Pick`
    });
    // Day 3 assets (Rounds 4, 5, 6, 7)
    [4, 5, 6, 7].forEach(round => {
      draftAssets.push({
        year,
        round,
        pickName: `Round ${round} Pick`
      });
    });
  });

  // Expected most used formations (Offense and Defense)
  // We'll customize formations based on the team's style (e.g. 11 Personnel, 12 Personnel, Nickel 4-2-5, 3-4 Base, 4-3 Base)
  const is34 = team.currentScheme.toLowerCase().includes("3-4");

  const formations: DepthChartFormation[] = [
    {
      name: "11 Personnel (Expected Base Offense)",
      positions: [
        { role: "QB", player: data.qb },
        { role: "RB", player: data.rb },
        { role: "WR1", player: data.wr1 },
        { role: "WR2", player: data.wr2 },
        { role: "WR3", player: data.wr3 },
        { role: "TE", player: data.te },
        { role: "LT", player: data.ol[0] },
        { role: "LG", player: data.ol[1] },
        { role: "C", player: data.ol[2] },
        { role: "RG", player: data.ol[3] },
        { role: "RT", player: data.ol[4] }
      ]
    },
    {
      name: "12 Personnel (Heavy Offense Form)",
      positions: [
        { role: "QB", player: data.qb },
        { role: "RB", player: data.rb },
        { role: "WR1", player: data.wr1 },
        { role: "WR2", player: data.wr2 },
        { role: "TE1", player: data.te },
        { role: "TE2", player: data.te2 },
        { role: "LT", player: data.ol[0] },
        { role: "LG", player: data.ol[1] },
        { role: "C", player: data.ol[2] },
        { role: "RG", player: data.ol[3] },
        { role: "RT", player: data.ol[4] }
      ]
    },
    {
      name: "Nickel 4-2-5 (Primary Defensive Front)",
      positions: [
        { role: "DE1", player: data.dl[0] },
        { role: "DT1", player: data.dl[1] },
        { role: "DT2", player: data.dl[2] },
        { role: "DE2", player: data.dl[3] },
        { role: "LB1", player: data.lb[0] },
        { role: "LB2", player: data.lb[1] },
        { role: "CB1", player: data.db[0] },
        { role: "CB2", player: data.db[1] },
        { role: "S1", player: data.db[2] },
        { role: "S2", player: data.db[3] },
        { role: "NCB", player: data.db[4] }
      ]
    },
    {
      name: is34 ? "3-4 Base Front Defense" : "4-3 Base Front Defense",
      positions: is34 ? [
        { role: "NT", player: data.dl[1] },
        { role: "DE1", player: data.dl[0] },
        { role: "DE2", player: data.dl[2] },
        { role: "OLB1", player: data.lb[2] || "Outside Linebacker 1" },
        { role: "ILB1", player: data.lb[0] },
        { role: "ILB2", player: data.lb[1] },
        { role: "OLB2", player: "Outside Linebacker 2" },
        { role: "CB1", player: data.db[0] },
        { role: "CB2", player: data.db[1] },
        { role: "FS", player: data.db[2] },
        { role: "SS", player: data.db[3] }
      ] : [
        { role: "DE1", player: data.dl[0] },
        { role: "DT1", player: data.dl[1] },
        { role: "DT2", player: data.dl[2] },
        { role: "DE2", player: data.dl[3] },
        { role: "WLB", player: data.lb[0] },
        { role: "MLB", player: data.lb[1] },
        { role: "SLB", player: data.lb[2] || "Strongside Linebacker" },
        { role: "CB1", player: data.db[0] },
        { role: "CB2", player: data.db[1] },
        { role: "FS", player: data.db[2] },
        { role: "SS", player: data.db[3] }
      ]
    }
  ];

  return {
    teamId: team.id,
    salaryCap: {
      totalCap,
      activeCap,
      deadCap,
      capSpace,
      topCapHits: data.stars
    },
    draftAssets,
    expiringDeals: data.expiring,
    salaryCuts: data.cuts,
    transactions: data.transactions,
    formations
  };
}
