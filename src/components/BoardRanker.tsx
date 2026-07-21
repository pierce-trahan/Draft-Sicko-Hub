import React, { useState } from 'react';
import { Player, Team, Scheme } from '../types';
import { getPlayerPhotoUrl, getCollegeColors } from '../utils/playerPhotos';
import { 
  ArrowUp, ArrowDown, Edit3, Trash2, Search, SlidersHorizontal,
  Move, PlusCircle, HelpCircle, RefreshCw, Award, GripVertical, Download, Tag
} from 'lucide-react';
import { LabelDef, getLabelClasses } from '../utils/labels';

interface BoardRankerProps {
  boardKey: string; // "league", "team_GB", "pos_QB", "scheme_westcoast", etc.
  players: Player[];
  orderedIds: string[];
  onReorder: (newOrderedIds: string[]) => void;
  onSelectPlayer: (player: Player) => void;
  onDeletePlayer: (id: string) => void;
  onCreateProspect: () => void;
  activeTeam?: Team;
  activeScheme?: Scheme;
  customBoards?: Array<{ id: string; name: string }>;
  onExportBoard?: (boardKey: string, boardName: string) => void;
  customLabels?: LabelDef[];
  activeLabelFilter?: string | null;
  onClearLabelFilter?: () => void;
}

const PlayerAvatar = ({ player }: { player: Player }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const photoUrl = getPlayerPhotoUrl(player);
  const colors = getCollegeColors(player.school);
  const initials = player.name.split(' ').map(n => n[0]).join('');

  if (photoUrl && !imgFailed) {
    return (
      <div className="w-10 h-10 rounded-none bg-slate-950 border shrink-0 overflow-hidden relative" style={{ borderColor: colors.secondary }}>
        <img
          src={photoUrl}
          alt={player.name}
          className="w-full h-full object-cover object-top"
          referrerPolicy="no-referrer"
          onError={() => setImgFailed(true)}
        />
      </div>
    );
  }

  return (
    <div 
      className="w-10 h-10 rounded-none flex items-center justify-center font-mono font-bold text-xs shrink-0 border"
      style={{ 
        backgroundColor: colors.primary, 
        borderColor: colors.secondary,
        color: colors.text
      }}
    >
      {initials}
    </div>
  );
};

