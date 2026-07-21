import React, { useState, useEffect } from 'react';
import { Team, Player } from '../types';
import { NFL_TEAMS } from '../data/teams';
import { INITIAL_PROSPECTS } from '../data/initialProspects';
import { getContrastColor } from '../utils/contrast';
import { getTeamReport, TeamReport, DepthChartFormation } from '../data/teamReportsData';
import { 
  DollarSign, ShieldAlert, Award, Calendar, Layers, Edit2, Check, 
  RotateCcw, History, AlertTriangle, ChevronRight, Briefcase, Plus, Trash2,
  Printer, Download, Copy, Star, Search, X, FileText
} from 'lucide-react';

interface TeamReportsProps {
  onSelectPlayer?: (playerName: string) => void;
}

export default function TeamReports({ onSelectPlayer }: TeamReportsProps) {
  // Active team state
  const [selectedTeamId, setSelectedTeamId] = useState<string>('GB');
  const activeTeam = NFL_TEAMS.find(t => t.id === selectedTeamId) || NFL_TEAMS[0];
  // Raw default report data from generator
  const defaultReport = getTeamReport(activeTeam);

  // -------------------------------------------------------------
  // FRANCHISE NEEDS & DRAFT TARGET BOARD UTILITIES
  // -------------------------------------------------------------
  const STANDARD_POSITIONS = ["QB", "RB", "WR", "TE", "OT", "IOL", "EDGE", "DT", "LB", "CB", "S"];

  // Players database load
  const [players, setPlayers] = useState<Player[]>([]);
  useEffect(() => {
    const saved = localStorage.getItem('nfl_draft_players');
    if (saved) {
      try {
        setPlayers(JSON.parse(saved));
      } catch (e) {
        setPlayers(INITIAL_PROSPECTS);
      }
    } else {
      setPlayers(INITIAL_PROSPECTS);
    }
  }, []);

  // Customized Roster/Franchise Needs
  const [customNeeds, setCustomNeeds] = useState<string[]>([]);
  
  // Pinned priority target IDs
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  
  // Custom scouting notes for pinned target players
  const [scoutNotes, setScoutNotes] = useState<Record<string, string>>({});

  // UI state for search & export
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [newNeedPos, setNewNeedPos] = useState('OT');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Load team-specific customizations on selectedTeamId or activeTeam change
  useEffect(() => {
    // 1. Load team needs
    const savedNeeds = localStorage.getItem(`prospect_engine_needs_${selectedTeamId}`);
    if (savedNeeds) {
      try {
        setCustomNeeds(JSON.parse(savedNeeds));
      } catch (e) {
        setCustomNeeds([...activeTeam.needs]);
      }
    } else {
      setCustomNeeds([...activeTeam.needs]);
    }

    // 2. Load pinned targets
    const savedPinned = localStorage.getItem(`prospect_engine_pinned_${selectedTeamId}`);
    if (savedPinned) {
      try {
        setPinnedIds(JSON.parse(savedPinned));
      } catch (e) {
        setPinnedIds([]);
      }
    } else {
      // Intelligently prepopulate with the top prospect matching the team's primary needs
      const initialPinned: string[] = [];
      const teamNeeds = activeTeam.needs;
      teamNeeds.forEach(need => {
        const bestMatch = INITIAL_PROSPECTS
          .filter(p => p.position === need)
          .sort((a, b) => b.overallGrade - a.overallGrade)[0];
        if (bestMatch && !initialPinned.includes(bestMatch.id)) {
          initialPinned.push(bestMatch.id);
        }
      });
      setPinnedIds(initialPinned);
      localStorage.setItem(`prospect_engine_pinned_${selectedTeamId}`, JSON.stringify(initialPinned));
    }

    // Reset search
    setSearchQuery('');
    setShowSearchDropdown(false);
  }, [selectedTeamId, activeTeam]);

  // Load custom scout target notes when pinnedIds change
  useEffect(() => {
    const loadedNotes: Record<string, string> = {};
    pinnedIds.forEach(id => {
      const savedNote = localStorage.getItem(`prospect_scout_note_${selectedTeamId}_${id}`);
      if (savedNote) {
        loadedNotes[id] = savedNote;
      }
    });
    setScoutNotes(loadedNotes);
  }, [pinnedIds, selectedTeamId]);

  // Handler functions
  const handleAddNeed = () => {
    if (customNeeds.includes(newNeedPos)) return;
    const updated = [...customNeeds, newNeedPos];
    setCustomNeeds(updated);
    localStorage.setItem(`prospect_engine_needs_${selectedTeamId}`, JSON.stringify(updated));
  };

  const handleRemoveNeed = (needPos: string) => {
    const updated = customNeeds.filter(n => n !== needPos);
    setCustomNeeds(updated);
    localStorage.setItem(`prospect_engine_needs_${selectedTeamId}`, JSON.stringify(updated));
  };

  const handleResetNeeds = () => {
    if (window.confirm(`Reset roster needs for ${activeTeam.fullName} back to default franchise profile?`)) {
      setCustomNeeds([...activeTeam.needs]);
      localStorage.removeItem(`prospect_engine_needs_${selectedTeamId}`);
    }
  };

  const handleTogglePin = (playerId: string) => {
    const updated = pinnedIds.includes(playerId)
      ? pinnedIds.filter(id => id !== playerId)
      : [...pinnedIds, playerId];
    setPinnedIds(updated);
    localStorage.setItem(`prospect_engine_pinned_${selectedTeamId}`, JSON.stringify(updated));
  };

  const handleUpdateScoutNote = (playerId: string, note: string) => {
    setScoutNotes(prev => ({ ...prev, [playerId]: note }));
    localStorage.setItem(`prospect_scout_note_${selectedTeamId}_${playerId}`, note);
  };

  const getRecommendedTargets = () => {
    const recommended: Player[] = [];
    customNeeds.forEach(need => {
      const matches = players
        .filter(p => p.position === need && !pinnedIds.includes(p.id))
        .sort((a, b) => b.overallGrade - a.overallGrade);
      if (matches[0]) recommended.push(matches[0]);
    });
    // Deduplicate and slice
    return Array.from(new Set(recommended)).slice(0, 4);
  };

  // Filter players for search dropdown matches
  const searchMatches = players.filter(p => {
    if (!searchQuery) return false;
    const isMatch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    p.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    p.school.toLowerCase().includes(searchQuery.toLowerCase());
    return isMatch && !pinnedIds.includes(p.id);
  });

  // Compiled formatted Markdown text report generator
  const generateMarkdownReport = () => {
    const pinnedPlayers = players.filter(p => pinnedIds.includes(p.id));
    const recommendedPlayers = getRecommendedTargets();
    
    return `# ${activeTeam.fullName} Franchise Scouting Report & Draft Dossier
Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
Division: ${activeTeam.division} | Base Scheme: ${activeTeam.currentScheme}

## I. SALARY CAP & FINANCIAL AUDIT
- **Total Adjusted Cap Limit:** $${defaultReport.salaryCap.totalCap}M
- **Active Roster Spending:** $${defaultReport.salaryCap.activeCap}M
- **Dead Salary Cap Hit:** $${defaultReport.salaryCap.deadCap}M
- **Net Available Cap Space:** $${defaultReport.salaryCap.capSpace}M

### Top Cap Allocations:
${defaultReport.salaryCap.topCapHits.map((h, idx) => `${idx + 1}. ${h.player} (${h.position}) - $${h.amount}M`).join('\n')}

---

## II. IDENTIFIED ROSTER NEEDS
Primary roster needs prioritized by front office:
${customNeeds.map((need, idx) => `- **Priority #${idx + 1}:** ${need}`).join('\n')}

---

## III. PRIORITY DRAFT TARGETS
These prospects have been flagged as core fits for the franchise's scheme and needs:

### 1. Pinned Franchise Targets:
${pinnedPlayers.length === 0 ? '_No prospects pinned as primary targets yet._' : pinnedPlayers.map(p => `
#### ${p.name} - ${p.position} | ${p.school}
- **Class:** ${p.year}
- **Overall Grade:** ${p.overallGrade} (${p.archetype || 'N/A'})
- **Scouting Profile:** ${p.scoutingReport}
- **Custom Scout Notes:** ${scoutNotes[p.id] || '_No notes recorded._'}
`).join('\n')}

### 2. Recommended Roster Fits:
${recommendedPlayers.map(p => `- **${p.name}** (${p.position} - ${p.school}) | Grade: ${p.overallGrade} | Archetype: ${p.archetype || 'N/A'}`).join('\n')}

---

## IV. UPCOMING DRAFT CAPITAL (2026-2028)
Draft picks held by the franchise:
${[2026, 2027, 2028].map(year => {
  const yearPicks = defaultReport.draftAssets.filter(a => a.year === year);
  return `### ${year} Picks:
${yearPicks.map(a => `- Round ${a.round}: ${a.pickName}`).join('\n')}`;
}).join('\n\n')}

---

## V. ROSTER ADJUSTMENTS & FREE AGENCY OUTLOOK
### Expiring Contracts (Pending Free Agents):
${defaultReport.expiringDeals.map(d => `- ${d.player} (${d.position}, Age ${d.age}) - Current AAV: $${d.currentSalary}M`).join('\n')}

### Recommended Salary Cuts / Trade Candidates:
${defaultReport.salaryCuts.map(c => `- **${c.player}** (${c.position}) | Cap Saved: +$${c.capSavings}M | Dead Cap: $${c.deadCap}M\n  *Reason:* ${c.reason}`).join('\n')}
`;
  };
  // -------------------------------------------------------------

  // State to hold custom/editable depth charts loaded from localStorage
  const [customFormations, setCustomFormations] = useState<DepthChartFormation[]>([]);
  const [editingPosIndex, setEditingPosIndex] = useState<{ formIdx: number; posIdx: number } | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');

  // Transactions list that is editable/extendable
  const [transactions, setTransactions] = useState<any[]>([]);
  const [newTxDesc, setNewTxDesc] = useState('');
  const [newTxType, setNewTxType] = useState<'signing' | 'trade' | 'release' | 'contract_extension'>('signing');

  // Load active team report edits on team change
  useEffect(() => {
    // 1. Load depth charts
    const storageKey = `prospect_engine_depth_chart_${selectedTeamId}`;
    const savedChart = localStorage.getItem(storageKey);
    if (savedChart) {
      try {
        setCustomFormations(JSON.parse(savedChart));
      } catch (e) {
        console.error("Failed to parse saved depth chart", e);
        setCustomFormations(defaultReport.formations);
      }
    } else {
      setCustomFormations(defaultReport.formations);
    }

    // 2. Load transactions
    const txStorageKey = `prospect_engine_tx_${selectedTeamId}`;
    const savedTx = localStorage.getItem(txStorageKey);
    if (savedTx) {
      try {
        setTransactions(JSON.parse(savedTx));
      } catch (e) {
        setTransactions(defaultReport.transactions);
      }
    } else {
      setTransactions(defaultReport.transactions);
    }

    // Reset editing state
    setEditingPosIndex(null);
  }, [selectedTeamId]);

  // Persist depth charts to local storage
  const saveDepthChart = (updatedFormations: DepthChartFormation[]) => {
    setCustomFormations(updatedFormations);
    localStorage.setItem(`prospect_engine_depth_chart_${selectedTeamId}`, JSON.stringify(updatedFormations));
  };

  // Persist transactions to local storage
  const saveTransactions = (updatedTx: any[]) => {
    setTransactions(updatedTx);
    localStorage.setItem(`prospect_engine_tx_${selectedTeamId}`, JSON.stringify(updatedTx));
  };

  // Handle position edit
  const startEditingPosition = (formIdx: number, posIdx: number, currentVal: string) => {
    setEditingPosIndex({ formIdx, posIdx });
    setEditingValue(currentVal);
  };

  const saveEditedPosition = () => {
    if (!editingPosIndex) return;
    const { formIdx, posIdx } = editingPosIndex;
    
    const updatedFormations = [...customFormations];
    updatedFormations[formIdx].positions[posIdx].player = editingValue.trim();
    
    saveDepthChart(updatedFormations);
    setEditingPosIndex(null);
  };

  // Reset depth chart back to team defaults
  const handleResetDepthChart = () => {
    if (window.confirm(`Reset ${activeTeam.fullName} depth charts back to franchise defaults?`)) {
      saveDepthChart(defaultReport.formations);
    }
  };

  // Add custom transaction
  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTxDesc.trim()) return;

    const newTx = {
      date: new Date().toISOString().split('T')[0],
      type: newTxType,
      description: newTxDesc.trim()
    };

    const updated = [newTx, ...transactions];
    saveTransactions(updated);
    setNewTxDesc('');
  };

  // Delete transaction
  const handleDeleteTransaction = (index: number) => {
    const updated = transactions.filter((_, i) => i !== index);
    saveTransactions(updated);
  };

  // Group draft assets by season year
  const assetsByYear = defaultReport.draftAssets.reduce((acc, asset) => {
    if (!acc[asset.year]) {
      acc[asset.year] = [];
    }
    acc[asset.year].push(asset);
    return acc;
  }, {} as Record<number, typeof defaultReport.draftAssets>);

  return (
    <div className="space-y-6">
      
      {/* Upper banner selector */}
      <div className="bg-slate-900 border border-slate-800 p-4 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 tracking-wider">
            FRANCHISE AUDIT SUITE
          </span>
          <h2 className="text-2xl font-serif font-bold italic text-slate-100 mt-1">
            NFL Team Reports & Depth Planners
          </h2>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Audit salary cap space, customize depth charts, view 3-year draft picks, and map roster transaction histories.
          </p>
        </div>

        {/* Dropdown for Team select */}
        <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
          <span className="text-xs font-mono text-slate-400">Select Team:</span>
          <select
            value={selectedTeamId}
            onChange={(e) => setSelectedTeamId(e.target.value)}
            className="bg-slate-950 text-slate-100 border border-slate-800 rounded px-3 py-1.5 text-xs font-mono font-bold focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            {NFL_TEAMS.map(t => (
              <option key={t.id} value={t.id}>
                {t.id} - {t.fullName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left column sidebar list: 32 Teams Quick Switcher */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 p-4 space-y-4 max-h-[85vh] overflow-y-auto hidden lg:block scrollbar-thin">
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block border-b border-slate-800 pb-1">
            Franchises
          </span>
          <div className="space-y-1">
            {NFL_TEAMS.map((team) => {
              const isActive = team.id === selectedTeamId;
              return (
                <button
                  key={team.id}
                  onClick={() => setSelectedTeamId(team.id)}
                  className={`w-full text-left p-2 rounded text-xs font-mono transition-all flex items-center justify-between relative overflow-hidden pl-3 ${
                    isActive 
                      ? "bg-slate-950 border border-slate-850 text-slate-100 font-bold" 
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-950/40"
                  }`}
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: team.logoColor }}></div>
                  <span className="truncate">{team.fullName}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-500 font-bold uppercase">{team.id}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right column detailed reports dashboard */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* Active Franchise header card with team brand colors */}
          <div className="relative overflow-hidden border border-slate-850 bg-slate-900/60 p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="absolute top-0 bottom-0 left-0 w-2" style={{ backgroundColor: activeTeam.logoColor }}></div>
            <div className="space-y-1.5 pl-3">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2 py-0.5 font-mono uppercase tracking-wider rounded ${getContrastColor(activeTeam.logoColor)}`} style={{ backgroundColor: activeTeam.logoColor }}>
                  {activeTeam.id}
                </span>
                <span className="text-xs font-mono text-slate-400">{activeTeam.division}</span>
              </div>
              <h3 className="text-2xl font-serif font-black italic text-slate-100 tracking-tight">
                {activeTeam.fullName}
              </h3>
              <div className="flex flex-wrap gap-2 text-[11px] font-mono text-slate-400 mt-1">
                <span>Scheme: <strong className="text-slate-200">{activeTeam.currentScheme}</strong></span>
                <span>•</span>
                <span>Primary Needs: <strong className="text-emerald-400">{activeTeam.needs.join(', ')}</strong></span>
              </div>
            </div>

            {/* Total Cap Space stat capsule */}
            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-none min-w-[200px] shrink-0">
              <span className="text-[9px] font-mono uppercase text-slate-500 font-bold block">// AUDITED CAP SPACE</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className={`text-2xl font-mono font-black ${defaultReport.salaryCap.capSpace >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  ${defaultReport.salaryCap.capSpace}M
                </span>
                <span className="text-[9px] font-mono text-slate-500">Available</span>
              </div>
              <div className="w-full bg-slate-900 h-1 mt-2 overflow-hidden rounded-full">
                <div 
                  className="bg-emerald-400 h-full transition-all"
                  style={{ width: `${Math.max(0, Math.min(100, (defaultReport.salaryCap.capSpace / defaultReport.salaryCap.totalCap) * 100))}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Section A: Salary Cap Breakdown & Key Cap Hits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Cap spending stats breakdown */}
            <div className="bg-slate-950 border border-slate-850 p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-900 pb-2.5">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
                  Salary Cap Breakdown (2026 Season)
                </span>
              </div>

              <div className="space-y-3 font-mono text-xs text-slate-300">
                <div className="flex justify-between items-center py-1 border-b border-slate-900/40">
                  <span className="text-slate-400">Total Adjusted Cap Limit:</span>
                  <span className="font-bold text-slate-100">${defaultReport.salaryCap.totalCap}M</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-900/40">
                  <span className="text-slate-400">Active Roster Cap Spending:</span>
                  <span className="font-bold text-slate-100">${defaultReport.salaryCap.activeCap}M</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-900/40">
                  <span className="text-slate-400">Dead Salary Cap Hit:</span>
                  <span className="font-bold text-red-400">${defaultReport.salaryCap.deadCap}M</span>
                </div>
                <div className="flex justify-between items-center py-2 bg-slate-900/40 px-2 border border-slate-900">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Net Cap Space remaining:</span>
                  <span className={`font-black text-sm ${defaultReport.salaryCap.capSpace >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    ${defaultReport.salaryCap.capSpace}M
                  </span>
                </div>
              </div>
            </div>

            {/* Top Cap Hits list */}
            <div className="bg-slate-950 border border-slate-850 p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-900 pb-2.5">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
                  Top Franchise Cap Allocations
                </span>
              </div>

              <div className="space-y-2">
                {defaultReport.salaryCap.topCapHits.map((hit, idx) => (
                  <div key={hit.player} className="flex justify-between items-center bg-slate-900/40 p-2 border border-slate-900 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500 font-mono w-4">#{idx+1}</span>
                      <span className="font-serif font-bold italic text-slate-200">{hit.player}</span>
                      <span className="text-[9px] font-mono text-slate-500">({hit.position})</span>
                    </div>
                    <span className="font-mono font-bold text-slate-300">${hit.amount}M</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Section B: Franchise Needs & Priority Target Board */}
          <div className="bg-slate-950 border-2 border-slate-800 p-5 md:p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-4">
              <div>
                <h4 className="text-lg font-serif font-bold italic text-slate-100 flex items-center gap-2">
                  <Star className="w-5 h-5 text-emerald-500 fill-emerald-500/20" />
                  Section B: Franchise Needs & Target Board
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Calibrate franchise draft requirements and isolate core target prospects. Pinned targets are included in your generated scout report.
                </p>
              </div>

              {/* Export Printable Report Button */}
              <button
                onClick={() => setIsPrintModalOpen(true)}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-mono text-xs font-bold uppercase tracking-wide flex items-center gap-2 transition-all shadow-md cursor-pointer shrink-0"
              >
                <Printer className="w-4 h-4" />
                Export printable report
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Needs Column */}
              <div className="lg:col-span-5 bg-slate-900/40 p-4 border border-slate-850 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                  <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider block">
                    1. Roster Needs Editor
                  </span>
                  <button
                    onClick={handleResetNeeds}
                    className="text-[10px] font-mono font-bold uppercase text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-all"
                    title="Reset to franchise default needs"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset Defaults
                  </button>
                </div>

                {/* Display Current Needs */}
                <div className="flex flex-wrap gap-2">
                  {customNeeds.length === 0 ? (
                    <p className="text-xs text-slate-500 font-mono italic">No franchise needs identified.</p>
                  ) : (
                    customNeeds.map((need, idx) => (
                      <div 
                        key={need} 
                        className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded pl-2.5 pr-1.5 py-1 text-xs font-mono font-bold text-slate-200"
                      >
                        <span>#{idx + 1} {need}</span>
                        <button 
                          onClick={() => handleRemoveNeed(need)}
                          className="p-0.5 text-slate-500 hover:text-red-400 hover:bg-slate-900 rounded transition-all cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Custom Need Form */}
                <div className="pt-2 border-t border-slate-900/60 flex items-center gap-2">
                  <select
                    value={newNeedPos}
                    onChange={(e) => setNewNeedPos(e.target.value)}
                    className="bg-slate-950 text-slate-200 border border-slate-850 rounded px-2.5 py-1 text-xs font-mono focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {STANDARD_POSITIONS.map(pos => (
                      <option key={pos} value={pos}>{pos}</option>
                    ))}
                  </select>
                  <button
                    onClick={handleAddNeed}
                    disabled={customNeeds.includes(newNeedPos)}
                    className={`flex-1 px-3 py-1 text-xs font-mono font-bold uppercase rounded flex items-center justify-center gap-1 transition-all ${
                      customNeeds.includes(newNeedPos)
                        ? "bg-slate-900 border border-slate-955 text-slate-600 cursor-not-allowed"
                        : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 cursor-pointer"
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Need
                  </button>
                </div>
              </div>

              {/* Targets Column */}
              <div className="lg:col-span-7 bg-slate-900/40 p-4 border border-slate-850 space-y-4">
                <div className="border-b border-slate-900 pb-2">
                  <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider block">
                    2. Pinned Draft Targets
                  </span>
                </div>

                {/* Search / Add Targets Box */}
                <div className="relative">
                  <div className="flex items-center gap-2 bg-slate-950 border border-slate-850 rounded px-2.5 py-1.5 text-xs">
                    <Search className="w-4 h-4 text-slate-500 shrink-0" />
                    <input
                      type="text"
                      placeholder="Search prospects to pin... (e.g. Travis Hunter)"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowSearchDropdown(true);
                      }}
                      onFocus={() => setShowSearchDropdown(true)}
                      className="bg-transparent text-slate-200 border-none outline-none focus:ring-0 w-full font-mono placeholder:text-slate-600"
                    />
                    {searchQuery && (
                      <button 
                        onClick={() => { setSearchQuery(''); setShowSearchDropdown(false); }}
                        className="p-0.5 text-slate-500 hover:text-slate-300"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Search Results Dropdown */}
                  {showSearchDropdown && searchQuery && (
                    <div className="absolute left-0 right-0 mt-1 bg-slate-955 border border-slate-800 max-h-48 overflow-y-auto z-10 shadow-xl rounded-none font-mono">
                      {searchMatches.length === 0 ? (
                        <div className="p-2.5 text-xs text-slate-600 text-center italic">No unmatched prospects found.</div>
                      ) : (
                        searchMatches.map(player => (
                          <button
                            key={player.id}
                            type="button"
                            onClick={() => {
                              handleTogglePin(player.id);
                              setSearchQuery('');
                              setShowSearchDropdown(false);
                            }}
                            className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-900 hover:text-slate-100 flex justify-between items-center border-b border-slate-900 last:border-0 cursor-pointer"
                          >
                            <span>{player.name} <strong className="text-slate-500">({player.position})</strong> - {player.school}</span>
                            <span className="text-[10px] px-1.5 py-0.5 bg-slate-900 text-emerald-400 font-bold border border-slate-850">
                              Grade: {player.overallGrade}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* List of Pinned Targets with Custom Scouting Notes */}
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                  {pinnedIds.length === 0 ? (
                    <div className="text-center py-6 text-xs font-mono text-slate-600 border border-dashed border-slate-900">
                      No pinned targets yet. Pin suggested draft targets below or search above.
                    </div>
                  ) : (
                    players
                      .filter(p => pinnedIds.includes(p.id))
                      .map(player => (
                        <div key={player.id} className="bg-slate-900 border border-slate-800 p-3 rounded-none space-y-2">
                          <div className="flex justify-between items-start">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5">
                                <span className="font-serif font-bold italic text-slate-100">{player.name}</span>
                                <span className="text-[9px] font-mono px-1.5 py-0.5 bg-slate-950 border border-slate-850 text-slate-350 uppercase rounded">
                                  {player.position}
                                </span>
                              </div>
                              <span className="text-[10px] font-mono text-slate-400 dark:text-slate-400 block">
                                {player.school} • {player.year} • {player.archetype || 'Prospect'}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/5 px-2 py-0.5 border border-emerald-500/10">
                                {player.overallGrade} OVR
                              </span>
                              <button
                                onClick={() => handleTogglePin(player.id)}
                                className="p-1 text-amber-400 hover:text-slate-500 hover:bg-slate-900 rounded transition-all cursor-pointer"
                                title="Unpin target"
                              >
                                <Star className="w-4 h-4 fill-amber-400" />
                              </button>
                            </div>
                          </div>

                          {/* Editable Scout Target Note */}
                          <div className="flex items-center gap-2 bg-slate-900/40 px-2 py-1 border border-slate-900">
                            <span className="text-[8px] font-mono font-bold text-slate-500 uppercase tracking-widest shrink-0">// SCOUT NOTE:</span>
                            <input
                              type="text"
                              placeholder="Add specific target scout notes... (e.g. ideal scheme fit)"
                              value={scoutNotes[player.id] || ''}
                              onChange={(e) => handleUpdateScoutNote(player.id, e.target.value)}
                              className="bg-transparent text-slate-300 font-sans text-[10px] outline-none focus:ring-0 w-full placeholder:text-slate-600 border-none p-0"
                            />
                          </div>
                        </div>
                      ))
                  )}
                </div>

                {/* Suggestions List based on Needs */}
                {getRecommendedTargets().length > 0 && (
                  <div className="pt-2 border-t border-slate-900 space-y-2">
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">
                      💡 Suggested Matches (Top prospects at need positions)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {getRecommendedTargets().map(player => (
                        <div 
                          key={player.id} 
                          className="bg-slate-900 border border-slate-800 p-2 flex justify-between items-center text-xs"
                        >
                          <div className="truncate pr-2">
                            <span className="font-serif font-bold italic text-slate-200 block truncate">{player.name}</span>
                            <span className="text-[9px] font-mono text-slate-400 dark:text-slate-400 block">{player.position} - {player.school}</span>
                          </div>
                          <button
                            onClick={() => handleTogglePin(player.id)}
                            className="p-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-emerald-400 rounded transition-all flex items-center justify-center shrink-0 cursor-pointer"
                            title="Pin as Priority Target"
                          >
                            <Star className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

            </div>
          </div>

          {/* Section C: Editable Depth Charts (Most used formations) */}
          <div className="bg-slate-950 border-2 border-slate-800 p-5 md:p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-4">
              <div>
                <h4 className="text-lg font-serif font-bold italic text-slate-100 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-emerald-500" />
                  Tactical Depth Chart Planner
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Configure starting personnel across primary offensive/defensive configurations. Click any player name to modify roster depth.
                </p>
              </div>

              <button
                onClick={handleResetDepthChart}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-slate-200 rounded text-[10px] font-mono font-bold uppercase transition-all flex items-center gap-1 shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Restore Default Depth
              </button>
            </div>

            {/* Render expected formations side-by-side or stacked */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {customFormations.map((form, formIdx) => (
                <div key={form.name} className="space-y-3 bg-slate-950 p-4 border border-slate-850/60 rounded-none">
                  <div className="bg-slate-900 p-2.5 border-b border-slate-800 flex justify-between items-center">
                    <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-wide">
                      {form.name}
                    </span>
                  </div>

                  {/* Depth Chart position slots */}
                  <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
                    {form.positions.map((pos, posIdx) => {
                      const isEditing = editingPosIndex?.formIdx === formIdx && editingPosIndex?.posIdx === posIdx;
                      return (
                        <div 
                          key={pos.role} 
                          className="flex justify-between items-center bg-slate-950/80 p-2 border border-slate-900 hover:border-slate-800 text-xs transition-all"
                        >
                          {/* Role Badge */}
                          <div className="flex items-center gap-2.5">
                            <span className="w-10 px-1.5 py-0.5 bg-slate-900 border border-slate-850 text-slate-400 font-mono font-bold text-[10px] text-center uppercase tracking-wider rounded">
                              {pos.role}
                            </span>
                            
                            {isEditing ? (
                              <input
                                type="text"
                                value={editingValue}
                                onChange={(e) => setEditingValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') saveEditedPosition();
                                  if (e.key === 'Escape') setEditingPosIndex(null);
                                }}
                                className="bg-slate-900 text-slate-100 border border-emerald-500 rounded px-2 py-0.5 text-xs font-serif font-bold italic focus:outline-none focus:ring-1 focus:ring-emerald-500 w-[150px]"
                                autoFocus
                              />
                            ) : (
                              <span className="font-serif font-bold italic text-slate-200">
                                {pos.player || "VACANT"}
                              </span>
                            )}
                          </div>

                          {/* Inline Edit Buttons */}
                          <div>
                            {isEditing ? (
                              <button
                                onClick={saveEditedPosition}
                                className="p-1 text-emerald-400 hover:text-white hover:bg-emerald-500/10 rounded transition-all"
                                title="Save"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <button
                                onClick={() => startEditingPosition(formIdx, posIdx, pos.player)}
                                className="p-1 text-slate-500 hover:text-emerald-400 hover:bg-slate-900 rounded transition-all"
                                title="Edit Player"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section C: Draft Assets / Next 3 Seasons */}
          <div className="bg-slate-950 border border-slate-850 p-5 md:p-6 space-y-4">
            <div className="border-b border-slate-900 pb-3">
              <h4 className="text-base font-serif font-bold italic text-slate-100 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-500" />
                3-Season Franchise Draft Capital (2026-2028)
              </h4>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                Audit complete round asset portfolio. Day 1 (Round 1) and Day 2 (Rounds 2-3) picks are listed with draft ranges.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.keys(assetsByYear).map(yearStr => {
                const year = parseInt(yearStr);
                const assets = assetsByYear[year];
                return (
                  <div key={year} className="bg-slate-900/30 p-4 border border-slate-900 space-y-3">
                    <span className="text-xs font-mono font-bold text-slate-200 block border-b border-slate-800 pb-1 text-center">
                      {year} DRAFT CAPITAL
                    </span>
                    <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                      {assets.map((asset) => (
                        <div key={`${asset.round}-${asset.pickName}`} className="flex justify-between items-center text-[11px] font-mono p-1 bg-slate-950/40 border border-slate-900/80">
                          <span className="text-slate-400">Rnd {asset.round}</span>
                          <span className="font-bold text-slate-200 text-right truncate max-w-[120px]" title={asset.pickName}>
                            {asset.pickName}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section D: Expiring Contracts & Cut Candidates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Expiring Contracts list */}
            <div className="bg-slate-950 border border-slate-850 p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-900 pb-2.5">
                <Briefcase className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
                  Expiring Deals (Pending Free Agency)
                </span>
              </div>

              <div className="space-y-2">
                {defaultReport.expiringDeals.map((deal) => (
                  <div key={deal.player} className="bg-slate-900/40 p-3 border border-slate-900 text-xs flex justify-between items-center">
                    <div className="space-y-0.5">
                      <span className="font-serif font-bold italic text-slate-200 block">{deal.player}</span>
                      <span className="text-[10px] text-slate-500 font-mono">Pos: {deal.position} | Age: {deal.age}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-amber-400 block">${deal.currentSalary}M</span>
                      <span className="text-[8px] text-slate-500 font-mono uppercase">Current AAV</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cut / Trade Candidates list */}
            <div className="bg-slate-950 border border-slate-850 p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-900 pb-2.5">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
                  Salaries Cut / Trade Candidates
                </span>
              </div>

              <div className="space-y-3">
                {defaultReport.salaryCuts.map((cut) => (
                  <div key={cut.player} className="bg-slate-900/20 p-3 border border-red-950/20 text-xs space-y-1.5">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-serif font-bold italic text-slate-200 block">{cut.player}</span>
                        <span className="text-[10px] text-slate-500 font-mono">Position: {cut.position}</span>
                      </div>
                      <div className="text-right font-mono">
                        <span className="font-bold text-emerald-400 block">+${cut.capSavings}M</span>
                        <span className="text-[9px] text-slate-500">Cap Saved</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal font-sans bg-slate-950/60 p-2 border border-slate-900">
                      <strong>Scout Reason:</strong> {cut.reason}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Section E: Major Transaction History (excluding Practice Squad) */}
          <div className="bg-slate-950 border-2 border-slate-800 p-5 md:p-6 space-y-5">
            <div className="border-b border-slate-900 pb-3">
              <h4 className="text-lg font-serif font-bold italic text-slate-100 flex items-center gap-2">
                <History className="w-5 h-5 text-emerald-500" />
                Major Transaction History (Roster & Extensions)
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Audit recent significant franchise movements, trades, and major contract signings. Practice squad movements are filtered.
              </p>
            </div>

            {/* Roster move feed */}
            <div className="space-y-2">
              {transactions.length === 0 ? (
                <div className="text-center py-6 text-xs font-mono text-slate-600 border border-dashed border-slate-900">
                  No major transactions on record.
                </div>
              ) : (
                transactions.map((tx, idx) => (
                  <div key={idx} className="bg-slate-900/40 p-3 border border-slate-900 flex justify-between items-center text-xs">
                    <div className="flex items-center gap-3">
                      <div className="font-mono text-slate-500 text-[10px] shrink-0">
                        {tx.date}
                      </div>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase ${
                        tx.type === 'signing' ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400' :
                        tx.type === 'trade' ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400' :
                        tx.type === 'release' ? 'bg-red-500/10 border border-red-500/20 text-red-400' :
                        'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                      }`}>
                        {tx.type.replace('_', ' ')}
                      </span>
                      <p className="text-slate-300 font-sans leading-relaxed">
                        {tx.description}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDeleteTransaction(idx)}
                      className="p-1 text-slate-600 hover:text-red-400 hover:bg-slate-900 rounded transition-all shrink-0 ml-2"
                      title="Delete Transaction Record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Form to submit custom major transactions */}
            <form onSubmit={handleAddTransaction} className="p-4 bg-slate-900/20 border border-slate-850 rounded-none space-y-3">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                Add Roster Action / Trade Entry
              </span>
              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={newTxType}
                  onChange={(e: any) => setNewTxType(e.target.value)}
                  className="bg-slate-950 text-slate-200 border border-slate-800 rounded px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="signing">Contract Signing</option>
                  <option value="trade">Trade Acquisition</option>
                  <option value="release">Roster Release</option>
                  <option value="contract_extension">Contract Extension</option>
                </select>

                <input
                  type="text"
                  placeholder="E.g., Signed QB Patrick Mahomes to a 10-year, $450M contract restructuring..."
                  value={newTxDesc}
                  onChange={(e) => setNewTxDesc(e.target.value)}
                  className="flex-1 bg-slate-950 text-slate-200 border border-slate-800 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-emerald-500"
                  required
                />

                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded text-xs font-mono font-bold uppercase transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Record Move
                </button>
              </div>
            </form>
          </div>

        </div>

      </div>

      {/* Printable Scout Report Export Modal */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto no-print">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl relative">
            
            {/* Modal Controls Toolbar */}
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/40">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span className="font-mono text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Formatted Dossier Exporter
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Copy Clipboard button */}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generateMarkdownReport());
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 hover:text-slate-100 rounded text-[10px] font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Copy formatted markdown dossier"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copied ? 'Copied!' : 'Copy Markdown'}
                </button>

                {/* Download File button */}
                <button
                  onClick={() => {
                    const blob = new Blob([generateMarkdownReport()], { type: 'text/markdown;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.href = url;
                    link.setAttribute("download", `${activeTeam.id}_Franchise_Scouting_Dossier.md`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 hover:text-slate-100 rounded text-[10px] font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Download scouting report as a markdown document"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download File
                </button>

                {/* Print Command Button */}
                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded text-[10px] font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer shadow"
                  title="Open system print dialog"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Report
                </button>

                {/* Close Button */}
                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  className="p-1.5 text-slate-500 hover:text-slate-200 hover:bg-slate-800 rounded transition-all cursor-pointer"
                  title="Close modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Document Preview container styled like physical paper */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-950 font-sans scrollbar-thin">
              
              <div 
                id="printable-dossier-wrapper" 
                className="bg-[#fffdf9] text-slate-900 p-8 md:p-12 shadow-2xl rounded-none border border-amber-100/50 max-w-3xl mx-auto space-y-8 font-sans leading-relaxed text-left"
              >
                
                {/* Print Styles Sheet embedded in render */}
                <style>{`
                  @media print {
                    /* Hide everything except the printable element */
                    body > * {
                      display: none !important;
                    }
                    #printable-dossier-wrapper, #printable-dossier-wrapper * {
                      visibility: visible;
                      display: block !important;
                    }
                    #printable-dossier-wrapper {
                      position: absolute;
                      left: 0;
                      top: 0;
                      width: 100%;
                      height: auto;
                      background: #fffdf9 !important;
                      color: #0f172a !important;
                      padding: 0px !important;
                      margin: 0px !important;
                      box-shadow: none !important;
                      border: none !important;
                    }
                    /* Custom print typography and borders */
                    .print-border {
                      border-color: #94a3b8 !important;
                    }
                    .print-section {
                      page-break-inside: avoid;
                    }
                  }
                `}</style>

                {/* Dossier Header */}
                <div className="border-b-4 border-slate-900 pb-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-2 text-left">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase block">
                      // OFFICIAL FRANCHISE DOSSIER & SCOUTING REPORT
                    </span>
                    <h1 className="text-3xl font-serif font-black italic text-slate-900 tracking-tight">
                      {activeTeam.fullName}
                    </h1>
                    <p className="text-xs font-mono text-slate-600">
                      Division: {activeTeam.division} | Offensive-Defensive Base Scheme: {activeTeam.currentScheme}
                    </p>
                  </div>
                  <div className="text-left md:text-right font-mono text-[11px] text-slate-600 space-y-0.5 shrink-0">
                    <div>Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                    <div>Audited Cap Space: <strong className="text-emerald-700">${defaultReport.salaryCap.capSpace}M</strong></div>
                    <div>Status: <span className="text-emerald-700 font-bold">Approved War Room Draft Board</span></div>
                  </div>
                </div>

                {/* Section 1: Financial Assessment */}
                <div className="space-y-3 print-section text-left">
                  <h3 className="text-sm font-mono font-black text-slate-800 uppercase tracking-wider border-b-2 border-slate-300 pb-1 flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-slate-700" />
                    I. Financial & Salary Cap Summary
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-900/5 p-4 border border-slate-200">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-mono text-slate-500 uppercase block">Adjusted Limit</span>
                      <span className="text-base font-mono font-bold text-slate-900">${defaultReport.salaryCap.totalCap}M</span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-mono text-slate-500 uppercase block">Active Spending</span>
                      <span className="text-base font-mono font-bold text-slate-900">${defaultReport.salaryCap.activeCap}M</span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-mono text-slate-500 uppercase block">Dead Cap Pool</span>
                      <span className="text-base font-mono font-bold text-red-700">${defaultReport.salaryCap.deadCap}M</span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-mono text-slate-500 uppercase block">Available Cap Space</span>
                      <span className="text-base font-mono font-black text-emerald-700">${defaultReport.salaryCap.capSpace}M</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block tracking-wider">// Top Franchise Cap Allocations:</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      {defaultReport.salaryCap.topCapHits.map((h, i) => (
                        <div key={h.player} className="flex justify-between items-center py-1.5 border-b border-slate-200 px-1 font-mono">
                          <span className="text-slate-800 font-bold">{i+1}. {h.player} ({h.position})</span>
                          <span className="font-bold text-slate-700">${h.amount}M</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Section 2: Franchise Needs */}
                <div className="space-y-3 print-section text-left">
                  <h3 className="text-sm font-mono font-black text-slate-800 uppercase tracking-wider border-b-2 border-slate-300 pb-1 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-slate-700" />
                    II. Calibrated Roster & Franchise Needs
                  </h3>
                  <p className="text-xs text-slate-600 font-sans italic">
                    The following positional requirements have been audited by executive staff, prioritized in order of roster vulnerability:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                    {customNeeds.map((need, idx) => (
                      <div key={need} className="bg-slate-900/5 border border-slate-200 px-3 py-2 flex justify-between items-center">
                        <span className="font-bold text-slate-800">Priority #{idx + 1}: {need}</span>
                        <span className="text-[9px] uppercase font-bold text-slate-500">Critical Fit Requirement</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 3: Priority Draft Targets */}
                <div className="space-y-4 print-section text-left">
                  <h3 className="text-sm font-mono font-black text-slate-800 uppercase tracking-wider border-b-2 border-slate-300 pb-1 flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-slate-700" />
                    III. Priority Draft Targets & Evaluations
                  </h3>

                  {/* Pinned Targets */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block tracking-wider">// Pinned Board Prospects:</span>
                    {pinnedIds.length === 0 ? (
                      <p className="text-xs text-slate-500 font-mono italic p-3 bg-slate-900/5 border border-slate-200">
                        No targets currently pinned on this team's board.
                      </p>
                    ) : (
                      players
                        .filter(p => pinnedIds.includes(p.id))
                        .map((p, idx) => (
                          <div key={p.id} className="border border-slate-200 bg-white p-4 space-y-2 print-section">
                            <div className="flex justify-between items-start border-b border-slate-100 pb-1.5">
                              <div>
                                <h4 className="text-sm font-serif font-bold text-slate-900 flex items-center gap-1.5">
                                  <span>{idx+1}. {p.name}</span>
                                  <span className="text-[9px] font-mono px-1.5 bg-slate-100 border border-slate-200 text-slate-500 rounded uppercase">
                                    {p.position}
                                  </span>
                                </h4>
                                <span className="text-[10px] font-mono text-slate-500 block">
                                  {p.school} • {p.year} • {p.archetype || 'Prospect'}
                                </span>
                              </div>
                              <div className="text-right font-mono text-xs">
                                <span className="font-bold text-slate-900">Grade: {p.overallGrade}</span>
                              </div>
                            </div>
                            
                            {/* Scouting report snippet */}
                            <p className="text-[11px] text-slate-600 leading-normal font-sans">
                              <strong>Scouting Profile:</strong> {p.scoutingReport}
                            </p>

                            {/* Scout Notes */}
                            <div className="bg-amber-50/40 p-2.5 border border-amber-100 font-sans text-xs text-left">
                              <strong className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">// WAR ROOM NOTE:</strong>
                              <p className="text-slate-700 mt-1 italic font-sans leading-relaxed text-left">
                                {scoutNotes[p.id] ? `"${scoutNotes[p.id]}"` : '"No specialized scout notes recorded. Standard evaluation scheme applied."'}
                              </p>
                            </div>
                          </div>
                        ))
                    )}
                  </div>

                  {/* Suggested matches */}
                  {getRecommendedTargets().length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block tracking-wider">// High-Fit Prospect Alternatives:</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {getRecommendedTargets().map(p => (
                          <div key={p.id} className="p-2 bg-slate-900/5 border border-slate-200 flex justify-between items-center font-mono">
                            <div>
                              <span className="font-bold text-slate-800 block truncate">{p.name}</span>
                              <span className="text-[9px] text-slate-500 block">{p.position} - {p.school}</span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-600">Grade: {p.overallGrade}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 4: Draft Capital */}
                <div className="space-y-3 print-section text-left">
                  <h3 className="text-sm font-mono font-black text-slate-800 uppercase tracking-wider border-b-2 border-slate-300 pb-1 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-slate-700" />
                    IV. Three-Year Draft Capital Portfolio (2026-2028)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[2026, 2027, 2028].map(year => {
                      const yearPicks = defaultReport.draftAssets.filter(a => a.year === year);
                      return (
                        <div key={year} className="bg-slate-900/5 p-3 border border-slate-200 space-y-2">
                          <span className="text-[10px] font-mono font-bold text-slate-800 border-b border-slate-300 pb-0.5 block">
                            {year} Franchise Picks
                          </span>
                          <div className="space-y-1 text-[10px] font-mono text-slate-700">
                            {yearPicks.map(a => (
                              <div key={`${a.round}-${a.pickName}`} className="flex justify-between">
                                <span>Rnd {a.round}:</span>
                                <span className="font-bold truncate max-w-[120px]" title={a.pickName}>{a.pickName}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Section 5: Expiring Deals and Cuts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print-section text-left">
                  
                  {/* Expiring Deals */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-mono font-black text-slate-800 uppercase tracking-wider border-b-2 border-slate-300 pb-1 flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5" />
                      V. Pending Free Agency Deals
                    </h4>
                    <div className="space-y-1.5 text-xs">
                      {defaultReport.expiringDeals.map(d => (
                        <div key={d.player} className="p-2 border border-slate-200 bg-white flex justify-between items-center font-mono">
                          <div>
                            <span className="font-sans font-bold text-slate-800 block">{d.player}</span>
                            <span className="text-[9px] text-slate-500 block">Pos: {d.position} | Age: {d.age}</span>
                          </div>
                          <span className="font-bold text-slate-700">${d.currentSalary}M</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cuts */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-mono font-black text-slate-800 uppercase tracking-wider border-b-2 border-slate-300 pb-1 flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      VI. Recommended Cap Space Savings
                    </h4>
                    <div className="space-y-1.5 text-xs">
                      {defaultReport.salaryCuts.map(c => (
                        <div key={c.player} className="p-2 border border-slate-200 bg-white space-y-1">
                          <div className="flex justify-between font-mono">
                            <span className="font-sans font-bold text-slate-800 block">{c.player}</span>
                            <span className="font-bold text-emerald-700">Save +${c.capSavings}M</span>
                          </div>
                          <p className="text-[9px] text-slate-500 leading-snug">{c.reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Footer sign-off stamp */}
                <div className="pt-6 border-t-2 border-dashed border-slate-300 flex justify-between items-center text-[10px] font-mono text-slate-500">
                  <span>SYSTEM WAR ROOM VERIFIED REPORT</span>
                  <span>ID: {activeTeam.id}-DOSSIER-2026</span>
                </div>

              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
