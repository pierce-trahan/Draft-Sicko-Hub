import React, { useState, useEffect } from 'react';
import { Player, Team, Scheme } from './types';
import { NFL_TEAMS, SCHEMES } from './data/teams';
import { INITIAL_PROSPECTS } from './data/initialProspects';
import BoardRanker from './components/BoardRanker';
import { getContrastColor } from './utils/contrast';
import PlayerProfileModal from './components/PlayerProfileModal';
import DraftSimulator from './components/DraftSimulator';
import PlayerComparer from './components/PlayerComparer';
import TeamReports from './components/TeamReports';
import CoachingReports from './components/CoachingReports';
import PlayerRankingMatrix from './components/PlayerRankingMatrix';
import CitedSources from './components/CitedSources';
import DraftClassOverview from './components/DraftClassOverview';
import { 
  Award, Trophy, ClipboardList, Layers, Settings, Users, 
  Sparkles, Clock, RefreshCcw, HelpCircle, Flame, Plus, Menu, X, ArrowUpRight,
  Sun, Moon, Download, Upload, Trash2, FolderPlus, FileJson, Tag, Star
} from 'lucide-react';
import { LabelDef, DEFAULT_LABELS, getLabelClasses } from './utils/labels';

export default function App() {
  // Database States
  const [players, setPlayers] = useState<Player[]>([]);
  const [rankings, setRankings] = useState<Record<string, string[]>>({});
  const [appMode, setAppMode] = useState<'boards' | 'draft_sim' | 'compare' | 'team_reports' | 'coaching_reports' | 'scouting_matrix' | 'overview'>('boards');
  
  // Selection States
  const [activeBoardKey, setActiveBoardKey] = useState<string>('league'); // "league", "team_GB", "pos_QB", etc.
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [sidebarTab, setSidebarTab] = useState<'consensus' | 'teams' | 'positions' | 'schemes'>('consensus');
  
  // Mobile UI States
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Custom Labels States
  const [customLabels, setCustomLabels] = useState<LabelDef[]>(() => {
    const saved = localStorage.getItem('nfl_draft_custom_labels');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse custom labels", e);
      }
    }
    return DEFAULT_LABELS;
  });

  const [activeLabelFilter, setActiveLabelFilter] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('nfl_draft_custom_labels', JSON.stringify(customLabels));
  }, [customLabels]);

  const handleAddCustomLabel = (newLabel: LabelDef) => {
    setCustomLabels(prev => {
      if (prev.some(l => l.name.toLowerCase() === newLabel.name.toLowerCase())) {
        return prev;
      }
      return [...prev, newLabel];
    });
  };

  // Custom Board States
  const [customBoards, setCustomBoards] = useState<Array<{ id: string; name: string }>>(() => {
    const saved = localStorage.getItem('nfl_draft_custom_boards');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse custom boards", e);
      }
    }
    return [];
  });

  // Data Hub Modal and message states
  const [dataHubOpen, setDataHubOpen] = useState(false);
  const [dataHubTab, setDataHubTab] = useState<'import' | 'export'>('export');
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [newBoardName, setNewBoardName] = useState('');
  const [isCreatingBoard, setIsCreatingBoard] = useState(false);

  useEffect(() => {
    localStorage.setItem('nfl_draft_custom_boards', JSON.stringify(customBoards));
  }, [customBoards]);

  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('nfl_draft_theme') as 'light' | 'dark') || 'dark';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
    localStorage.setItem('nfl_draft_theme', theme);
  }, [theme]);

  // Load and save state from localStorage
  useEffect(() => {
    // 1. Load players
    const savedPlayers = localStorage.getItem('nfl_draft_players');
    let loadedPlayers: Player[] = [];
    if (savedPlayers) {
      try {
        loadedPlayers = JSON.parse(savedPlayers);
        // Automatically migrate if the loaded player pool is not the authentic 101 prospect class or is missing gradeHistory
        const needsFullClassHydration = loadedPlayers.length !== 101 || loadedPlayers[0]?.id !== 'jeremiah-smith' || !loadedPlayers[0]?.gradeHistory;
        if (needsFullClassHydration) {
          loadedPlayers = [...INITIAL_PROSPECTS];
          localStorage.setItem('nfl_draft_players', JSON.stringify(loadedPlayers));
          // Clear stale custom board rankings since the player pool has been fully expanded and updated
          localStorage.removeItem('nfl_draft_rankings');
        } else {
          // Clean up any stale/unsupported "Generational Talent" archetypes that might be stored in localStorage
          let updatedStorage = false;
          loadedPlayers = loadedPlayers.map(p => {
            if (p.archetype === 'Generational Talent') {
              updatedStorage = true;
              return { ...p, archetype: 'Blue Chip Prospect' };
            }
            return p;
          });
          if (updatedStorage) {
            localStorage.setItem('nfl_draft_players', JSON.stringify(loadedPlayers));
          }
        }
      } catch (e) {
        console.error("Failed to parse players from local storage", e);
        loadedPlayers = [...INITIAL_PROSPECTS];
      }
    } else {
      loadedPlayers = [...INITIAL_PROSPECTS];
      localStorage.setItem('nfl_draft_players', JSON.stringify(loadedPlayers));
    }
    setPlayers(loadedPlayers);

    // 2. Load rankings
    const savedRankings = localStorage.getItem('nfl_draft_rankings');
    let loadedRankings: Record<string, string[]> = {};
    if (savedRankings) {
      try {
        loadedRankings = JSON.parse(savedRankings);
      } catch (e) {
        console.error("Failed to parse rankings from local storage", e);
      }
    }
    setRankings(loadedRankings);
  }, []);

  // Save changes helper
  const savePlayersToStorage = (updatedPlayers: Player[]) => {
    const sanitized = updatedPlayers.map(p => {
      if (p.archetype === 'Generational Talent') {
        return { ...p, archetype: 'Blue Chip Prospect' };
      }
      return p;
    });
    setPlayers(sanitized);
    localStorage.setItem('nfl_draft_players', JSON.stringify(sanitized));
  };

  const saveRankingsToStorage = (updatedRankings: Record<string, string[]>) => {
    setRankings(updatedRankings);
    localStorage.setItem('nfl_draft_rankings', JSON.stringify(updatedRankings));
  };

  // Active Context Parsers
  const isTeamActive = activeBoardKey.startsWith('team_');
  const activeTeamId = isTeamActive ? activeBoardKey.split('_')[1] : null;
  const activeTeam = activeTeamId ? NFL_TEAMS.find(t => t.id === activeTeamId) : undefined;

  const isSchemeActive = activeBoardKey.startsWith('scheme_');
  const activeSchemeId = isSchemeActive ? activeBoardKey.split('_')[1] : null;
  const activeScheme = activeSchemeId ? SCHEMES.find(s => s.id === activeSchemeId) : undefined;

  // Calculate current active order for the active board
  const getActiveBoardOrder = (): string[] => {
    const existingPlayerIds = new Set(players.map(p => p.id));
    const savedOrder = rankings[activeBoardKey];

    if (savedOrder && savedOrder.length > 0) {
      // Filter out any IDs that were deleted from the database
      return savedOrder.filter(id => existingPlayerIds.has(id));
    }

    // Default fallback order: sorted by overall grade descending
    return [...players]
      .sort((a, b) => b.overallGrade - a.overallGrade)
      .map(p => p.id);
  };

  const handleReorder = (newOrderedIds: string[]) => {
    const updatedRankings = {
      ...rankings,
      [activeBoardKey]: newOrderedIds
    };
    saveRankingsToStorage(updatedRankings);
  };

  // Player Editing actions
  const handleSavePlayer = (updatedPlayer: Player) => {
    const exists = players.some(p => p.id === updatedPlayer.id);
    let updatedList: Player[];
    
    if (exists) {
      updatedList = players.map(p => p.id === updatedPlayer.id ? updatedPlayer : p);
    } else {
      updatedList = [...players, updatedPlayer];
    }
    
    savePlayersToStorage(updatedList);
    setSelectedPlayer(null);
  };

  const handleDeletePlayer = (id: string) => {
    if (window.confirm("Are you sure you want to permanently delete this prospect from all boards? This cannot be undone.")) {
      const updatedList = players.filter(p => p.id !== id);
      savePlayersToStorage(updatedList);

      // Clean up rankings orders
      const updatedRankings = { ...rankings };
      Object.keys(updatedRankings).forEach(key => {
        updatedRankings[key] = updatedRankings[key].filter(pId => pId !== id);
      });
      saveRankingsToStorage(updatedRankings);
    }
  };

  // Custom Board Actions
  const handleCreateCustomBoard = (nameInput?: string) => {
    const name = nameInput?.trim() || `Custom Board #${customBoards.length + 1}`;
    const id = `cb_${Date.now()}`;
    const newBoard = { id, name };
    
    // Copy active board or consensus order to initialize the new board's order
    const currentOrder = getActiveBoardOrder();
    const updatedRankings = {
      ...rankings,
      [`custom_${id}`]: currentOrder
    };
    saveRankingsToStorage(updatedRankings);
    
    setCustomBoards(prev => [...prev, newBoard]);
    setActiveBoardKey(`custom_${id}`);
    setIsCreatingBoard(false);
    setNewBoardName('');
  };

  const handleDeleteCustomBoard = (boardId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Don't trigger selection
    if (window.confirm("Are you sure you want to delete this custom board? This cannot be undone.")) {
      const updatedBoards = customBoards.filter(b => b.id !== boardId);
      setCustomBoards(updatedBoards);
      
      const updatedRankings = { ...rankings };
      delete updatedRankings[`custom_${boardId}`];
      saveRankingsToStorage(updatedRankings);
      
      if (activeBoardKey === `custom_${boardId}`) {
        setActiveBoardKey('league');
      }
    }
  };

  // Export functions
  const handleExportIndividualBoard = (boardKey: string, boardName: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    // Get rankings for this board
    const boardRankings = rankings[boardKey] || getActiveBoardOrder();
    
    const exportData = {
      version: "1.0",
      type: "big_board",
      boardKey,
      boardName,
      rankings: boardRankings
    };
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${boardName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_board_export.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportDraftClass = () => {
    const exportData = {
      version: "1.0",
      type: "draft_class",
      players
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `draft_class_players_export.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportFullBackup = () => {
    const exportData = {
      version: "1.0",
      type: "full_backup",
      players,
      rankings,
      customBoards
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `prospect_engine_full_backup.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import handler
  const handleImportJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportStatus(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (!json || typeof json !== 'object') {
          throw new Error("Invalid JSON file structure.");
        }

        // 1. Individual Big Board
        if (json.type === "big_board" && Array.isArray(json.rankings)) {
          const importedKey = json.boardKey || `custom_cb_${Date.now()}`;
          const importedName = json.boardName || "Imported Board";
          
          // If it's a custom board, make sure we add it to our custom boards list if not exists
          if (importedKey.startsWith('custom_')) {
            const cbId = importedKey.replace('custom_', '');
            if (!customBoards.some(b => b.id === cbId)) {
              setCustomBoards(prev => [...prev, { id: cbId, name: importedName }]);
            }
          }
          
          const updatedRankings = {
            ...rankings,
            [importedKey]: json.rankings
          };
          saveRankingsToStorage(updatedRankings);
          setActiveBoardKey(importedKey);
          
          setImportStatus({
            type: 'success',
            message: `Successfully imported big board "${importedName}" with ${json.rankings.length} ranked prospects.`
          });
        }
        // 2. Draft Class (Players)
        else if (json.type === "draft_class" && Array.isArray(json.players)) {
          savePlayersToStorage(json.players);
          setImportStatus({
            type: 'success',
            message: `Successfully imported Draft Class with ${json.players.length} players.`
          });
        }
        // 3. Full backup
        else if (json.type === "full_backup" && Array.isArray(json.players) && json.rankings) {
          savePlayersToStorage(json.players);
          saveRankingsToStorage(json.rankings);
          if (Array.isArray(json.customBoards)) {
            setCustomBoards(json.customBoards);
          }
          setImportStatus({
            type: 'success',
            message: `Successfully restored full backup: ${json.players.length} players, custom boards, and all customized rankings.`
          });
        } else {
          // Try heuristic parsing if standard type tags are missing
          if (Array.isArray(json)) {
            // Check if it looks like players array
            if (json.length > 0 && 'name' in json[0] && 'position' in json[0]) {
              savePlayersToStorage(json);
              setImportStatus({
                type: 'success',
                message: `Heuristically parsed and loaded ${json.length} players into Draft Class.`
              });
            } else {
              throw new Error("Unrecognized JSON array format. Please import a standard ProspectEngine export file.");
            }
          } else {
            throw new Error("Unrecognized export file format. Could not locate standard schema tags.");
          }
        }
      } catch (err: any) {
        setImportStatus({
          type: 'error',
          message: err?.message || "Failed to parse JSON file. Ensure it is a valid backup/export."
        });
      }
    };
    reader.readAsText(file);
  };

  // Smart update that preserves user notes, grades, custom rankings while updating raw attributes
  const handleUpdateMeasurablesJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportStatus(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (!json || typeof json !== 'object') {
          throw new Error("Invalid JSON file structure.");
        }

        let incomingPlayers: Player[] = [];
        if (json.type === "draft_class" && Array.isArray(json.players)) {
          incomingPlayers = json.players;
        } else if (json.type === "full_backup" && Array.isArray(json.players)) {
          incomingPlayers = json.players;
        } else if (Array.isArray(json)) {
          incomingPlayers = json;
        } else {
          throw new Error("Unrecognized JSON format. Make sure you upload a draft class or a backup JSON file containing players.");
        }

        if (incomingPlayers.length === 0) {
          throw new Error("No players found in the uploaded file.");
        }

        let updatedCount = 0;
        let addedCount = 0;

        const mergedPlayers = players.map(existingPlayer => {
          // Find matching incoming player by ID or by Name + Position + School (case insensitive)
          const incomingPlayer = incomingPlayers.find(p => 
            p.id === existingPlayer.id || 
            (p.name.trim().toLowerCase() === existingPlayer.name.trim().toLowerCase() && 
             p.position === existingPlayer.position && 
             p.school === existingPlayer.school)
          );

          if (incomingPlayer) {
            updatedCount++;
            // Perform a smart merge, preserving user notes, grades, big boards (custom annotations/comments)
            return {
              ...incomingPlayer, // Pull in new testing/athletic traits, height, weight, archetype, year etc.
              id: existingPlayer.id, // Keep current ID
              
              // PRESERVE USER DEFINED CUSTOM DATA:
              scoutNotes: existingPlayer.scoutNotes !== undefined ? existingPlayer.scoutNotes : incomingPlayer.scoutNotes,
              overallGrade: existingPlayer.overallGrade !== undefined ? existingPlayer.overallGrade : incomingPlayer.overallGrade,
              bigBoards: {
                ...incomingPlayer.bigBoards,
                ...existingPlayer.bigBoards // Keep custom ratings/ranks assigned locally on standard & custom boards
              },
              strengths: existingPlayer.strengths && existingPlayer.strengths.length > 0 ? existingPlayer.strengths : incomingPlayer.strengths,
              weaknesses: existingPlayer.weaknesses && existingPlayer.weaknesses.length > 0 ? existingPlayer.weaknesses : incomingPlayer.weaknesses,
              isCustom: existingPlayer.isCustom
            };
          }
          return existingPlayer;
        });

        // Add any brand new players that are in the update but not in current state
        const newPlayersToAdd: Player[] = [];
        incomingPlayers.forEach(incomingPlayer => {
          const alreadyExists = players.some(existingPlayer => 
            existingPlayer.id === incomingPlayer.id || 
            (existingPlayer.name.trim().toLowerCase() === incomingPlayer.name.trim().toLowerCase() && 
             existingPlayer.position === incomingPlayer.position && 
             existingPlayer.school === existingPlayer.school)
          );

          if (!alreadyExists) {
            newPlayersToAdd.push(incomingPlayer);
            addedCount++;
          }
        });

        const finalPlayersList = [...mergedPlayers, ...newPlayersToAdd];

        savePlayersToStorage(finalPlayersList);
        
        setImportStatus({
          type: 'success',
          message: `Smart update complete! Successfully updated measurables and attributes for ${updatedCount} players and added ${addedCount} new prospects. Your existing scout notes, customized grades, and individual board orders were fully preserved.`
        });
      } catch (err: any) {
        setImportStatus({
          type: 'error',
          message: err?.message || "Failed to process and update measurables. Ensure the file contains valid prospect information."
        });
      }
    };
    reader.readAsText(file);
  };

  const handleCreateProspect = () => {
    // Generate a secure unique slug ID
    const randomId = "custom-" + Date.now().toString(36);
    const newProspect: Player = {
      id: randomId,
      name: "New Draft Prospect",
      position: "QB",
      school: "State University",
      height: "6'3\"",
      weight: 220,
      year: "Jr",
      traits: {
        athleticism: 75,
        technique: 75,
        production: 75,
        footballIQ: 75,
        sizeAndFrame: 75
      },
      strengths: ["Highly coachable athlete", "Solid frame for development"],
      weaknesses: ["Needs mechanical consistency", "Limited starts at FBS level"],
      scoutingReport: "A customizable prospect ready for detailed scout evaluations. Enter details, slide ratings, and generate AI comment blurbs.",
      bigBoards: {
        "Mel Kiper Jr. (ESPN)": { rank: 50, comment: "Needs refinement but flashes traits. Intriguing Day 3 project." },
        "Dane Brugler (The Athletic)": { rank: 50, comment: "Shows raw physical indicators but needs film development. Solid developmental piece." },
        "Daniel Jeremiah (NFL Network)": { rank: 50, comment: "I like his athleticism. High upside if put in the right scheme." },
        "NFLSE (Trevor Sikkema)": { rank: 50, comment: "Limited collegiate grading tape. Production is average but physical traits warrant interest." },
        "Danny Kelly (The Ringer)": { rank: 50, comment: "A traits-based flyer who could develop into a reliable backup or starter." }
      },
      overallGrade: 75,
      isCustom: true,
      scoutNotes: ""
    };

    setSelectedPlayer(newProspect);
  };

  // Fully reset entire localStorage to start fresh
  const handleSystemFullReset = () => {
    if (window.confirm("CRITICAL WARNING: This will delete ALL custom rankings, newly created prospects, and edited traits. It restores the app to initial default prospects. Continue?")) {
      localStorage.removeItem('nfl_draft_players');
      localStorage.removeItem('nfl_draft_rankings');
      setPlayers([...INITIAL_PROSPECTS]);
      setRankings({});
      setActiveBoardKey('league');
      setSidebarTab('consensus');
    }
  };

  // Dynamic theme colors calculated for active team
  const activeAccentColor = activeTeam ? activeTeam.logoColor : '#10B981';
  const activeSecondaryAccent = activeTeam ? activeTeam.secondaryColor : '#059669';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans antialiased flex flex-col selection:bg-emerald-500/10 selection:text-emerald-400">
      
      {/* 1. Global Navigation Bar */}
      <header className="bg-slate-900 border-b border-slate-800 shrink-0 sticky top-0 z-40 px-4 md:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          
          <div className="flex items-center gap-2.5">
            <Star className="w-5 h-5 text-emerald-500 fill-emerald-500/10 animate-pulse" />
            <div>
              <h1 className="header-title font-serif font-bold italic text-slate-300 text-xl sm:text-2xl tracking-tight leading-none flex items-center gap-2">
                ProspectEngine <span className="font-mono text-[9px] not-italic text-slate-500 font-bold uppercase tracking-widest border border-slate-300/40 px-2 py-0.5 rounded-full">V2.4</span>
              </h1>
            </div>
          </div>
        </div>

        {/* Status Indicators & Clock */}
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="hidden md:flex items-center gap-1.5 font-mono text-[10px] text-slate-500 uppercase tracking-wider">
            Sync_Status: <span className="text-emerald-500 font-bold">Optimal</span>
          </div>

          {/* Data Hub (Import / Export) Button */}
          <button
            onClick={() => {
              setImportStatus(null);
              setDataHubOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-800 hover:border-slate-500 text-slate-400 hover:text-slate-200 transition-all text-[10px] font-mono uppercase tracking-wider bg-slate-900/40 cursor-pointer"
            title="Import/Export Draft Classes and Boards"
          >
            <FileJson className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Data Hub</span>
            <span className="sm:hidden font-bold">Data</span>
          </button>

          {/* Theme Switcher Button */}
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-800 hover:border-slate-500 text-slate-400 hover:text-slate-200 transition-all text-[10px] font-mono uppercase tracking-wider bg-slate-900/40 cursor-pointer"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'light' ? (
              <>
                <Moon className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Dark Mode</span>
                <span className="sm:hidden">Dark</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Light Mode</span>
                <span className="sm:hidden">Light</span>
              </>
            )}
          </button>

          <button
            onClick={handleSystemFullReset}
            className="px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 hover:text-red-900 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase transition-all flex items-center gap-1.5"
            title="Reset complete database to defaults"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            System Reset
          </button>
        </div>
      </header>

      {/* 2. Main Content Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Sidebar Container */}
        <aside className={`
          fixed lg:relative inset-y-0 left-0 w-80 bg-slate-900 border-r border-slate-800 flex flex-col z-30 transform transition-transform duration-300 lg:translate-x-0 shrink-0
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}>
          
          {/* Permanent Draft Intelligence Navigation */}
          <div className="p-5 border-b border-slate-800 space-y-3.5 bg-slate-950/20">
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 font-mono">Draft Intelligence</p>
            <div className="space-y-1">
              {[
                { id: 'boards', label: 'Prospect Boards' },
                { id: 'overview', label: 'Draft Class Overview' },
                { id: 'draft_sim', label: 'Draft Simulator' },
                { id: 'compare', label: 'Prospect Comparer' },
                { id: 'team_reports', label: 'Team Reports' },
                { id: 'coaching_reports', label: 'Coaching Reports' },
                { id: 'scouting_matrix', label: 'Scouting Matrix' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setAppMode(item.id as any);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left py-2 px-3 transition-all font-sans text-sm rounded-none border-l-2 flex items-center justify-between cursor-pointer ${
                    appMode === item.id
                      ? "text-slate-100 border-emerald-500 bg-emerald-500/5 font-semibold"
                      : "text-slate-500 border-transparent hover:text-slate-200 hover:bg-slate-900/10"
                  }`}
                >
                  <span>{item.label}</span>
                  {appMode === item.id && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />}
                </button>
              ))}
            </div>
          </div>

          {/* Conditional Sub-features in Sidebar */}
          {appMode === 'boards' ? (
            <>
              {/* Sidebar tabs for Boards Mode */}
              <div className="grid grid-cols-4 border-b border-slate-800 bg-slate-950 text-center text-xs text-slate-400 font-bold font-mono">
                <button
                  onClick={() => setSidebarTab('consensus')}
                  className={`py-3.5 border-r border-slate-800 flex flex-col items-center justify-center gap-1 cursor-pointer ${sidebarTab === 'consensus' ? "bg-slate-900 text-emerald-400 border-b-2 border-b-emerald-500" : "hover:text-slate-200"}`}
                >
                  <ClipboardList className="w-4 h-4" />
                  <span>Boards</span>
                </button>
                <button
                  onClick={() => setSidebarTab('teams')}
                  className={`py-3.5 border-r border-slate-800 flex flex-col items-center justify-center gap-1 cursor-pointer ${sidebarTab === 'teams' ? "bg-slate-900 text-emerald-400 border-b-2 border-b-emerald-500" : "hover:text-slate-200"}`}
                >
                  <Users className="w-4 h-4" />
                  <span>Teams</span>
                </button>
                <button
                  onClick={() => setSidebarTab('positions')}
                  className={`py-3.5 border-r border-slate-800 flex flex-col items-center justify-center gap-1 cursor-pointer ${sidebarTab === 'positions' ? "bg-slate-900 text-emerald-400 border-b-2 border-b-emerald-500" : "hover:text-slate-200"}`}
                >
                  <Layers className="w-4 h-4" />
                  <span>Positions</span>
                </button>
                <button
                  onClick={() => setSidebarTab('schemes')}
                  className={`py-3.5 flex flex-col items-center justify-center gap-1 cursor-pointer ${sidebarTab === 'schemes' ? "bg-slate-900 text-emerald-400 border-b-2 border-b-emerald-500" : "hover:text-slate-200"}`}
                >
                  <Settings className="w-4 h-4" />
                  <span>Schemes</span>
                </button>
              </div>

              {/* Sidebar tab body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                
                {/* Tab: Consensus */}
                {sidebarTab === 'consensus' && (
                  <div className="space-y-2.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono">Draft Boards</span>
                    <button
                      onClick={() => {
                        setActiveBoardKey('league');
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full text-left p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                        activeBoardKey === 'league'
                          ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                          : "bg-slate-950/40 border-slate-850 hover:bg-slate-950 text-slate-300 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Trophy className="w-4 h-4 text-emerald-500" />
                        <div>
                          <span className="text-xs font-bold block">NFL Consensus Board</span>
                          <span className="text-[9px] text-slate-400 font-mono">Default league sorting</span>
                        </div>
                      </div>
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
                    </button>

                    <button
                      onClick={() => {
                        setActiveBoardKey('my_board');
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full text-left p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                        activeBoardKey === 'my_board'
                          ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                          : "bg-slate-950/40 border-slate-850 hover:bg-slate-950 text-slate-300 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Award className="w-4 h-4 text-emerald-500" />
                        <div>
                          <span className="text-xs font-bold block">My Board</span>
                          <span className="text-[9px] text-slate-400 font-mono">Your customized rankings</span>
                        </div>
                      </div>
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
                    </button>

                    {/* Dynamic Custom Boards */}
                    {customBoards.map((board) => {
                      const isBoardActive = activeBoardKey === `custom_${board.id}`;
                      return (
                        <div
                          key={board.id}
                          onClick={() => {
                            setActiveBoardKey(`custom_${board.id}`);
                            setMobileMenuOpen(false);
                          }}
                          className={`group w-full p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                            isBoardActive
                              ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                              : "bg-slate-950/40 border-slate-850 hover:bg-slate-950 text-slate-300 hover:text-white"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <FolderPlus className="w-4 h-4 text-emerald-500 shrink-0" />
                            <div className="min-w-0">
                              <span className="text-xs font-bold block truncate">{board.name}</span>
                              <span className="text-[9px] text-slate-400 font-mono">Custom Big Board</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => handleExportIndividualBoard(`custom_${board.id}`, board.name, e)}
                              className="p-1 text-slate-500 hover:text-emerald-400 hover:bg-slate-900 rounded"
                              title="Export Board individually"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteCustomBoard(board.id, e)}
                              className="p-1 text-slate-500 hover:text-red-400 hover:bg-slate-900 rounded"
                              title="Delete Custom Board"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {/* Create Board Bubble */}
                    {isCreatingBoard ? (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleCreateCustomBoard(newBoardName);
                        }}
                        className="p-3 rounded-xl border border-dashed border-slate-700 bg-slate-900/40 space-y-2"
                      >
                        <input
                          type="text"
                          placeholder="Board name..."
                          value={newBoardName}
                          onChange={(e) => setNewBoardName(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 text-xs px-2.5 py-1.5 text-slate-200 focus:border-emerald-500 focus:outline-none rounded-lg"
                          autoFocus
                        />
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setIsCreatingBoard(false)}
                            className="px-2 py-1 text-[10px] text-slate-400 hover:text-white bg-slate-850 rounded-lg font-mono uppercase cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-2 py-1 text-[10px] text-white dark:text-slate-950 bg-emerald-500 hover:bg-emerald-600 rounded-lg font-mono uppercase font-bold cursor-pointer"
                          >
                            Create
                          </button>
                        </div>
                      </form>
                    ) : (
                      <button
                        onClick={() => setIsCreatingBoard(true)}
                        className="w-full text-left p-3 rounded-xl border border-dashed border-slate-800 hover:border-slate-500 hover:border-solid text-slate-400 hover:text-slate-200 transition-all flex items-center justify-center gap-2 bg-slate-950/20 hover:bg-slate-950/50 cursor-pointer"
                      >
                        <Plus className="w-4 h-4 text-slate-500" />
                        <span className="text-xs font-bold font-mono uppercase tracking-wider">Create a Board</span>
                      </button>
                    )}

                    {/* Filter by Player Label section */}
                    <div className="pt-4 border-t border-slate-800 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                          Filter by Label
                        </span>
                        {activeLabelFilter && (
                          <button
                            onClick={() => setActiveLabelFilter(null)}
                            className="text-[9px] font-mono text-emerald-400 hover:text-emerald-300 uppercase cursor-pointer font-bold"
                          >
                            Clear
                          </button>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <button
                          onClick={() => setActiveLabelFilter(null)}
                          className={`w-full text-left px-3 py-2 flex items-center justify-between transition-all cursor-pointer border rounded-lg text-xs ${
                            activeLabelFilter === null
                              ? "bg-slate-900 border-emerald-500/45 text-emerald-400 font-bold"
                              : "bg-slate-950/40 border-slate-850 hover:bg-slate-950 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-slate-500" />
                            <span>All Prospects</span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-500 font-bold bg-slate-950 px-1.5 py-0.5 border border-slate-850 rounded">
                            {players.length}
                          </span>
                        </button>

                        {customLabels.map((label) => {
                          const count = players.filter(p => p.labels?.includes(label.name)).length;
                          const classes = getLabelClasses(label.colorName);
                          const isActive = activeLabelFilter === label.name;
                          return (
                            <button
                              key={label.name}
                              onClick={() => setActiveLabelFilter(label.name)}
                              className={`w-full text-left px-3 py-2 flex items-center justify-between transition-all cursor-pointer border rounded-lg text-xs ${
                                isActive
                                  ? `${classes} ring-1 ring-emerald-500/40 font-bold`
                                  : "bg-slate-950/40 border-slate-850 hover:bg-slate-950 text-slate-400 hover:text-slate-200"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: label.color }} />
                                <span>{label.name}</span>
                              </div>
                              <span className="text-[10px] font-mono font-bold bg-slate-950 px-1.5 py-0.5 border border-slate-850 text-slate-400 rounded">
                                {count}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab: Teams */}
                {sidebarTab === 'teams' && (
                  <div className="space-y-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono">32 NFL Franchise Boards</span>
                      <p className="text-[9px] text-slate-400 leading-normal mt-0.5">Click any team to view their custom priorities, needs, and save their specific draft order.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                      {NFL_TEAMS.map((team) => (
                        <button
                          key={team.id}
                          onClick={() => {
                            setActiveBoardKey(`team_${team.id}`);
                            setMobileMenuOpen(false);
                          }}
                          className={`text-left p-2 rounded-lg border transition-all flex flex-col justify-between h-[64px] relative overflow-hidden cursor-pointer ${
                            activeBoardKey === `team_${team.id}`
                              ? "bg-slate-950 border-emerald-500 text-slate-100"
                              : "bg-slate-950/40 border-slate-800 hover:bg-slate-950 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          {/* Left border franchise color accent strip */}
                          <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: team.logoColor }}></div>
                          
                          <div className="flex items-center justify-between w-full pl-1">
                            <span className="font-mono font-bold text-sm tracking-wide text-slate-100">{team.id}</span>
                            <span className="text-[9px] font-bold uppercase truncate max-w-[60px]" style={{ color: team.logoColor }}>
                              {team.name}
                            </span>
                          </div>
                          
                          <div className="text-[8px] font-mono text-slate-500 pl-1 truncate w-full uppercase">
                            Needs: {team.needs.slice(0, 2).join(', ')}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tab: Positions */}
                {sidebarTab === 'positions' && (
                  <div className="space-y-2.5">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono">Dedicated Position Boards</span>
                      <p className="text-[9px] text-slate-400 leading-normal mt-0.5">Edit specific custom orders for positional pools.</p>
                    </div>
                    
                    <div className="space-y-1.5">
                      {['QB', 'RB', 'WR', 'TE', 'OT', 'IOL', 'EDGE', 'DT', 'LB', 'CB', 'S'].map((pos) => {
                        const active = activeBoardKey === `pos_${pos}`;
                        return (
                          <button
                            key={pos}
                            onClick={() => {
                              setActiveBoardKey(`pos_${pos}`);
                              setMobileMenuOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2.5 rounded-lg border flex items-center justify-between transition-all cursor-pointer ${
                              active
                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                : "bg-slate-950/40 border-slate-850 hover:bg-slate-950 text-slate-300 hover:text-white"
                            }`}
                          >
                            <span className="text-xs font-bold font-mono">{pos} Rankings</span>
                            <span className="text-[9px] font-mono font-bold text-slate-500">
                              {players.filter(p => p.position === pos || p.position.includes(pos)).length} players
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Tab: Schemes */}
                {sidebarTab === 'schemes' && (
                  <div className="space-y-2.5">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono">Tactical Scheme Fits</span>
                      <p className="text-[9px] text-slate-400 leading-normal mt-0.5">Customize rankings tailored for offensive/defensive configurations.</p>
                    </div>

                    <div className="space-y-1.5">
                      {SCHEMES.map((sch) => {
                        const active = activeBoardKey === `scheme_${sch.id}`;
                        return (
                          <button
                            key={sch.id}
                            onClick={() => {
                              setActiveBoardKey(`scheme_${sch.id}`);
                              setMobileMenuOpen(false);
                            }}
                            className={`w-full text-left p-3 rounded-xl border flex flex-col gap-1 transition-all cursor-pointer ${
                              active
                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                : "bg-slate-950/40 border-slate-850 hover:bg-slate-950 text-slate-300"
                            }`}
                          >
                            <div className="flex justify-between items-center w-full">
                              <span className="text-xs font-bold block">{sch.name}</span>
                              <span className={`text-[8px] font-mono px-1 border rounded uppercase tracking-wider font-semibold ${
                                sch.type === 'offense' ? "text-blue-400 border-blue-900/50 bg-blue-950/10" : "text-amber-400 border-amber-900/50 bg-amber-950/10"
                              }`}>
                                {sch.type}
                              </span>
                            </div>
                            <span className="text-[9px] text-slate-500 truncate w-full">{sch.description}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>
            </>
          ) : (
            /* Active Library View for Other Modes */
            <div className="p-5 flex-1 space-y-4">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 font-mono">Active Library</span>
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-none shadow-sm space-y-1">
                <p className="text-xs font-semibold text-slate-200 font-sans">
                  {activeBoardKey === 'league' 
                    ? 'NFL Consensus Board' 
                    : activeBoardKey === 'my_board'
                      ? 'My Custom Board'
                      : activeBoardKey.startsWith('team_')
                        ? `${activeBoardKey.split('_')[1]} Franchise Board`
                        : activeBoardKey.startsWith('pos_')
                          ? `${activeBoardKey.split('_')[1]} Position Board`
                          : 'Custom Ranker Board'
                  }
                </p>
                <p className="text-[9px] text-slate-500 font-mono uppercase tracking-wider">
                  Primary Dataset
                </p>
              </div>
              <button 
                onClick={() => setAppMode('boards')}
                className="w-full py-2.5 bg-transparent border border-slate-800 hover:border-slate-500 text-xs font-mono font-bold uppercase transition-all tracking-wider text-slate-300 cursor-pointer"
              >
                Manage Rankings
              </button>
            </div>
          )}

          {/* Sidebar Footer Details */}
          <div className="p-4 bg-slate-950 border-t border-slate-800 text-center">
            <span className="text-[10px] text-slate-500 font-mono">PERSISTED LOCAL DATABASE</span>
          </div>
        </aside>

        {/* Outer overlay for mobile sidebar */}
        {mobileMenuOpen && (
          <div 
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 lg:hidden"
          ></div>
        )}

        {/* 3. Main Board View Section */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6">
          
          {appMode === 'boards' && (
            <>
              {/* Active Context Banner */}
              {activeTeam && (
                <div 
                  className="border-2 border-slate-800 p-5 md:p-6 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all bg-slate-955/60 dark:bg-slate-900/60"
                  style={{ 
                    borderLeftWidth: '6px',
                    borderLeftColor: activeTeam.logoColor
                  }}
                >
                  <div className="space-y-1.5 flex-1 pl-1">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold font-mono" style={{ color: activeTeam.logoColor }}>
                      {activeTeam.division} Division Context
                    </span>
                    <h2 className="text-xl md:text-2xl font-serif font-bold italic text-slate-100 flex items-baseline gap-2">
                      {activeTeam.fullName}
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                        // War Room Active
                      </span>
                    </h2>
                    
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                      <div>
                        Primary Scheme: <span className="text-slate-300 font-semibold">{activeTeam.currentScheme}</span>
                      </div>
                      <div className="hidden sm:block text-slate-600">|</div>
                      <div>
                        Picks: <span className="text-emerald-500 font-mono font-bold">{activeTeam.draftPicks.join(', ')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Franchise Needs Badges */}
                  <div className="flex flex-col items-start md:items-end gap-1.5">
                    <span className="text-[9px] uppercase tracking-wider font-bold text-slate-500 font-mono">Priority Franchise Needs</span>
                    <div className="flex flex-wrap gap-1">
                      {activeTeam.needs.map(need => (
                        <span 
                          key={need} 
                          className={`text-xs px-2.5 py-1 rounded-none font-extrabold font-mono uppercase ${getContrastColor(activeTeam.logoColor)}`}
                          style={{ backgroundColor: activeTeam.logoColor }}
                        >
                          {need}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeScheme && (
                <div 
                  className="border-2 border-slate-800 bg-slate-900 p-5 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 rounded-none"
                >
                  <div className="space-y-1.5 flex-1">
                    <span className="text-[10px] uppercase tracking-wider font-bold font-mono text-emerald-400">
                      {activeScheme.type === 'offense' ? "OFFENSIVE" : "DEFENSIVE"} SCHEME BOARD
                    </span>
                    <h2 className="text-xl md:text-2xl font-serif font-bold italic text-slate-100 flex items-center gap-2">
                      {activeScheme.name} Configuration
                    </h2>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">{activeScheme.description}</p>
                  </div>

                  <div className="flex flex-col items-start md:items-end gap-1.5">
                    <span className="text-[9px] uppercase tracking-wider font-bold text-slate-500 font-mono">Favored Scheme Positions</span>
                    <div className="flex gap-1">
                      {activeScheme.favoredPositions.map(pos => (
                        <span 
                          key={pos} 
                          className="text-xs px-2.5 py-1 rounded-none font-extrabold font-mono bg-slate-950 text-slate-100 border border-slate-800 uppercase"
                        >
                          {pos}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Dynamic Board Ranker container */}
              <BoardRanker
                boardKey={activeBoardKey}
                players={players}
                orderedIds={getActiveBoardOrder()}
                onReorder={handleReorder}
                onSelectPlayer={setSelectedPlayer}
                onDeletePlayer={handleDeletePlayer}
                onCreateProspect={handleCreateProspect}
                activeTeam={activeTeam}
                activeScheme={activeScheme}
                customBoards={customBoards}
                onExportBoard={handleExportIndividualBoard}
                customLabels={customLabels}
                activeLabelFilter={activeLabelFilter}
                onClearLabelFilter={() => setActiveLabelFilter(null)}
              />
            </>
          )}

          {appMode === 'overview' && (
            <DraftClassOverview
              players={players}
              onSelectPlayer={setSelectedPlayer}
            />
          )}

          {appMode === 'draft_sim' && (
            <DraftSimulator
              players={players}
              orderedPlayerIds={getActiveBoardOrder()}
              onSelectPlayer={setSelectedPlayer}
              customLabels={customLabels}
            />
          )}

          {appMode === 'compare' && (
            <PlayerComparer
              players={players}
              onSelectPlayer={setSelectedPlayer}
            />
          )}

          {appMode === 'team_reports' && (
            <TeamReports
              onSelectPlayer={(playerName) => {
                const matched = players.find(p => p.name.trim().toLowerCase() === playerName.trim().toLowerCase());
                if (matched) setSelectedPlayer(matched);
              }}
            />
          )}

          {appMode === 'coaching_reports' && (
            <CoachingReports />
          )}

          {appMode === 'scouting_matrix' && (
            <PlayerRankingMatrix
              players={players}
              onSelectPlayer={setSelectedPlayer}
            />
          )}

          {/* Dynamic Source Citations Segment */}
          <CitedSources currentTab={appMode} />

        </main>
      </div>

      {/* 4. Player Profile Modal/Editor Overlay */}
      {selectedPlayer && (
        <PlayerProfileModal
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
          onSave={handleSavePlayer}
          teamContext={activeTeam}
          customLabels={customLabels}
          onAddCustomLabel={handleAddCustomLabel}
        />
      )}

      {/* 5. Data Hub (Import / Export) Modal Overlay */}
      {dataHubOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border-2 border-slate-800 rounded-none w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="border-b border-slate-800 p-5 flex items-center justify-between bg-slate-950/40">
              <div className="flex items-center gap-2.5">
                <FileJson className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-base font-serif font-bold italic text-slate-100">Draft Engine Data Hub</h3>
                  <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Import & Export Sandbox Assets</p>
                </div>
              </div>
              <button
                onClick={() => setDataHubOpen(false)}
                className="p-1 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="grid grid-cols-2 border-b border-slate-800 bg-slate-950/20 text-center font-mono text-xs">
              <button
                onClick={() => {
                  setDataHubTab('export');
                  setImportStatus(null);
                }}
                className={`py-3 flex items-center justify-center gap-1.5 font-bold uppercase transition-all border-r border-slate-800 ${
                  dataHubTab === 'export' ? "bg-slate-900/60 text-emerald-400 border-b-2 border-b-emerald-500" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Download className="w-4 h-4" />
                Export Assets
              </button>
              <button
                onClick={() => {
                  setDataHubTab('import');
                  setImportStatus(null);
                }}
                className={`py-3 flex items-center justify-center gap-1.5 font-bold uppercase transition-all ${
                  dataHubTab === 'import' ? "bg-slate-900/60 text-emerald-400 border-b-2 border-b-emerald-500" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Upload className="w-4 h-4" />
                Import Assets
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 flex-1 overflow-y-auto space-y-6">
              
              {dataHubTab === 'export' && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Export your scouting information, customized board rankings, and player properties as clean, portable JSON files. You can reload these files at any time on this or another browser.
                  </p>

                  <div className="grid grid-cols-1 gap-3">
                    {/* Export 1: Individual Board */}
                    <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-none flex items-center justify-between hover:border-slate-700 transition-all">
                      <div>
                        <span className="text-xs font-bold text-slate-200 block">Export Active Board Rankings</span>
                        <span className="text-[10px] text-slate-500 font-mono">Current Context: {activeBoardKey}</span>
                      </div>
                      <button
                        onClick={() => handleExportIndividualBoard(activeBoardKey, "Custom Active Board")}
                        className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white dark:text-slate-950 rounded-none text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1.5 border border-slate-800 transition-all"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Export Active
                      </button>
                    </div>

                    {/* Export 2: All Players (Draft Class) */}
                    <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-none flex items-center justify-between hover:border-slate-700 transition-all">
                      <div>
                        <span className="text-xs font-bold text-slate-200 block">Export Draft Class (Players Only)</span>
                        <span className="text-[10px] text-slate-500 font-mono">Export modified traits, AI commentary, and custom prospects</span>
                      </div>
                      <button
                        onClick={handleExportDraftClass}
                        className="px-3.5 py-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 rounded-none text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-400" />
                        Export Class
                      </button>
                    </div>

                    {/* Export 3: Complete Sandbox State */}
                    <div className="p-4 bg-slate-950/40 border border-emerald-500/20 rounded-none flex items-center justify-between hover:border-emerald-500/40 transition-all">
                      <div>
                        <span className="text-xs font-bold text-slate-200 block">Export Full Environment State</span>
                        <span className="text-[10px] text-slate-500 font-mono">Consolidates all custom boards, rankings, players, and settings</span>
                      </div>
                      <button
                        onClick={handleExportFullBackup}
                        className="px-3.5 py-1.5 bg-emerald-500/10 border border-emerald-500/40 hover:bg-emerald-500/20 text-emerald-400 rounded-none text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Export Backup
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {dataHubTab === 'import' && (
                <div className="space-y-5">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Import or update standard JSON files previously exported from ProspectEngine. Choose the type of import operation you would like to run:
                  </p>

                  <div className="grid grid-cols-1 gap-4">
                    {/* Option 1: Smart Update Measurables (Recommended) */}
                    <div className="border border-emerald-500/30 bg-emerald-500/[0.02] hover:border-emerald-500/50 p-4 transition-all relative flex flex-col justify-between">
                      <div className="space-y-1 mb-4">
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-emerald-400" />
                          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">
                            Smart Measurables Update (Recommended)
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-200">
                          Update Combine/Testing Numbers & Traits
                        </p>
                        <p className="text-[10px] text-slate-400 leading-normal">
                          Loads updated height, weight, athleticism/traits, and general information. <strong>Your existing custom scout notes, overall grades, and active/custom board rankings are fully preserved.</strong>
                        </p>
                      </div>

                      <div className="relative border border-dashed border-emerald-500/20 hover:border-emerald-500/40 bg-slate-950/40 py-4 px-3 text-center cursor-pointer transition-all">
                        <input
                          type="file"
                          accept=".json"
                          onChange={handleUpdateMeasurablesJsonFile}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <Upload className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                        <span className="text-[11px] font-bold text-slate-300 block">
                          Upload Update File
                        </span>
                        <span className="text-[9px] text-slate-500 font-mono mt-0.5 block">
                          Merge updated measurables
                        </span>
                      </div>
                    </div>

                    {/* Option 2: Full Asset Overwrite */}
                    <div className="border border-slate-800 hover:border-slate-700 bg-slate-950/20 p-4 transition-all relative flex flex-col justify-between">
                      <div className="space-y-1 mb-4">
                        <div className="flex items-center gap-1.5">
                          <Layers className="w-4 h-4 text-slate-500" />
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                            Standard Import
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-200">
                          Complete Database Overwrite
                        </p>
                        <p className="text-[10px] text-slate-400 leading-normal">
                          Completely loads the imported file's draft class players, custom boards, and rankings. <strong>Warning: This overwrites any local edits or custom notes.</strong>
                        </p>
                      </div>

                      <div className="relative border border-dashed border-slate-800 hover:border-slate-700 bg-slate-950/40 py-4 px-3 text-center cursor-pointer transition-all">
                        <input
                          type="file"
                          accept=".json"
                          onChange={handleImportJsonFile}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <Upload className="w-5 h-5 text-slate-500 mx-auto mb-1" />
                        <span className="text-[11px] font-bold text-slate-300 block">
                          Upload Overwrite File
                        </span>
                        <span className="text-[9px] text-slate-500 font-mono mt-0.5 block">
                          Fully replace local data
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  {importStatus && (
                    <div className={`p-4 rounded-none border text-xs leading-relaxed font-mono ${
                      importStatus.type === 'success' 
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        : "bg-red-500/10 border-red-500/30 text-red-400"
                    }`}>
                      <span className="font-bold block uppercase mb-1">
                        {importStatus.type === 'success' ? "✓ Operation Succeeded" : "✗ Operation Failed"}
                      </span>
                      {importStatus.message}
                    </div>
                  )}

                  <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-none text-[10px] text-amber-500/80 leading-normal">
                    <span className="font-bold uppercase block mb-0.5">⚠️ Data Notice:</span>
                    If you want to keep your custom evaluation work but load updated prospect athletic raw traits/measurables, use the <strong>Smart Measurables Update</strong> zone.
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-800 p-4 bg-slate-950/40 flex justify-end">
              <button
                onClick={() => setDataHubOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold font-mono uppercase tracking-wider rounded-none cursor-pointer transition-all"
              >
                Close Data Hub
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