export default function BoardRanker({
  boardKey,
  players,
  orderedIds,
  onReorder,
  onSelectPlayer,
  onDeletePlayer,
  onCreateProspect,
  activeTeam,
  activeScheme,
  customBoards,
  onExportBoard,
  customLabels = [],
  activeLabelFilter = null,
  onClearLabelFilter
}: BoardRankerProps) {
  // Search and position filtering state
  const [searchQuery, setSearchQuery] = useState('');
  const [positionFilter, setPositionFilter] = useState('ALL');

  // Drag and drop tracking
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Parse and match the players with the ordered list
  // 1. Get only players that exist in the database
  const playerMap = new Map(players.map(p => [p.id, p]));
  
  // 2. Build the current ordered list for the active board context
  let orderedPlayers: Player[] = [];
  const orderedSet = new Set<string>();

  // Add players in their ranked order
  orderedIds.forEach(id => {
    const p = playerMap.get(id);
    if (p) {
      orderedPlayers.push(p);
      orderedSet.add(id);
    }
  });

  // Append any players that are NOT yet in the order list (e.g., newly created custom players)
  players.forEach(p => {
    if (!orderedSet.has(p.id)) {
      orderedPlayers.push(p);
    }
  });

  // Filter by position context if this is a custom Position Board, OR if a manual position filter is active
  const isDedicatedPositionBoard = boardKey.startsWith('pos_');
  const targetPosition = isDedicatedPositionBoard ? boardKey.split('_')[1] : null;

  // Perform search and filter
  const filteredPlayers = orderedPlayers.filter((player, index) => {
    // If it's a dedicated position board, strictly filter by position first
    if (targetPosition && player.position !== targetPosition && !player.position.includes(targetPosition)) {
      return false;
    }

    // Apply active sidebar position filter if in other board contexts
    if (!isDedicatedPositionBoard && positionFilter !== 'ALL' && player.position !== positionFilter && !player.position.includes(positionFilter)) {
      return false;
    }

    // Apply active label filter if present
    if (activeLabelFilter) {
      if (!player.labels || !player.labels.includes(activeLabelFilter)) {
        return false;
      }
    }

    // Apply search query
    const searchLower = searchQuery.toLowerCase();
    const nameMatch = player.name.toLowerCase().includes(searchLower);
    const schoolMatch = player.school.toLowerCase().includes(searchLower);
    const posMatch = player.position.toLowerCase().includes(searchLower);
    
    return nameMatch || schoolMatch || posMatch;
  });

  // Ranking action: move player up
  const moveUp = (index: number) => {
    if (index === 0) return;
    const newOrder = [...filteredPlayers];
    const temp = newOrder[index];
    newOrder[index] = newOrder[index - 1];
    newOrder[index - 1] = temp;
    updateParentOrder(newOrder);
  };

  // Ranking action: move player down
  const moveDown = (index: number) => {
    if (index === filteredPlayers.length - 1) return;
    const newOrder = [...filteredPlayers];
    const temp = newOrder[index];
    newOrder[index] = newOrder[index + 1];
    newOrder[index + 1] = temp;
    updateParentOrder(newOrder);
  };

  // Ranking action: jump player directly to rank index
  const handleJumpToRank = (currentIndex: number, rankStr: string) => {
    const targetRank = parseInt(rankStr);
    if (isNaN(targetRank) || targetRank < 1 || targetRank > filteredPlayers.length) return;
    
    const targetIndex = targetRank - 1;
    if (currentIndex === targetIndex) return;

    const newOrder = [...filteredPlayers];
    const [movedPlayer] = newOrder.splice(currentIndex, 1);
    newOrder.splice(targetIndex, 0, movedPlayer);
    
    updateParentOrder(newOrder);
  };

  // Helper to push updated orders up to parent storage
  const updateParentOrder = (newOrderedList: Player[]) => {
    // If we're filtering, we must merge with the original complete list to preserve out-of-filter items
    const visibleIds = newOrderedList.map(p => p.id);
    const visibleIdSet = new Set(visibleIds);
    
    // Non-visible IDs stay in their original relative positions at the end
    const nonVisibleIds = orderedPlayers.filter(p => !visibleIdSet.has(p.id)).map(p => p.id);
    onReorder([...visibleIds, ...nonVisibleIds]);
  };

  // HTML5 Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // Required for Firefox drag support
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    // Rearrange in real-time for tactile drag feel
    const newOrder = [...filteredPlayers];
    const [draggedItem] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(index, 0, draggedItem);
    
    setDraggedIndex(index);
    updateParentOrder(newOrder);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Quick reset to overall ratings default
  const handleResetToRatings = () => {
    if (window.confirm("Are you sure you want to reset this board's rankings to the consensus prospect grade defaults?")) {
      const defaultOrder = [...players]
        .sort((a, b) => b.overallGrade - a.overallGrade)
        .map(p => p.id);
      onReorder(defaultOrder);
    }
  };

  // Render positions filters (Only if not a dedicated position board)
  const positionOptions = ['ALL', 'QB', 'RB', 'WR', 'TE', 'OT', 'IOL', 'EDGE', 'DT', 'LB', 'CB', 'S'];

  const customBoardObj = boardKey.startsWith('custom_') 
    ? customBoards?.find(b => b.id === boardKey.replace('custom_', ''))
    : null;
  const activeBoardName = activeTeam 
    ? `${activeTeam.fullName} Big Board` 
    : activeScheme 
      ? `${activeScheme.name} Big Board` 
      : isDedicatedPositionBoard 
        ? `${targetPosition} Prospect Rankings` 
        : customBoardObj 
          ? customBoardObj.name 
          : boardKey === 'my_board' 
            ? "My Custom Big Board" 
            : "NFL Consensus Big Board";

  return (
    <div className="bg-slate-950 border-2 border-slate-800 rounded-none p-5 md:p-6 space-y-5">
      
      {/* Board Header details */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl md:text-2xl font-serif font-bold italic text-slate-100 flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-500" />
              {activeBoardName}
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-none bg-slate-900 border border-slate-800 text-slate-400 font-mono font-bold">
              {filteredPlayers.length} Prospects
            </span>
          </div>
          {activeTeam && (
            <p className="text-xs text-slate-400 mt-1">
              Active team-specific board. Primary Team Needs: <span className="text-emerald-500 font-semibold">{activeTeam.needs.join(', ')}</span> | Scheme: <span className="text-slate-300 italic">{activeTeam.currentScheme}</span>
            </p>
          )}
          {activeScheme && (
            <p className="text-xs text-slate-400 mt-1">
              Active scheme board. Favored attributes: <span className="text-emerald-500 font-semibold">{activeScheme.favoredPositions.join(', ')}</span>. {activeScheme.description}
            </p>
          )}
          {!activeTeam && !activeScheme && !isDedicatedPositionBoard && (
            <p className="text-xs text-slate-400 mt-1">
              {boardKey === 'my_board' 
                ? "Your custom-ordered rankings. Drag and drop prospects or use keys to rank your board."
                : boardKey.startsWith('custom_')
                  ? `Your customized board rankings for "${activeBoardName}". Drag and drop prospects to rank.`
                  : "Consensus league-wide rankings. Filter or re-order players as desired."}
            </p>
          )}
        </div>

        {/* Board actions */}
        <div className="flex flex-wrap gap-2">
          {onExportBoard && (
            <button
              onClick={() => onExportBoard(boardKey, activeBoardName)}
              className="px-3.5 py-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:text-white rounded-none text-xs font-bold text-slate-400 transition-all flex items-center gap-1.5"
              title="Export this board's rankings individually"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              Export Board
            </button>
          )}

          <button
            onClick={handleResetToRatings}
            className="px-3.5 py-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:text-white rounded-none text-xs font-bold text-slate-400 transition-all flex items-center gap-1.5"
            title="Reset active board to match overall scout grades"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Rankings
          </button>
          
          <button
            onClick={onCreateProspect}
            className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-none text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-800"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Create Prospect
          </button>
        </div>
      </div>

      {/* Search and manual filtering row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search players by name, school, or position..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/60 border border-slate-800 focus:border-emerald-500 focus:outline-none rounded-none pl-9 pr-4 py-2 text-xs text-slate-200"
          />
        </div>

        {/* Position filters (hidden on dedicated position boards since position is fixed) */}
        {!isDedicatedPositionBoard && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
            <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1 shrink-0 font-mono">
              <SlidersHorizontal className="w-3 h-3" /> Filter:
            </span>
            <div className="flex gap-1">
              {positionOptions.map(pos => (
                <button
                  key={pos}
                  onClick={() => setPositionFilter(pos)}
                  className={`px-2 py-1 rounded-none text-[10px] font-bold font-mono transition-all ${
                    positionFilter === pos
                      ? "bg-emerald-500/20 text-emerald-500 border border-slate-800"
                      : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {activeLabelFilter && (
        <div className="flex items-center gap-2.5 px-4 py-2.5 bg-emerald-500/5 border-l-4 border-emerald-500 border-y border-r border-slate-800 text-xs text-slate-200 font-mono">
          <Tag className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span>Active Label Filter:</span>
          <span className="font-bold text-emerald-400 bg-slate-900 px-1.5 py-0.5 border border-slate-800 uppercase tracking-wider text-[10px]">
            {activeLabelFilter}
          </span>
          <button 
            onClick={onClearLabelFilter}
            className="ml-auto text-[10px] text-slate-400 hover:text-white underline uppercase cursor-pointer font-bold"
          >
            Clear Filter
          </button>
        </div>
      )}

      {/* Rankings List */}
      {filteredPlayers.length === 0 ? (
        <div className="border border-dashed border-slate-800 rounded-2xl py-12 px-4 text-center">
          <p className="text-sm text-slate-400 font-medium">No prospects found matching your criteria.</p>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your filters or search terms, or create a custom prospect!</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
          {filteredPlayers.map((player, index) => {
            const actualRank = index + 1;
            
            return (
              <div
                key={player.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`flex flex-col lg:flex-row items-stretch lg:items-center justify-between p-3 bg-slate-955/60 dark:bg-slate-955 border hover:bg-slate-900 transition-all ${
                  draggedIndex === index 
                    ? "border-emerald-500 bg-slate-900 scale-[0.98] opacity-75 rounded-none" 
                    : "border-slate-800 rounded-none"
                }`}
              >
                
                {/* Left Block: Drag Handle, Rank, Player Basic Info */}
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  {/* Native Drag Grip Icon */}
                  <div 
                    className="cursor-grab text-slate-500 hover:text-slate-700 active:cursor-grabbing shrink-0"
                    title="Drag and drop to re-rank"
                  >
                    <GripVertical className="w-4 h-4" />
                  </div>

                  {/* Rank Badge & direct rank jump */}
                  <div className="flex flex-col items-center justify-center shrink-0 w-11 h-11 bg-slate-900 border border-slate-800 rounded-none">
                    <span className="text-[9px] font-mono text-slate-500 leading-none">RANK</span>
                    <select
                      value={actualRank}
                      onChange={(e) => handleJumpToRank(index, e.target.value)}
                      className="text-xs font-bold font-mono text-emerald-500 bg-transparent border-none focus:outline-none focus:ring-0 p-0 text-center cursor-pointer"
                      title="Click to jump to another rank directly"
                    >
                      {Array.from({ length: filteredPlayers.length }).map((_, rIdx) => (
                        <option key={rIdx} value={rIdx + 1} className="bg-slate-950 text-slate-100 font-mono font-bold">
                          #{rIdx + 1}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Player Avatar or fallbacks */}
                  <PlayerAvatar player={player} />

                  {/* Player text */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-bold italic text-base text-slate-100 hover:text-emerald-500 cursor-pointer whitespace-nowrap" onClick={() => onSelectPlayer(player)}>
                        {player.name}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-none bg-slate-950 text-slate-300 font-mono font-bold shrink-0 border border-slate-800">
                        {player.position}
                      </span>
                      {player.archetype && (
                        <span className={`text-[8px] px-1.5 py-0.5 border font-mono font-bold shrink-0 uppercase tracking-wide rounded-none ${
                          player.archetype === 'Day 1 Starter' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                          player.archetype === 'Blue Chip Prospect' ? 'bg-teal-500/10 text-teal-400 border-teal-500/30' :
                          player.archetype === 'Raw Developmental' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' :
                          player.archetype === 'Specialist' ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' :
                          player.archetype === 'High Floor Starter' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                          player.archetype === 'Boom-or-Bust' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
                          player.archetype === 'Sleeper' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' :
                          'bg-slate-500/10 text-slate-400 border-slate-500/30'
                        }`}>
                          {player.archetype}
                        </span>
                      )}
                      {player.isCustom && (
                        <span className="text-[8px] px-1 bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 rounded-none font-bold shrink-0 uppercase tracking-wide">
                          Custom
                        </span>
                      )}
                      {player.labels && player.labels.map(labelName => {
                        const matchedLabel = customLabels?.find(l => l.name === labelName);
                        const classes = matchedLabel ? getLabelClasses(matchedLabel.colorName) : 'bg-slate-500/10 text-slate-400 border-slate-500/20';
                        return (
                          <span 
                            key={labelName}
                            className={`text-[8px] px-1.5 py-0.5 border font-mono font-bold shrink-0 uppercase tracking-wide rounded-none flex items-center gap-1.5 ${classes}`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: matchedLabel?.color || '#64748b' }} />
                            {labelName}
                          </span>
                        );
                      })}
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5 truncate">
                      <span className="font-medium text-slate-300">{player.school}</span>
                      <span>•</span>
                      <span>{player.height}, {player.weight} lbs</span>
                      <span>•</span>
                      <span className="font-mono">{player.year}</span>
                    </div>
                  </div>
                </div>

                {/* Center Block: Media Big Board Locations List (disappears when screen is small) */}
                <div className="hidden xl:flex my-3 lg:my-0 lg:px-6 flex-wrap gap-1.5 max-w-full overflow-hidden justify-start lg:justify-center">
                  {[
                    "Dane Brugler (The Athletic)",
                    "Daniel Jeremiah (NFL Network)",
                    "Danny Kelly (The Ringer)",
                    "NFLSE (Trevor Sikkema)",
                    "Mel Kiper Jr. (ESPN)"
                  ].map((boardName) => {
                    const info = player.bigBoards?.[boardName] || player.bigBoards?.["PFF (Pro Football Focus)"];
                    if (!info) return null;
                    
                    const shortBoard = boardName.split(' ')[0]; // E.g. "Dane" or "Daniel" or "Danny" or "NFLSE" or "Mel"
                    const boardLabel = 
                      shortBoard === "Mel" ? "Kiper" : 
                      shortBoard === "Dane" ? "Brugler" : 
                      shortBoard === "Daniel" ? "Jeremiah" : 
                      shortBoard === "Danny" ? "Kelly" : 
                      shortBoard === "NFLSE" ? "NFLSE" : 
                      shortBoard;

                    return (
                      <div 
                        key={boardName} 
                        className="text-[10px] px-2 py-1 rounded-none bg-slate-950 border border-slate-800 font-mono text-slate-400 flex items-center gap-1 shrink-0"
                        title={`${boardName} rank: #${info.rank}`}
                      >
                        <span className="text-[9px] font-bold text-slate-500">{boardLabel}:</span>
                        <span className="font-bold text-emerald-500">#{info.rank}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Right Block: Grade & Controls */}
                <div className="flex items-center justify-between lg:justify-end gap-4 shrink-0 border-t lg:border-t-0 border-slate-800 pt-2 lg:pt-0">
                  {/* Grade */}
                  <div className="flex flex-col items-start lg:items-end">
                    <span className="text-[9px] text-slate-500 uppercase font-mono font-bold leading-none">Scout Grade</span>
                    <span className="text-sm font-bold font-mono text-emerald-500 mt-0.5">{player.overallGrade}</span>
                  </div>

                  {/* Arrow move commands (helpful on touch devices where drag is tough) */}
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => moveUp(index)}
                      disabled={index === 0}
                      className="p-1.5 text-slate-400 hover:text-white disabled:text-slate-750 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-none transition-all"
                      title="Move Rank Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => moveDown(index)}
                      disabled={index === filteredPlayers.length - 1}
                      className="p-1.5 text-slate-400 hover:text-white disabled:text-slate-750 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-none transition-all"
                      title="Move Rank Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Actions (Edit / Trash) */}
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => onSelectPlayer(player)}
                      className="p-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-300 hover:text-white rounded-none transition-all"
                      title="Edit Profile"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeletePlayer(player.id)}
                      className="p-1.5 bg-slate-950 border border-slate-800 hover:bg-red-950/20 text-slate-500 hover:text-red-600 rounded-none transition-all"
                      title="Delete Prospect"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Helpful legend banner */}
      <div className="bg-slate-900/30 border border-slate-800/50 p-3 rounded-xl flex items-start gap-2.5">
        <HelpCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
        <p className="text-[10px] text-slate-400 leading-relaxed">
          <strong>Draft Board Mechanic:</strong> Drag prospects by their <Move className="w-3 h-3 inline-block" /> grip dots or click their <span className="text-emerald-400 font-mono font-bold"># Rank Selectors</span> to jump them to any ranking immediately. Changes made to any board are instantly saved to your browser session. Clicking reset will re-order players by their scouting grades.
        </p>
      </div>

    </div>
  );
}
