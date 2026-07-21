import { Team, Scheme } from '../types';

export const NFL_TEAMS: Team[] = [
  {
    id: "ARI",
    name: "Cardinals",
    fullName: "Arizona Cardinals",
    logoColor: "#97233F",
    textColor: "#FFFFFF",
    secondaryColor: "#FFB612",
    division: "NFC West",
    needs: ["EDGE", "DT", "WR", "CB", "IOL"],
    currentScheme: "3-4 Hybrid Defense",
    draftPicks: ["1.11", "2.43", "3.75", "4.107", "5.139"]
  },
  {
    id: "ATL",
    name: "Falcons",
    fullName: "Atlanta Falcons",
    logoColor: "#A71930",
    textColor: "#FFFFFF",
    secondaryColor: "#000000",
    division: "NFC South",
    needs: ["EDGE", "CB", "WR", "IOL", "DL"],
    currentScheme: "3-4 Multiple Defense",
    draftPicks: ["1.16", "2.48", "3.80", "4.112", "5.144"]
  },
  {
    id: "BAL",
    name: "Ravens",
    fullName: "Baltimore Ravens",
    logoColor: "#241773",
    textColor: "#FFFFFF",
    secondaryColor: "#9E7C0C",
    division: "AFC North",
    needs: ["OT", "EDGE", "IOL", "WR", "CB"],
    currentScheme: "3-4 Odd Front Defense",
    draftPicks: ["1.26", "2.58", "3.90", "4.122", "5.154"]
  },
  {
    id: "BUF",
    name: "Bills",
    fullName: "Buffalo Bills",
    logoColor: "#00338D",
    textColor: "#FFFFFF",
    secondaryColor: "#C60C30",
    division: "AFC East",
    needs: ["WR", "EDGE", "DT", "S", "LB"],
    currentScheme: "4-3 Over Defense",
    draftPicks: ["1.30", "2.62", "3.94", "4.126", "5.158"]
  },
  {
    id: "CAR",
    name: "Panthers",
    fullName: "Carolina Panthers",
    logoColor: "#0085CA",
    textColor: "#FFFFFF",
    secondaryColor: "#101820",
    division: "NFC South",
    needs: ["WR", "EDGE", "CB", "TE", "DT"],
    currentScheme: "3-4 Base Defense",
    draftPicks: ["1.3", "2.35", "3.67", "4.99", "5.131"]
  },
  {
    id: "CHI",
    name: "Bears",
    fullName: "Chicago Bears",
    logoColor: "#0B162A",
    textColor: "#FFFFFF",
    secondaryColor: "#E64100",
    division: "NFC North",
    needs: ["EDGE", "OT", "IOL", "DT", "WR"],
    currentScheme: "4-3 Under Defense",
    draftPicks: ["1.9", "2.41", "3.73", "4.105", "5.137"]
  },
  {
    id: "CIN",
    name: "Bengals",
    fullName: "Cincinnati Bengals",
    logoColor: "#FB4F14",
    textColor: "#FFFFFF",
    secondaryColor: "#000000",
    division: "AFC North",
    needs: ["DT", "OT", "WR", "CB", "IOL"],
    currentScheme: "4-3 Split-Safety Defense",
    draftPicks: ["1.17", "2.49", "3.81", "4.113", "5.145"]
  },
  {
    id: "CLE",
    name: "Browns",
    fullName: "Cleveland Browns",
    logoColor: "#311D00",
    textColor: "#FFFFFF",
    secondaryColor: "#FF3C00",
    division: "AFC North",
    needs: ["QB", "OT", "WR", "DT", "LB"],
    currentScheme: "4-3 Aggressive Single-High",
    draftPicks: ["1.5", "2.37", "3.69", "4.101", "5.133"]
  },
  {
    id: "DAL",
    name: "Cowboys",
    fullName: "Dallas Cowboys",
    logoColor: "#003594",
    textColor: "#FFFFFF",
    secondaryColor: "#869397",
    division: "NFC East",
    needs: ["RB", "DT", "EDGE", "WR", "CB"],
    currentScheme: "4-3 Nickel Defense",
    draftPicks: ["1.19", "2.51", "3.83", "4.115", "5.147"]
  },
  {
    id: "DEN",
    name: "Broncos",
    fullName: "Denver Broncos",
    logoColor: "#FC4C02",
    textColor: "#FFFFFF",
    secondaryColor: "#0C2340",
    division: "AFC West",
    needs: ["WR", "TE", "EDGE", "DT", "CB"],
    currentScheme: "3-4 Multiple Defense",
    draftPicks: ["1.14", "2.46", "3.78", "4.110", "5.142"]
  },
  {
    id: "DET",
    name: "Lions",
    fullName: "Detroit Lions",
    logoColor: "#0076B6",
    textColor: "#FFFFFF",
    secondaryColor: "#B0B7BC",
    division: "NFC North",
    needs: ["EDGE", "DT", "CB", "WR", "S"],
    currentScheme: "4-3 Multi-Front Defense",
    draftPicks: ["1.28", "2.60", "3.92", "4.124", "5.156"]
  },
  {
    id: "GB",
    name: "Packers",
    fullName: "Green Bay Packers",
    logoColor: "#203731",
    textColor: "#FFFFFF",
    secondaryColor: "#FFB612",
    division: "NFC North",
    needs: ["CB", "OT", "S", "DT", "EDGE"],
    currentScheme: "4-3 Over/Under Cover 4",
    draftPicks: ["1.24", "2.56", "3.88", "4.120", "5.152"]
  },
  {
    id: "HOU",
    name: "Texans",
    fullName: "Houston Texans",
    logoColor: "#03202F",
    textColor: "#FFFFFF",
    secondaryColor: "#A71930",
    division: "AFC South",
    needs: ["DT", "S", "IOL", "EDGE", "LB"],
    currentScheme: "4-3 Wide-9 Defense",
    draftPicks: ["1.25", "2.57", "3.89", "4.121", "5.153"]
  },
  {
    id: "IND",
    name: "Colts",
    fullName: "Indianapolis Colts",
    logoColor: "#002C5F",
    textColor: "#FFFFFF",
    secondaryColor: "#A2AAAD",
    division: "AFC South",
    needs: ["CB", "S", "TE", "WR", "EDGE"],
    currentScheme: "4-3 Cover 3 Base",
    draftPicks: ["1.12", "2.44", "3.76", "4.108", "5.140"]
  },
  {
    id: "JAX",
    name: "Jaguars",
    fullName: "Jacksonville Jaguars",
    logoColor: "#006778",
    textColor: "#FFFFFF",
    secondaryColor: "#D7A22A",
    division: "AFC South",
    needs: ["OT", "CB", "IOL", "WR", "S"],
    currentScheme: "4-3 Press-Man Defense",
    draftPicks: ["1.2", "2.34", "3.66", "4.98", "5.130"]
  },
  {
    id: "KC",
    name: "Chiefs",
    fullName: "Kansas City Chiefs",
    logoColor: "#E31837",
    textColor: "#FFFFFF",
    secondaryColor: "#FFB612",
    division: "AFC West",
    needs: ["OT", "WR", "CB", "DT", "EDGE"],
    currentScheme: "3-4 Multiple Aggressive",
    draftPicks: ["1.32", "2.64", "3.96", "4.128", "5.160"]
  },
  {
    id: "LV",
    name: "Raiders",
    fullName: "Las Vegas Raiders",
    logoColor: "#101820",
    textColor: "#FFFFFF",
    secondaryColor: "#A5ACAF",
    division: "AFC West",
    needs: ["QB", "OT", "CB", "DT", "RB"],
    currentScheme: "3-4 Hybrid Cover 1",
    draftPicks: ["1.6", "2.38", "3.70", "4.102", "5.134"]
  },
  {
    id: "LAC",
    name: "Chargers",
    fullName: "Los Angeles Chargers",
    logoColor: "#0080C6",
    textColor: "#FFFFFF",
    secondaryColor: "#FFC20E",
    division: "AFC West",
    needs: ["WR", "TE", "DT", "CB", "IOL"],
    currentScheme: "3-4 Match Quarters Defense",
    draftPicks: ["1.15", "2.47", "3.79", "4.111", "5.143"]
  },
  {
    id: "LAR",
    name: "Rams",
    fullName: "Los Angeles Rams",
    logoColor: "#003594",
    textColor: "#FFFFFF",
    secondaryColor: "#FFA300",
    division: "NFC West",
    needs: ["OT", "EDGE", "CB", "S", "IOL"],
    currentScheme: "3-4 Split Safety Front",
    draftPicks: ["1.21", "2.53", "3.85", "4.117", "5.149"]
  },
  {
    id: "MIA",
    name: "Dolphins",
    fullName: "Miami Dolphins",
    logoColor: "#008E97",
    textColor: "#FFFFFF",
    secondaryColor: "#FC4C02",
    division: "AFC East",
    needs: ["IOL", "DT", "EDGE", "WR", "TE"],
    currentScheme: "3-4 Vic Fangio Style",
    draftPicks: ["1.18", "2.50", "3.82", "4.114", "5.146"]
  },
  {
    id: "MIN",
    name: "Vikings",
    fullName: "Minnesota Vikings",
    logoColor: "#4F2683",
    textColor: "#FFFFFF",
    secondaryColor: "#FFC62F",
    division: "NFC North",
    needs: ["DT", "CB", "IOL", "EDGE", "TE"],
    currentScheme: "3-4 Psycho Blitz Fronts",
    draftPicks: ["1.27", "2.59", "3.91", "4.123", "5.155"]
  },
  {
    id: "NE",
    name: "Patriots",
    fullName: "New England Patriots",
    logoColor: "#002244",
    textColor: "#FFFFFF",
    secondaryColor: "#C60C30",
    division: "AFC East",
    needs: ["OT", "WR", "EDGE", "CB", "DT"],
    currentScheme: "3-4 Hybrid/Two-Gap",
    draftPicks: ["1.4", "2.36", "3.68", "4.100", "5.132"]
  },
  {
    id: "NO",
    name: "Saints",
    fullName: "New Orleans Saints",
    logoColor: "#D3BC8D",
    textColor: "#101820",
    secondaryColor: "#101820",
    division: "NFC South",
    needs: ["EDGE", "OT", "IOL", "WR", "QB"],
    currentScheme: "4-3 Heavy Cover 3",
    draftPicks: ["1.13", "2.45", "3.77", "4.109", "5.141"]
  },
  {
    id: "NYG",
    name: "Giants",
    fullName: "New York Giants",
    logoColor: "#0B2265",
    textColor: "#FFFFFF",
    secondaryColor: "#A71930",
    division: "NFC East",
    needs: ["QB", "OT", "WR", "CB", "DT"],
    currentScheme: "3-4 Press-Man Heavy Blitz",
    draftPicks: ["1.7", "2.39", "3.71", "4.103", "5.135"]
  },
  {
    id: "NYJ",
    name: "Jets",
    fullName: "New York Jets",
    logoColor: "#125740",
    textColor: "#FFFFFF",
    secondaryColor: "#000000",
    division: "AFC East",
    needs: ["OT", "S", "DT", "WR", "QB"],
    currentScheme: "4-3 Match Quarter Coverage",
    draftPicks: ["1.8", "2.40", "3.72", "4.104", "5.136"]
  },
  {
    id: "PHI",
    name: "Eagles",
    fullName: "Philadelphia Eagles",
    logoColor: "#004C54",
    textColor: "#FFFFFF",
    secondaryColor: "#A5ACAF",
    division: "NFC East",
    needs: ["EDGE", "OT", "TE", "WR", "LB"],
    currentScheme: "3-4 Vic Fangio Shell",
    draftPicks: ["1.29", "2.61", "3.93", "4.125", "5.157"]
  },
  {
    id: "PIT",
    name: "Steelers",
    fullName: "Pittsburgh Steelers",
    logoColor: "#101820",
    textColor: "#FFB612",
    secondaryColor: "#FFB612",
    division: "AFC North",
    needs: ["WR", "IOL", "DL", "EDGE", "CB"],
    currentScheme: "3-4 Standard Okie Front",
    draftPicks: ["1.22", "2.54", "3.86", "4.118", "5.150"]
  },
  {
    id: "SF",
    name: "49ers",
    fullName: "San Francisco 49ers",
    logoColor: "#AA0000",
    textColor: "#FFFFFF",
    secondaryColor: "#B3995D",
    division: "NFC West",
    needs: ["IOL", "OT", "CB", "S", "DL"],
    currentScheme: "4-3 Wide-9 Defense",
    draftPicks: ["1.23", "2.55", "3.87", "4.119", "5.151"]
  },
  {
    id: "SEA",
    name: "Seahawks",
    fullName: "Seattle Seahawks",
    logoColor: "#002244",
    textColor: "#FFFFFF",
    secondaryColor: "#69BE28",
    division: "NFC West",
    needs: ["IOL", "LB", "DT", "EDGE", "S"],
    currentScheme: "3-4 Multiple/Odd Defense",
    draftPicks: ["1.10", "2.42", "3.74", "4.106", "5.138"]
  },
  {
    id: "TB",
    name: "Buccaneers",
    fullName: "Tampa Bay Buccaneers",
    logoColor: "#D50A0A",
    textColor: "#FFFFFF",
    secondaryColor: "#34302B",
    division: "NFC South",
    needs: ["EDGE", "CB", "IOL", "S", "WR"],
    currentScheme: "3-4 Aggressive Pressure",
    draftPicks: ["1.20", "2.52", "3.84", "4.116", "5.148"]
  },
  {
    id: "TEN",
    name: "Titans",
    fullName: "Tennessee Titans",
    logoColor: "#4B92DB",
    textColor: "#FFFFFF",
    secondaryColor: "#C60C30",
    division: "AFC South",
    needs: ["EDGE", "WR", "OT", "CB", "TE"],
    currentScheme: "3-4 Multiple Fronts",
    draftPicks: ["1.1", "2.33", "3.65", "4.97", "5.129"]
  },
  {
    id: "WAS",
    name: "Commanders",
    fullName: "Washington Commanders",
    logoColor: "#5A1414",
    textColor: "#FFFFFF",
    secondaryColor: "#FFB612",
    division: "NFC East",
    needs: ["OT", "EDGE", "CB", "WR", "LB"],
    currentScheme: "4-3 Aggressive Press",
    draftPicks: ["1.31", "2.63", "3.95", "4.127", "5.159"]
  }
];

