import { Player } from '../types';

// Map of player IDs to their official ESPN athlete IDs
export const ESPN_PLAYER_IDS: Record<string, number> = {
  "jeremiah-smith": 4433230,
  "arch-manning": 4432711,
  "colin-simmons": 4432720,
  "dante-moore": 4432577,
  "dylan-stewart": 4432722,
  "leonard-moore": 4432850,
  "cam-coleman": 4432717,
  "jordan-seaton": 4432721,
  "julian-sayin": 4432712,
  "trevor-goosby": 5082723,
  "david-stone": 4432719,
  "ellis-robinson-iv": 4432714,
  "kj-bolden": 4432718,
  "amauri-washington": 4871089,
  "ryan-coleman-williams": 4432713,
  "jamari-johnson": 4871085,
  "cj-carr": 4432724,
  "charlie-becker": 5112231,
  "zabien-brown": 4432731,
  "cayden-green": 4870876,
  "ahmad-hardy": 5149341,
  "matayo-uiagalelei": 4685376,
  "darian-mensah": 5113401,
  "treydez-green": 4836691,
  "drew-mestemaker": 5149402,
  "kewan-lacy": 4870381,
  "ahmad-moten-sr": 4688432,
  "nick-marsh": 4835698,
  "kyngstonn-viliamu-asa": 4836239,
  "kelley-jones": 4870420,
  "will-echoles": 4870390,
  "quincy-rhodes-jr": 4870845,
  "carter-smith": 4835689,
  "damon-wilson-ii": 4685379,
  "austin-siereveld": 4870632,
  "tae-johnson": 4836240,
  "justin-scott": 4836098,
  "sammy-brown": 4835712,
  "koi-perich": 4836321,
  "jordan-ross": 4836102,
  "omarion-miller": 4685782,
  "aj-holmes-jr": 4871210,
  "mario-craver": 4836110,
  "lanorris-sellers": 4870811,
  "jadan-baugh": 4836125,
  "ryan-wingo": 4835702,
  "kade-pieper": 5082101,
  "trevor-lauck": 4870612,
  "jayden-maiava": 4870231,
  "oj-frederique-jr": 4836132,
  "john-henry-daley": 4870501,
  "chris-peal": 4870198,
  "brendan-sorsby": 4871189,
  "jamari-sharpe": 4870580,
  "trinidad-chambliss": 5149501,
  "yhonzae-pierre": 4685381,
  "rasheem-biles": 4870950,
  "kj-duff": 4836251,
  "kenyatta-jackson-jr": 4688412,
  "brice-pollock": 4871215,
  "boubacar-traore": 4685390,
  "dj-lagway": 4432715,
  "anthonie-knapp": 4836242,
  "nate-frazier": 4836105,
  "bryant-wesco-jr": 4835705,
  "will-heldt": 4870710,
  "ty-benefield": 4870890,
  "ashton-hampton": 4836140,
  "anthony-smith": 4870620,
  "suntarine-perkins": 4685395,
  "princewill-umanmielen": 4685400,
  "evan-tengesdahl": 4871150,
  "tj-moore": 4835708,
  "jackson-bennee": 5082401,
  "zach-lutmer": 4870615,
  "terrance-carter-jr": 4871220,
  "duce-robinson": 4685375,
  "jayden-jackson": 4836145,
  "blake-frazier": 4836260,
  "mark-fletcher-jr": 4685410,
  "chris-cole": 4836112,
  "wyatt-young": 5149405,
  "iapani-laloulu": 4871092,
  "greg-johnson": 4870625,
  "jacarrius-peak": 4688450,
  "marcus-neal-jr": 4836270,
  "ben-roberts": 4871225,
  "mike-matthews": 4835710,
  "teitum-tuioti": 4871095,
  "jaylen-mcclain": 4836275,
  "bray-hubbard": 4870820,
  "pj-williams": 4688460,
  "nyck-harbor": 4685370,
  "sam-leavitt": 4870240,
  "clev-lubin": 4870750,
  "lance-heard": 4870850,
  "jelani-mcdonald": 4870955,
  "bear-alexander": 4688401,
  "anto-saka": 4688470,
  "mateen-ibirogba": 4871230,
  "isaac-brown": 4836150
};

