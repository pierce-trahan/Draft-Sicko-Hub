export interface JobHistoryItem {
  yearRange: string;
  role: string;
  team: string;
}

export interface Coach {
  id: string;
  name: string;
  team: string;
  teamId: string; // e.g. "KC", "SF", "LAC", "DET", "SEA", "HOU", "LAR"
  role: string;
  currentSystem: string;
  systemsRun: string[];
  mentors: string[];
  proteges: string[];
  peers: string[];
  schemeDescription: string;
  personnelPreferences: string;
  keyPlayType: string;
  avatarPlaceholderColor: string;
  jobHistory: JobHistoryItem[];
}

export interface PlayerArchetype {
  role: string;
  archetype: string;
  attributes: string;
  examples: string[];
}

export interface FormationTrend {
  name: string;
  personnel: string;
  leagueUsage: string;
  runPassRatio: string;
  epaPerPlay: number;
  trend: "rising" | "stable" | "declining";
  description: string;
  primaryUsers: string[];
  advantage: string;
  preferredArchetypes: PlayerArchetype[];
  keyAttributes: string[];
}

export const COACHES: Coach[] = [
  {
    id: "mike-lafleur",
    name: "Mike LaFleur",
    team: "Arizona Cardinals",
    teamId: "ARI",
    role: "Head Coach",
    currentSystem: "Shanahan Outside-Zone & Compressed West Coast",
    systemsRun: ["Shanahan Wide Zone", "Jets West Coast Spread", "Rams Motion Passing"],
    mentors: ["Kyle Shanahan", "Sean McVay", "Robert Saleh"],
    proteges: ["Benton Crowder"],
    peers: ["Bobby Slowik", "Matt LaFleur", "Mike McDaniel"],
    schemeDescription: "As Kyle Shanahan's long-time run-game coordinator, LaFleur brings a highly integrated wide-zone run system paired with heavy play-action bootlegs and vertical crossing routes. He uses compressed formations to generate block-edge advantages and open deep middle targets.",
    personnelPreferences: "Enjoys highly agile offensive linemen, physical blocking receivers, and a quick-processing quarterback.",
    keyPlayType: "Outside-Zone Stretch / Play-Action Bootleg Cross / Condensed 11-Personnel Boot",
    avatarPlaceholderColor: "bg-red-750",
    jobHistory: [
      { yearRange: "2026-Present", role: "Head Coach", team: "Arizona Cardinals" },
      { yearRange: "2023-2025", role: "Offensive Coordinator", team: "Los Angeles Rams" },
      { yearRange: "2021-2022", role: "Offensive Coordinator", team: "New York Jets" },
      { yearRange: "2017-2020", role: "Passing Game Coordinator", team: "San Francisco 49ers" }
    ]
  },
  {
    id: "kevin-stefanski",
    name: "Kevin Stefanski",
    team: "Atlanta Falcons",
    teamId: "ATL",
    role: "Head Coach",
    currentSystem: "Under-Center Wide-Zone & Gap Power PA",
    systemsRun: ["Gary Kubiak Wide Zone", "Norv Turner Air Coryell", "Pat Shurmur West Coast"],
    mentors: ["Gary Kubiak", "Brad Childress", "Norv Turner", "Pat Shurmur"],
    proteges: ["Ken Dorsey", "Jerrod Johnson"],
    peers: ["Kyle Shanahan", "Matt LaFleur"],
    schemeDescription: "Stefanski implements a classic Gary Kubiak wide-zone baseline, placing the quarterback under center to force deep-angle play-action boots. He mixes this with heavy personnel packages (12/13 personnel) to ground down defensive fronts.",
    personnelPreferences: "Demands exceptional lateral-agility offensive guards, elite vertical threat tight ends, and heavy, downhill block-shedding linebackers.",
    keyPlayType: "Under-Center Wide-Zone Boot / Heavy 3-TE Play-Action Leak / Gap Counter",
    avatarPlaceholderColor: "bg-red-900",
    jobHistory: [
      { yearRange: "2026-Present", role: "Head Coach", team: "Atlanta Falcons" },
      { yearRange: "2020-2025", role: "Head Coach", team: "Cleveland Browns" },
      { yearRange: "2019", role: "Offensive Coordinator", team: "Minnesota Vikings" },
      { yearRange: "2017-2018", role: "Quarterbacks Coach", team: "Minnesota Vikings" },
      { yearRange: "2016", role: "Running Backs Coach", team: "Minnesota Vikings" }
    ]
  },
  {
    id: "jesse-minter",
    name: "Jesse Minter",
    team: "Baltimore Ravens",
    teamId: "BAL",
    role: "Head Coach",
    currentSystem: "Amoeba Simulated Pressure Hybrid 3-4 & Match Quarters",
    systemsRun: ["Ravens Multiple Odd Front Defense", "Michigan Aggressive Match-Quarters", "Wink Martindale Blitz-Heavy"],
    mentors: ["John Harbaugh", "Jim Harbaugh", "Don Brown", "Mike Macdonald"],
    proteges: ["Steve Clinkscale"],
    peers: ["Mike Macdonald", "Dennard Wilson"],
    schemeDescription: "A premier defensive mind who succeeded Mike Macdonald at Michigan and followed him to the NFL. Minter employs disguised simulated pressures, presenting looks showing blitzers from anywhere before dropping into complex match coverages to generate free rushers and throw off quarterbacks.",
    personnelPreferences: "Versatile, interchangeable safeties, fast linebackers who can rush or drop, and high-motor edge rushers.",
    keyPlayType: "Simulated Pressure 4-Man Rush / Amoeba Under Front Blitz / Bracket Match Cover-4",
    avatarPlaceholderColor: "bg-violet-900",
    jobHistory: [
      { yearRange: "2026-Present", role: "Head Coach", team: "Baltimore Ravens" },
      { yearRange: "2024-2025", role: "Defensive Coordinator", team: "Los Angeles Chargers" },
      { yearRange: "2022-2023", role: "Defensive Coordinator", team: "Michigan Wolverines (Collegiate)" },
      { yearRange: "2021", role: "Defensive Coordinator", team: "Vanderbilt Commodores (Collegiate)" },
      { yearRange: "2017-2020", role: "Defensive Assistant / DBs Coach", team: "Baltimore Ravens" }
    ]
  },
  {
    id: "joe-brady",
    name: "Joe Brady",
    team: "Buffalo Bills",
    teamId: "BUF",
    role: "Head Coach",
    currentSystem: "Spread West Coast RPO & Multi-Personnel Passing",
    systemsRun: ["LSU Passing Game Spread", "Sean Payton West Coast", "Joe Moorhead RPO Spread"],
    mentors: ["Sean Payton", "Ed Orgeron", "Joe Moorhead", "Pete Carmichael"],
    proteges: ["Dovonte Edwards"],
    peers: ["Bobby Slowik", "Zac Taylor", "Liam Coen"],
    schemeDescription: "Promoted to Bills Head Coach after Sean McDermott's firing. Brady coordinates a highly modern, explosive spread offense that blends RPO options with deep downfield vertical attacks. He excels in empty-backfield spacing and route concepts that exploit linebacker leverage.",
    personnelPreferences: "Explosive receivers who can create yards after the catch, dynamic tight ends, and an athletic, deep-ball-throwing quarterback.",
    keyPlayType: "LSU-Style Mesh Option / Quick RPO Bubble Stretch / Empty-Spread Verticals",
    avatarPlaceholderColor: "bg-blue-800",
    jobHistory: [
      { yearRange: "2026-Present", role: "Head Coach", team: "Buffalo Bills" },
      { yearRange: "2023-2025", role: "Offensive Coordinator / QBs Coach", team: "Buffalo Bills" },
      { yearRange: "2022-2023", role: "Quarterbacks Coach", team: "Buffalo Bills" },
      { yearRange: "2020-2021", role: "Offensive Coordinator", team: "Carolina Panthers" },
      { yearRange: "2019", role: "Passing Game Coordinator", team: "LSU Tigers (Collegiate)" }
    ]
  },
  {
    id: "dave-canales",
    name: "Dave Canales",
    team: "Carolina Panthers",
    teamId: "CAR",
    role: "Head Coach",
    currentSystem: "Vite-Motion 11 Personnel West Coast & Mid-Zone",
    systemsRun: ["Pete Carroll Ground-and-Pound", "Shane Waldron modern McVay West Coast"],
    mentors: ["Pete Carroll", "Todd Bowles", "Shane Waldron"],
    proteges: ["Brad Idzik"],
    peers: ["Geno Smith", "Baker Mayfield"],
    schemeDescription: "Canales uses positive mental imagery and high-frequency motion. His offensive playbook is built on bootlegs, wide-zone stretches, and clear, quick progressions designed to maximize passing efficiency and protect quarterbacks from pocket breakdowns.",
    personnelPreferences: "Enjoys agile interior offensive line pullers, dynamic running backs with explosive cut capabilities, and precise, route-disciplined pass-catchers.",
    keyPlayType: "Outside-Zone Stretch / Play-Action Bootleg Crosser / RB Screen",
    avatarPlaceholderColor: "bg-sky-600",
    jobHistory: [
      { yearRange: "2024-Present", role: "Head Coach", team: "Carolina Panthers" },
      { yearRange: "2023", role: "Offensive Coordinator", team: "Tampa Bay Buccaneers" },
      { yearRange: "2022", role: "Quarterbacks Coach", team: "Seattle Seahawks" },
      { yearRange: "2020-2021", role: "Passing Game Coordinator", team: "Seattle Seahawks" },
      { yearRange: "2018-2019", role: "Quarterbacks Coach", team: "Seattle Seahawks" }
    ]
  },
  {
    id: "ben-johnson",
    name: "Ben Johnson",
    team: "Chicago Bears",
    teamId: "CHI",
    role: "Head Coach",
    currentSystem: "Multiple Personnel Play-Action Spread & Creative Gap-Run",
    systemsRun: ["Dan Campbell Heavy Pro-Style", "Joe Philbin Spread West Coast", "Gary Kubiak Wide-Zone Boot"],
    mentors: ["Dan Campbell", "Gary Kubiak", "Joe Philbin", "Jim Caldwell"],
    proteges: ["Tanner Engstrand", "Scottie Montgomery"],
    peers: ["Bobby Slowik", "Matt LaFleur", "Shane Steichen"],
    schemeDescription: "Widely regarded as one of the NFL's premier offensive minds. Johnson runs a highly unpredictable, motion-dense system that blends creative gap schemes (like sweeps and traps) with complex play-action bootlegs and vertical crossing concepts to consistently manipulate defensive keys and create wide-open targets.",
    personnelPreferences: "Wants versatile, fast wideouts who can block, a dual-threat tight end capable of lining up anywhere, and athletic offensive linemen who can pull and get out in space.",
    keyPlayType: "Flea-Flicker Cross / Counter GT Pull / PA Boot-Over Corner",
    avatarPlaceholderColor: "bg-blue-900",
    jobHistory: [
      { yearRange: "2025-Present", role: "Head Coach", team: "Chicago Bears" },
      { yearRange: "2022-2024", role: "Offensive Coordinator", team: "Detroit Lions" },
      { yearRange: "2020-2021", role: "Tight Ends Coach", team: "Detroit Lions" },
      { yearRange: "2019", role: "Offensive Quality Control Coach", team: "Detroit Lions" },
      { yearRange: "2016-2018", role: "Assistant Quarterbacks Coach", team: "Miami Dolphins" }
    ]
  },
  {
    id: "zac-taylor",
    name: "Zac Taylor",
    team: "Cincinnati Bengals",
    teamId: "CIN",
    role: "Head Coach",
    currentSystem: "Spread 11 Personnel Empty-Quick & West Coast",
    systemsRun: ["Sean McVay Rams Offense", "Bill Lazor West Coast", "Mike Sherman West Coast"],
    mentors: ["Sean McVay", "Bill Lazor", "Mike Sherman", "Dan Campbell"],
    proteges: ["Dan Pitcher", "Brian Callahan"],
    peers: ["Matt LaFleur", "Kevin O'Connell"],
    schemeDescription: "Taylor uses high-rate empty-field formations (11 personnel) designed to isolate defenders. He couples this with horizontal quick-game passing, vertical deep choice structures, and quick-progression audibles at the line.",
    personnelPreferences: "Wants quarterbacks with elite pre-snap processing speeds, tall boundary receivers with superior hand-strength, and pass-protection first tackles.",
    keyPlayType: "Empty Quick Hitch-Seam / PA Bootleg Crosser / WR Bubble RPO",
    avatarPlaceholderColor: "bg-orange-600",
    jobHistory: [
      { yearRange: "2019-Present", role: "Head Coach", team: "Cincinnati Bengals" },
      { yearRange: "2018", role: "Quarterbacks Coach", team: "Los Angeles Rams" },
      { yearRange: "2017", role: "Assistant Wide Receivers Coach", team: "Los Angeles Rams" },
      { yearRange: "2016", role: "Offensive Coordinator", team: "Cincinnati Bearcats (Collegiate)" },
      { yearRange: "2012-2015", role: "Offensive Coordinator / QBs Coach", team: "Miami Dolphins" }
    ]
  },
  {
    id: "todd-monken",
    name: "Todd Monken",
    team: "Cleveland Browns",
    teamId: "CLE",
    role: "Head Coach",
    currentSystem: "Pro-Style Spread, Multiple Personnel & Vertical RPO",
    systemsRun: ["Air Raid Spread", "Georgia Bulldogs Multiple Pro-Style", "Dirk Koetter Vertical Passing"],
    mentors: ["Dirk Koetter", "Les Miles", "Jack Harbaugh", "John Harbaugh"],
    proteges: ["Mike Bobo", "Buster Faulkner"],
    peers: ["Todd Haley", "Steve Spagnuolo"],
    schemeDescription: "Monken left his Baltimore Ravens OC job to become Cleveland's head coach. He runs a highly adaptable, explosive pro-style spread offense that features multiple tight end sets, complex RPOs, and vertical deep crossing routes designed to maximize space and target linebackers in coverage.",
    personnelPreferences: "Physical blocking tight ends with seam-stretching speed, downhill running backs, and smart quarterbacks who can diagnose coverages quickly.",
    keyPlayType: "12-Personnel Vertical Seam / Play-Action Post Crosser / Zone-Counter Run",
    avatarPlaceholderColor: "bg-amber-900",
    jobHistory: [
      { yearRange: "2026-Present", role: "Head Coach", team: "Cleveland Browns" },
      { yearRange: "2023-2025", role: "Offensive Coordinator", team: "Baltimore Ravens" },
      { yearRange: "2020-2022", role: "Offensive Coordinator / QBs Coach", team: "Georgia Bulldogs (Collegiate)" },
      { yearRange: "2019", role: "Offensive Coordinator", team: "Cleveland Browns" },
      { yearRange: "2016-2018", role: "Offensive Coordinator", team: "Tampa Bay Buccaneers" }
    ]
  },
  {
    id: "brian-schottenheimer",
    name: "Brian Schottenheimer",
    team: "Dallas Cowboys",
    teamId: "DAL",
    role: "Head Coach",
    currentSystem: "Texas Coast Spread & Balanced West Coast",
    systemsRun: ["Marty Schottenheimer Power Run", "Mike McCarthy West Coast", "Pete Carroll Pro-Style Run"],
    mentors: ["Marty Schottenheimer", "Mike McCarthy", "Pete Carroll", "Bill Belichick"],
    proteges: ["Kellen Moore"],
    peers: ["Darrell Bevell", "Shane Waldron"],
    schemeDescription: "Promoted from Cowboys OC to Head Coach, Schottenheimer implements a highly efficient 'Texas Coast' spread, emphasizing short, high-percentage passes, quick pre-snap motions, and balanced zone-run packages designed to generate manageable situations.",
    personnelPreferences: "Cerebral receivers with high YAC potential, reliable pocket-protecting tackles, and quick-releasing quarterbacks.",
    keyPlayType: "Slant-Flat Quick Concept / PA Deep Post-Stutter / Duo-Power Lead",
    avatarPlaceholderColor: "bg-blue-950",
    jobHistory: [
      { yearRange: "2026-Present", role: "Head Coach", team: "Dallas Cowboys" },
      { yearRange: "2023-2025", role: "Offensive Coordinator", team: "Dallas Cowboys" },
      { yearRange: "2021-2022", role: "Passing Game Coordinator / Consultant", team: "Jaguars & Seahawks" },
      { yearRange: "2018-2020", role: "Offensive Coordinator", team: "Seattle Seahawks" },
      { yearRange: "2016-2017", role: "Quarterbacks Coach", team: "Indianapolis Colts" }
    ]
  },
  {
    id: "sean-payton",
    name: "Sean Payton",
    team: "Denver Broncos",
    teamId: "DEN",
    role: "Head Coach",
    currentSystem: "Multiple-Personnel Spread & Power RPO",
    systemsRun: ["Bill Parcells Power Football", "Jon Gruden West Coast", "Saints High-Scoring Option-Route Offense"],
    mentors: ["Bill Parcells", "Jon Gruden", "Ray Rhodes", "Jim Fassel"],
    proteges: ["Dan Campbell", "Pete Carmichael", "Joe Lombardi", "Dennis Allen"],
    peers: ["Andy Reid", "Mike McCarthy"],
    schemeDescription: "Payton focuses heavily on mismatch generation, matching running backs and athletic tight ends against sluggish interior linebackers. He deploys lightning-quick horizontal screen strategies paired with vertical seam attacks.",
    personnelPreferences: "Prioritizes highly sturdy interior offensive line anchors, highly cerebral receiving backs, and aggressive, zone-aware safeties.",
    keyPlayType: "RB Choice Angle Route / Bubble Screen RPO / PA Seam-Streak",
    avatarPlaceholderColor: "bg-amber-500",
    jobHistory: [
      { yearRange: "2023-Present", role: "Head Coach", team: "Denver Broncos" },
      { yearRange: "2006-2021", role: "Head Coach", team: "New Orleans Saints" },
      { yearRange: "2003-2005", role: "Assistant HC / Passing Game Coordinator", team: "Dallas Cowboys" },
      { yearRange: "2000-2002", role: "Offensive Coordinator", team: "New York Giants" },
      { yearRange: "1999", role: "Quarterbacks Coach", team: "New York Giants" }
    ]
  },
  {
    id: "dan-campbell",
    name: "Dan Campbell",
    team: "Detroit Lions",
    teamId: "DET",
    role: "Head Coach",
    currentSystem: "Brutal Multiple Power-Gap & Play-Action Heavy",
    systemsRun: ["Sean Payton Option-Saints Offense", "Aggressive Multiple Pro-Style Run"],
    mentors: ["Sean Payton", "Bill Parcells", "Dan Henning", "Joe Philbin"],
    proteges: ["Ben Johnson", "Aaron Glenn"],
    peers: ["Dennis Allen", "Zac Taylor"],
    schemeDescription: "Campbell is famous for physical intimidation and meticulous game situations. His team uses heavy-pulling gap schemes, deceptive play-action flea-flickers, and high fourth-down conversion rates to physically break down opponents.",
    personnelPreferences: "Requires highly physical, blue-chip offensive line building blocks, hard-hitting downhill linebackers, and punishing blockers at receiver.",
    keyPlayType: "Counter GY Pull / PA Flea-Flicker Deep Cross / Tackle-Eligible Jump Pass",
    avatarPlaceholderColor: "bg-sky-500",
    jobHistory: [
      { yearRange: "2021-Present", role: "Head Coach", team: "Detroit Lions" },
      { yearRange: "2016-2020", role: "Assistant HC / Tight Ends Coach", team: "New Orleans Saints" },
      { yearRange: "2015", role: "Interim Head Coach", team: "Miami Dolphins" },
      { yearRange: "2011-2015", role: "Tight Ends Coach", team: "Miami Dolphins" },
      { yearRange: "2010", role: "Coaching Intern", team: "Miami Dolphins" }
    ]
  },
  {
    id: "matt-lafleur",
    name: "Matt LaFleur",
    team: "Green Bay Packers",
    teamId: "GB",
    role: "Head Coach",
    currentSystem: "Compressed Wide-Zone & Complex Play-Action",
    systemsRun: ["Kyle Shanahan Outside Zone", "Sean McVay Rams West Coast", "Tennessee Titans RPO-Heavy"],
    mentors: ["Kyle Shanahan", "Sean McVay", "Mike Shanahan", "Gary Kubiak"],
    proteges: ["Nathaniel Hackett", "Luke Getsy", "Adam Stenavich"],
    peers: ["Robert Saleh", "Mike McDaniel"],
    schemeDescription: "LaFleur blends Kyle Shanahan's horizontal run stretch with Sean McVay's vertical motion spacing. He uses motion to align receivers close to offensive tackles, creating highly dynamic space patterns on play-action leaks.",
    personnelPreferences: "Wants athletic, highly mobile offensive line reachers, dual-threat running backs, and multi-role wideouts with strong run-blocking skills.",
    keyPlayType: "Mid-Zone Stretch / Play-Action Bootleg Crosser / WR Motion Jet Sweep",
    avatarPlaceholderColor: "bg-green-850",
    jobHistory: [
      { yearRange: "2019-Present", role: "Head Coach", team: "Green Bay Packers" },
      { yearRange: "2018", role: "Offensive Coordinator", team: "Tennessee Titans" },
      { yearRange: "2017", role: "Offensive Coordinator", team: "Los Angeles Rams" },
      { yearRange: "2015-2016", role: "Quarterbacks Coach", team: "Atlanta Falcons" },
      { yearRange: "2014", role: "Quarterbacks Coach", team: "Notre Dame Fighting Irish (Collegiate)" }
    ]
  },
  {
    id: "demeco-ryans",
    name: "DeMeco Ryans",
    team: "Houston Texans",
    teamId: "HOU",
    role: "Head Coach",
    currentSystem: "4-3 Wide-9 Under Front & Cover-3/4 Match",
    systemsRun: ["Robert Saleh Wide-9 4-3", "49ers DeMeco Ryans Aggressive Nickel Base"],
    mentors: ["Robert Saleh", "Kyle Shanahan", "Gary Kubiak", "Wade Phillips"],
    proteges: ["Bobby Slowik", "Matt Burke"],
    peers: ["Mike McDaniel", "Robert Saleh"],
    schemeDescription: "Ryans runs an intense, aggressive 4-3 Wide-9 defense. By stretching defensive ends far outside, he forces instant pass-rush lanes and lets linebackers fly down with visual clarity. He couples this with wide-zone offense structures.",
    personnelPreferences: "Requires highly explosive edge speed-rushers, sideline-to-sideline tackling linebackers, and high-velocity safeties.",
    keyPlayType: "Wide-9 Speed Rush Twist / Match Cover-3 Under / PA Bootleg Deep Dig",
    avatarPlaceholderColor: "bg-sky-900",
    jobHistory: [
      { yearRange: "2023-Present", role: "Head Coach", team: "Houston Texans" },
      { yearRange: "2021-2022", role: "Defensive Coordinator", team: "San Francisco 49ers" },
      { yearRange: "2018-2020", role: "Inside Linebackers Coach", team: "San Francisco 49ers" },
      { yearRange: "2017", role: "Defensive Quality Control Coach", team: "San Francisco 49ers" },
      { yearRange: "2006-2015", role: "All-Pro Linebacker Player", team: "Texans & Eagles (NFL Player)" }
    ]
  },
  {
    id: "shane-steichen",
    name: "Shane Steichen",
    team: "Indianapolis Colts",
    teamId: "IND",
    role: "Head Coach",
    currentSystem: "Spread RPO, Vertical Deep-Choice & Power Run",
    systemsRun: ["Philip Rivers Chargers Quick-Game", "Eagles Jalen Hurts RPO Option Power"],
    mentors: ["Nick Sirianni", "Frank Reich", "Philip Rivers", "Norv Turner"],
    proteges: ["Jim Bob Cooter"],
    peers: ["Jonathan Gannon", "Kellen Moore"],
    schemeDescription: "Steichen utilizes high-tempo, modern spread RPOs paired with power-option ground networks. He stretches secondaries vertically with explosive downfield choice routes, maximizing output from dual-threat quarterbacks.",
    personnelPreferences: "Requires an athletic, high-weight dual-threat quarterback, dynamic vertical stretch tight ends, and physical boundary speed wideouts.",
    keyPlayType: "Power RPO Slant-Choice / PA Deep Seam-Stripe / Zone-Read Option-Pull",
    avatarPlaceholderColor: "bg-blue-700",
    jobHistory: [
      { yearRange: "2023-Present", role: "Head Coach", team: "Indianapolis Colts" },
      { yearRange: "2021-2022", role: "Offensive Coordinator", team: "Philadelphia Eagles" },
      { yearRange: "2020", role: "Offensive Coordinator", team: "Los Angeles Chargers" },
      { yearRange: "2016-2019", role: "Quarterbacks Coach", team: "Los Angeles Chargers" },
      { yearRange: "2014-2015", role: "Offensive Quality Control Coach", team: "San Diego Chargers" }
    ]
  },
  {
    id: "liam-coen",
    name: "Liam Coen",
    team: "Jacksonville Jaguars",
    teamId: "JAX",
    role: "Head Coach",
    currentSystem: "Rams-Style Condensed 11/12 Personnel & Mid-Zone Duo",
    systemsRun: ["Sean McVay Rams Offense", "Kentucky Pro-Style Offense", "Rich Scangarello West Coast"],
    mentors: ["Sean McVay", "Mark Stoops", "Frank Cignetti Jr.", "Rich Scangarello"],
    proteges: ["Mike Hartline"],
    peers: ["Zac Robinson", "Dave Canales", "Bobby Slowik"],
    schemeDescription: "A brilliant McVay disciple who has coordinated both NFL and collegiate offenses with stellar results. Coen runs a compressed, high-motion passing system emphasizing mid-zone and duo runs, paired with play-action bootlegs and vertical option routes to create high-probability throws.",
    personnelPreferences: "Requires highly durable running backs, a physical blocking tight end who can stretch seams, and smart, agile slot receivers who read zone coverages.",
    keyPlayType: "Duo Run Block / Play-Action Deep Choice Seam / Condensed WR Bubble",
    avatarPlaceholderColor: "bg-teal-850",
    jobHistory: [
      { yearRange: "2025-Present", role: "Head Coach", team: "Jacksonville Jaguars" },
      { yearRange: "2024", role: "Offensive Coordinator", team: "Tampa Bay Buccaneers" },
      { yearRange: "2023", role: "Offensive Coordinator / QBs Coach", team: "Kentucky Wildcats (Collegiate)" },
      { yearRange: "2022", role: "Offensive Coordinator", team: "Los Angeles Rams" },
      { yearRange: "2021", role: "Offensive Coordinator / QBs Coach", team: "Kentucky Wildcats (Collegiate)" },
      { yearRange: "2018-2020", role: "Assistant Quarterbacks / WRs Coach", team: "Los Angeles Rams" }
    ]
  },
  {
    id: "andy-reid",
    name: "Andy Reid",
    team: "Kansas City Chiefs",
    teamId: "KC",
    role: "Head Coach",
    currentSystem: "West Coast Spread & Dynamic RPO",
    systemsRun: ["Classic West Coast (Bill Walsh style)", "Spread Option", "Modern Chiefs Motion-Dense RPO"],
    mentors: ["Mike Holmgren", "LaVell Edwards", "Jack Elway"],
    proteges: ["Sean McDermott", "John Harbaugh", "Doug Pederson", "Matt Nagy", "Eric Bieniemy", "Steve Spagnuolo"],
    peers: ["Jon Gruden", "Brad Childress", "Ron Rivera"],
    schemeDescription: "A highly creative evolver of the West Coast offense. Reid uses deep horizontal stretching, high-frequency pre-snap motion to diagnose coverage, and sophisticated run-pass options (RPOs) paired with deep vertical-choice concepts.",
    personnelPreferences: "Prioritizes highly versatile receiving Tight Ends who can line up in the slot, elite pass-blocking offensive tackles, and shifty running backs with high-volume receiving capabilities.",
    keyPlayType: "Philly Special / Jet Sweep Shovel Pass / Mesh Option",
    avatarPlaceholderColor: "bg-red-500",
    jobHistory: [
      { yearRange: "2013-Present", role: "Head Coach", team: "Kansas City Chiefs" },
      { yearRange: "1999-2012", role: "Head Coach", team: "Philadelphia Eagles" },
      { yearRange: "1997-1998", role: "QB Coach / Assistant HC", team: "Green Bay Packers" },
      { yearRange: "1992-1996", role: "Offensive Assistant / TE Coach", team: "Green Bay Packers" },
      { yearRange: "1986-1991", role: "Offensive Line Coach", team: "UTEP (Collegiate)" }
    ]
  },
  {
    id: "klint-kubiak",
    name: "Klint Kubiak",
    team: "Las Vegas Raiders",
    teamId: "LV",
    role: "Head Coach",
    currentSystem: "Shanahan Wide-Zone & High-Motion Play-Action Boot",
    systemsRun: ["Gary Kubiak West Coast Wide-Zone", "Kyle Shanahan Outside-Zone System", "Saints Motion Offense"],
    mentors: ["Gary Kubiak", "Kyle Shanahan", "Sean Payton", "Mike Zimmer"],
    proteges: ["Clint Kubiak"],
    peers: ["Mike McDaniel", "Matt LaFleur", "Bobby Slowik"],
    schemeDescription: "Brings the highly efficient, movement-heavy Shanahan outside-zone coaching tree to Las Vegas. Kubiak utilizes continuous pre-snap motion, compressed WR splits, and devastating play-action boots to freeze linebackers and generate massive gains on leak concepts over the middle.",
    personnelPreferences: "Lateral-moving offensive linemen who can pull, highly versatile fullbacks, and precise route-running receivers with exceptional run-blocking engagement.",
    keyPlayType: "Outside-Zone Wide Stretch / PA Bootleg Crosser Leak / Condensed Duo Run",
    avatarPlaceholderColor: "bg-neutral-800",
    jobHistory: [
      { yearRange: "2026-Present", role: "Head Coach", team: "Las Vegas Raiders" },
      { yearRange: "2024-2025", role: "Offensive Coordinator", team: "New Orleans Saints" },
      { yearRange: "2023", role: "Passing Game Coordinator", team: "San Francisco 49ers" },
      { yearRange: "2022", role: "Passing Game Coordinator / QBs Coach", team: "Denver Broncos" },
      { yearRange: "2021", role: "Offensive Coordinator", team: "Minnesota Vikings" }
    ]
  },
  {
    id: "jim-harbaugh",
    name: "Jim Harbaugh",
    team: "Los Angeles Chargers",
    teamId: "LAC",
    role: "Head Coach",
    currentSystem: "Brutalist Power-Gap & Heavy Personnel Ball-Control",
    systemsRun: ["Stanford I-Formation Pro Style", "49ers Dual-Threat Pistol Option", "Michigan Heavy 6-Lineman JUMBO"],
    mentors: ["Jack Harbaugh", "Bo Schembechler", "Bill Walsh", "Al Davis"],
    proteges: ["Vic Fangio", "Sherrone Moore", "Jesse Minter", "Greg Roman"],
    peers: ["John Harbaugh", "David Shaw"],
    schemeDescription: "Uncompromising physical football. Harbaugh utilizes massive visual fronts, employing a 6th offensive lineman, multiple tight ends, and fullbacks to break down defenses. This wears down the pass rush, sets up a punishing run game, and secures clean downfield play-action opportunities.",
    personnelPreferences: "Wants elite, high-weight offensive tackles, bruising fullbacks who excel in isolation blocks, and quarterbacks who possess tremendous leadership, toughness, and physical size.",
    keyPlayType: "6-Lineman Wham Block / Power-O Isolation / Play-Action Post",
    avatarPlaceholderColor: "bg-amber-600",
    jobHistory: [
      { yearRange: "2024-Present", role: "Head Coach", team: "Los Angeles Chargers" },
      { yearRange: "2015-2023", role: "Head Coach", team: "Michigan Wolverines (Collegiate)" },
      { yearRange: "2011-2014", role: "Head Coach", team: "San Francisco 49ers" },
      { yearRange: "2007-2010", role: "Head Coach", team: "Stanford Cardinal (Collegiate)" },
      { yearRange: "2004-2006", role: "Head Coach", team: "San Diego Toreros (Collegiate)" }
    ]
  },
  {
    id: "sean-mcvay",
    name: "Sean McVay",
    team: "Los Angeles Rams",
    teamId: "LAR",
    role: "Head Coach",
    currentSystem: "Condensed 11 Personnel Wide-Zone & Duo",
    systemsRun: ["Washington Air-Coryell West Coast hybrid", "Rams High-Speed Tempo Wide-Zone", "Condensed Duo-Power Option"],
    mentors: ["Jon Gruden", "Mike Shanahan", "Jay Gruden"],
    proteges: ["Matt LaFleur", "Zac Taylor", "Kevin O'Connell", "Brandon Staley", "Raheem Morris", "Thomas Brown"],
    peers: ["Kyle Shanahan", "Aubrey Pleasant"],
    schemeDescription: "McVay operates almost exclusively out of 11 personnel but compresses wide receivers close to the offensive tackles. This lets WRs block defensive ends in the run game, creating outside lanes, and runs deep crossing routes off intense play-action fakes to disrupt safe coverages.",
    personnelPreferences: "Enjoys durable, vision-heavy 'one-cut' running backs, physical blocking wide receivers, and elite pocket quarterbacks who can throw with superb timing and anticipation.",
    keyPlayType: "Duo Run / Mid-Zone Bootleg / PA Deep Dig-Crossing Route",
    avatarPlaceholderColor: "bg-blue-600",
    jobHistory: [
      { yearRange: "2017-Present", role: "Head Coach", team: "Los Angeles Rams" },
      { yearRange: "2014-2016", role: "Offensive Coordinator", team: "Washington Redskins" },
      { yearRange: "2011-2013", role: "Tight Ends Coach", team: "Washington Redskins" },
      { yearRange: "2010", role: "Assistant Tight Ends Coach", team: "Washington Redskins" },
      { yearRange: "2009", role: "Wide Receivers / Quality Control", team: "Florida Tuskers (UFL)" }
    ]
  },
  {
    id: "jeff-hafley",
    name: "Jeff Hafley",
    team: "Miami Dolphins",
    teamId: "MIA",
    role: "Head Coach",
    currentSystem: "Aggressive 4-3 Single-High Press Cover 1/3",
    systemsRun: ["Robert Saleh 4-3 Defense", "Ohio State Press-Man Defense", "Packers Multiple Pressure Fronts"],
    mentors: ["Robert Saleh", "Ryan Day", "Kyle Shanahan", "Mike Pettine"],
    proteges: [],
    peers: ["Mike Macdonald", "Jesse Minter", "Aaron Glenn"],
    schemeDescription: "Brings an aggressive, modern defensive mindset to Miami. Hafley coordinates a 4-3 multiple front defense that uses single-high safety coverage (Cover 1 and Cover 3 Press), heavy perimeter jam tactics, and dynamic edge-blitz looks designed to disrupt deep-pass architectures.",
    personnelPreferences: "Elite press-man cornerbacks with long-reach capacity, high-velocity single-high centerfield safeties, and disruptive edge rushers.",
    keyPlayType: "Press Cover-1 Boundary Blitz / 4-3 Over Single-Gap Push / Safety Overload",
    avatarPlaceholderColor: "bg-teal-500",
    jobHistory: [
      { yearRange: "2026-Present", role: "Head Coach", team: "Miami Dolphins" },
      { yearRange: "2024-2025", role: "Defensive Coordinator", team: "Green Bay Packers" },
      { yearRange: "2020-2023", role: "Head Coach", team: "Boston College Eagles (Collegiate)" },
      { yearRange: "2019", role: "Co-Defensive Coordinator / DBs Coach", team: "Ohio State Buckeyes (Collegiate)" },
      { yearRange: "2016-2018", role: "Defensive Backs Coach", team: "San Francisco 49ers" }
    ]
  },
  {
    id: "kevin-oconnell",
    name: "Kevin O'Connell",
    team: "Minnesota Vikings",
    teamId: "MIN",
    role: "Head Coach",
    currentSystem: "Condensed 11 Personnel West Coast & Mid-Zone Boot",
    systemsRun: ["Sean McVay Spread West Coast", "Washington Jay Gruden Passing System"],
    mentors: ["Sean McVay", "Jay Gruden", "Chip Kelly"],
    proteges: ["Wes Phillips", "Josh McCown"],
    peers: ["Matt LaFleur", "Zac Taylor"],
    schemeDescription: "O'Connell runs a highly sophisticated, timing-based passing offense out of condensed 11 personnel looks, deploying deep crossing route patterns off aggressive play-action to freeze linebackers.",
    personnelPreferences: "Wants highly durable slot and boundary pass catchers, elite protection interior blockers, and high-stature accurate pocket passers.",
    keyPlayType: "Duo Run Block / Play-Action Deep Crossing Flood / Choice Option Slant",
    avatarPlaceholderColor: "bg-purple-850",
    jobHistory: [
      { yearRange: "2022-Present", role: "Head Coach", team: "Minnesota Vikings" },
      { yearRange: "2020-2021", role: "Offensive Coordinator", team: "Los Angeles Rams" },
      { yearRange: "2019", role: "Offensive Coordinator", team: "Washington Redskins" },
      { yearRange: "2017-2018", role: "Quarterbacks Coach", team: "Washington Redskins" },
      { yearRange: "2016", role: "Special Projects Coach", team: "San Francisco 49ers" }
    ]
  },
  {
    id: "mike-vrabel",
    name: "New England Patriots",
    team: "New England Patriots",
    teamId: "NE",
    role: "Head Coach",
    currentSystem: "Physical Hybrid 3-4/4-3 Defense & Balanced Power-Action Run",
    systemsRun: ["Bill Belichick 3-4 Hybrid Defense", "Ryan Tannehill Play-Action Zone Offense", "Ohio State Defensive Fronts"],
    mentors: ["Bill Belichick", "Urban Meyer", "Luke Fickell", "Bill O'Brien"],
    proteges: ["Arthur Smith", "Kerry Coombs"],
    peers: ["Mike Tomlin", "John Harbaugh", "Sean Payton"],
    schemeDescription: "Returning to New England where he won three Super Bowls as a player, Vrabel establishes a tough, highly physical culture. He runs a versatile 3-4/4-3 hybrid defense prioritizing front discipline and mixed coverages, paired offensively with a robust downhill running game to set up vertical strikes.",
    personnelPreferences: "Highly physical, high-effort defensive ends, downhill coverage-safe linebackers, and strong, physical offensive tackles who dominate in run blocking.",
    keyPlayType: "Multi-Front Interior Pinch / Play-Action Shot Post / Power-G Lead Run",
    avatarPlaceholderColor: "bg-navy-900",
    jobHistory: [
      { yearRange: "2026-Present", role: "Head Coach", team: "New England Patriots" },
      { yearRange: "2024-2025", role: "Coaching Consultant", team: "Cleveland Browns" },
      { yearRange: "2018-2023", role: "Head Coach", team: "Tennessee Titans" },
      { yearRange: "2017", role: "Defensive Coordinator", team: "Houston Texans" },
      { yearRange: "2014-2016", role: "Linebackers Coach", team: "Houston Texans" }
    ]
  },
  {
    id: "kellen-moore",
    name: "Kellen Moore",
    team: "New Orleans Saints",
    teamId: "NO",
    role: "Head Coach",
    currentSystem: "High-Motion Spread, West Coast Timing & Air Coryell Vertical",
    systemsRun: ["Dallas Cowboys High-Tempo Spread", "Kellen Moore Chargers Offense", "Eagles Vertical RPO"],
    mentors: ["Chris Petersen", "Jason Garrett", "Mike McCarthy", "Nick Sirianni"],
    proteges: ["Doug Nussmeier"],
    peers: ["Shane Steichen", "Zac Taylor", "Kevin O'Connell"],
    schemeDescription: "Takes over in New Orleans with an explosive, high-tempo modern spread offense. Moore combines quick West Coast timing concepts with deep pre-snap motion and Air Coryell vertical choices to generate favorable matchups in space, heavily isolating linebackers over the middle.",
    personnelPreferences: "Cerebral quarterbacks with lightning-fast processing speed, shifty route-running slot receivers, and athletic pulling offensive guards.",
    keyPlayType: "Play-Action Deep Crossing Leak / Choice Option Corner / WR Jet-Sweep Motion",
    avatarPlaceholderColor: "bg-amber-600",
    jobHistory: [
      { yearRange: "2026-Present", role: "Head Coach", team: "New Orleans Saints" },
      { yearRange: "2024-2025", role: "Offensive Coordinator", team: "Philadelphia Eagles" },
      { yearRange: "2023", role: "Offensive Coordinator", team: "Los Angeles Chargers" },
      { yearRange: "2019-2022", role: "Offensive Coordinator", team: "Dallas Cowboys" },
      { yearRange: "2018", role: "Quarterbacks Coach", team: "Dallas Cowboys" }
    ]
  },
  {
    id: "john-harbaugh",
    name: "John Harbaugh",
    team: "New York Giants",
    teamId: "NYG",
    role: "Head Coach",
    currentSystem: "Physical Multiple Front Defense & Multi-Personnel Power Run",
    systemsRun: ["Wink Martindale Blitz-Heavy", "Greg Roman Pistol Power", "Mike Macdonald Simulated Pressure"],
    mentors: ["Andy Reid", "Mike Holmgren", "Jack Harbaugh", "Jerry Burns"],
    proteges: ["Mike Macdonald", "Jesse Minter", "Rex Ryan", "Chuck Pagano"],
    peers: ["Jim Harbaugh", "Sean Payton"],
    schemeDescription: "In a monumental offseason move, John Harbaugh moved from Baltimore to become head coach of the Giants. He establishes a program focused on ultimate discipline, special teams mastery, and physical football. He deploys multi-front aggressive defensive packages paired with a robust ground game.",
    personnelPreferences: "Highly physical, high-motor players across all phases, defensive interior anchors, and coverage-safe linebackers.",
    keyPlayType: "Duo-Power G-Lead / Simulated Pressure 4-Man Blitz / Play-Action Corner Boot",
    avatarPlaceholderColor: "bg-blue-600",
    jobHistory: [
      { yearRange: "2026-Present", role: "Head Coach", team: "New York Giants" },
      { yearRange: "2008-2025", role: "Head Coach", team: "Baltimore Ravens" },
      { yearRange: "2007", role: "Secondary Coach", team: "Philadelphia Eagles" },
      { yearRange: "1998-2006", role: "Special Teams Coordinator", team: "Philadelphia Eagles" }
    ]
  },
  {
    id: "aaron-glenn",
    name: "Aaron Glenn",
    team: "New York Jets",
    teamId: "NYJ",
    role: "Head Coach",
    currentSystem: "Aggressive Multi-Front Defense & Press Cover 1 / Cover 3",
    systemsRun: ["Saints Press Cover Defense", "Dan Campbell Lions Multiple Front Defense"],
    mentors: ["Dan Campbell", "Sean Payton", "Bill Parcells", "Dennis Allen"],
    proteges: ["Kelvin Sheppard"],
    peers: ["DeMeco Ryans", "Robert Saleh"],
    schemeDescription: "Takes over as head coach of the Jets. Glenn is a high-energy, culture-building defensive coach who installs an aggressive multi-front system featuring heavy press-man coverages on the perimeter, simulated pressures, and heavy defensive tackle penetration to stifle the run.",
    personnelPreferences: "Long, physical perimeter cornerbacks, highly active interior rush defensive tackles, and downhill tackling linebackers.",
    keyPlayType: "Overload Edge-Safety Blitz / Press Cover-1 Man Lock / 4-3 Inside Twist",
    avatarPlaceholderColor: "bg-emerald-800",
    jobHistory: [
      { yearRange: "2026-Present", role: "Head Coach", team: "New York Jets" },
      { yearRange: "2021-2025", role: "Defensive Coordinator", team: "Detroit Lions" },
      { yearRange: "2016-2020", role: "Defensive Backs Coach", team: "New Orleans Saints" },
      { yearRange: "2014-2015", role: "Defensive Backs Coach", team: "Cleveland Browns" }
    ]
  },
  {
    id: "nick-sirianni",
    name: "Nick Sirianni",
    team: "Philadelphia Eagles",
    teamId: "PHI",
    role: "Head Coach",
    currentSystem: "Spread RPO, Vertical Deep-Choice & Power Duo",
    systemsRun: ["Frank Reich RPO Options", "Chargers Quick-Game West Coast"],
    mentors: ["Frank Reich", "Norv Turner", "Todd Haley", "Todd Bowles"],
    proteges: ["Shane Steichen", "Brian Johnson"],
    peers: ["Jonathan Gannon", "Kellen Moore"],
    schemeDescription: "Sirianni preaches explosive downfield plays, RPO-heavy designs, and elite perimeter matchups. His offenses focus heavily on 'isolation vertical deep shots' and power interior runs that open play-action channels.",
    personnelPreferences: "Demands elite boundary wide receiver speed, stout and agile offensive tackles, and athletic interior linebackers.",
    keyPlayType: "RPO Slant Option / PA Deep Vertical Seam / Brotherly Shove Quarterback Sneak",
    avatarPlaceholderColor: "bg-teal-900",
    jobHistory: [
      { yearRange: "2021-Present", role: "Head Coach", team: "Philadelphia Eagles" },
      { yearRange: "2018-2020", role: "Offensive Coordinator", team: "Indianapolis Colts" },
      { yearRange: "2016-2017", role: "Wide Receivers Coach", team: "Los Angeles Chargers" },
      { yearRange: "2014-2015", role: "Quarterbacks Coach", team: "San Diego Chargers" },
      { yearRange: "2013", role: "Offensive Quality Control Coach", team: "San Diego Chargers" }
    ]
  },
  {
    id: "mike-mccarthy",
    name: "Mike McCarthy",
    team: "Pittsburgh Steelers",
    teamId: "PIT",
    role: "Head Coach",
    currentSystem: "Texas Coast Spread & Quick West Coast",
    systemsRun: ["Classic Green Bay West Coast", "Norv Turner Air Coryell", "Modern Shotgun Spread"],
    mentors: ["Marty Schottenheimer", "Ray Rhodes", "Paul Hackett", "Sherman Lewis"],
    proteges: ["Joe Philbin", "Ben McAdoo", "Alex Van Pelt", "Kellen Moore"],
    peers: ["Andy Reid", "Sean Payton"],
    schemeDescription: "McCarthy coordinates his balanced quick-passing West Coast and shotgun spread strategies, focusing on horizontal stretch passing, perimeter screens, and tough inside duo-power runs to support his quarterback.",
    personnelPreferences: "Wants highly reliable pocket protectors, crisp route-running slot wide receivers, and interior rush-defending defensive tackles.",
    keyPlayType: "Slant-Flat Combo / PA Deep Post-Stutter / Duo-Power Lead",
    avatarPlaceholderColor: "bg-yellow-600",
    jobHistory: [
      { yearRange: "2026-Present", role: "Head Coach", team: "Pittsburgh Steelers" },
      { yearRange: "2020-2025", role: "Head Coach", team: "Dallas Cowboys" },
      { yearRange: "2006-2018", role: "Head Coach", team: "Green Bay Packers" },
      { yearRange: "2005", role: "Offensive Coordinator", team: "San Francisco 49ers" },
      { yearRange: "2000-2004", role: "Offensive Coordinator", team: "New Orleans Saints" }
    ]
  },
  {
    id: "kyle-shanahan",
    name: "Kyle Shanahan",
    team: "San Francisco 49ers",
    teamId: "SF",
    role: "Head Coach",
    currentSystem: "Outside-Zone / 21 Personnel West Coast",
    systemsRun: ["Mike Shanahan Outside-Zone", "Atlanta Falcons Spread West Coast", "Under-Center 21 Personnel Heavy"],
    mentors: ["Mike Shanahan", "Gary Kubiak", "Jon Gruden"],
    proteges: ["Sean McVay", "Matt LaFleur", "Mike McDaniel", "Robert Saleh", "DeMeco Ryans", "Bobby Slowik"],
    peers: ["Rich Scangarello", "Mike Lafleur"],
    schemeDescription: "The absolute gold standard of the modern run game. Shanahan creates 'the illusion of complexity' by running numerous passing play designs out of identical pre-snap run formations. Uses heavy alignments to trigger favorable defensive groups, then exploits linebackers with play-action boots.",
    personnelPreferences: "Demands high-IQ fullbacks, athletic interior offensive linemen who can pull and reach-block on outside sweeps, and highly physical wide receivers who embrace run-blocking duties.",
    keyPlayType: "Outside Zone Stretch / Play-Action Bootleg Drifter / FB Wheel Route",
    avatarPlaceholderColor: "bg-rose-700",
    jobHistory: [
      { yearRange: "2017-Present", role: "Head Coach", team: "San Francisco 49ers" },
      { yearRange: "2015-2016", role: "Offensive Coordinator", team: "Atlanta Falcons" },
      { yearRange: "2014", role: "Offensive Coordinator", team: "Cleveland Browns" },
      { yearRange: "2010-2013", role: "Offensive Coordinator", team: "Washington Redskins" },
      { yearRange: "2008-2009", role: "Offensive Coordinator", team: "Houston Texans" }
    ]
  },
  {
    id: "mike-macdonald",
    name: "Mike Macdonald",
    team: "Seattle Seahawks",
    teamId: "SEA",
    role: "Head Coach",
    currentSystem: "Amoeba Simulated Pressure Hybrid 3-4",
    systemsRun: ["Ravens Multiple Odd Front Defense", "Michigan Aggressive Match-Quarters", "Amoeba simulated rush packages"],
    mentors: ["John Harbaugh", "Wink Martindale", "Nick Saban"],
    proteges: ["Jesse Minter", "Zach Orr", "Aden Durde"],
    peers: ["Dennard Wilson", "Leslie Frazier"],
    schemeDescription: "A defensive mastermind who completely frustrates elite quarterbacks. Macdonald uses 'simulated pressures' - showing a 6 or 7-man rush pre-snap, then only rushing 4 while dropping elite linemen or hybrid safeties. This cloaks coverage windows and creates instant free rushers.",
    personnelPreferences: "Thrives with heavy, anchor-style defensive tackles, highly versatile hybrid safeties who can play deep or in the box, and edge rushers with the intelligence to drop into coverage zones seamlessly.",
    keyPlayType: "Simulated Pressure 4-Man Rush / Bracket Match-Quarters",
    avatarPlaceholderColor: "bg-emerald-600",
    jobHistory: [
      { yearRange: "2024-Present", role: "Head Coach", team: "Seattle Seahawks" },
      { yearRange: "2022-2023", role: "Defensive Coordinator", team: "Baltimore Ravens" },
      { yearRange: "2021", role: "Defensive Coordinator", team: "Michigan Wolverines (Collegiate)" },
      { yearRange: "2018-2020", role: "Linebackers Coach", team: "Baltimore Ravens" },
      { yearRange: "2017", role: "Defensive Backs Coach", team: "Baltimore Ravens" }
    ]
  },
  {
    id: "todd-bowles",
    name: "Todd Bowles",
    team: "Tampa Bay Buccaneers",
    teamId: "TB",
    role: "Head Coach",
    currentSystem: "Aggressive Multi-Front Blitz & Cover 1/3 Press",
    systemsRun: ["Parcells 3-4 Base", "Cardinals Exotic Overload Blitz", "Jets Multiple Defensive Schemes"],
    mentors: ["Bill Parcells", "Bruce Arians", "Joe Gibbs"],
    proteges: ["Kacy Rodgers", "Larry Foote"],
    peers: ["Dennis Allen", "Jim Harbaugh"],
    schemeDescription: "Bowles is known for highly aggressive, exotic overload blitz structures that attack interior offensive line guards. He uses press-man coverage, safety jumps, and deceptive interior rushes to completely collapse pocket structures.",
    personnelPreferences: "Prioritizes highly sturdy nose tackles who draw double teams, heavy-hitting inside linebackers, and cornerbacks with strong jam-skills.",
    keyPlayType: "Exotic Overload A-Gap Blitz / Press Cover-1 Jump / DT Screen Disruption",
    avatarPlaceholderColor: "bg-red-650",
    jobHistory: [
      { yearRange: "2022-Present", role: "Head Coach", team: "Tampa Bay Buccaneers" },
      { yearRange: "2019-2021", role: "Defensive Coordinator", team: "Tampa Bay Buccaneers" },
      { yearRange: "2015-2018", role: "Head Coach", team: "New York Jets" },
      { yearRange: "2013-2014", role: "Defensive Coordinator", team: "Arizona Cardinals" },
      { yearRange: "2012", role: "Defensive Coordinator / Secondary Coach", team: "Philadelphia Eagles" }
    ]
  },
  {
    id: "robert-saleh",
    name: "Robert Saleh",
    team: "Tennessee Titans",
    teamId: "TEN",
    role: "Head Coach",
    currentSystem: "4-3 Wide-9 Under Cover-4 Match",
    systemsRun: ["Gus Bradley Seattle Cover-3", "49ers Wide-9 Speed-Rush Front"],
    mentors: ["Kyle Shanahan", "Gus Bradley", "Gary Kubiak", "Pete Carroll"],
    proteges: ["Jeff Ulbrich", "Mike LaFleur"],
    peers: ["DeMeco Ryans", "Matt LaFleur"],
    schemeDescription: "Saleh brings his famous, highly explosive 4-3 Wide-9 defense to Tennessee. By placing edge rushers extremely wide, he stretches offensive tackle positions, creating clear paths for downhill athletic linebackers to stuff the run and collapse pockets.",
    personnelPreferences: "Highly athletic, speed-rushing perimeter defensive ends, sideline-to-sideline tackling linebackers, and zone-match cornerbacks.",
    keyPlayType: "Wide-9 End Loop Twist / Cover-4 Match Split-Safety / PA Deep Over",
    avatarPlaceholderColor: "bg-sky-700",
    jobHistory: [
      { yearRange: "2025-Present", role: "Head Coach", team: "Tennessee Titans" },
      { yearRange: "2021-2024", role: "Head Coach", team: "New York Jets" },
      { yearRange: "2017-2020", role: "Defensive Coordinator", team: "San Francisco 49ers" },
      { yearRange: "2014-2016", role: "Linebackers Coach", team: "Jacksonville Jaguars" },
      { yearRange: "2011-2013", role: "Defensive Quality Control Coach", team: "Seattle Seahawks" }
    ]
  },
  {
    id: "dan-quinn",
    name: "Dan Quinn",
    team: "Washington Commanders",
    teamId: "WAS",
    role: "Head Coach",
    currentSystem: "4-3 Under Cover-3 Press & Multiple Fronts",
    systemsRun: ["Seattle Legion of Boom Cover-3", "Dallas Cowboys Multiple Pressure-Simulations"],
    mentors: ["Pete Carroll", "Nick Saban", "Steve Mariucci"],
    proteges: ["Kyle Shanahan", "Raheem Morris", "Joe Whitt Jr."],
    peers: ["Dennis Allen", "Todd Bowles"],
    schemeDescription: "Quinn made the legendary 'Legion of Boom' Cover-3 defense famous in Seattle, which he has since evolved to include highly sophisticated multiple-front pressure packages. His units focus heavily on relentless hustle, takeaway creation, and interior pressure.",
    personnelPreferences: "Requires highly athletic, tall edge rushers, explosive sideline linebackers, and physical boundary cornerbacks who tackle in space.",
    keyPlayType: "Cover-3 Press Single-High / Edge Overload Twisting Loop / PA Bootleg Cross",
    avatarPlaceholderColor: "bg-red-800",
    jobHistory: [
      { yearRange: "2024-Present", role: "Head Coach", team: "Washington Commanders" },
      { yearRange: "2021-2023", role: "Defensive Coordinator", team: "Dallas Cowboys" },
      { yearRange: "2015-2020", role: "Head Coach", team: "Atlanta Falcons" },
      { yearRange: "2013-2014", role: "Defensive Coordinator", team: "Seattle Seahawks" },
      { yearRange: "2011-2012", role: "Defensive Coordinator", team: "Florida Gators (Collegiate)" }
    ]
  }
];

