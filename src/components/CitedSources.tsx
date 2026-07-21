import React from 'react';
import { BookOpen, Database, ShieldCheck, HelpCircle } from 'lucide-react';

interface CitedSourcesProps {
  currentTab: 'boards' | 'draft_sim' | 'compare' | 'team_reports' | 'coaching_reports' | 'scouting_matrix';
}

export default function CitedSources({ currentTab }: CitedSourcesProps) {
  // Define source contents for each tab
  const getCitationContent = () => {
    switch (currentTab) {
      case 'scouting_matrix':
        return {
          title: "Positional Scouting Matrix Methodology",
          dataPoints: "Positional grading algorithms, natural prospect grades, relative athletic scores, and position-specific physical/athletic thresholds.",
          sources: [
            { name: "Pro Football Focus (PFF)", desc: "Positional scouting grades, draft capital projections, and athletic drill databases.", url: "https://www.pff.com" },
            { name: "RelativeAthleticScores.com (Kent Lee Platte)", desc: "Athletic percentile matrices adjusted for position and size.", url: "https://relativeathleticscores.com" },
            { name: "DraftTek Valuation Matrix", desc: "Positional value index scores and historical draft range correlations." }
          ],
          note: "Valuations are updated continuously to correlate positional scarcity with draft grade thresholds across previous draft classes."
        };
      case 'boards':
        return {
          title: "Scouting & Board Metrics Methodology",
          dataPoints: "Relative Athletic Scores (RAS), standard mock draft consensus weights, Combine physical specifications, and performance grades.",
          sources: [
            { name: "Pro Football Focus (PFF)", desc: "Prospect grades, run/pass snaps, and pressure frequencies.", url: "https://www.pff.com" },
            { name: "RelativeAthleticScores.com (Kent Lee Platte)", desc: "Athletic percentile matrices adjusted for position and size.", url: "https://relativeathleticscores.com" },
            { name: "NFL Combine Database", desc: "Official height, weight, arm length, wing-span, and athletic drill times." },
            { name: "Consensus Big Board Index", desc: "Aggregated positional rank arrays from over 100 scout rosters." }
          ],
          note: "Draft grades utilize high-school rating foundations alongside physical thresholds and collegiate yards-after-contact/pressure-rate coefficients."
        };
      case 'draft_sim':
        return {
          title: "Draft Simulation & Picker Logic Matrix",
          dataPoints: "Team priority weight coefficients, mock draft frequency arrays, position premium multipliers, and simulation consensus boards.",
          sources: [
            { name: "Grinding the Mocks", desc: "Consensus Average Draft Position (ADP) curves.", url: "https://grindingthemocks.com" },
            { name: "NFL Mock Draft Database", desc: "Consensus team pick frequencies and mock selections.", url: "https://www.nflmockdraftdatabase.com" },
            { name: "PFF Mock Draft Simulator Core", desc: "Team needs priorities and user selection distribution curves." },
            { name: "Sports Info Solutions (SIS)", desc: "Draft pick trade value charts (Rich Hill & Jimmy Johnson model variants)." }
          ],
          note: "AI pickers prioritize premium position multipliers (QB, OT, EDGE, CB, WR) and align draft capital using standard value charts."
        };
      case 'compare':
        return {
          title: "Head-to-Head Comparison Core",
          dataPoints: "Dynamic percentile rankings, biometric radar projections, collegiate stats, and athletic score coefficients.",
          sources: [
            { name: "Sports Info Solutions (SIS) Data Hub", desc: "Rookie evaluation profiles and adjusted yards per pass route.", url: "https://www.sportsinfosolutions.com" },
            { name: "NFL Next Gen Stats", desc: "Tracking data, separation scores, and ball-carrier velocity coefficients.", url: "https://nextgenstats.nfl.com" },
            { name: "College Football Reference", desc: "Historic career snap distributions and production multipliers." }
          ],
          note: "Percentile comparisons are derived from collegiate positional historical averages spanning the previous 10 draft classes."
        };
      case 'team_reports':
        return {
          title: "Franchise Roster & Priority Needs Source Profile",
          dataPoints: "Positional gap analyses, active cap space distributions, and roster age weights.",
          sources: [
            { name: "Over The Cap (OTC)", desc: "NFL player contract values, active cap space data, and dead money variables.", url: "https://overthecap.com" },
            { name: "OurLads Football Scouting Services", desc: "Depth charts and active player roster status.", url: "https://www.ourlads.com" },
            { name: "ESPN NFL Team Priority Matrix", desc: "Consensus franchise primary position needs and target ranges." }
          ],
          note: "Franchise needs represent live consensus rosters and cap health indexes prior to the active offseason cycle."
        };
      case 'coaching_reports':
        return {
          title: "Coaching Schemes & Formation Analytics Framework",
          dataPoints: "NFL personnel frequency data (11, 12, 21 alignments), Expected Points Added (EPA) per play, and tactical staff connections.",
          sources: [
            { name: "NFL Next Gen Stats (NextGen Stats Data)", desc: "Personnel groupings, motion frequency percentages, and alignment tracking data.", url: "https://nextgenstats.nfl.com" },
            { name: "Sports Info Solutions (SIS) Analytics", desc: "Run/Pass ratio indices and play outcomes by personnel grouping.", url: "https://www.sportsinfosolutions.com" },
            { name: "Pro-Football-Reference Coaching Database", desc: "NFL head coach and coordinator career roles, dates, and historical records." }
          ],
          note: "Formation frequencies and Expected Points Added (EPA) represent consolidated league outcomes across previous regular-season snaps."
        };
      default:
        return null;
    }
  };

  const citation = getCitationContent();
  if (!citation) return null;

  return (
    <div id="sources-citation-block" className="border-t border-slate-800 bg-slate-950/40 mt-12 pt-8 pb-6 px-1 space-y-6">
      
      {/* Upper header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <BookOpen className="w-4 h-4 text-emerald-500" />
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
              {citation.title}
            </h4>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5 uppercase tracking-wide">
              Verified Source Citations & Analytical Methodology
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-mono uppercase bg-slate-900/60 border border-slate-850 px-2.5 py-1">
          <Database className="w-3.5 h-3.5 text-emerald-500" />
          Active Data Source Integrations
        </div>
      </div>

      {/* Main citation list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {citation.sources.map((src, index) => (
          <div 
            key={index} 
            className="p-3 bg-slate-900/30 border border-slate-850 hover:border-slate-800 transition-all flex items-start gap-2.5"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-500/80 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-serif font-bold text-slate-200">
                  {src.name}
                </span>
                {src.url && (
                  <a 
                    href={src.url} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-[9px] font-mono text-emerald-500 hover:underline flex items-center gap-0.5"
                  >
                    [Visit Official Source]
                  </a>
                )}
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {src.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Footnote information */}
      <div className="p-3 bg-slate-950 border border-slate-900 rounded-none flex items-start gap-2 text-slate-500 font-mono text-[9px] uppercase tracking-wide leading-relaxed">
        <HelpCircle className="w-4 h-4 text-slate-600 shrink-0" />
        <div>
          <span className="text-emerald-500/80 font-bold">Consolidated Note: </span>
          {citation.note} All stats are calculated based on collegiate and NFL datasets calibrated through the 2025/2026 NFL league cycles.
        </div>
      </div>

    </div>
  );
}
