import React, { useState } from 'react';
import { Player, Team, UsageProjection, BigBoardInfo } from '../types';
import { NFL_TEAMS, SCHEMES } from '../data/teams';
import RadarChart from './RadarChart';
import TrendLineChart from './TrendLineChart';
import { getDraftRange } from '../utils/draftValue';
import { getPlayerPhotoUrl, getCollegeColors } from '../utils/playerPhotos';
import {
  X,
  Plus,
  Trash2,
  Sparkles,
  Check,
  Edit3,
  RotateCcw,
  ShieldCheck,
  ChevronDown,
  ListPlus,
  Award,
  User,
  HelpCircle,
  Tag,
  Sliders,
  TrendingUp,
  AlertCircle,
  Zap,
  Target,
  Lock,
  Unlock,
  Compass,
} from 'lucide-react';
import { LabelDef, PRESET_COLORS, getLabelClasses, getLabelHex } from '../utils/labels';
import {
  getSchema,
  computePositionGrade,
  pillarRollup,
  topTraits,
  bottomTraits,
  getWeightBadgeInfo,
} from '../utils/traitGrading';
import { computeUsageProjection, setPrimaryUsageRole } from '../utils/usageProjection';

interface PlayerProfileModalProps {
  player: Player;
  onClose: () => void;
  onSave: (updatedPlayer: Player) => void;
  teamContext?: Team;
  customLabels: LabelDef[];
  onAddCustomLabel: (newLabel: LabelDef) => void;
}

