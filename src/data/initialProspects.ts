import { Player, AthleticMeasurables } from '../types';

// Spec 05 — seeded combine measurables for a representative subset of prospects
// (scout-entered / illustrative). Percentiles + athletic score + outlier band are
// computed live from these via src/utils/athleticOutlier.ts against nflverse-derived
// baselines. Absent players simply show no athletic card until measurables are added.
const ATHLETIC_SEEDS: Record<string, AthleticMeasurables> = {
  'jeremiah-smith':    { heightIn: 75, weightLb: 215, forty: 4.38, tenSplit: 1.52, vertical: 38.5, broad: 131, threeCone: 6.85, twentyShuttle: 4.15, bench: 15, armIn: 32.5, handIn: 9.8 },
  'cam-coleman':       { heightIn: 75, weightLb: 195, forty: 4.42, tenSplit: 1.54, vertical: 37, broad: 128, threeCone: 6.95, twentyShuttle: 4.2, armIn: 32.75, handIn: 9.5 },
  'colin-simmons':     { heightIn: 75, weightLb: 235, forty: 4.51, vertical: 35.5, broad: 128, threeCone: 6.95, twentyShuttle: 4.28, bench: 21, armIn: 33.5, handIn: 10 },
  'dylan-stewart':     { heightIn: 78, weightLb: 248, forty: 4.58, vertical: 36, broad: 129, threeCone: 7.0, twentyShuttle: 4.3, bench: 24, armIn: 34.5, handIn: 10.2 },
  'ellis-robinson-iv': { heightIn: 72, weightLb: 185, forty: 4.4, tenSplit: 1.51, vertical: 37, broad: 128, threeCone: 6.7, twentyShuttle: 4.05, armIn: 31.5, handIn: 9.3 },
  'sammy-brown':       { heightIn: 74, weightLb: 235, forty: 4.56, vertical: 36.5, broad: 126, threeCone: 7.0, twentyShuttle: 4.3, bench: 24 },
  'jordan-seaton':     { heightIn: 77, weightLb: 310, forty: 5.12, vertical: 29, broad: 106, threeCone: 7.65, twentyShuttle: 4.65, bench: 26, armIn: 34, handIn: 10.5 },
  'arch-manning':      { heightIn: 76, weightLb: 225, forty: 4.72, vertical: 31, broad: 114, armIn: 31, handIn: 9.5 },
  'omarion-miller':    { heightIn: 74, weightLb: 195, forty: 4.35, tenSplit: 1.49, vertical: 40, broad: 134, threeCone: 6.75, twentyShuttle: 4.05, bench: 14, armIn: 33, handIn: 9.6 },
  'mario-craver':      { heightIn: 70, weightLb: 170, forty: 4.32, tenSplit: 1.48, vertical: 39, broad: 132, threeCone: 6.8, twentyShuttle: 4.1 },
};