export const SCHEMES: Scheme[] = [
  {
    id: "westcoast",
    name: "West Coast Offense",
    type: "offense",
    description: "Emphasizes quick horizontal passing as an extension of the run game, requiring highly accurate QBs and high-YAC receivers with precise route-running.",
    favoredPositions: ["QB", "WR", "TE", "IOL"]
  },
  {
    id: "spread",
    name: "Vertical Spread Offense",
    type: "offense",
    description: "Stretches the defense horizontally and vertically, requiring speedy receivers, athletic pocket protectors, and mobile, deep-throwing quarterbacks.",
    favoredPositions: ["QB", "WR", "OT"]
  },
  {
    id: "zoneblock",
    name: "Zone Blocking / Outside Zone",
    type: "offense",
    description: "Requires highly athletic offensive linemen who can move laterally, reach-block, and climb to the second level to create cutback lanes.",
    favoredPositions: ["OT", "IOL", "RB"]
  },
  {
    id: "gapblock",
    name: "Gap/Power Blocking Offense",
    type: "offense",
    description: "Relies on size, strength, and raw power. Linemen pull across the formation to create massive gaps for downhill, physical runners.",
    favoredPositions: ["IOL", "RB", "TE"]
  },
  {
    id: "34defense",
    name: "3-4 Hybrid Defense",
    type: "defense",
    description: "Relies on three massive interior two-gapping linemen and active outside linebackers (EDGE) who excel at both pass rush and coverage.",
    favoredPositions: ["EDGE", "DT", "LB"]
  },
  {
    id: "43defense",
    name: "4-3 Under/Over Defense",
    type: "defense",
    description: "A traditional single-gap defensive front that uses four down-linemen to disrupt the pocket directly, allowing linebackers to flow freely and attack.",
    favoredPositions: ["EDGE", "DT", "LB", "CB"]
  },
  {
    id: "pressman",
    name: "Press-Man Cover 1",
    type: "defense",
    description: "Requires cornerback prospects with elite physical size, arm-length, and jam-technique on the line of scrimmage, supported by a single-high safety.",
    favoredPositions: ["CB", "S", "EDGE"]
  },
  {
    id: "quarters",
    name: "Match Quarters (Cover 4)",
    type: "defense",
    description: "Modern split-safety architecture that matches receiver releases, requiring intelligent, high-IQ safeties and disciplined perimeter defensive backs.",
    favoredPositions: ["S", "CB", "LB"]
  }
];
