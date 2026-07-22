import React, { useState } from 'react';
import { Player, Team } from '../types';
import { NFL_TEAMS } from '../data/teams';
import RadarChart from './RadarChart';
import TrendLineChart from './TrendLineChart';
import { getDraftRange } from '../utils/draftValue';
import { getPlayerPhotoUrl, getCollegeColors } from '../utils/playerPhotos';
import { 
  X, Plus, Trash2, Sparkles, Check, Edit3, 
  RotateCcw, ShieldCheck, ChevronDown, ListPlus, Award, User, HelpCircle, Tag
} from 'lucide-react';
import { LabelDef, PRESET_COLORS, getLabelClasses, getLabelHex } from '../utils/labels';

interface PlayerProfileModalProps {
  player: Player;
  onClose: () => void;
  onSave: (updatedPlayer: Player) => void;
  teamContext?: Team; // Optional team context if we want to default to team scheme fits
  customLabels: LabelDef[];
  onAddCustomLabel: (newLabel: LabelDef) => void;
}

export default function PlayerProfileModal({ 
  player, 
  onClose, 
  onSave,
  teamContext,
  customLabels,
  onAddCustomLabel
}: PlayerProfileModalProps) {
  // Local state for all customizable player attributes
  const [editedPlayer, setEditedPlayer] = useState<Player>({ ...player });
  const [newStrength, setNewStrength] = useState('');
  const [newWeakness, setNewWeakness] = useState('');

  // Custom labels state
  const [isAddingLabel, setIsAddingLabel] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState<'emerald' | 'rose' | 'cyan' | 'amber' | 'violet' | 'pink' | 'slate'>('emerald');
  const [labelError, setLabelError] = useState('');

  const handleCreateCustomLabel = () => {
    if (!newLabelName.trim()) {
      setLabelError('Label name cannot be empty');
      return;
    }
    const sanitized = newLabelName.trim();
    if (customLabels.some(l => l.name.toLowerCase() === sanitized.toLowerCase())) {
      setLabelError('A label with this name already exists');
      return;
    }

    const newLabelObj = {
      name: sanitized,
      color: getLabelHex(newLabelColor),
      colorName: newLabelColor
    };

    onAddCustomLabel(newLabelObj);
    
    // Also auto-select it on this player!
    const currentLabels = editedPlayer.labels || [];
    setEditedPlayer({
      ...editedPlayer,
      labels: [...currentLabels, sanitized]
    });

    setIsAddingLabel(false);
    setNewLabelName('');
    setLabelError('');
  };
  
  // AI Generation state
  const [selectedExpert, setSelectedExpert] = useState<string>("Dane Brugler (The Athletic)");
  const [selectedTeamId, setSelectedTeamId] = useState<string>(teamContext?.id || "");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedComment, setGeneratedComment] = useState("");
  const [generatedUrl, setGeneratedUrl] = useState("");
  const [generatedSourceName, setGeneratedSourceName] = useState("");
  const [generatedDateStr, setGeneratedDateStr] = useState("");
  const [generationError, setGenerationError] = useState("");
  const [aiAccordionOpen, setAiAccordionOpen] = useState(false);

  // Live media search loading and error states for each expert
  const [individualLoading, setIndividualLoading] = useState<Record<string, boolean>>({});
  const [individualError, setIndividualError] = useState<Record<string, string>>({});

  const handleTraitChange = (key: keyof Player['traits'], value: number) => {
    const updatedTraits = { ...editedPlayer.traits, [key]: value };
    // Calculate a dynamic overall grade based on the average of traits, or keep it custom
    const traitAverage = Math.round(
      (updatedTraits.athleticism + 
       updatedTraits.technique + 
       updatedTraits.production + 
       updatedTraits.footballIQ + 
       updatedTraits.sizeAndFrame) / 5
    );
    
    setEditedPlayer({
      ...editedPlayer,
      traits: updatedTraits,
      overallGrade: traitAverage // Automatically adjust overall grade when traits shift, highly convenient!
    });
  };

  const handleAddField = (type: 'strengths' | 'weaknesses') => {
    const text = type === 'strengths' ? newStrength : newWeakness;
    if (!text.trim()) return;

    setEditedPlayer({
      ...editedPlayer,
      [type]: [...(editedPlayer[type] || []), text.trim()]
    });

    if (type === 'strengths') setNewStrength('');
    else setNewWeakness('');
  };

  const handleRemoveField = (type: 'strengths' | 'weaknesses', index: number) => {
    const list = [...(editedPlayer[type] || [])];
    list.splice(index, 1);
    setEditedPlayer({
      ...editedPlayer,
      [type]: list
    });
  };

  const handleBigBoardRankChange = (board: string, rank: number) => {
    setEditedPlayer({
      ...editedPlayer,
      bigBoards: {
        ...editedPlayer.bigBoards,
        [board]: {
          ...editedPlayer.bigBoards[board],
          rank: Math.max(1, rank)
        }
      }
    });
  };

  const handleBigBoardCommentChange = (
    board: string, 
    comment: string, 
    url?: string, 
    sourceName?: string, 
    isRealQuote?: boolean,
    dateStr?: string
  ) => {
    setEditedPlayer({
      ...editedPlayer,
      bigBoards: {
        ...editedPlayer.bigBoards,
        [board]: {
          ...editedPlayer.bigBoards[board],
          comment,
          ...(url !== undefined && { url }),
          ...(sourceName !== undefined && { sourceName }),
          ...(isRealQuote !== undefined && { isRealQuote }),
          ...(dateStr !== undefined && { dateStr })
        }
      }
    });
  };

  // Call Express Backend API to run server-side Gemini media search & parse
  const handleGenerateAIComment = async () => {
    setIsGenerating(true);
    setGenerationError("");
    setGeneratedComment("");
    setGeneratedUrl("");
    setGeneratedSourceName("");
    setGeneratedDateStr("");

    const targetTeam = NFL_TEAMS.find(t => t.id === selectedTeamId);

    try {
      const response = await fetch('/api/gemini/generate-scout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player: editedPlayer,
          expert: selectedExpert,
          targetTeam: targetTeam || null
        })
      });

      if (!response.ok) {
        throw new Error('Failed to search live media commentary.');
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setGeneratedComment(data.comment);
      setGeneratedUrl(data.url || "");
      setGeneratedSourceName(data.sourceName || "");
      setGeneratedDateStr(data.dateStr || "");
    } catch (err: any) {
      console.error(err);
      setGenerationError(err.message || "Something went wrong searching and parsing media.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Trigger individual search grounding directly on an expert's block
  const handleUpdateLivePerspective = async (boardName: string) => {
    setIndividualLoading(prev => ({ ...prev, [boardName]: true }));
    setIndividualError(prev => ({ ...prev, [boardName]: "" }));
    
    try {
      const response = await fetch('/api/gemini/generate-scout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player: editedPlayer,
          expert: boardName,
          targetTeam: null
        })
      });

      if (!response.ok) {
        throw new Error('Server connection issue.');
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      handleBigBoardCommentChange(
        boardName,
        data.comment,
        data.url,
        data.sourceName,
        true,
        data.dateStr || "Recent"
      );
    } catch (err: any) {
      console.error(err);
      setIndividualError(prev => ({ 
        ...prev, 
        [boardName]: err.message || "Failed to parse recent media quotes." 
      }));
    } finally {
      setIndividualLoading(prev => ({ ...prev, [boardName]: false }));
    }
  };

  const handleApplyGeneratedComment = () => {
    if (!generatedComment) return;
    handleBigBoardCommentChange(
      selectedExpert, 
      generatedComment, 
      generatedUrl, 
      generatedSourceName, 
      true, 
      generatedDateStr
    );
    setGeneratedComment("");
    setGeneratedUrl("");
    setGeneratedSourceName("");
    setGeneratedDateStr("");
    setAiAccordionOpen(false);
  };

  const handleSave = () => {
    let updatedHistory = [...(editedPlayer.gradeHistory || [])];
    
    // If the overall grade changed from the original grade
    if (editedPlayer.overallGrade !== player.overallGrade) {
      // Find the "Current" or "Pre-Draft" entry, and update its grade
      updatedHistory = updatedHistory.map(point => {
        if (point.milestone === 'Pre-Draft' || point.date === 'Current') {
          return { ...point, grade: editedPlayer.overallGrade };
        }
        return point;
      });

      // Also append a new history point for this specific manual edit with a real date/time timestamp!
      const currentLabel = `Scout Edit #${updatedHistory.filter(h => h.milestone.startsWith('Scout Edit')).length + 1}`;
      const nowStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      
      // Place it right before "Pre-Draft" or at the end of the history
      const currentIdx = updatedHistory.findIndex(point => point.milestone === 'Pre-Draft' || point.date === 'Current');
      if (currentIdx !== -1) {
        updatedHistory.splice(currentIdx, 0, {
          milestone: currentLabel,
          date: nowStr,
          grade: editedPlayer.overallGrade
        });
      } else {
        updatedHistory.push({
          milestone: currentLabel,
          date: nowStr,
          grade: editedPlayer.overallGrade
        });
      }
    } else {
      // Just align Pre-Draft grade with current overallGrade to keep them synced
      updatedHistory = updatedHistory.map(point => {
        if (point.milestone === 'Pre-Draft' || point.date === 'Current') {
          return { ...point, grade: editedPlayer.overallGrade };
        }
        return point;
      });
    }

    onSave({
      ...editedPlayer,
      gradeHistory: updatedHistory
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-950 border-2 border-slate-800 rounded-none shadow-none overflow-hidden flex flex-col my-8 max-h-[90vh]">
        
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b-2 border-slate-800">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-500" />
            <span className="text-sm font-bold font-mono text-slate-400 uppercase tracking-wider">Prospect Scouting Profile Editor</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-none border border-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
          
          {/* Section 1: Basic Info customization */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 md:p-6">
            <h3 className="text-base font-semibold text-slate-100 mb-4 flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-500" />
                Custom Demographics & Overall Grade
              </span>
              {editedPlayer.archetype && (
                <span className={`px-2.5 py-0.5 text-[11px] font-bold font-mono border rounded-none uppercase tracking-wider ${
                  editedPlayer.archetype === 'Day 1 Starter' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                  editedPlayer.archetype === 'Blue Chip Prospect' ? 'bg-teal-500/10 text-teal-400 border-teal-500/30' :
                  editedPlayer.archetype === 'Raw Developmental' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' :
                  editedPlayer.archetype === 'Specialist' ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' :
                  editedPlayer.archetype === 'High Floor Starter' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                  editedPlayer.archetype === 'Boom-or-Bust' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
                  editedPlayer.archetype === 'Sleeper' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' :
                  'bg-slate-500/10 text-slate-400 border-slate-500/30'
                }`}>
                  {editedPlayer.archetype}
                </span>
              )}
            </h3>
            
            <div className="flex flex-col md:flex-row gap-6">
              {/* Photo & Branding Card */}
              <div className="w-full md:w-1/4 flex flex-col items-center bg-slate-950/80 border border-slate-800/80 p-4 rounded-xl shrink-0">
                <div className="text-xs font-bold font-mono text-slate-500 uppercase tracking-wider mb-3">Roster Headshot</div>
                
                {/* Large Player Photo/Fallback */}
                <div className="w-32 h-32 rounded-lg border-2 overflow-hidden bg-slate-900 relative flex items-center justify-center shrink-0 mb-4 shadow-lg transition-transform hover:scale-105"
                     style={{ borderColor: getCollegeColors(editedPlayer.school).secondary }}>
                  {(() => {
                    const photo = getPlayerPhotoUrl(editedPlayer);
                    if (photo) {
                      return (
                        <img 
                          src={photo} 
                          alt={editedPlayer.name}
                          className="w-full h-full object-cover object-top"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            // If load fails, hide image and show initials fallback
                            (e.target as HTMLElement).style.display = 'none';
                            const fallback = (e.target as HTMLElement).nextElementSibling;
                            if (fallback) (fallback as HTMLElement).style.display = 'flex';
                          }}
                        />
                      );
                    }
                    return null;
                  })()}
                  {/* Initials Fallback */}
                  <div 
                    className="absolute inset-0 flex items-center justify-center font-mono font-bold text-3xl"
                    style={{ 
                      backgroundColor: getCollegeColors(editedPlayer.school).primary,
                      color: getCollegeColors(editedPlayer.school).text,
                      display: getPlayerPhotoUrl(editedPlayer) ? 'none' : 'flex'
                    }}
                  >
                    {editedPlayer.name.split(' ').map(n => n[0]).join('')}
                  </div>
                </div>

                {/* College Brand Pill */}
                <div 
                  className="px-3 py-1 text-xs font-bold font-mono uppercase tracking-wide border rounded-full mb-4 flex items-center gap-1.5 text-center justify-center max-w-full truncate"
                  style={{ 
                    backgroundColor: getCollegeColors(editedPlayer.school).primary,
                    borderColor: getCollegeColors(editedPlayer.school).secondary,
                    color: getCollegeColors(editedPlayer.school).text
                  }}
                  title={editedPlayer.school}
                >
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: getCollegeColors(editedPlayer.school).secondary }} />
                  <span className="truncate">{editedPlayer.school}</span>
                </div>

                {/* Custom Photo URL Input */}
                <div className="w-full mt-2">
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Custom Image URL</label>
                  <input
                    type="text"
                    placeholder="Paste website photo URL..."
                    value={editedPlayer.photoUrl || ''}
                    onChange={(e) => setEditedPlayer({ ...editedPlayer, photoUrl: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-850 focus:border-emerald-500 focus:outline-none rounded-lg px-2 py-1.5 text-xs text-slate-100 placeholder-slate-600"
                    title="Paste an image URL from college athletic roster or sports news sites"
                  />
                </div>
              </div>

              {/* Right Side: Demographics Form Fields */}
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Player Name</label>
                    <input
                      type="text"
                      value={editedPlayer.name}
                      onChange={(e) => setEditedPlayer({ ...editedPlayer, name: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 focus:outline-none rounded-lg px-3 py-2 text-sm text-slate-100"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Position</label>
                    <select
                      value={editedPlayer.position}
                      onChange={(e) => setEditedPlayer({ ...editedPlayer, position: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 focus:outline-none rounded-lg px-3 py-2 text-sm text-slate-100"
                    >
                      <option value="QB">QB - Quarterback</option>
                      <option value="RB">RB - Running Back</option>
                      <option value="WR">WR - Wide Receiver</option>
                      <option value="TE">TE - Tight End</option>
                      <option value="OT">OT - Offensive Tackle</option>
                      <option value="IOL">IOL - Interior Offensive Line</option>
                      <option value="EDGE">EDGE - Edge Rusher</option>
                      <option value="DT">DT - Defensive Tackle</option>
                      <option value="LB">LB - Linebacker</option>
                      <option value="CB">CB - Cornerback</option>
                      <option value="S">S - Safety</option>
                      <option value="CB/WR">CB/WR - Two-Way Athlete</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">College Program</label>
                    <input
                      type="text"
                      value={editedPlayer.school}
                      onChange={(e) => setEditedPlayer({ ...editedPlayer, school: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 focus:outline-none rounded-lg px-3 py-2 text-sm text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Height</label>
                    <input
                      type="text"
                      placeholder="e.g. 6'2"
                      value={editedPlayer.height}
                      onChange={(e) => setEditedPlayer({ ...editedPlayer, height: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 focus:outline-none rounded-lg px-3 py-2 text-sm text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Weight (lbs)</label>
                    <input
                      type="number"
                      value={editedPlayer.weight}
                      onChange={(e) => setEditedPlayer({ ...editedPlayer, weight: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 focus:outline-none rounded-lg px-3 py-2 text-sm text-slate-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-800/50">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Eligibility Year</label>
                    <select
                      value={editedPlayer.year}
                      onChange={(e) => setEditedPlayer({ ...editedPlayer, year: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 focus:outline-none rounded-lg px-3 py-2 text-sm text-slate-100"
                    >
                      <option value="Fr">Fr - Freshman</option>
                      <option value="So">So - Sophomore</option>
                      <option value="Jr">Jr - Junior</option>
                      <option value="Sr">Sr - Senior</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Prospect Archetype</label>
                    <select
                      value={editedPlayer.archetype || ''}
                      onChange={(e) => setEditedPlayer({ ...editedPlayer, archetype: e.target.value || undefined })}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 focus:outline-none rounded-lg px-3 py-2 text-sm text-slate-100"
                    >
                      <option value="">None - Untagged</option>
                      <option value="Blue Chip Prospect">Blue Chip Prospect</option>
                      <option value="Day 1 Starter">Day 1 Starter</option>
                      <option value="High Floor Starter">High Floor Starter</option>
                      <option value="Raw Developmental">Raw Developmental</option>
                      <option value="Boom-or-Bust">Boom-or-Bust</option>
                      <option value="Specialist">Specialist</option>
                      <option value="Sleeper">Sleeper</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1 flex justify-between uppercase tracking-wide">
                      <span>Overall Scout Grade</span>
                      <span className="text-emerald-400 font-mono font-bold">{editedPlayer.overallGrade}/99</span>
                    </label>
                    <input
                      type="range"
                      min="50"
                      max="99"
                      value={editedPlayer.overallGrade}
                      onChange={(e) => setEditedPlayer({ ...editedPlayer, overallGrade: parseInt(e.target.value) })}
                      className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer mt-2.5"
                    />
                    <div className="text-[10px] space-y-1 mt-1">
                      <p className="text-slate-500">
                        Adjusting core traits below will auto-calculate an average score, or override here.
                      </p>
                      <div className="flex justify-between items-center bg-slate-900/80 p-2 border border-slate-800/60 rounded">
                        <span className="text-[9px] text-slate-400 uppercase font-mono font-bold">Projected Draft Range:</span>
                        <span className={`font-mono font-bold uppercase tracking-wider ${getDraftRange(editedPlayer.overallGrade).color}`}>
                          {getDraftRange(editedPlayer.overallGrade).range}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Player Labels selection section */}
            <div className="border-t border-slate-800/50 mt-5 pt-4">
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-emerald-500" />
                Player Labels
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {customLabels.map((label) => {
                  const isSelected = editedPlayer.labels?.includes(label.name);
                  const classes = getLabelClasses(label.colorName);
                  return (
                    <button
                      key={label.name}
                      type="button"
                      onClick={() => {
                        const currentLabels = editedPlayer.labels || [];
                        const updated = currentLabels.includes(label.name)
                          ? currentLabels.filter(l => l !== label.name)
                          : [...currentLabels, label.name];
                        setEditedPlayer({ ...editedPlayer, labels: updated });
                      }}
                      className={`px-3 py-1 text-xs font-bold font-mono uppercase tracking-wide border cursor-pointer transition-all flex items-center gap-1 ${
                        isSelected 
                          ? `${classes} ring-1 ring-emerald-500/40 opacity-100 scale-105 shadow`
                          : 'bg-slate-950 border-slate-850 text-slate-500 hover:text-slate-300 hover:border-slate-700 opacity-75'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: label.color }} />
                      {label.name}
                    </button>
                  );
                })}

                {/* Inline creator */}
                <button
                  type="button"
                  onClick={() => setIsAddingLabel(!isAddingLabel)}
                  className="px-2.5 py-1 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 hover:text-white border border-dashed border-slate-800 hover:border-slate-500 rounded-none bg-slate-900/20 hover:bg-slate-950 transition-all cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  {isAddingLabel ? 'Cancel' : 'New Label'}
                </button>
              </div>

              {isAddingLabel && (
                <div className="mt-3 p-3 bg-slate-950 border border-slate-850 rounded-lg max-w-md space-y-3 animate-fadeIn">
                  <p className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider">Create Custom Color Label</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <input
                        type="text"
                        placeholder="Label name (e.g. Target)"
                        value={newLabelName}
                        onChange={(e) => setNewLabelName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 focus:outline-none rounded px-2 py-1 text-xs text-slate-300"
                      />
                    </div>
                    <div>
                      <select
                        value={newLabelColor}
                        onChange={(e) => setNewLabelColor(e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 focus:outline-none rounded px-2 py-1 text-xs text-slate-300"
                      >
                        {PRESET_COLORS.map(color => (
                          <option key={color.name} value={color.name}>
                            {color.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {labelError && <p className="text-[10px] text-red-400 font-mono">⚠️ {labelError}</p>}
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingLabel(false);
                        setNewLabelName('');
                        setLabelError('');
                      }}
                      className="px-2 py-1 text-[10px] font-mono uppercase bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-slate-200 transition-all rounded"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleCreateCustomLabel}
                      className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500 hover:bg-emerald-600 text-slate-950 transition-all rounded"
                    >
                      Save Label
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Traits & Radar Chart Visualizer */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
            
            {/* Visualizer Column */}
            <div className="md:col-span-5 flex flex-col justify-between">
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 flex flex-col items-center justify-center h-full">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Athletic & Technical Radar</span>
                <RadarChart traits={editedPlayer.traits} />
                <span className="text-[10px] font-mono text-slate-500 text-center mt-3 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/80" /> Real-time math SVG translation model
                </span>
              </div>
            </div>

            {/* Traits Sliders Column */}
            <div className="md:col-span-7 bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 md:p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-100 mb-4 uppercase tracking-wider border-b border-slate-800 pb-2">Scouting Traits Model</h3>
                <div className="space-y-4">
                  {/* Athleticism */}
                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1">
                      <span className="text-slate-300">Athleticism (Speed, Burst, Agility)</span>
                      <span className="text-emerald-400 font-mono font-semibold">{editedPlayer.traits.athleticism}/99</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="99"
                      value={editedPlayer.traits.athleticism}
                      onChange={(e) => handleTraitChange('athleticism', parseInt(e.target.value))}
                      className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Technique */}
                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1">
                      <span className="text-slate-300">Technique (Hands, Footwork, Mechanics)</span>
                      <span className="text-emerald-400 font-mono font-semibold">{editedPlayer.traits.technique}/99</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="99"
                      value={editedPlayer.traits.technique}
                      onChange={(e) => handleTraitChange('technique', parseInt(e.target.value))}
                      className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Production */}
                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1">
                      <span className="text-slate-300">Production (Stats, Game Impacts, Wins)</span>
                      <span className="text-emerald-400 font-mono font-semibold">{editedPlayer.traits.production}/99</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="99"
                      value={editedPlayer.traits.production}
                      onChange={(e) => handleTraitChange('production', parseInt(e.target.value))}
                      className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Football IQ */}
                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1">
                      <span className="text-slate-300">Football IQ (Processing, Instincts, Pre-Snap)</span>
                      <span className="text-emerald-400 font-mono font-semibold">{editedPlayer.traits.footballIQ}/99</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="99"
                      value={editedPlayer.traits.footballIQ}
                      onChange={(e) => handleTraitChange('footballIQ', parseInt(e.target.value))}
                      className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Size & Frame */}
                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1">
                      <span className="text-slate-300">Size & Frame (Height, Weight, Length)</span>
                      <span className="text-emerald-400 font-mono font-semibold">{editedPlayer.traits.sizeAndFrame}/99</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="99"
                      value={editedPlayer.traits.sizeAndFrame}
                      onChange={(e) => handleTraitChange('sizeAndFrame', parseInt(e.target.value))}
                      className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2.5: Stock Trend Analysis */}
          <TrendLineChart player={editedPlayer} />

          {/* Section 3: Strengths, Weaknesses, and Written Report */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Strengths & Weaknesses */}
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 md:p-6 space-y-4">
              <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider border-b border-slate-800 pb-2">Traits Breakdown</h3>
              
              {/* Strengths List */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">Key Strengths</span>
                <div className="space-y-1.5">
                  {editedPlayer.strengths?.map((str, i) => (
                    <div key={i} className="flex items-start gap-2 bg-slate-900/60 border border-slate-800 rounded-lg p-2 text-xs text-slate-300">
                      <span className="text-emerald-500 mt-0.5 font-bold">✓</span>
                      <span className="flex-1">{str}</span>
                      <button 
                        onClick={() => handleRemoveField('strengths', i)}
                        className="text-slate-500 hover:text-red-400 transition-colors ml-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    placeholder="Add player strength..."
                    value={newStrength}
                    onChange={(e) => setNewStrength(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddField('strengths')}
                    className="flex-1 bg-slate-900 border border-slate-800 focus:border-emerald-500 focus:outline-none rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                  />
                  <button 
                    onClick={() => handleAddField('strengths')}
                    className="px-2.5 py-1.5 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600 hover:text-white rounded-lg text-xs transition-all flex items-center gap-1 font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>
              </div>

              {/* Weaknesses List */}
              <div className="space-y-2 pt-2 border-t border-slate-800/50">
                <span className="text-xs font-bold text-red-400 uppercase tracking-wide">Scouting Concerns / Weaknesses</span>
                <div className="space-y-1.5">
                  {editedPlayer.weaknesses?.map((weak, i) => (
                    <div key={i} className="flex items-start gap-2 bg-slate-900/60 border border-slate-800 rounded-lg p-2 text-xs text-slate-300">
                      <span className="text-red-500 mt-0.5 font-bold">✗</span>
                      <span className="flex-1">{weak}</span>
                      <button 
                        onClick={() => handleRemoveField('weaknesses', i)}
                        className="text-slate-500 hover:text-red-400 transition-colors ml-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    placeholder="Add scouting concern..."
                    value={newWeakness}
                    onChange={(e) => setNewWeakness(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddField('weaknesses')}
                    className="flex-1 bg-slate-900 border border-slate-800 focus:border-emerald-500 focus:outline-none rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                  />
                  <button 
                    onClick={() => handleAddField('weaknesses')}
                    className="px-2.5 py-1.5 bg-red-600/20 text-red-400 border border-red-500/30 hover:bg-red-600 hover:text-white rounded-lg text-xs transition-all flex items-center gap-1 font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>
              </div>
            </div>

            {/* Written Scouting Report & Scout's Personal Notes */}
            <div className="flex flex-col gap-6">
              {/* Executive Scouting Report */}
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 md:p-6 flex flex-col flex-1">
                <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider border-b border-slate-800 pb-2 mb-4">Executive Scouting Report</h3>
                <textarea
                  value={editedPlayer.scoutingReport}
                  onChange={(e) => setEditedPlayer({ ...editedPlayer, scoutingReport: e.target.value })}
                  rows={6}
                  placeholder="Write full detailed scouting review here..."
                  className="w-full flex-1 bg-slate-900 border border-slate-800 focus:border-emerald-500 focus:outline-none rounded-lg p-3 text-xs text-slate-300 resize-none font-sans leading-relaxed"
                />
              </div>

              {/* Personal Scout Notes */}
              <div className="bg-slate-900/40 border border-emerald-500/20 rounded-xl p-5 md:p-6 flex flex-col flex-1">
                <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider border-b border-emerald-500/10 pb-2 mb-4 flex items-center gap-1.5">
                  <Edit3 className="w-4 h-4 text-emerald-500" /> Scout's Personal Notes
                </h3>
                <textarea
                  value={editedPlayer.scoutNotes || ''}
                  onChange={(e) => setEditedPlayer({ ...editedPlayer, scoutNotes: e.target.value })}
                  rows={5}
                  placeholder="Add quick personal thoughts, custom grades, scheme notes, or team buzz..."
                  className="w-full flex-1 bg-slate-900 border border-slate-800 focus:border-emerald-500 focus:outline-none rounded-lg p-3 text-xs text-slate-300 resize-none font-sans leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Media Big Boards & Expert Comments */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 md:p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-500" />
                  Grounded Media Quotes & Expert Commentary
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Read parsed perspectives from real articles or podcasts, with links to source materials.</p>
              </div>

              {/* Toggle Gemini AI Generator */}
              <button
                onClick={() => setAiAccordionOpen(!aiAccordionOpen)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  aiAccordionOpen 
                    ? "bg-slate-800 text-emerald-400 border border-slate-700" 
                    : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-950/25"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                {aiAccordionOpen ? "Close Live Media Parser" : "Open Live Search Parser"}
              </button>
            </div>

            {/* AI Generation Accordion Area */}
            {aiAccordionOpen && (
              <div className="bg-slate-900 border border-emerald-500/20 rounded-xl p-4 md:p-5 space-y-4 animate-fadeIn">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs uppercase tracking-wide">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  Live Grounded Search Tool
                </div>
                <p className="text-xs text-slate-400">
                  Select an expert persona below. Gemini will execute a live Google Search to find real, recent articles or podcast quotes regarding this player, complete with verifiable web links.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Select Analyst Persona</label>
                    <select
                      value={selectedExpert}
                      onChange={(e) => setSelectedExpert(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:outline-none rounded-lg px-3 py-2 text-xs text-slate-100"
                    >
                      <option value="Dane Brugler (The Athletic)">Dane Brugler (The Athletic) - Deeply Technical</option>
                      <option value="Daniel Jeremiah (NFL Network)">Daniel Jeremiah (NFL Network) - Friendly Former Scout</option>
                      <option value="Danny Kelly (The Ringer)">Danny Kelly (The Ringer) - Snappy, Fun, Ringer-style Fit Focus</option>
                      <option value="NFLSE (Trevor Sikkema)">NFLSE (Trevor Sikkema) - Data & Metrics Dense</option>
                      <option value="Mel Kiper Jr. (ESPN)">Mel Kiper Jr. (ESPN) - Hyper Enthusiastic</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">NFL Team Evaluation Context</label>
                    <select
                      value={selectedTeamId}
                      onChange={(e) => setSelectedTeamId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:outline-none rounded-lg px-3 py-2 text-xs text-slate-100"
                    >
                      <option value="">Consensus Draft Board Context (None)</option>
                      {NFL_TEAMS.map(team => (
                        <option key={team.id} value={team.id}>
                          {team.fullName} ({team.currentScheme})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex justify-start gap-3">
                  <button
                    onClick={handleGenerateAIComment}
                    disabled={isGenerating}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white dark:text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    {isGenerating ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        Searching Live Web...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        Search & Parse Media Quote
                      </>
                    )}
                  </button>
                </div>

                {generationError && (
                  <div className="text-xs text-red-400 bg-red-950/20 border border-red-500/20 p-3 rounded-lg leading-relaxed">
                    {generationError}
                  </div>
                )}

                {generatedComment && (
                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-lg space-y-3.5 animate-fadeIn">
                    <div className="text-xs text-slate-300 italic leading-relaxed border-l-2 border-emerald-500 pl-3">
                      "{generatedComment}"
                    </div>
                    
                    {generatedUrl && (
                      <div className="text-[10px] font-mono text-slate-400 bg-slate-900 p-2 border border-slate-800 rounded flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Found Source: </span>
                        <a href={generatedUrl} target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline font-bold truncate max-w-md">
                          {generatedSourceName || "Original Article"} ↗
                        </a>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={handleApplyGeneratedComment}
                        className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-white font-bold text-[11px] rounded transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3 h-3" /> Save Quote to Player Profile
                      </button>
                      <button
                        onClick={() => {
                          setGeneratedComment("");
                          setGeneratedUrl("");
                          setGeneratedSourceName("");
                          setGeneratedDateStr("");
                        }}
                        className="px-3 py-1.5 bg-slate-900 text-slate-400 border border-slate-800 hover:text-white font-semibold text-[11px] rounded transition-all cursor-pointer"
                      >
                        Discard
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Editable Boards grid */}
            <div className="space-y-4">
              {[
                "Dane Brugler (The Athletic)",
                "Daniel Jeremiah (NFL Network)",
                "Danny Kelly (The Ringer)",
                "NFLSE (Trevor Sikkema)",
                "Mel Kiper Jr. (ESPN)"
              ].map((boardName) => {
                const info = editedPlayer.bigBoards?.[boardName] || editedPlayer.bigBoards?.["PFF (Pro Football Focus)"];
                if (!info) return null;
                return (
                  <div key={boardName} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 md:p-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                    
                    {/* Board Brand & Rank Input */}
                    <div className="md:col-span-3 flex flex-col justify-between h-full gap-2.5">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-emerald-500/80" />
                        <span className="text-xs font-bold text-slate-200">{boardName}</span>
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase tracking-wider text-slate-400 mb-1 font-semibold">Board Position</label>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold font-mono text-emerald-400">#</span>
                          <input
                            type="number"
                            min="1"
                            max="300"
                            value={info.rank}
                            onChange={(e) => handleBigBoardRankChange(boardName, parseInt(e.target.value) || 1)}
                            className="w-20 bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:outline-none rounded px-2 py-1 text-xs text-slate-100 font-mono font-bold"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Expert Blurb Textarea */}
                    <div className="md:col-span-9 space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="block text-[9px] uppercase tracking-wider text-slate-400 font-semibold">Analyst Blurb Comment (Real Media or Podcast Quote)</label>
                        
                        <button
                          type="button"
                          disabled={individualLoading[boardName]}
                          onClick={() => handleUpdateLivePerspective(boardName)}
                          className="px-2.5 py-1 bg-emerald-600/10 hover:bg-emerald-600/20 disabled:bg-slate-800 text-emerald-400 hover:text-emerald-300 disabled:text-slate-500 border border-emerald-500/20 hover:border-emerald-500/30 rounded text-[10px] font-bold font-mono transition-all flex items-center gap-1 cursor-pointer"
                        >
                          {individualLoading[boardName] ? (
                            <>
                              <span className="w-3 h-3 border border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin"></span>
                              Searching...
                            </>
                          ) : (
                            <>
                              <RotateCcw className="w-3 h-3" />
                              Update Live Perspective
                            </>
                          )}
                        </button>
                      </div>

                      <textarea
                        value={info.comment}
                        onChange={(e) => handleBigBoardCommentChange(boardName, e.target.value)}
                        rows={3}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:outline-none rounded-lg p-2.5 text-xs text-slate-300 font-sans leading-relaxed resize-none"
                        placeholder={`Provide ${boardName}'s comments on this player...`}
                      />

                      {/* Display Link & Quote Source metadata if present */}
                      {(info.url || info.isRealQuote) && (
                        <div className="flex flex-wrap items-center gap-2 mt-1.5 p-2 bg-slate-950 border border-slate-800/80 rounded-lg text-[10px] text-slate-400 font-mono">
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-bold bg-emerald-950/30 px-1.5 py-0.5 border border-emerald-500/20 rounded-none uppercase text-[9px] tracking-wider">
                            <ShieldCheck className="w-3 h-3" /> Grounded Media
                          </span>
                          {info.sourceName && (
                            <span>Source: <strong className="text-slate-300">{info.sourceName}</strong></span>
                          )}
                          {info.dateStr && (
                            <span className="text-slate-500">| {info.dateStr}</span>
                          )}
                          {info.url && (
                            <a 
                              href={info.url} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="text-emerald-400 hover:text-emerald-300 underline font-semibold transition-all ml-auto flex items-center gap-0.5"
                            >
                              View Quote ↗
                            </a>
                          )}
                        </div>
                      )}
                      
                      {individualError[boardName] && (
                        <div className="text-[10px] text-red-400 font-mono mt-1">
                          ⚠️ {individualError[boardName]}
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>

          </div>

        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-900 border-t-2 border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-none border border-slate-800 text-xs font-bold font-mono transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white dark:text-slate-950 rounded-none border border-slate-800 text-xs font-bold font-mono transition-all flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" /> Save Profile Details
          </button>
        </div>

      </div>
    </div>
  );
}