const COMPACT_PLAYERS: string[] = [
  "jeremiah-smith|Jeremiah Smith|WR|Ohio State|6'3\"|215|Jr|99|Blue Chip Prospect",
  "arch-manning|Arch Manning|QB|Texas|6'4\"|225|R-Jr|98|Blue Chip Prospect",
  "colin-simmons|Colin Simmons|EDGE|Texas|6'3\"|235|Jr|98|Blue Chip Prospect",
  "dante-moore|Dante Moore|QB|Oregon|6'2\"|210|Jr|97|Day 1 Starter",
  "dylan-stewart|Dylan Stewart|EDGE|South Carolina|6'6\"|248|Jr|97|Day 1 Starter",
  "leonard-moore|Leonard Moore|CB|Notre Dame|6'2\"|185|So|96|Day 1 Starter",
  "cam-coleman|Cam Coleman|WR|Texas|6'3\"|195|Jr|96|Day 1 Starter",
  "jordan-seaton|Jordan Seaton|OT|LSU|6'5\"|310|Jr|95|Day 1 Starter",
  "julian-sayin|Julian Sayin|QB|Ohio State|6'1\"|200|So|95|Day 1 Starter",
  "trevor-goosby|Trevor Goosby|OT|Texas|6'7\"|305|R-So|95|Day 1 Starter",
  "david-stone|David Stone|DT|Oklahoma|6'5\"|295|So|94|Blue Chip Prospect",
  "ellis-robinson-iv|Ellis Robinson IV|CB|Georgia|6'0\"|185|So|94|Blue Chip Prospect",
  "kj-bolden|KJ Bolden|S|Georgia|6'0\"|190|So|94|Blue Chip Prospect",
  "amauri-washington|A'Mauri Washington|DT|Oregon|6'3\"|300|R-So|93|Blue Chip Prospect",
  "ryan-coleman-williams|Ryan Coleman-Williams|WR|Alabama|6'0\"|180|Jr|93|Blue Chip Prospect",
  "jamari-johnson|Jamari Johnson|TE|Oregon|6'5\"|260|R-So|92|Blue Chip Prospect",
  "cj-carr|CJ Carr|QB|Notre Dame|6'3\"|210|So|92|Blue Chip Prospect",
  "charlie-becker|Charlie Becker|WR|Indiana|6'1\"|190|So|92|Blue Chip Prospect",
  "zabien-brown|Zabien Brown|CB|Alabama|6'0\"|180|So|91|Blue Chip Prospect",
  "cayden-green|Cayden Green|OT/IOL|Missouri|6'5\"|315|Jr|91|Blue Chip Prospect",
  "ahmad-hardy|Ahmad Hardy|RB|Missouri|5'10\"|210|So|91|Blue Chip Prospect",
  "matayo-uiagalelei|Matayo Uiagalelei|EDGE|Oregon|6'5\"|270|Sr|90|High-Floor Starter",
  "darian-mensah|Darian Mensah|QB|Miami|6'3\"|215|R-So|90|High-Floor Starter",
  "treydez-green|Trey'Dez Green|TE|LSU|6'7\"|240|So|90|High-Floor Starter",
  "drew-mestemaker|Drew Mestemaker|QB|Oklahoma State|6'2\"|205|So|89|High-Floor Starter",
  "kewan-lacy|Kewan Lacy|RB|Ole Miss|5'11\"|205|So|89|High-Floor Starter",
  "ahmad-moten-sr|Ahmad Moten Sr.|DT|Miami|6'3\"|325|R-Jr|89|High-Floor Starter",
  "nick-marsh|Nick Marsh|WR|Indiana|6'3\"|208|So|88|High-Floor Starter",
  "kyngstonn-viliamu-asa|Kyngstonn Viliamu-Asa|LB|Notre Dame|6'3\"|235|So|88|High-Floor Starter",
  "kelley-jones|Kelley Jones|CB|Mississippi State|6'4\"|195|R-So|88|High-Floor Starter",
  "will-echoles|Will Echoles|DT|Ole Miss|6'4\"|300|So|87|High-Floor Starter",
  "quincy-rhodes-jr|Quincy Rhodes Jr.|EDGE|Arkansas|6'6\"|280|Jr|87|High-Floor Starter",
  "carter-smith|Carter Smith|OT|Indiana|6'5\"|300|R-So|87|High-Floor Starter",
  "damon-wilson-ii|Damon Wilson II|EDGE|Miami|6'4\"|245|Jr|86|High-Floor Starter",
  "austin-siereveld|Austin Siereveld|OT|Ohio State|6'5\"|315|R-So|86|High-Floor Starter",
  "tae-johnson|Tae Johnson|S|Notre Dame|6'3\"|185|So|86|High-Floor Starter",
  "justin-scott|Justin Scott|DT|Miami|6'4\"|310|So|85|High-Floor Starter",
  "sammy-brown|Sammy Brown|LB|Clemson|6'2\"|235|So|85|High-Floor Starter",
  "koi-perich|Koi Perich|S|Oregon|6'1\"|200|So|85|High-Floor Starter",
  "jordan-ross|Jordan Ross|EDGE|LSU|6'5\"|245|So|84|Boom-or-Bust",
  "omarion-miller|Omarion Miller|WR|Arizona State|6'2\"|195|Jr|84|Boom-or-Bust",
  "aj-holmes-jr|A.J. Holmes Jr.|DT|Texas Tech|6'3\"|290|Jr|84|Boom-or-Bust",
  "mario-craver|Mario Craver|WR|Texas A&M|5'10\"|170|So|83|Boom-or-Bust",
  "lanorris-sellers|LaNorris Sellers|QB|South Carolina|6'3\"|240|R-So|83|Boom-or-Bust",
  "jadan-baugh|Jadan Baugh|RB|Florida|6'1\"|230|So|83|Boom-or-Bust",
  "ryan-wingo|Ryan Wingo|WR|Texas|6'2\"|205|So|82|Boom-or-Bust",
  "kade-pieper|Kade Pieper|IOL|Iowa|6'3\"|295|R-So|82|Boom-or-Bust",
  "trevor-lauck|Trevor Lauck|OT|Iowa|6'6\"|300|R-So|82|Boom-or-Bust",
  "jayden-maiava|Jayden Maiava|QB|USC|6'4\"|220|R-Jr|81|Boom-or-Bust",
  "oj-frederique-jr|OJ Frederique Jr.|CB|Miami|6'0\"|180|So|81|Boom-or-Bust",
  "john-henry-daley|John Henry Daley|EDGE|Michigan|6'5\"|250|R-Jr|81|Boom-or-Bust",
  "chris-peal|Chris Peal|CB|Syracuse|6'1\"|190|R-So|80|Boom-or-Bust",
  "brendan-sorsby|Brendan Sorsby|QB|Texas Tech|6'3\"|230|R-Jr|80|Boom-or-Bust",
  "jamari-sharpe|Jamari Sharpe|CB|Indiana|6'1\"|190|R-Jr|80|Boom-or-Bust",
  "trinidad-chambliss|Trinidad Chambliss|QB|Ole Miss|6'2\"|215|Jr|79|Boom-or-Bust",
  "yhonzae-pierre|Yhonzae Pierre|EDGE|Alabama|6'4\"|240|R-So|79|Boom-or-Bust",
  "rasheem-biles|Rasheem Biles|LB|Texas|6'1\"|215|Jr|79|Boom-or-Bust",
  "kj-duff|KJ Duff|WR|Rutgers|6'5\"|210|So|78|Boom-or-Bust",
  "kenyatta-jackson-jr|Kenyatta Jackson Jr.|EDGE|Ohio State|6'5\"|258|R-Jr|78|Boom-or-Bust",
  "brice-pollock|Brice Pollock|CB|Texas Tech|6'1\"|190|Jr|78|Boom-or-Bust",
  "boubacar-traore|Boubacar Traore|EDGE|Notre Dame|6'4\"|240|So|77|Boom-or-Bust",
  "dj-lagway|DJ Lagway|QB|Baylor|6'3\"|240|So|77|Boom-or-Bust",
  "anthonie-knapp|Anthonie Knapp|IOL|Notre Dame|6'4\"|290|So|77|Boom-or-Bust",
  "nate-frazier|Nate Frazier|RB|Georgia|5'10\"|210|So|76|Boom-or-Bust",
  "bryant-wesco-jr|Bryant Wesco Jr.|WR|Clemson|6'2\"|175|So|76|Boom-or-Bust",
  "will-heldt|Will Heldt|EDGE|Clemson|6'6\"|250|Jr|76|Boom-or-Bust",
  "ty-benefield|Ty Benefield|S|LSU|6'2\"|200|Jr|75|Boom-or-Bust",
  "ashton-hampton|Ashton Hampton|CB|Clemson|6'2\"|185|So|75|Boom-or-Bust",
  "anthony-smith|Anthony Smith|EDGE|Minnesota|6'6\"|280|R-So|75|Boom-or-Bust",
  "suntarine-perkins|Suntarine Perkins|LB/EDGE|Ole Miss|6'3\"|210|Jr|74|Boom-or-Bust",
  "princewill-umanmielen|Princewill Umanmielen|EDGE|LSU|6'4\"|250|Jr|74|Boom-or-Bust",
  "evan-tengesdahl|Evan Tengesdahl|IOL|Cincinnati|6'4\"|300|R-So|74|Boom-or-Bust",
  "tj-moore|T.J. Moore|WR|Clemson|6'3\"|190|So|73|Boom-or-Bust",
  "jackson-bennee|Jackson Bennee|S|Utah|6'2\"|195|So|73|Boom-or-Bust",
  "zach-lutmer|Zach Lutmer|S/CB|Iowa|6'0\"|190|R-So|73|Boom-or-Bust",
  "terrance-carter-jr|Terrance Carter Jr.|TE|Texas Tech|6'3\"|235|Jr|72|Sleeper Project",
  "duce-robinson|Duce Robinson|WR|Florida State|6'6\"|220|Jr|72|Sleeper Project",
  "jayden-jackson|Jayden Jackson|DT|Oklahoma|6'2\"|300|So|72|Sleeper Project",
  "blake-frazier|Blake Frazier|OT|Michigan|6'6\"|290|So|71|Sleeper Project",
  "mark-fletcher-jr|Mark Fletcher Jr.|RB|Miami|6'2\"|225|Jr|71|Sleeper Project",
  "chris-cole|Chris Cole|LB|Georgia|6'3\"|220|So|71|Sleeper Project",
  "wyatt-young|Wyatt Young|WR|Oklahoma State|6'0\"|185|So|70|Sleeper Project",
  "iapani-laloulu|Iapani Laloulu|IOL|Oregon|6'2\"|325|Jr|70|Sleeper Project",
  "greg-johnson|Greg Johnson|IOL|Minnesota|6'5\"|310|R-So|70|Sleeper Project",
  "jacarrius-peak|Jacarrius Peak|OT|South Carolina|6'4\"|310|R-Jr|69|Sleeper Project",
  "marcus-neal-jr|Marcus Neal Jr.|S|Penn State|6'0\"|190|So|69|Sleeper Project",
  "ben-roberts|Ben Roberts|LB|Texas Tech|6'3\"|230|R-So|69|Sleeper Project",
  "mike-matthews|Mike Matthews|WR|Tennessee|6'1\"|185|So|68|Sleeper Project",
  "teitum-tuioti|Teitum Tuioti|EDGE|Oregon|6'3\"|240|Jr|68|Sleeper Project",
  "jaylen-mcclain|Jaylen McClain|S|Ohio State|6'0\"|185|So|68|Sleeper Project",
  "bray-hubbard|Bray Hubbard|S|Alabama|6'2\"|205|Jr|67|Raw Developmental",
  "pj-williams|PJ Williams|OT|SMU|6'5\"|305|R-Jr|67|Raw Developmental",
  "nyck-harbor|Nyck Harbor|WR|South Carolina|6'5\"|225|Jr|67|Raw Developmental",
  "sam-leavitt|Sam Leavitt|QB|LSU|6'2\"|210|R-So|66|Raw Developmental",
  "clev-lubin|Clev Lubin|EDGE|Louisville|6'4\"|250|Sr|66|Raw Developmental",
  "lance-heard|Lance Heard|OT|Kentucky|6'6\"|335|So|66|Raw Developmental",
  "jelani-mcdonald|Jelani McDonald|S|Texas|6'2\"|205|Jr|65|Raw Developmental",
  "bear-alexander|Bear Alexander|DT|Oregon|6'3\"|315|Sr|65|Raw Developmental",
  "anto-saka|Anto Saka|EDGE|Texas A&M|6'4\"|245|Jr|65|Raw Developmental",
  "mateen-ibirogba|Mateen Ibirogba|DT|Texas Tech|6'5\"|290|R-So|65|Raw Developmental",
  "isaac-brown|Isaac Brown|RB|Louisville|5'9\"|180|So|65|Raw Developmental"
];