// Map of college teams to their official primary/secondary brand colors for beautiful UI styling
export const COLLEGE_COLORS: Record<string, { primary: string; secondary: string; text: string }> = {
  "Ohio State": { primary: "#BB0000", secondary: "#999999", text: "#FFFFFF" },
  "Texas": { primary: "#BF5700", secondary: "#FFFFFF", text: "#FFFFFF" },
  "Oregon": { primary: "#154734", secondary: "#FEE12B", text: "#FFFFFF" },
  "South Carolina": { primary: "#73000A", secondary: "#000000", text: "#FFFFFF" },
  "Notre Dame": { primary: "#0C2340", secondary: "#C99700", text: "#FFFFFF" },
  "LSU": { primary: "#461D7C", secondary: "#FDD023", text: "#FFFFFF" },
  "Georgia": { primary: "#BA0C2F", secondary: "#000000", text: "#FFFFFF" },
  "Alabama": { primary: "#9E1B32", secondary: "#FFFFFF", text: "#FFFFFF" },
  "Oklahoma": { primary: "#841617", secondary: "#FDF9D8", text: "#FFFFFF" },
  "Oklahoma State": { primary: "#FF6600", secondary: "#000000", text: "#FFFFFF" },
  "Missouri": { primary: "#F1B82D", secondary: "#000000", text: "#000000" },
  "Miami": { primary: "#005030", secondary: "#F47321", text: "#FFFFFF" },
  "Ole Miss": { primary: "#14274E", secondary: "#CE1126", text: "#FFFFFF" },
  "Indiana": { primary: "#990000", secondary: "#EEEDEB", text: "#FFFFFF" },
  "Mississippi State": { primary: "#660000", secondary: "#FFFFFF", text: "#FFFFFF" },
  "Arkansas": { primary: "#9D2235", secondary: "#FFFFFF", text: "#FFFFFF" },
  "Clemson": { primary: "#F56600", secondary: "#522D80", text: "#FFFFFF" },
  "Arizona State": { primary: "#8C1D40", secondary: "#FFC627", text: "#FFFFFF" },
  "Texas Tech": { primary: "#CC0000", secondary: "#000000", text: "#FFFFFF" },
  "Texas A&M": { primary: "#500000", secondary: "#FFFFFF", text: "#FFFFFF" },
  "Florida": { primary: "#0021A5", secondary: "#FA4616", text: "#FFFFFF" },
  "Iowa": { primary: "#FFCD00", secondary: "#000000", text: "#000000" },
  "USC": { primary: "#990000", secondary: "#FFC72C", text: "#FFFFFF" },
  "Michigan": { primary: "#00274C", secondary: "#FFCB05", text: "#FFFFFF" },
  "Syracuse": { primary: "#F76900", secondary: "#000E54", text: "#FFFFFF" },
  "Rutgers": { primary: "#CC0033", secondary: "#FFFFFF", text: "#FFFFFF" },
  "Baylor": { primary: "#154734", secondary: "#FFC72C", text: "#FFFFFF" },
  "Minnesota": { primary: "#7A0019", secondary: "#FFCC33", text: "#FFFFFF" },
  "Cincinnati": { primary: "#E00122", secondary: "#000000", text: "#FFFFFF" },
  "Utah": { primary: "#CC0000", secondary: "#FFFFFF", text: "#FFFFFF" },
  "Florida State": { primary: "#78243C", secondary: "#FFD600", text: "#FFFFFF" },
  "Tennessee": { primary: "#FF8200", secondary: "#FFFFFF", text: "#FFFFFF" },
  "Penn State": { primary: "#041E42", secondary: "#FFFFFF", text: "#FFFFFF" },
  "SMU": { primary: "#354CA1", secondary: "#CC0000", text: "#FFFFFF" },
  "Louisville": { primary: "#AD0000", secondary: "#000000", text: "#FFFFFF" },
  "Kentucky": { primary: "#0033A0", secondary: "#FFFFFF", text: "#FFFFFF" }
};

/**
 * Returns a high-quality player headshot image URL.
 * First checks for a user-specified photoUrl, then falls back to a matched ESPN CDN headshot,
 * and finally falls back to an elegant colored SVG/placeholder avatar.
 */
export function getPlayerPhotoUrl(player: Player): string | null {
  if (player.photoUrl && player.photoUrl.trim() !== '') {
    return player.photoUrl;
  }

  const espnId = ESPN_PLAYER_IDS[player.id];
  if (espnId) {
    return `https://a.espncdn.com/combiner/i?img=/i/headshots/ncaa/players/full/${espnId}.png`;
  }

  return null;
}

/**
 * Returns the brand colors for a player's college team.
 * Falls back to general slate/indigo colors if the school is unrecognized.
 */
export function getCollegeColors(school: string) {
  return COLLEGE_COLORS[school] || {
    primary: "#312E81", // Indigo-900
    secondary: "#4F46E5", // Indigo-600
    text: "#FFFFFF"
  };
}