export const FORMATION_TRENDS: FormationTrend[] = [
  {
    name: "11 Personnel",
    personnel: "1 Running Back, 1 Tight End, 3 Wide Receivers",
    leagueUsage: "61.8% (NFL Baseline standard)",
    runPassRatio: "34% Run / 66% Pass",
    epaPerPlay: 0.05,
    trend: "stable",
    description: "The absolute standard of the modern passing era. Spread wide receivers force defenders into space, opening clear middle voids and clear passing lines. However, modern schemes compress the alignment to aid outside edge blocking.",
    primaryUsers: ["Sean McVay", "Andy Reid", "Kevin O'Connell"],
    advantage: "Maximal spacing, easy hot routes, pre-snap indicator diagnostic friendliness.",
    preferredArchetypes: [
      {
        role: "Power Slot WR",
        archetype: "Heavy Slot / Run Game Anchor",
        attributes: "Elite short-area agility, physical run-blocking, contact balance.",
        examples: ["Cooper Kupp", "Amon-Ra St. Brown", "Chris Godwin"]
      },
      {
        role: "Zone Slasher RB",
        archetype: "One-Cut / Receiving Option",
        attributes: "High initial burst, vision in outside zone, soft hands in flat.",
        examples: ["Kyren Williams", "Jahmyr Gibbs", "Saquon Barkley"]
      },
      {
        role: "Pass-Pro Tackle",
        archetype: "Mirror-Step Tackle",
        attributes: "Exceptional wingspan, lateral kick-slide, recovery speed.",
        examples: ["Penei Sewell", "Christian Darrisaw", "Rashawn Slater"]
      }
    ],
    keyAttributes: [
      "Short-Area Agility (Agility/COD >= 90)",
      "Pre-Snap Route IQ (Mental Processing >= 88)",
      "Perimeter Run-Block Sustain (Strength/Run Block >= 75)"
    ]
  },
  {
    name: "12 Personnel",
    personnel: "1 Running Back, 2 Tight Ends, 2 Wide Receivers",
    leagueUsage: "21.4% (Highest growth over 3 years)",
    runPassRatio: "51% Run / 49% Pass",
    epaPerPlay: 0.08,
    trend: "rising",
    description: "The premier mismatch generator. By adding a second tight end, teams present a heavy run threat, forcing defenses to put heavier linebackers on the field. The offense then shifts to passing patterns, exploiting slow linebackers in pass coverage.",
    primaryUsers: ["Dan Campbell", "Andy Reid", "Matt LaFleur"],
    advantage: "Flexibility to run powerful counters or audibles to play-action passing matches.",
    preferredArchetypes: [
      {
        role: "Flex TE (F)",
        archetype: "Seam-Stretcher / Move Option",
        attributes: "Wide-receiver-like speed, high-point catch radius, seam leverage.",
        examples: ["Travis Kelce", "Dallas Goedert", "Dalton Kincaid"]
      },
      {
        role: "Inline TE (Y)",
        archetype: "Point-of-Attack Seal Blocker",
        attributes: "Heavy build, elite inline run-blocking, safe play-action safety valve.",
        examples: ["Cole Kmet", "George Kittle", "Hunter Henry"]
      },
      {
        role: "Isolated WR (X)",
        archetype: "Physical Perimeter Target",
        attributes: "Press-release physical play, strong hands, vertical choice awareness.",
        examples: ["Rashee Rice", "Brandon Aiyuk", "Drake London"]
      }
    ],
    keyAttributes: [
      "Point-of-Attack Run Blocking (Strength/Run Block >= 82)",
      "Seam-Crossing High-Point (Catch Radius >= 88)",
      "Dual-Role Structural Versatility (Position Flexibility >= 90)"
    ]
  },
  {
    name: "21 Personnel",
    personnel: "1 Running Back, 1 Fullback, 1 Tight End, 2 Wide Receivers",
    leagueUsage: "7.2% (Niche but highly elite efficiency)",
    runPassRatio: "58% Run / 42% Pass",
    epaPerPlay: 0.12,
    trend: "stable",
    description: "The Kyle Shanahan specialty. Placing a lead blocking fullback under center creates a powerful running game that can attack either A-gap or swing outside. It freezes deep safeties, leaving the middle of the field open for deep play-action crossing routes.",
    primaryUsers: ["Kyle Shanahan", "Mike McDaniel"],
    advantage: "Sledgehammer lead run block options with devastating play-action bootlegs.",
    preferredArchetypes: [
      {
        role: "Hybrid Fullback",
        archetype: "Lead-Pounder / Backfield Receiver",
        attributes: "Elite lead-blocking grades, soft hands for wheel routes, mismatch-creator.",
        examples: ["Kyle Juszczyk", "Alec Ingold", "C.J. Ham"]
      },
      {
        role: "Wide-Zone RB",
        archetype: "One-Cut Speed Stretcher",
        attributes: "Elite 10-yard split times, horizontal-to-vertical shift, high-volume threat.",
        examples: ["Christian McCaffrey", "De'Von Achane", "Bijan Robinson"]
      },
      {
        role: "Blocking Wideout",
        archetype: "Heavy Perimeter Stalker",
        attributes: "Size, willingness to block linebackers, yards-after-catch threat.",
        examples: ["Deebo Samuel", "Jauan Jennings", "Allen Lazard"]
      }
    ],
    keyAttributes: [
      "Lead-Block Impact Rating (Impact Block >= 85)",
      "Backfield Release Speed (Speed/Burst >= 92)",
      "Downfield Block Sustain (WR Block Hold >= 80)"
    ]
  },
  {
    name: "13 Personnel",
    personnel: "1 Running Back, 3 Tight Ends, 1 Wide Receiver",
    leagueUsage: "4.5% (Heavy Specialist Front)",
    runPassRatio: "74% Run / 26% Pass",
    epaPerPlay: 0.02,
    trend: "rising",
    description: "An absolute powerhouse alignment. Often used on first downs or near the red zone. Offenses load the line of scrimmage with three tight ends, converting matchups into inline line-of-scrimmage physical battles.",
    primaryUsers: ["Jim Harbaugh", "John Harbaugh"],
    advantage: "Brute force edge control, excellent protection helper, max-protect play-action.",
    preferredArchetypes: [
      {
        role: "Jumbo Blocking TE",
        archetype: "Sixth Offensive Lineman",
        attributes: "Inline double-team force, edge sealing, minimal route involvement.",
        examples: ["Will Dissly", "Charlie Woerner", "Marcedes Lewis"]
      },
      {
        role: "Power Running Back",
        archetype: "Inside-Zone Bruiser",
        attributes: "Elite contact balance, massive leg drive, heavy yardage after contact.",
        examples: ["Derrick Henry", "Gus Edwards", "Najee Harris"]
      },
      {
        role: "Dual-Threat TE",
        archetype: "H-Back Playmaker",
        attributes: "Can line up as fullback or flex out, elite play-action route runner.",
        examples: ["Sam LaPorta", "Brock Bowers", "Pat Freiermuth"]
      }
    ],
    keyAttributes: [
      "Contact Balance / Breaks (YAC/Breaks >= 90)",
      "Inline Leverage Leverage (Base Strength >= 88)",
      "Play-Action Sell Disguise (Fake Sell Rating >= 85)"
    ]
  },
  {
    name: "Spread / Empty Field",
    personnel: "0/1 Running Back, 4/5 Wide Receivers (Empty backfield)",
    leagueUsage: "5.1% (Passing/Third Down staple)",
    runPassRatio: "8% Run / 92% Pass",
    epaPerPlay: 0.04,
    trend: "declining",
    description: "Forces maximum defensive coverage spread. This is popular for quick-release passing or mobile quarterbacks who can run. However, the rise of disguised simulated pressures has made empty backfields high-risk against complex defensive fronts.",
    primaryUsers: ["Andy Reid", "Zac Taylor", "Sean Payton"],
    advantage: "Immediate clarity on defensive coverage, isolations on the outside boundaries.",
    preferredArchetypes: [
      {
        role: "Empty-Processor QB",
        archetype: "Pre-Snap Diagnostician",
        attributes: "Ultra-fast release time, pre-snap indicator reader, high blitz tolerance.",
        examples: ["Patrick Mahomes", "Joe Burrow", "Lamar Jackson"]
      },
      {
        role: "Separation WR",
        archetype: "Whip-Route Artist",
        attributes: "Incredible quickness at break point, reliable hands under contact.",
        examples: ["Justin Jefferson", "Ja'Marr Chase", "CeeDee Lamb"]
      },
      {
        role: "Receiving Flex RB",
        archetype: "Detached Backfield Threat",
        attributes: "Mismatches against linebackers from slot alignments, route tree diversity.",
        examples: ["Christian McCaffrey", "Alvin Kamara", "Breece Hall"]
      }
    ],
    keyAttributes: [
      "Instant Ball Release Speed (Release Time <= 2.1s)",
      "Man-Coverage Win Rate (Separation >= 92)",
      "Boundary Positioning & Toe-Tap (Footwork >= 90)"
    ]
  }
];