// Lookup for custom elements to preserve hand-crafted aspects of original prospects
const BESPOKE_PROFILES: Record<string, Partial<Player>> = {
  "jeremiah-smith": {
    traits: { athleticism: 99, technique: 96, production: 98, footballIQ: 96, sizeAndFrame: 99 },
    strengths: [
      "True physical specimen with an enormous catch radius and elite jump-ball dominance",
      "Elite speed and physical strength to break press coverage easily",
      "Incredible body control and deceleration transitions at the catch point",
      "Violent route runner who snaps off deep-vertical routes cleanly"
    ],
    weaknesses: [
      "Can occasionally raise his posture on short, quick-slants route stems",
      "Faced very few double-teams playing with Ohio State's top-tier receiving core"
    ],
    scoutingReport: "Jeremiah Smith is a generational, boundary wide receiver prospect who has dominated SEC-caliber defensive backs from day one. He possesses a rare blend of massive size, high-end velocity, and outstanding catch balance. He is a quarterback's ultimate asset in the red zone and behaves like a seasoned veteran."
  },
  "arch-manning": {
    traits: { athleticism: 95, technique: 97, production: 95, footballIQ: 99, sizeAndFrame: 96 },
    strengths: [
      "Elite football lineage and flawless pre-snap/post-snap mental processing",
      "Exceptional pocket poise with active, quiet footwork and clean mechanics",
      "Sneaky-elite dynamic runner with high rushing versatility",
      "Outstanding vertical arm strength with pinpoint deep-ball touch"
    ],
    weaknesses: [
      "Initially limited in starting experience due to playing behind Quinn Ewers",
      "Can occasionally get overconfident and force passes into tight secondary brackets"
    ],
    scoutingReport: "Arch Manning is the crown jewel of the NFL Draft Class, possessing the combined cerebral strengths of the Manning family along with elite modern athletic mobility. Operating Steve Sarkisian's complex offensive scheme with immense comfort, he processes coverages instantly, maintains superb poise inside collapsing pockets, and delivers the ball with elite touch and velocity."
  },
  "colin-simmons": {
    traits: { athleticism: 97, technique: 93, production: 96, footballIQ: 93, sizeAndFrame: 90 },
    strengths: [
      "Elite speed off the line with exceptional bend and leverage",
      "Outstanding lateral speed to pursue and tackle outside runs",
      "Superb speed-to-power transition capability using low center of gravity",
      "Highly natural instinct for strip-sacks and forced fumbles"
    ],
    weaknesses: [
      "On the lighter side for full-time inline defensive end duties in a 4-3",
      "Can get washed out against heavy double-team run concepts"
    ],
    scoutingReport: "Colin Simmons is an explosive pass-rusher possessing elite speed off the edge and deep bend. Threatening the tackle's outside shoulder instantly, he closes on quarterbacks with spectacular velocity. He is an ideal fit as an active outside linebacker in odd-front schemes."
  },
  "dylan-stewart": {
    traits: { athleticism: 98, technique: 94, production: 95, footballIQ: 93, sizeAndFrame: 98 },
    strengths: [
      "Exceptional first-step burst off the line with outstanding ankle flexion (bend)",
      "Prototypical length, broad frame, and elite reach metrics",
      "Devastating hand-swipe transition and active pass-rush counters",
      "Highly physical block-shedder who seals the edge against run concepts"
    ],
    weaknesses: [
      "Can get repetitive with his pass rush if his initial speed-rush is countered",
      "Must remain disciplined on outside boundary contains"
    ],
    scoutingReport: "Dylan Stewart is a premium blue-chip defensive end with elite physical dimensions and athletic traits. He has the rare ability to bend flat around the corner at 6'6\", instantly collapsing pockets. His powerful hands and speed-to-power transition make him a highly disruptive edge defender."
  },
  "ellis-robinson-iv": {
    traits: { athleticism: 97, technique: 96, production: 91, footballIQ: 94, sizeAndFrame: 92 },
    strengths: [
      "Flawless hips and transition smoothness in press coverage",
      "Highly physical alignment; excels at jamming receivers at the line",
      "Exceptional vertical recovery speed to stay in phase",
      "Outstanding ball tracking and high-pointing interception skills"
    ],
    weaknesses: [
      "Needs to add core strength to support run contain assignments",
      "Can draw occasional defensive holding calls due to highly physical style"
    ],
    scoutingReport: "Ellis Robinson IV is a premier lockdown cornerback prospect with outstanding coverage discipline. Possessing hyper-fluid hips, long arms, and elite vertical tracking speed, he smothers top-tier receivers and excels in press-man situations."
  },
  "sammy-brown": {
    traits: { athleticism: 97, technique: 91, production: 93, footballIQ: 94, sizeAndFrame: 95 },
    strengths: [
      "Elite, explosive downhill speed and physical tackling power",
      "Sideline-to-sideline range; chases perimeter plays with high-end speed",
      "Highly physical run-stuffer who fills gaps with extreme force",
      "Exceptional blitzing utility and pre-snap pressure alignment"
    ],
    weaknesses: [
      "Needs to refine zone coverage drop depth and space discipline",
      "Can occasionally overshoot tackling angles due to hyper-aggressive speed"
    ],
    scoutingReport: "Sammy Brown is an elite off-ball linebacker with rare athletic dimensions and testing metrics. He is a high-motor defender who flies across the field, delivering massive hits and filling interior run gaps instantly. His physical toughness makes him a defensive pillar."
  },
  "dj-lagway": {
    traits: { athleticism: 95, technique: 91, production: 93, footballIQ: 92, sizeAndFrame: 97 },
    strengths: [
      "Powerful, dense physical build; highly durable under heavy contact",
      "Outstanding deep-ball arm power and off-balance throwing ability",
      "Excellent downhill runner who breaks arm-tackles in the open field",
      "Displays strong competitive leadership in high-pressure matchups"
    ],
    weaknesses: [
      "Footwork can get sloppy when rolling out to his weak side",
      "Can get caught over-trusting his power and taking unnecessary sacks"
    ],
    scoutingReport: "DJ Lagway is a dual-threat quarterback powerhouse built for physical modern football. Built like a running back but sporting an incredibly strong arm, Lagway can generate massive velocity on off-platform throws and remains a constant threat as a heavy downhill running weapon."
  },
  "jordan-seaton": {
    traits: { athleticism: 94, technique: 95, production: 92, footballIQ: 93, sizeAndFrame: 95 },
    strengths: [
      "Superb lateral foot speed and smooth kick-slide in pass protection",
      "Massive wingspan and quick hand placement that stuns edge rushers",
      "Stout, heavy anchor; very difficult to push back with bull-rush moves",
      "Extremely physical run-block finisher who plays with a nasty streak"
    ],
    weaknesses: [
      "Can sometimes over-kick against ultra-wide rush alignments",
      "Needs to remain disciplined on pad leverage to avoid holding calls"
    ],
    scoutingReport: "Jordan Seaton is the premier offensive tackle prospect of the class. Acting as the anchor for Colorado's explosive passing offense, he displays elite footwork, heavy hands, and outstanding recovery speed. He protects the blindside with supreme confidence."
  }
};