export default function PlayerProfileModal({
  player,
  onClose,
  onSave,
  teamContext,
  customLabels,
  onAddCustomLabel,
}: PlayerProfileModalProps) {
  // Local state for all customizable player attributes
  const [editedPlayer, setEditedPlayer] = useState<Player>({ ...player });
  const [newStrength, setNewStrength] = useState('');
  const [newWeakness, setNewWeakness] = useState('');

  // Spec 03 position-trait view mode ('position' vs 'pillars')
  const [traitViewMode, setTraitViewMode] = useState<'position' | 'pillars'>('position');

  // Custom labels state
  const [isAddingLabel, setIsAddingLabel] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState<
    'emerald' | 'rose' | 'cyan' | 'amber' | 'violet' | 'pink' | 'slate'
  >('emerald');
  const [labelError, setLabelError] = useState('');

  const handleCreateCustomLabel = () => {
    if (!newLabelName.trim()) {
      setLabelError('Label name cannot be empty');
      return;
    }
    const sanitized = newLabelName.trim();
    if (customLabels.some((l) => l.name.toLowerCase() === sanitized.toLowerCase())) {
      setLabelError('A label with this name already exists');
      return;
    }

    const newLabelObj = {
      name: sanitized,
      color: getLabelHex(newLabelColor),
      colorName: newLabelColor,
    };

    onAddCustomLabel(newLabelObj);

    const currentLabels = editedPlayer.labels || [];
    setEditedPlayer({
      ...editedPlayer,
      labels: [...currentLabels, sanitized],
    });

    setIsAddingLabel(false);
    setNewLabelName('');
    setLabelError('');
  };

  // AI Generation state
  const [selectedExpert, setSelectedExpert] = useState<string>('Dane Brugler (The Athletic)');
  const [selectedTeamId, setSelectedTeamId] = useState<string>(teamContext?.id || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedComment, setGeneratedComment] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [generatedSourceName, setGeneratedSourceName] = useState('');
  const [generatedDateStr, setGeneratedDateStr] = useState('');
  const [generationError, setGenerationError] = useState('');
  const [aiAccordionOpen, setAiAccordionOpen] = useState(false);

  const [individualLoading, setIndividualLoading] = useState<Record<string, boolean>>({});
  const [individualError, setIndividualError] = useState<Record<string, string>>({});

  // Spec 03: 5 Pillars trait change handler
  const handleTraitChange = (key: keyof Player['traits'], value: number) => {
    const updatedTraits = { ...editedPlayer.traits, [key]: value };
    const traitAverage = Math.round(
      (updatedTraits.athleticism +
        updatedTraits.technique +
        updatedTraits.production +
        updatedTraits.footballIQ +
        updatedTraits.sizeAndFrame) /
        5
    );

    setEditedPlayer({
      ...editedPlayer,
      traits: updatedTraits,
      overallGrade: traitAverage,
    });
  };

  // Spec 03: Position sub-trait change handler (synchronizes 5 pillars)
  const handlePositionTraitChange = (traitKey: string, value: number) => {
    const currentPosTraits = editedPlayer.positionTraits || {};
    const updatedPosTraits = { ...currentPosTraits, [traitKey]: value };

    const tempPlayer = {
      ...editedPlayer,
      positionTraits: updatedPosTraits,
    };
    const rolledUpPillars = pillarRollup(tempPlayer);

    setEditedPlayer({
      ...editedPlayer,
      positionTraits: updatedPosTraits,
      traits: rolledUpPillars,
    });
  };

  // Spec 03: Apply computed position grade to overall grade
  const handleApplyComputedGrade = () => {
    const computed = computePositionGrade(editedPlayer);
    setEditedPlayer({
      ...editedPlayer,
      overallGrade: computed,
    });
  };

  // Spec 04: Active usage projection calculation & user lock state
  const activeProjection: UsageProjection =
    editedPlayer.usageProjection && editedPlayer.usageProjection.userEdited
      ? editedPlayer.usageProjection
      : computeUsageProjection(editedPlayer);

  const primaryRole =
    activeProjection.roles.find((r) => r.id === activeProjection.primaryRoleId) ||
    activeProjection.roles[0];

  const handleSelectPrimaryRole = (roleId: string) => {
    const updatedProj = setPrimaryUsageRole(activeProjection, roleId);
    setEditedPlayer({
      ...editedPlayer,
      usageProjection: updatedProj,
    });
  };

  const handleResetUsageProjection = () => {
    const recomputed = computeUsageProjection(editedPlayer);
    setEditedPlayer({
      ...editedPlayer,
      usageProjection: recomputed,
    });
  };

  const handleAddField = (type: 'strengths' | 'weaknesses') => {
    const text = type === 'strengths' ? newStrength : newWeakness;
    if (!text.trim()) return;

    setEditedPlayer({
      ...editedPlayer,
      [type]: [...(editedPlayer[type] || []), text.trim()],
    });

    if (type === 'strengths') setNewStrength('');
    else setNewWeakness('');
  };

  const handleRemoveField = (type: 'strengths' | 'weaknesses', index: number) => {
    const list = [...(editedPlayer[type] || [])];
    list.splice(index, 1);
    setEditedPlayer({
      ...editedPlayer,
      [type]: list,
    });
  };

  const handleBigBoardRankChange = (board: string, rank: number) => {
    setEditedPlayer({
      ...editedPlayer,
      bigBoards: {
        ...editedPlayer.bigBoards,
        [board]: {
          ...editedPlayer.bigBoards[board],
          rank: Math.max(1, rank),
        },
      },
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
          ...(dateStr !== undefined && { dateStr }),
        },
      },
    });
  };

  const handleGenerateAIComment = async () => {
    setIsGenerating(true);
    setGenerationError('');
    setGeneratedComment('');
    setGeneratedUrl('');
    setGeneratedSourceName('');
    setGeneratedDateStr('');

    const targetTeam = NFL_TEAMS.find((t) => t.id === selectedTeamId);

    try {
      const response = await fetch('/api/gemini/generate-scout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player: editedPlayer,
          expert: selectedExpert,
          targetTeam: targetTeam || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to search live media commentary.');
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setGeneratedComment(data.comment);
      setGeneratedUrl(data.url || '');
      setGeneratedSourceName(data.sourceName || '');
      setGeneratedDateStr(data.dateStr || '');
    } catch (err: any) {
      console.error(err);
      setGenerationError(err.message || 'Something went wrong searching and parsing media.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateLivePerspective = async (boardName: string) => {
    setIndividualLoading((prev) => ({ ...prev, [boardName]: true }));
    setIndividualError((prev) => ({ ...prev, [boardName]: '' }));

    try {
      const response = await fetch('/api/gemini/generate-scout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player: editedPlayer,
          expert: boardName,
          targetTeam: null,
        }),
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
        data.dateStr || 'Recent'
      );
    } catch (err: any) {
      console.error(err);
      setIndividualError((prev) => ({
        ...prev,
        [boardName]: err.message || 'Failed to parse recent media quotes.',
      }));
    } finally {
      setIndividualLoading((prev) => ({ ...prev, [boardName]: false }));
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
    setGeneratedComment('');
    setGeneratedUrl('');
    setGeneratedSourceName('');
    setGeneratedDateStr('');
    setAiAccordionOpen(false);
  };

  const handleSave = () => {
    let updatedHistory = [...(editedPlayer.gradeHistory || [])];

    if (editedPlayer.overallGrade !== player.overallGrade) {
      updatedHistory = updatedHistory.map((point) => {
        if (point.milestone === 'Pre-Draft' || point.date === 'Current') {
          return { ...point, grade: editedPlayer.overallGrade };
        }
        return point;
      });

      const currentLabel = `Scout Edit #${
        updatedHistory.filter((h) => h.milestone.startsWith('Scout Edit')).length + 1
      }`;
      const nowStr = new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      const currentIdx = updatedHistory.findIndex(
        (point) => point.milestone === 'Pre-Draft' || point.date === 'Current'
      );
      if (currentIdx !== -1) {
        updatedHistory.splice(currentIdx, 0, {
          milestone: currentLabel,
          date: nowStr,
          grade: editedPlayer.overallGrade,
        });
      } else {
        updatedHistory.push({
          milestone: currentLabel,
          date: nowStr,
          grade: editedPlayer.overallGrade,
        });
      }
    } else {
      updatedHistory = updatedHistory.map((point) => {
        if (point.milestone === 'Pre-Draft' || point.date === 'Current') {
          return { ...point, grade: editedPlayer.overallGrade };
        }
        return point;
      });
    }

    onSave({
      ...editedPlayer,
      gradeHistory: updatedHistory,
      usageProjection: activeProjection,
    });
  };

  const schema = getSchema(editedPlayer.position);
  const computedPosGrade = computePositionGrade(editedPlayer);
  const tops = topTraits(editedPlayer, 3);
  const bottoms = bottomTraits(editedPlayer, 3);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-950 border-2 border-slate-800 rounded-none shadow-none overflow-hidden flex flex-col my-8 max-h-[90vh]">
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b-2 border-slate-800">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-500" />
            <span className="text-sm font-bold font-mono text-slate-400 uppercase tracking-wider">
              Prospect Scouting Profile Editor
            </span>
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
          {/* Section 1: Demographics & Overall Grade */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 md:p-6">
            <h3 className="text-base font-semibold text-slate-100 mb-4 flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-500" />
                Custom Demographics & Overall Grade
              </span>
              {editedPlayer.archetype && (
                <span
                  className={`px-2.5 py-0.5 text-[11px] font-bold font-mono border rounded-none uppercase tracking-wider ${
                    editedPlayer.archetype === 'Day 1 Starter'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : editedPlayer.archetype === 'Blue Chip Prospect'
                      ? 'bg-teal-500/10 text-teal-400 border-teal-500/30'
                      : editedPlayer.archetype === 'Raw Developmental'
                      ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                      : editedPlayer.archetype === 'Specialist'
                      ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                      : editedPlayer.archetype === 'High Floor Starter'
                      ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                      : editedPlayer.archetype === 'Boom-or-Bust'
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      : editedPlayer.archetype === 'Sleeper'
                      ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                      : 'bg-slate-500/10 text-slate-400 border-slate-500/30'
                  }`}
                >
                  {editedPlayer.archetype}
                </span>
              )}
            </h3>

            <div className="flex flex-col md:flex-row gap-6">
              {/* Photo & Branding Card */}
              <div className="w-full md:w-1/4 flex flex-col items-center bg-slate-950/80 border border-slate-800/80 p-4 rounded-xl shrink-0">
                <div className="text-xs font-bold font-mono text-slate-500 uppercase tracking-wider mb-3">
                  Roster Headshot
                </div>

                <div
                  className="w-32 h-32 rounded-lg border-2 overflow-hidden bg-slate-900 relative flex items-center justify-center shrink-0 mb-4 shadow-lg transition-transform hover:scale-105"
                  style={{ borderColor: getCollegeColors(editedPlayer.school).secondary }}
                >
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
                            (e.target as HTMLElement).style.display = 'none';
                            const fallback = (e.target as HTMLElement).nextElementSibling;
                            if (fallback) (fallback as HTMLElement).style.display = 'flex';
                          }}
                        />
                      );
                    }
                    return null;
                  })()}
                  <div
                    className="absolute inset-0 flex items-center justify-center font-mono font-bold text-3xl"
                    style={{
                      backgroundColor: getCollegeColors(editedPlayer.school).primary,
                      color: getCollegeColors(editedPlayer.school).text,
                      display: getPlayerPhotoUrl(editedPlayer) ? 'none' : 'flex',
                    }}
                  >
                    {editedPlayer.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </div>
                </div>

                <div
                  className="px-3 py-1 text-xs font-bold font-mono uppercase tracking-wide border rounded-full mb-4 flex items-center gap-1.5 text-center justify-center max-w-full truncate"
                  style={{
                    backgroundColor: getCollegeColors(editedPlayer.school).primary,
                    borderColor: getCollegeColors(editedPlayer.school).secondary,
                    color: getCollegeColors(editedPlayer.school).text,
                  }}
                  title={editedPlayer.school}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: getCollegeColors(editedPlayer.school).secondary }}
                  />
                  <span className="truncate">{editedPlayer.school}</span>
                </div>

                <div className="w-full mt-2">
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
                    Custom Image URL
                  </label>
                  <input
                    type="text"
                    placeholder="Paste website photo URL..."
                    value={editedPlayer.photoUrl || ''}
                    onChange={(e) => setEditedPlayer({ ...editedPlayer, photoUrl: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-850 focus:border-emerald-500 focus:outline-none rounded-lg px-2 py-1.5 text-xs text-slate-100 placeholder-slate-600"
                  />
                </div>
              </div>

              {/* Demographics Form Fields */}
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">
                      Player Name
                    </label>
                    <input
                      type="text"
                      value={editedPlayer.name}
                      onChange={(e) => setEditedPlayer({ ...editedPlayer, name: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 focus:outline-none rounded-lg px-3 py-2 text-sm text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">
                      Position
                    </label>
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
                      <option value="FLEX">FLEX - Hybrid / Athlete</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">
                      College Program
                    </label>
                    <input
                      type="text"
                      value={editedPlayer.school}
                      onChange={(e) => setEditedPlayer({ ...editedPlayer, school: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 focus:outline-none rounded-lg px-3 py-2 text-sm text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">
                      Height
                    </label>
                    <input
                      type="text"
                      placeholder='e.g. 6"2'
                      value={editedPlayer.height}
                      onChange={(e) => setEditedPlayer({ ...editedPlayer, height: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 focus:outline-none rounded-lg px-3 py-2 text-sm text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">
                      Weight (lbs)
                    </label>
                    <input
                      type="number"
                      value={editedPlayer.weight}
                      onChange={(e) =>
                        setEditedPlayer({ ...editedPlayer, weight: parseInt(e.target.value) || 0 })
                      }
                      className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 focus:outline-none rounded-lg px-3 py-2 text-sm text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">
                      Eligibility Year
                    </label>
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800/50">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">
                      Prospect Archetype
                    </label>
                    <select
                      value={editedPlayer.archetype || ''}
                      onChange={(e) =>
                        setEditedPlayer({ ...editedPlayer, archetype: e.target.value || undefined })
                      }
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
                      <span className="text-emerald-400 font-mono font-bold">
                        {editedPlayer.overallGrade}/99
                      </span>
                    </label>
                    <input
                      type="range"
                      min="50"
                      max="99"
                      value={editedPlayer.overallGrade}
                      onChange={(e) =>
                        setEditedPlayer({ ...editedPlayer, overallGrade: parseInt(e.target.value) })
                      }
                      className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer mt-2.5"
                    />
                    <div className="text-[10px] space-y-1 mt-1">
                      <div className="flex justify-between items-center bg-slate-900/80 p-2 border border-slate-800/60 rounded">
                        <span className="text-[9px] text-slate-400 uppercase font-mono font-bold">
                          Projected Draft Range:
                        </span>
                        <span
                          className={`font-mono font-bold uppercase tracking-wider ${
                            getDraftRange(editedPlayer.overallGrade).color
                          }`}
                        >
                          {getDraftRange(editedPlayer.overallGrade).range}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: SPEC 03 Position-Aware Sub-Traits & Core Pillars */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 md:p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-500" />
                <h3 className="text-base font-semibold text-slate-100">
                  Scouting Trait Breakdown
                </h3>
              </div>

              <div className="flex bg-slate-950 p-1 border border-slate-800 rounded-lg">
                <button
                  onClick={() => setTraitViewMode('position')}
                  className={`px-3 py-1 text-xs font-mono font-bold rounded transition-colors ${
                    traitViewMode === 'position'
                      ? 'bg-emerald-500 text-slate-950'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {editedPlayer.position} Position Sub-Traits ({schema.length})
                </button>
                <button
                  onClick={() => setTraitViewMode('pillars')}
                  className={`px-3 py-1 text-xs font-mono font-bold rounded transition-colors ${
                    traitViewMode === 'pillars'
                      ? 'bg-emerald-500 text-slate-950'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  5 Pillars Rollup
                </button>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-slate-400 uppercase font-bold">Computed Position Grade:</span>
                  <span className="text-emerald-400 font-black text-lg">{computedPosGrade}/99</span>
                  <span className="text-slate-500 text-[10px]">
                    (vs Scout Overall: {editedPlayer.overallGrade})
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Weighted aggregate calculated from {schema.length} position sub-traits.
                </p>
              </div>

              <button
                onClick={handleApplyComputedGrade}
                disabled={editedPlayer.overallGrade === computedPosGrade}
                className="px-3.5 py-1.5 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500 hover:text-slate-950 disabled:opacity-40 text-emerald-400 text-xs font-mono font-bold transition-all rounded"
              >
                Apply {computedPosGrade} as Overall Grade
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800/80 space-y-2">
                <span className="text-[10px] font-mono uppercase font-bold text-emerald-400 block">
                  Top Key Strengths
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {tops.map((t) => {
                    const badge = getWeightBadgeInfo(t.weight);
                    return (
                      <span
                        key={t.key}
                        className="px-2 py-1 bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-[11px] font-mono rounded flex items-center gap-1.5"
                      >
                        <span className="font-bold">{t.label}:</span>
                        <span>{t.value}</span>
                        {badge.isKey && (
                          <span className="text-[8px] bg-emerald-500 text-slate-950 px-1 rounded font-bold uppercase">
                            Key
                          </span>
                        )}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800/80 space-y-2">
                <span className="text-[10px] font-mono uppercase font-bold text-amber-400 block">
                  Key Growth Areas
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {bottoms.map((t) => {
                    const badge = getWeightBadgeInfo(t.weight);
                    return (
                      <span
                        key={t.key}
                        className="px-2 py-1 bg-amber-950/30 border border-amber-800/50 text-amber-300 text-[11px] font-mono rounded flex items-center gap-1.5"
                      >
                        <span className="font-bold">{t.label}:</span>
                        <span>{t.value}</span>
                        {badge.isKey && (
                          <span className="text-[8px] bg-amber-500 text-slate-950 px-1 rounded font-bold uppercase">
                            Key
                          </span>
                        )}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-5 flex justify-center">
                <div className="w-full max-w-[280px]">
                  {traitViewMode === 'position' ? (
                    <RadarChart
                      positionTraits={editedPlayer.positionTraits}
                      position={editedPlayer.position}
                      traits={editedPlayer.traits}
                      color="#10B981"
                    />
                  ) : (
                    <RadarChart traits={editedPlayer.traits} color="#10B981" />
                  )}
                </div>
              </div>

              <div className="lg:col-span-7 space-y-3">
                {traitViewMode === 'position' ? (
                  <div className="space-y-3 max-h-[340px] overflow-y-auto pr-2">
                    {schema.map((traitDef) => {
                      const posVal =
                        editedPlayer.positionTraits?.[traitDef.key] ??
                        editedPlayer.traits[traitDef.pillar] ??
                        70;
                      const badgeInfo = getWeightBadgeInfo(traitDef.weight);

                      return (
                        <div
                          key={traitDef.key}
                          className="bg-slate-950 p-2.5 border border-slate-800/80 rounded space-y-1"
                        >
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-medium text-slate-200 flex items-center gap-1.5">
                              {traitDef.label}
                              <span
                                className={`text-[9px] font-mono px-1 rounded uppercase ${
                                  badgeInfo.isKey
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold'
                                    : 'bg-slate-800 text-slate-400'
                                }`}
                              >
                                {Math.round(traitDef.weight * 100)}%
                              </span>
                            </span>
                            <span className="font-mono font-bold text-emerald-400">{posVal}/99</span>
                          </div>
                          <input
                            type="range"
                            min="50"
                            max="99"
                            value={posVal}
                            onChange={(e) =>
                              handlePositionTraitChange(traitDef.key, parseInt(e.target.value))
                            }
                            className="w-full accent-emerald-500 h-1 bg-slate-800 rounded cursor-pointer"
                          />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(
                      [
                        { key: 'athleticism', label: 'Athleticism' },
                        { key: 'technique', label: 'Technique' },
                        { key: 'production', label: 'Production' },
                        { key: 'footballIQ', label: 'Football IQ' },
                        { key: 'sizeAndFrame', label: 'Size & Frame' },
                      ] as const
                    ).map(({ key, label }) => (
                      <div key={key} className="space-y-1">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-slate-300">{label}</span>
                          <span className="text-emerald-400 font-bold">
                            {editedPlayer.traits[key]}/99
                          </span>
                        </div>
                        <input
                          type="range"
                          min="50"
                          max="99"
                          value={editedPlayer.traits[key]}
                          onChange={(e) => handleTraitChange(key, parseInt(e.target.value))}
                          className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 2B: SPEC 04 Positional Usage & Scheme Fit Projections */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 md:p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-500" />
                <h3 className="text-base font-semibold text-slate-100">
                  Positional Usage & Scheme Fit Projections
                </h3>
              </div>

              {activeProjection.userEdited ? (
                <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs font-mono font-bold text-amber-300">User Locked Projection</span>
                  <button
                    onClick={handleResetUsageProjection}
                    className="text-[10px] font-mono text-slate-400 hover:text-white underline ml-2"
                  >
                    Reset to Auto
                  </button>
                </div>
              ) : (
                <span className="text-xs font-mono text-slate-500 flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-emerald-500" />
                  Auto-Derived Trait Projection
                </span>
              )}
            </div>

            {/* Primary Projected Role Card */}
            {primaryRole && (
              <div className="bg-slate-950 border-2 border-emerald-500/40 p-4 rounded-xl space-y-3 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-emerald-500 text-slate-950 text-[10px] font-mono font-bold uppercase rounded">
                      PRIMARY PROJECTED ROLE
                    </span>
                    <h4 className="text-base font-bold font-serif italic text-slate-100">
                      {primaryRole.label}
                    </h4>
                  </div>

                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-xs text-slate-400">FIT SCORE:</span>
                    <span className="text-xl font-black text-emerald-400">{primaryRole.fitScore}/99</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 text-xs font-mono">
                  <span className="bg-slate-900 border border-slate-800 px-2.5 py-1 text-slate-300 rounded flex items-center gap-1">
                    <span className="text-slate-500">SPOT:</span> {primaryRole.formationSpot}
                  </span>
                  {primaryRole.scheme && (
                    <span className="bg-slate-900 border border-slate-800 px-2.5 py-1 text-emerald-400 rounded flex items-center gap-1">
                      <span className="text-slate-500">SCHEME:</span>
                      {SCHEMES.find((s) => s.id === primaryRole.scheme)?.name || primaryRole.scheme}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-300 font-serif italic leading-relaxed bg-slate-900/60 p-3 rounded border border-slate-850">
                  "{primaryRole.rationale}"
                </p>
              </div>
            )}

            {/* Ranked Candidate Avenues List */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
                Ranked Usage Avenues & Formation Fits ({activeProjection.roles.length})
              </span>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {activeProjection.roles.map((role) => {
                  const isPrimary = role.id === activeProjection.primaryRoleId;
                  const matchingScheme = SCHEMES.find((s) => s.id === role.scheme);

                  return (
                    <div
                      key={role.id}
                      className={`p-3 border rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3 transition-all ${
                        isPrimary
                          ? 'bg-slate-950 border-emerald-500/50'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-200">{role.label}</span>
                          <span className="text-[10px] font-mono bg-slate-900 border border-slate-800 px-2 py-0.5 text-slate-400 rounded">
                            {role.formationSpot}
                          </span>
                          {matchingScheme && (
                            <span className="text-[10px] font-mono bg-emerald-950/40 text-emerald-400 border border-emerald-800/50 px-2 py-0.5 rounded">
                              {matchingScheme.name}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 font-serif line-clamp-1">{role.rationale}</p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right font-mono">
                          <span className="text-xs font-bold text-emerald-400">{role.fitScore}/99</span>
                        </div>

                        {!isPrimary && (
                          <button
                            onClick={() => handleSelectPrimaryRole(role.id)}
                            className="px-2.5 py-1 bg-slate-900 border border-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-300 text-[10px] font-mono font-bold uppercase rounded transition-colors"
                          >
                            Set as Primary
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 3: Scouting Report & Strengths/Weaknesses */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 md:p-6 space-y-4">
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-2">
              <Edit3 className="w-4 h-4 text-emerald-500" />
              Scouting Report Narrative & Bullet Points
            </h3>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">
                Full Scouting Report
              </label>
              <textarea
                rows={4}
                value={editedPlayer.scoutingReport}
                onChange={(e) => setEditedPlayer({ ...editedPlayer, scoutingReport: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 focus:outline-none rounded-lg p-3 text-sm text-slate-200 leading-relaxed font-serif"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-3">
                <label className="block text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Key Strengths
                </label>
                <div className="space-y-2">
                  {(editedPlayer.strengths || []).map((str, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 bg-slate-950 p-2 border border-slate-850 rounded"
                    >
                      <span className="text-xs text-slate-200 flex-1">{str}</span>
                      <button
                        onClick={() => handleRemoveField('strengths', idx)}
                        className="text-slate-500 hover:text-red-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Add positive trait..."
                      value={newStrength}
                      onChange={(e) => setNewStrength(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddField('strengths')}
                      className="flex-1 bg-slate-900 border border-slate-800 text-xs text-slate-200 px-3 py-1.5 rounded focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      onClick={() => handleAddField('strengths')}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold rounded"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-bold text-rose-400 uppercase tracking-wider">
                  Scout Concerns / Weaknesses
                </label>
                <div className="space-y-2">
                  {(editedPlayer.weaknesses || []).map((wk, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 bg-slate-950 p-2 border border-slate-850 rounded"
                    >
                      <span className="text-xs text-slate-300 flex-1">{wk}</span>
                      <button
                        onClick={() => handleRemoveField('weaknesses', idx)}
                        className="text-slate-500 hover:text-red-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Add area for concern..."
                      value={newWeakness}
                      onChange={(e) => setNewWeakness(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddField('weaknesses')}
                      className="flex-1 bg-slate-900 border border-slate-800 text-xs text-slate-200 px-3 py-1.5 rounded focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      onClick={() => handleAddField('weaknesses')}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold rounded"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Media Big Boards & AI Commentary */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 md:p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                Industry Big Board Consensus & Expert Quotes
              </h3>
              <button
                onClick={() => setAiAccordionOpen(!aiAccordionOpen)}
                className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold rounded flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                AI Live Search & Quote Generator
              </button>
            </div>

            {aiAccordionOpen && (
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Select Target Media Expert
                    </label>
                    <select
                      value={selectedExpert}
                      onChange={(e) => setSelectedExpert(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 p-2 rounded"
                    >
                      <option value="Dane Brugler (The Athletic)">Dane Brugler (The Athletic)</option>
                      <option value="Daniel Jeremiah (NFL Network)">Daniel Jeremiah (NFL Network)</option>
                      <option value="Mel Kiper Jr. (ESPN)">Mel Kiper Jr. (ESPN)</option>
                      <option value="PFF College">PFF Scouting Staff</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Optional Scheme Context Team
                    </label>
                    <select
                      value={selectedTeamId}
                      onChange={(e) => setSelectedTeamId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 p-2 rounded"
                    >
                      <option value="">General Consensus (No Team Filter)</option>
                      {NFL_TEAMS.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.fullName} ({t.currentScheme})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={handleGenerateAIComment}
                    disabled={isGenerating}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 text-slate-950 font-mono font-bold text-xs rounded transition-all flex items-center gap-1.5"
                  >
                    {isGenerating ? 'Searching Media Outlets...' : 'Generate Grounded Quote'}
                  </button>
                </div>

                {generationError && (
                  <div className="p-3 bg-rose-950/40 border border-rose-800 text-rose-300 text-xs font-mono rounded">
                    {generationError}
                  </div>
                )}

                {generatedComment && (
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded space-y-2">
                    <div className="text-xs text-slate-200 font-serif italic">
                      "{generatedComment}"
                    </div>
                    {generatedSourceName && (
                      <div className="text-[10px] text-slate-400 font-mono">
                        Source: {generatedSourceName} ({generatedDateStr})
                      </div>
                    )}
                    <button
                      onClick={handleApplyGeneratedComment}
                      className="px-3 py-1 bg-emerald-500 text-slate-950 font-mono font-bold text-xs rounded"
                    >
                      Apply to {selectedExpert} Board
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(Object.entries(editedPlayer.bigBoards || {}) as [string, BigBoardInfo][]).map(([boardName, boardInfo]) => (
                <div key={boardName} className="bg-slate-950 p-4 border border-slate-800 rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono font-bold text-slate-200">{boardName}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500 uppercase font-mono">Rank:</span>
                      <input
                        type="number"
                        min="1"
                        value={boardInfo.rank}
                        onChange={(e) =>
                          handleBigBoardRankChange(boardName, parseInt(e.target.value) || 1)
                        }
                        className="w-16 bg-slate-900 border border-slate-800 text-xs text-slate-100 font-mono p-1 text-center rounded"
                      />
                    </div>
                  </div>

                  <textarea
                    rows={2}
                    value={boardInfo.comment}
                    onChange={(e) => handleBigBoardCommentChange(boardName, e.target.value)}
                    placeholder="Scouting commentary..."
                    className="w-full bg-slate-900 border border-slate-850 p-2 text-xs text-slate-300 rounded font-serif"
                  />

                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                    <span>{boardInfo.sourceName || boardName}</span>
                    <button
                      onClick={() => handleUpdateLivePerspective(boardName)}
                      disabled={individualLoading[boardName]}
                      className="text-emerald-400 hover:underline disabled:opacity-50"
                    >
                      {individualLoading[boardName] ? 'Searching...' : 'Refresh Quote'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Custom Labels & Grade History */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 space-y-4">
              <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-2">
                <Tag className="w-4 h-4 text-emerald-500" />
                Custom Scouting Labels
              </h3>

              <div className="flex flex-wrap gap-2">
                {customLabels.map((lbl) => {
                  const isSelected = (editedPlayer.labels || []).includes(lbl.name);
                  return (
                    <button
                      key={lbl.name}
                      onClick={() => {
                        const current = editedPlayer.labels || [];
                        const updated = isSelected
                          ? current.filter((l) => l !== lbl.name)
                          : [...current, lbl.name];
                        setEditedPlayer({ ...editedPlayer, labels: updated });
                      }}
                      className={`px-2.5 py-1 text-xs font-mono font-bold rounded border transition-all ${
                        isSelected
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {lbl.name}
                    </button>
                  );
                })}
              </div>

              {!isAddingLabel ? (
                <button
                  onClick={() => setIsAddingLabel(true)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold rounded flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Create New Tag
                </button>
              ) : (
                <div className="p-3 bg-slate-950 border border-slate-800 rounded space-y-2">
                  <input
                    type="text"
                    placeholder="Tag name..."
                    value={newLabelName}
                    onChange={(e) => setNewLabelName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 p-1.5 text-xs text-slate-200 rounded"
                  />
                  {labelError && <div className="text-[10px] text-rose-400 font-mono">{labelError}</div>}
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setIsAddingLabel(false)}
                      className="px-2 py-1 bg-slate-800 text-slate-400 text-xs rounded"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateCustomLabel}
                      className="px-3 py-1 bg-emerald-500 text-slate-950 text-xs font-mono font-bold rounded"
                    >
                      Save Tag
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 space-y-4">
              <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                Scout Grade Evaluation History
              </h3>

              {editedPlayer.gradeHistory && editedPlayer.gradeHistory.length > 0 ? (
                <div className="h-40">
                  <TrendLineChart player={editedPlayer} />
                </div>
              ) : (
                <div className="text-xs font-mono text-slate-500 text-center py-8">
                  No grade history points recorded yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end items-center gap-3 px-6 py-4 bg-slate-900 border-t-2 border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-bold rounded transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-mono font-bold text-xs rounded transition-all shadow"
          >
            Save Prospect Profile
          </button>
        </div>
      </div>
    </div>
  );
}