import React, { useState } from 'react';
import { COACHES, FORMATION_TRENDS, Coach, FormationTrend } from '../data/coachesData';
import { 
  GitBranch, Layers, TrendingUp, User, Shield, 
  Cpu, Award, Play, ChevronRight, CheckCircle2, ArrowRight
} from 'lucide-react';

export default function CoachingReports() {
  const [activeTab, setActiveTab] = useState<'formations' | 'coaches'>('coaches');
  const [selectedCoachId, setSelectedCoachId] = useState<string>('kyle-shanahan');
  const [hoveredFormation, setHoveredFormation] = useState<string | null>(null);

  // Active coach helper
  const activeCoach = COACHES.find(c => c.id === selectedCoachId) || COACHES[0];

  // Helper to resolve coach ID by name (for clickable tree connections)
  const findCoachIdByName = (name: string): string | null => {
    const matched = COACHES.find(c => c.name.toLowerCase().includes(name.toLowerCase()));
    return matched ? matched.id : null;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Upper Panel Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-none p-6 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        
        <div className="space-y-1">
          <span className="text-[10px] uppercase tracking-wider font-extrabold font-mono text-emerald-500">
            Tactical Intel Hub
          </span>
          <h2 className="text-2xl font-serif font-bold italic text-slate-100 flex items-baseline gap-2">
            Coaching & Scheme Analytics
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
              // Playbook Diagnostics
            </span>
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl">
            Analyze current structural NFL alignment data, historical coaching philosophies, and interactive staff trees. Align collegiate draft prospects with exact scheme blueprints.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="bg-slate-950 border border-slate-800 p-1 flex gap-1 rounded-none shrink-0 w-full md:w-auto">
          <button
            onClick={() => setActiveTab('coaches')}
            className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2 font-mono text-xs uppercase tracking-wider transition-all rounded-none font-bold ${
              activeTab === 'coaches'
                ? 'bg-emerald-500 text-slate-950 font-extrabold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitBranch className="w-4 h-4" />
            Coach Profiles & Trees
          </button>
          <button
            onClick={() => setActiveTab('formations')}
            className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2 font-mono text-xs uppercase tracking-wider transition-all rounded-none font-bold ${
              activeTab === 'formations'
                ? 'bg-emerald-500 text-slate-950 font-extrabold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            Formation Trends
          </button>
        </div>
      </div>

      {/* View 1: Formation Trends */}
      {activeTab === 'formations' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Trend list */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-1">
              <h3 className="text-sm font-mono uppercase tracking-wider text-slate-400 font-bold mb-1">
                NFL Personnel Alignments
              </h3>
              <p className="text-[11px] text-slate-500">
                Hover or inspect current league-wide structural usage frequencies and play outcomes.
              </p>
            </div>

            <div className="space-y-3">
              {FORMATION_TRENDS.map((f) => {
                const isHovered = hoveredFormation === f.name;
                const trendColor = 
                  f.trend === 'rising' ? 'text-emerald-500 border-emerald-500/20 bg-emerald-950/10' :
                  f.trend === 'stable' ? 'text-blue-400 border-blue-900/50 bg-blue-950/10' :
                  'text-amber-500 border-amber-900/50 bg-amber-950/10';

                return (
                  <div
                    key={f.name}
                    onMouseEnter={() => setHoveredFormation(f.name)}
                    className={`p-4 border transition-all rounded-none cursor-pointer ${
                      isHovered || hoveredFormation === null
                        ? 'bg-slate-900/80 border-slate-700 shadow-lg shadow-black/40'
                        : 'bg-slate-900/30 border-slate-800/60 opacity-60'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-serif font-bold text-lg text-slate-100 flex items-center gap-2">
                          {f.name}
                          <span className={`text-[9px] px-2 py-0.5 font-mono font-bold uppercase tracking-wider border rounded-full ${trendColor}`}>
                            {f.trend}
                          </span>
                        </h4>
                        <span className="text-[10px] font-mono text-slate-500">{f.personnel}</span>
                      </div>
                      
                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-slate-300 block">{f.leagueUsage}</span>
                        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wide">Usage Rate</span>
                      </div>
                    </div>

                    {/* Progress bar representing frequency */}
                    <div className="w-full h-1 bg-slate-950 overflow-hidden mb-3">
                      <div 
                        className="h-full bg-emerald-500 transition-all duration-500" 
                        style={{ width: `${parseFloat(f.leagueUsage) * 1.3}%` }}
                      ></div>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                      {f.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Trend Blueprint Panel */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 p-6 md:p-8 space-y-6 relative">
            <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500"></div>
            
            {/* Active inspected formation */}
            {(() => {
              const activeForm = FORMATION_TRENDS.find(f => f.name === hoveredFormation) || FORMATION_TRENDS[0];
              return (
                <div className="space-y-6">
                  
                  {/* Schematic Title */}
                  <div className="border-b border-slate-800 pb-4">
                    <span className="text-[10px] font-mono text-emerald-500 uppercase tracking-wider font-extrabold">Active Schematic Blueprint</span>
                    <h3 className="text-2xl font-serif font-bold italic text-slate-100 mt-1">{activeForm.name}</h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{activeForm.personnel}</p>
                  </div>

                  {/* EPA and Efficiency Metrics Grid */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-slate-950 border border-slate-800 p-3 text-center">
                      <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">Expected Points</span>
                      <span className="text-xl font-mono font-extrabold text-emerald-400 block">+{activeForm.epaPerPlay.toFixed(2)}</span>
                      <span className="text-[8px] font-mono text-slate-600 uppercase">EPA / Play</span>
                    </div>

                    <div className="bg-slate-950 border border-slate-800 p-3 text-center">
                      <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">Run / Pass Ratio</span>
                      <span className="text-xs font-mono font-bold text-slate-300 block py-1.5">{activeForm.runPassRatio}</span>
                      <span className="text-[8px] font-mono text-slate-600 uppercase">Play Balance</span>
                    </div>

                    <div className="bg-slate-950 border border-slate-800 p-3 text-center">
                      <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">Trend Direction</span>
                      <span className="text-xs font-mono font-bold text-emerald-500 flex items-center justify-center gap-1 py-1.5">
                        <TrendingUp className="w-3.5 h-3.5" />
                        {activeForm.trend.toUpperCase()}
                      </span>
                      <span className="text-[8px] font-mono text-slate-600 uppercase">League Motion</span>
                    </div>
                  </div>

                  {/* Playbook whiteboard layout (Visual representation) */}
                  <div className="bg-slate-950 border border-slate-800 rounded-none p-6 flex flex-col items-center justify-center min-h-[180px] relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#10B981 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
                    <span className="absolute bottom-2 right-2 text-[8px] font-mono text-slate-700 tracking-widest uppercase">HUD PLAYBOOK DIAGRAM</span>
                    
                    {/* Render visual nodes depending on formation */}
                    <div className="w-full max-w-sm flex flex-col gap-6 relative z-10 py-2">
                      
                      {/* Defensive Secondary Line */}
                      <div className="flex justify-around px-8 opacity-40">
                        <span className="text-[10px] font-mono font-bold text-red-500 border border-red-500/20 px-1 bg-red-950/20">CB</span>
                        <span className="text-[10px] font-mono font-bold text-red-500 border border-red-500/20 px-1 bg-red-950/20">FS</span>
                        <span className="text-[10px] font-mono font-bold text-red-500 border border-red-500/20 px-1 bg-red-950/20">SS</span>
                        <span className="text-[10px] font-mono font-bold text-red-500 border border-red-500/20 px-1 bg-red-950/20">CB</span>
                      </div>

                      {/* Line of Scrimmage */}
                      <div className="relative border-b border-dashed border-slate-800 pb-2">
                        <div className="flex justify-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500 text-emerald-500 flex items-center justify-center text-[10px] font-bold font-mono">T</span>
                          <span className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500 text-emerald-500 flex items-center justify-center text-[10px] font-bold font-mono">G</span>
                          <span className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-400 flex items-center justify-center text-[10px] font-bold font-mono">C</span>
                          <span className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500 text-emerald-500 flex items-center justify-center text-[10px] font-bold font-mono">G</span>
                          <span className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500 text-emerald-500 flex items-center justify-center text-[10px] font-bold font-mono">T</span>
                        </div>
                      </div>

                      {/* Backfield & Receivers */}
                      <div className="flex flex-col gap-2 items-center">
                        <div className="flex justify-center gap-12 w-full">
                          {/* Left Wideouts */}
                          <div className="flex gap-2">
                            <span className="w-6 h-6 rounded-full bg-blue-500/10 border border-blue-400 text-blue-400 flex items-center justify-center text-[9px] font-mono font-bold">WR</span>
                            {activeForm.name === "Spread / Empty Field" && (
                              <span className="w-6 h-6 rounded-full bg-blue-500/10 border border-blue-400 text-blue-400 flex items-center justify-center text-[9px] font-mono font-bold">WR</span>
                            )}
                          </div>

                          {/* Center Core */}
                          <div className="flex flex-col items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-emerald-500/30 border border-emerald-400 text-emerald-300 flex items-center justify-center text-[9px] font-mono font-bold">QB</span>
                            {activeForm.name !== "Spread / Empty Field" && (
                              <span className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 flex items-center justify-center text-[9px] font-mono font-bold">RB</span>
                            )}
                          </div>

                          {/* Right Tight Ends & WRs */}
                          <div className="flex gap-2">
                            {/* Tight Ends */}
                            {(activeForm.name === "12 Personnel" || activeForm.name === "13 Personnel" || activeForm.name === "21 Personnel" || activeForm.name === "11 Personnel") && (
                              <span className="w-6 h-6 rounded-full bg-purple-500/10 border border-purple-400 text-purple-400 flex items-center justify-center text-[9px] font-mono font-bold">TE</span>
                            )}
                            {((activeForm.name === "12 Personnel" || activeForm.name === "13 Personnel") ) && (
                              <span className="w-6 h-6 rounded-full bg-purple-500/10 border border-purple-400 text-purple-400 flex items-center justify-center text-[9px] font-mono font-bold">TE</span>
                            )}
                            {(activeForm.name === "13 Personnel") && (
                              <span className="w-6 h-6 rounded-full bg-purple-500/10 border border-purple-400 text-purple-400 flex items-center justify-center text-[9px] font-mono font-bold">TE</span>
                            )}
                            
                            {/* Fullback */}
                            {activeForm.name === "21 Personnel" && (
                              <span className="w-6 h-6 rounded-full bg-orange-500/10 border border-orange-400 text-orange-400 flex items-center justify-center text-[9px] font-mono font-bold">FB</span>
                            )}

                            {/* Right Wideouts */}
                            {activeForm.name !== "13 Personnel" && (
                              <span className="w-6 h-6 rounded-full bg-blue-500/10 border border-blue-400 text-blue-400 flex items-center justify-center text-[9px] font-mono font-bold">WR</span>
                            )}
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Strategic Overview */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold mb-1">Tactical Analysis</h4>
                      <p className="text-xs text-slate-300 leading-relaxed">{activeForm.description}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div className="bg-slate-950 border border-slate-800 p-4">
                        <span className="text-[10px] font-mono text-emerald-400 uppercase font-extrabold">Primary Advantage</span>
                        <p className="text-xs text-slate-300 mt-1">{activeForm.advantage}</p>
                      </div>

                      <div className="bg-slate-950 border border-slate-800 p-4">
                        <span className="text-[10px] font-mono text-emerald-400 uppercase font-extrabold">Premier Play-Callers</span>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {activeForm.primaryUsers.map((user) => (
                            <span 
                              key={user}
                              onClick={() => {
                                const matchedCoach = COACHES.find(c => c.name.toLowerCase().includes(user.toLowerCase()));
                                if (matchedCoach) {
                                  setSelectedCoachId(matchedCoach.id);
                                  setActiveTab('coaches');
                                }
                              }}
                              className="text-[10px] font-mono bg-slate-900 border border-slate-850 hover:border-slate-500 px-2 py-0.5 text-slate-300 cursor-pointer transition-all"
                            >
                              {user}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Coach Personnel Preferences & Player Archetypes */}
                    <div className="border-t border-slate-850 pt-5 mt-4 space-y-4">
                      <div>
                        <span className="text-[10px] font-mono text-emerald-500 uppercase tracking-wider font-extrabold flex items-center gap-1.5">
                          <User className="w-4 h-4 text-emerald-500" />
                          Coach Personnel Preferences & Player Archetypes
                        </span>
                        <p className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wide font-mono">
                          Stated scouting attributes & real-world blueprint fits for this alignment.
                        </p>
                      </div>

                      {/* Critical Attributes Tags */}
                      {activeForm.keyAttributes && activeForm.keyAttributes.length > 0 && (
                        <div className="bg-slate-950 border border-slate-800 p-4">
                          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-extrabold block mb-2">Critical Scouting Attributes</span>
                          <div className="flex flex-wrap gap-2">
                            {activeForm.keyAttributes.map((attr, idx) => (
                              <span 
                                key={idx} 
                                className="text-[10px] font-mono bg-emerald-950/20 border border-emerald-500/10 text-emerald-400 px-2.5 py-1"
                              >
                                {attr}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Player Archetypes Cards */}
                      {activeForm.preferredArchetypes && activeForm.preferredArchetypes.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {activeForm.preferredArchetypes.map((arch, idx) => (
                            <div key={idx} className="bg-slate-950 border border-slate-850 p-4 relative overflow-hidden group">
                              <div className="text-[9px] font-mono text-emerald-400 font-bold bg-emerald-950/20 px-1.5 py-0.5 border border-emerald-500/10 inline-block mb-2">
                                {arch.role}
                              </div>
                              <h5 className="text-xs font-bold text-slate-200 leading-snug">{arch.archetype}</h5>
                              <p className="text-[10px] text-slate-400 mt-1 leading-normal">{arch.attributes}</p>
                              
                              {/* Listed player examples */}
                              <div className="mt-3 pt-2 border-t border-slate-900">
                                <span className="text-[9px] font-mono text-slate-500 uppercase block mb-1">Stated Examples:</span>
                                <div className="flex flex-wrap gap-1">
                                  {arch.examples.map((ex, exIdx) => (
                                    <span 
                                      key={exIdx} 
                                      className="text-[9px] font-mono bg-slate-900 border border-slate-850 text-slate-300 px-1.5 py-0.5"
                                    >
                                      {ex}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>

                </div>
              );
            })()}
          </div>

        </div>
      )}

      {/* View 2: Coach Profiles & Trees */}
      {activeTab === 'coaches' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Coach List Sidebar Panel */}
          <div className="lg:col-span-4 flex flex-col lg:h-full space-y-3">
            <div className="p-1">
              <h3 className="text-sm font-mono uppercase tracking-wider text-slate-400 font-bold mb-1">
                NFL Staff Directory
              </h3>
              <p className="text-[11px] text-slate-500">
                Select a tactical designer to view system blueprints and personnel matches.
              </p>
            </div>

            <div className="space-y-2 flex-1 max-h-[680px] lg:max-h-[1120px] overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
              {COACHES.map((coach) => {
                const isSelected = selectedCoachId === coach.id;
                return (
                  <button
                    key={coach.id}
                    onClick={() => setSelectedCoachId(coach.id)}
                    className={`w-full text-left p-4 rounded-none border transition-all flex items-center justify-between group ${
                      isSelected
                        ? 'bg-slate-900 border-emerald-500 text-slate-100'
                        : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-250'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Placeholder circle representing coach initials */}
                      <div className={`w-8 h-8 rounded-none flex items-center justify-center font-mono font-bold text-xs text-slate-100 ${coach.avatarPlaceholderColor}`}>
                        {coach.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-sm text-slate-200 group-hover:text-slate-100">
                          {coach.name}
                        </h4>
                        <span className="text-[10px] font-mono text-slate-500">{coach.team}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 bg-slate-950 px-2 py-1 border border-slate-800 block">
                        {coach.teamId}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Immersive Profile and Coach Tree Panel */}
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 p-6 md:p-8 space-y-8 relative">
            <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500"></div>

            {/* Coach Title Header */}
            <div className="border-b border-slate-800 pb-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono px-2 py-0.5 bg-slate-950 border border-slate-800 text-emerald-400 uppercase tracking-widest font-extrabold">
                    {activeCoach.role}
                  </span>
                  <span className="text-[9px] font-mono px-2 py-0.5 bg-slate-950 border border-slate-800 text-slate-400 uppercase tracking-widest">
                    TEAM_CODE: {activeCoach.teamId}
                  </span>
                </div>
                <h3 className="text-3xl font-serif font-bold italic text-slate-100 mt-1">{activeCoach.name}</h3>
                <p className="text-xs text-slate-400 font-mono">{activeCoach.team}</p>
              </div>

              {/* Big Initial Badge */}
              <div className={`hidden md:flex w-16 h-16 rounded-none items-center justify-center font-serif font-extrabold italic text-2xl text-slate-100 ${activeCoach.avatarPlaceholderColor}`}>
                {activeCoach.name.split(' ').map(n => n[0]).join('')}
              </div>
            </div>

            {/* System Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Systems */}
              <div className="md:col-span-7 space-y-4">
                <div>
                  <span className="text-[10px] font-mono text-emerald-500 uppercase tracking-wider font-extrabold flex items-center gap-1.5 mb-1">
                    <Cpu className="w-3.5 h-3.5" />
                    Active Coaching Philosophy
                  </span>
                  <h4 className="text-sm font-bold text-slate-200 uppercase font-mono">{activeCoach.currentSystem}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed mt-2">{activeCoach.schemeDescription}</p>
                </div>

                <div className="border-t border-slate-800 pt-4">
                  <span className="text-[10px] font-mono text-emerald-500 uppercase tracking-wider font-extrabold flex items-center gap-1.5 mb-2">
                    <Award className="w-3.5 h-3.5" />
                    Systems & Schemes Run (Career History)
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeCoach.systemsRun.map((system) => (
                      <span 
                        key={system}
                        className="text-[10px] font-mono bg-slate-950 border border-slate-850 px-2.5 py-1 text-slate-300 rounded-none font-medium"
                      >
                        {system}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Preferences & Playcalls */}
              <div className="md:col-span-5 bg-slate-950 border border-slate-800 p-5 space-y-4">
                <div>
                  <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-wider font-extrabold block mb-1">Personnel Preferences</span>
                  <p className="text-[11px] text-slate-300 leading-relaxed">{activeCoach.personnelPreferences}</p>
                </div>

                <div className="border-t border-slate-800 pt-3">
                  <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-wider font-extrabold block mb-1">Signature Play-Type</span>
                  <p className="text-[11px] text-slate-300 font-mono bg-slate-900 border border-slate-850 px-2 py-1 rounded-none flex items-center gap-2">
                    <Play className="w-3 h-3 text-emerald-500 fill-emerald-500" />
                    {activeCoach.keyPlayType}
                  </p>
                </div>
              </div>

            </div>

            {/* Job History Timeline (Last 5 Stops) */}
            <div className="border-t border-slate-800 pt-6">
              <span className="text-[10px] font-mono text-emerald-500 uppercase tracking-wider font-extrabold flex items-center gap-1.5 mb-4">
                <Layers className="w-4 h-4 text-emerald-500" />
                Career Job History (Last 5 Stated Positions)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                {activeCoach.jobHistory && activeCoach.jobHistory.map((job, idx) => (
                  <div key={idx} className="bg-slate-950 border border-slate-850 p-3.5 relative overflow-hidden group">
                    <div className="absolute top-1 right-2 text-2xl font-mono font-black text-slate-800/50 select-none group-hover:text-emerald-500/5 transition-all">
                      #{idx + 1}
                    </div>
                    <div className="text-[9px] font-mono text-emerald-400 font-bold bg-emerald-950/20 px-1.5 py-0.5 border border-emerald-500/10 inline-block mb-2">
                      {job.yearRange}
                    </div>
                    <h5 className="text-xs font-bold text-slate-200 line-clamp-2 leading-snug">{job.role}</h5>
                    <p className="text-[10px] text-slate-400 mt-1 font-mono truncate">{job.team}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tree of Coaches Section */}
            <div className="border-t border-slate-800 pt-6 space-y-4">
              <div>
                <span className="text-[10px] font-mono text-emerald-500 uppercase tracking-wider font-extrabold flex items-center gap-1.5">
                  <GitBranch className="w-4 h-4" />
                  Tree of Coaches (NFL Staff Network)
                </span>
                <p className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wide font-mono">
                  Browse mentor-protege linkages. Click underlined names to navigate profiles instantly.
                </p>
              </div>

              {/* Interactive Staff Tree Visualizer */}
              <div className="bg-slate-950 border border-slate-800 p-6 grid grid-cols-1 md:grid-cols-3 gap-6 relative overflow-hidden">
                <div className="absolute inset-0 opacity-15" style={{ backgroundImage: 'radial-gradient(#10B981 1.2px, transparent 1.2px)', backgroundSize: '24px 24px' }}></div>
                
                {/* 1. Mentors Column */}
                <div className="space-y-3 relative z-10">
                  <div className="border-b border-slate-800 pb-1.5">
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-extrabold block">Mentors / Worked For</span>
                  </div>
                  
                  <div className="space-y-1.5">
                    {activeCoach.mentors.map((mentor) => {
                      const linkedId = findCoachIdByName(mentor);
                      return (
                        <div 
                          key={mentor}
                          onClick={() => linkedId && setSelectedCoachId(linkedId)}
                          className={`flex items-center gap-1.5 p-2 bg-slate-900/60 border border-slate-850 transition-all ${
                            linkedId 
                              ? 'hover:border-emerald-500 cursor-pointer hover:bg-slate-900 text-emerald-400 font-semibold' 
                              : 'text-slate-400'
                          }`}
                        >
                          <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                          <span className={`text-xs ${linkedId ? 'underline decoration-dotted decoration-emerald-500' : ''}`}>
                            {mentor}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Peers Column */}
                <div className="space-y-3 relative z-10">
                  <div className="border-b border-slate-800 pb-1.5">
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-extrabold block">Worked With / Peers</span>
                  </div>
                  
                  <div className="space-y-1.5">
                    {activeCoach.peers.map((peer) => {
                      const linkedId = findCoachIdByName(peer);
                      return (
                        <div 
                          key={peer}
                          onClick={() => linkedId && setSelectedCoachId(linkedId)}
                          className={`flex items-center gap-1.5 p-2 bg-slate-900/60 border border-slate-850 transition-all ${
                            linkedId 
                              ? 'hover:border-emerald-500 cursor-pointer hover:bg-slate-900 text-emerald-400 font-semibold' 
                              : 'text-slate-400'
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3 text-slate-600 shrink-0" />
                          <span className={`text-xs ${linkedId ? 'underline decoration-dotted decoration-emerald-500' : ''}`}>
                            {peer}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Proteges Column */}
                <div className="space-y-3 relative z-10">
                  <div className="border-b border-slate-800 pb-1.5">
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-extrabold block">Proteges / Worked With</span>
                  </div>
                  
                  <div className="space-y-1.5">
                    {activeCoach.proteges.map((protege) => {
                      const linkedId = findCoachIdByName(protege);
                      return (
                        <div 
                          key={protege}
                          onClick={() => linkedId && setSelectedCoachId(linkedId)}
                          className={`flex items-center gap-1.5 p-2 bg-slate-900/60 border border-slate-850 transition-all ${
                            linkedId 
                              ? 'hover:border-emerald-500 cursor-pointer hover:bg-slate-900 text-emerald-400 font-semibold' 
                              : 'text-slate-400'
                          }`}
                        >
                          <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                          <span className={`text-xs ${linkedId ? 'underline decoration-dotted decoration-emerald-500' : ''}`}>
                            {protege}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Informational Footer */}
              <div className="p-3 bg-slate-950 border border-slate-800 text-center">
                <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest leading-relaxed">
                  Interactive schematic tree mapping systems from 1990s West Coast foundations to modern Simulated Pressure variations.
                </p>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