function generateInitialGradeHistory(id: string, currentGrade: number, position: string, archetype?: string): { milestone: string; date: string; grade: number }[] {
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  let p1Offset = -5; // Pre-Season
  let p2Offset = -3; // Mid-Season
  let p3Offset = -2; // Bowl Season
  let p4Offset = 0;  // Combine
  let p5Offset = -1; // Pro Day
  
  if (archetype === 'Raw Developmental') {
    p1Offset = -12;
    p2Offset = -9;
    p3Offset = -7;
    p4Offset = 2;
    p5Offset = 1;
  } else if (archetype === 'Sleeper') {
    p1Offset = -8;
    p2Offset = -6;
    p3Offset = -4;
    p4Offset = -1;
    p5Offset = 0;
  } else if (archetype === 'Boom-or-Bust') {
    const isOdd = hash % 2 === 0;
    p1Offset = isOdd ? -3 : -7;
    p2Offset = isOdd ? -7 : -2;
    p3Offset = isOdd ? -2 : -5;
    p4Offset = isOdd ? 2 : -1;
    p5Offset = isOdd ? -1 : 1;
  } else if (archetype === 'Blue Chip Prospect') {
    p1Offset = -3;
    p2Offset = -2;
    p3Offset = -1;
    p4Offset = 1;
    p5Offset = 0;
  } else if (archetype === 'Day 1 Starter') {
    p1Offset = -2;
    p2Offset = -1;
    p3Offset = 0;
    p4Offset = 1;
    p5Offset = 0;
  } else if (position === 'QB') {
    p1Offset = -6;
    p2Offset = -3;
    p3Offset = -4;
    p4Offset = 1;
    p5Offset = 0;
  }
  
  const getVariance = (step: number) => {
    return ((hash + step) % 5) - 2; // returns -2 to +2
  };

  const clamp = (val: number) => Math.min(99, Math.max(50, val));

  return [
    { milestone: 'Pre-Season', date: 'Aug 2025', grade: clamp(currentGrade + p1Offset + getVariance(1)) },
    { milestone: 'Mid-Season', date: 'Nov 2025', grade: clamp(currentGrade + p2Offset + getVariance(2)) },
    { milestone: 'Bowl Games', date: 'Jan 2026', grade: clamp(currentGrade + p3Offset + getVariance(3)) },
    { milestone: 'NFL Combine', date: 'Mar 2026', grade: clamp(currentGrade + p4Offset + getVariance(4)) },
    { milestone: 'Pro Day', date: 'Apr 2026', grade: clamp(currentGrade + p5Offset + getVariance(5)) },
    { milestone: 'Pre-Draft', date: 'Current', grade: currentGrade }
  ];
}

// Hydration function that translates compact strings into rich Player models
const hydratedPlayers: Player[] = COMPACT_PLAYERS.map((line, idx) => {
  const [id, name, position, school, height, weightStr, year, gradeStr, archetype] = line.split('|');
  const weight = parseInt(weightStr, 10);
  const overallGrade = parseInt(gradeStr, 10);

  // Default trait profiles with variance based on id
  const offset = id.charCodeAt(0) % 4;
  let athleticism = Math.min(99, Math.max(55, overallGrade + (['QB', 'DT', 'IOL'].includes(position) ? -3 : 2) + offset));
  let technique = Math.min(99, Math.max(55, overallGrade + (['QB', 'CB', 'OT', 'IOL'].includes(position) ? 1 : -2) + offset));
  let production = Math.min(99, Math.max(55, overallGrade + (['QB', 'WR', 'RB', 'EDGE'].includes(position) ? 2 : -1) + offset));
  let footballIQ = Math.min(99, Math.max(55, overallGrade + (['QB', 'S', 'LB', 'IOL'].includes(position) ? 3 : -1) + offset));
  let sizeAndFrame = Math.min(99, Math.max(55, overallGrade + (['OT', 'DT', 'IOL', 'TE'].includes(position) ? 4 : -4) + offset));

  let strengths: string[] = [];
  let weaknesses: string[] = [];
  let scoutingReport = "";

  // Position specific template content
  if (position === 'QB') {
    strengths = [
      "Exceptional pre-snap diagnostics and defensive recognition",
      "Elite natural velocity on intermediate seam throws",
      "Excellent pocket mobility and subtle slide steps to avoid pressure",
      "Commanding leadership qualities and highly competitive engine"
    ];
    weaknesses = [
      "Footwork can occasionally disintegrate under heavy interior pressure",
      "Occasionally hunts the deep shots, passing up open checkdown outlets"
    ];
    scoutingReport = `${name} is an elite-tier quarterback prospect out of ${school} who directs the offense with immense poise. Displays rare velocity and superb off-platform arm angles, making him a cornerstone draft target.`;
  } else if (position === 'WR') {
    strengths = [
      "Hyper-fluid route stems and sudden stop-start deceleration",
      "Exceptional deep vertical gear that eats up boundary cornerback cushions",
      "Massive catching radius with acrobatic high-point control",
      "Outstanding run-after-catch threat with elite open field shiftiness"
    ];
    weaknesses = [
      "Needs to add physical mass to consistently beat heavy NFL press-jams",
      "Willing downfield blocker but physically limited at the point of attack"
    ];
    scoutingReport = `A dynamic game-breaker, ${name} from ${school} manipulates cornerback leverage cleanly and offers immediate WR1 vertical weapon traits in any passing system.`;
  } else if (position === 'RB') {
    strengths = [
      "Devastating lateral cut agility and open-field jump cuts",
      "Outstanding contact balance to shrug off low arm-tackles",
      "High-end pass catching hands and polished receiving route-running",
      "Stout pass-blocking frame and exceptional visual blitz pick-up"
    ];
    weaknesses = [
      "Lacks the raw 4.30 track gear, relying more on tempo and pacing",
      "Can carry the ball with high physical posture in dense traffic"
    ];
    scoutingReport = `A complete and highly productive workhorse back, ${name} from ${school} excels at running zone schemes, showing spectacular cutback vision and excellent leverage.`;
  } else if (position === 'TE') {
    strengths = [
      "Prototypical vertical frame and elite seam mismatch capability",
      "Extremely soft, reliable hands in heavily congested traffic zones",
      "Very smart zone finder who presents a reliable target for checkdowns",
      "Excellent blocking base with high willingness to seal boundaries"
    ];
    weaknesses = [
      "Lacks elite second-level foot speed to consistently threaten deep third safeties",
      "Can be susceptible to false steps off the line of scrimmage"
    ];
    scoutingReport = `${name} of ${school} is a classic modern utility tight end. A secure safety-blanket target with the physical tools to hold his own in run blocking.`;
  } else if (position === 'OT') {
    strengths = [
      "Superb lateral kick-slide depth with quick, quiet feet in pass-pro",
      "Outstanding reach parameters and violent, stalling hand-jabs",
      "Heavy, unmoveable anchor against power bull-rush attacks",
      "Highly physical run-block finisher who plays with a mean competitive streak"
    ];
    weaknesses = [
      "Occasionally over-sets against ultra-wide speed-rush alignments",
      "Pads can rise early, exposing core leverage on inside counter-moves"
    ];
    scoutingReport = `A premium boundary protector, ${name} from ${school} shows the elite physical tools and footwork required to lock down the left tackle spot.`;
  } else if (position === 'IOL') {
    strengths = [
      "Tremendous core strength and immediate displacement power in run games",
      "Extremely wide, dense frame that is near-impossible to push straight back",
      "Superb awareness to process twists, stunts, and late blitzer packages",
      "Excellent pulling speed and open-field targeting parameters"
    ];
    weaknesses = [
      "Lacks high-end recovery speed if beaten early by sudden swim moves",
      "Height can cause leverage difficulties if pads rise off the snap"
    ];
    scoutingReport = `A highly physical interior anchor, ${name} from ${school} controls the interior with robust leverage and excellent post-snap processing.`;
  } else if (position === 'EDGE') {
    strengths = [
      "Spectacular first-step getaway speed off the snap",
      "Outstanding ankle flexion to bend flat around the offensive tackle's shoulder",
      "Highly active hand-fighting counters and elite swipe-move transitions",
      "Excellent lateral range to chase and seal perimeter outside run plays"
    ];
    weaknesses = [
      "Can get washed out when faced with heavy double-team run schemes",
      "Occasionally over-pursues and surrenders interior boundary contain"
    ];
    scoutingReport = `An explosive pass rusher, ${name} from ${school} represents a constant pocket-disruption machine who possesses the natural speed and bend to translate into double-digit sacks.`;
  } else if (position === 'DT') {
    strengths = [
      "Massive, compact physical frame with extraordinary interior leverage",
      "Elite lateral shed velocity to clog running lanes instantly",
      "Slick, surprisingly quick swim move as an interior pass-rusher",
      "Unbelievable raw power to push pocket depths back into the quarterback"
    ];
    weaknesses = [
      "Can get winded if kept on the field for high-snap-count drives",
      "Needs to avoid raising his posture as physical fatigue sets in"
    ];
    scoutingReport = `A massive, dominant force inside, ${name} from ${school} commands double teams, destroys interior run concepts, and offers consistent pocket push.`;
  } else if (position === 'LB') {
    strengths = [
      "Elite sideline-to-sideline pursuit speed and lateral pursuit range",
      "Tremendous diagnosing capability in reading zone/gap run keys",
      "Secure, high-wrap tackling mechanism in open space",
      "Excellent coverage drop depth and fluid hips in intermediate zone"
    ];
    weaknesses = [
      "Can get locked onto block concepts if offensive guards climb cleanly",
      "Flashes a bit of over-aggression that smart offenses exploit with play-action"
    ];
    scoutingReport = `A versatile off-ball general, ${name} of ${school} plays with elite range, physical toughness, and the diagnostic speed to lead a defense.`;
  } else if (position === 'CB') {
    strengths = [
      "Extremely sticky in press-man alignments with hyper-fluid hips",
      "Elite deep tracking acceleration and recovery speed",
      "Superb vertical high-pointing to generate turnovers",
      "Aggressive and highly competitive at the catch point"
    ];
    weaknesses = [
      "Can draw yellow flags due to highly tactile and physical coverage style",
      "Needs to remain disciplined on double-moves and pivot route stems"
    ];
    scoutingReport = `A true lockdown boundary option, ${name} from ${school} possesses elite speed, length, and coverage confidence to match up with top-tier target threats on an island.`;
  } else { // S
    strengths = [
      "Incredible center-field range and elite deep safety processing",
      "Flawless open-field tracking and secure tackle security",
      "Outstanding coverage versatility across slot and box alignments",
      "Exceptional defensive communicator and pre-snap visual diagnostic"
    ];
    weaknesses = [
      "Slightly lighter build; can struggle as an inline run-stop plug",
      "Needs to avoid biting too early on play-action eye-candy keys"
    ];
    scoutingReport = `An elite secondary anchor, ${name} from ${school} erases vertical explosive deep-shots with rare spatial range and represents a true defensive general safety.`;
  }

  // Hydrate custom overrides if present
  const bespoke = BESPOKE_PROFILES[id];
  if (bespoke) {
    if (bespoke.traits) athleticism = bespoke.traits.athleticism;
    if (bespoke.traits) technique = bespoke.traits.technique;
    if (bespoke.traits) production = bespoke.traits.production;
    if (bespoke.traits) footballIQ = bespoke.traits.footballIQ;
    if (bespoke.traits) sizeAndFrame = bespoke.traits.sizeAndFrame;
    if (bespoke.strengths) strengths = bespoke.strengths;
    if (bespoke.weaknesses) weaknesses = bespoke.weaknesses;
    if (bespoke.scoutingReport) scoutingReport = bespoke.scoutingReport;
  }

  return {
    id,
    name,
    position,
    school,
    height,
    weight,
    year,
    traits: { athleticism, technique, production, footballIQ, sizeAndFrame },
    strengths,
    weaknesses,
    scoutingReport,
    bigBoards: {}, // Hydrated dynamically below
    overallGrade,
    archetype,
    gradeHistory: generateInitialGradeHistory(id, overallGrade, position, archetype),
    ...(ATHLETIC_SEEDS[id]
      ? { athleticProfile: { measurables: ATHLETIC_SEEDS[id], source: 'manual' as const } }
      : {})
  };
});

// Sort ALL players by overallGrade descending to establish correct draft board ranking order
const SORTED_PLAYERS: Player[] = [...hydratedPlayers].sort((a, b) => b.overallGrade - a.overallGrade);

// Populate analyst rankings and comments
SORTED_PLAYERS.forEach((player, idx) => {
  const currentRank = idx + 1;

  player.bigBoards = {
    "Mel Kiper Jr. (ESPN)": {
      rank: currentRank,
      comment: `At rank #${currentRank}, ${player.name} represents a truly premier option. His skill-set fits perfectly with what NFL teams look for at ${player.position}.`
    },
    "Dane Brugler (The Athletic)": {
      rank: currentRank,
      comment: `My #${currentRank} overall prospect. ${player.name} plays with remarkable technical discipline. Film study reveals zero doubts about his transition to the pros.`
    },
    "Daniel Jeremiah (NFL Network)": {
      rank: currentRank,
      comment: `I love the natural traits ${player.name} displays. At #${currentRank}, he's a ready-made starter who will elevate his coordinator's scheme instantly.`
    },
    "NFLSE (Trevor Sikkema)": {
      rank: currentRank,
      comment: `${player.name} exhibits top-tier analytics markers in our grading index. Perfect athletic and production match for modern NFL franchises.`
    },
    "Danny Kelly (The Ringer)": {
      rank: currentRank,
      comment: `Ranked #${currentRank} on my board. He is an absolute playmaker who is highly versatile and brings elite competitive toughness.`
    }
  };
});

export const INITIAL_PROSPECTS: Player[] = SORTED_PLAYERS;
