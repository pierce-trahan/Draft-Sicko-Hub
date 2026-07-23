import React, { useState } from 'react';
import { GM_PROFILES } from '../data/gmData';
import { computeGMTendencies } from '../utils/gmTendencies';
import { UserCheck, Building2, Layers, Award, Search, TrendingUp } from 'lucide-react';

export default function GMProfiles() {
  const [selectedGmId, setSelectedGmId] = useState<string>(GM_PROFILES[0].id);
  const [selectedTenureTeam, setSelectedTenureTeam] = useState<string>('ALL');
  const [searchFilter, setSearchFilter] = useState('');
  const [roundFilter, setRoundFilter] = useState<number | 'ALL'>('ALL');

  const selectedGm = GM_PROFILES.find((gm) => gm.id === selectedGmId) || GM_PROFILES[0];
  const tendencies = computeGMTendencies(
    selectedGm,
    selectedTenureTeam === 'ALL' ? undefined : selectedTenureTeam
  );

  const filteredPicks = selectedGm.picks.filter((pick) => {
    const matchTeam = selectedTenureTeam === 'ALL' || pick.teamId === selectedTenureTeam;
    const matchRound = roundFilter === 'ALL' || pick.round === roundFilter;
    const matchSearch =
      pick.playerName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      pick.position.toLowerCase().includes(searchFilter.toLowerCase()) ||
      pick.college.toLowerCase().includes(searchFilter.toLowerCase());
    return matchTeam && matchRound && matchSearch;
  });

  const positionGroups = ['QB', 'RB', 'WR', 'TE', 'OT', 'IOL', 'EDGE', 'DT', 'LB', 'CB', 'S', 'FLEX'];

  const sortedCapital = Object.entries(tendencies.draftCapitalByPos)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border-2 border-slate-800 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-500" />
            <span className="text-[10px] uppercase font-bold font-mono text-slate-400 tracking-wider">
              Decision-Maker Analytics
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold italic text-slate-100">
            GM Tendency & Draft Profiles
          </h1>
          <p className="text-xs text-slate-400 max-w-xl">
            Analyze historical drafting behavior of active NFL General Managers — position allocation, draft capital spend, and college pipeline preferences.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <select
            value={selectedGmId}
            onChange={(e) => {
              setSelectedGmId(e.target.value);
              setSelectedTenureTeam('ALL');
            }}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-sm font-mono font-bold p-2.5 rounded focus:outline-none focus:border-emerald-500"
          >
            {GM_PROFILES.map((gm) => (
              <option key={gm.id} value={gm.id}>
                {gm.name} ({gm.tenures.map((t) => t.teamId).join(' / ')})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-850 pb-4">
          <div>
            <h2 className="text-xl font-bold font-serif text-slate-100 flex items-center gap-2">
              {selectedGm.name}
              {selectedGm.title && (
                <span className="text-xs font-mono font-normal text-slate-400">
                  — {selectedGm.title}
                </span>
              )}
            </h2>
            <div className="flex items-center gap-2 mt-1 text-xs font-mono text-slate-400">
              <Building2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Tenures:</span>
              {selectedGm.tenures.map((t) => (
                <span
                  key={t.teamId}
                  className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-200 font-bold"
                >
                  {t.teamId} ({t.startYear}-{t.endYear || 'Present'})
                </span>
              ))}
            </div>
          </div>

          {selectedGm.tenures.length > 1 && (
            <div className="flex bg-slate-900 p-1 border border-slate-800 rounded">
              <button
                onClick={() => setSelectedTenureTeam('ALL')}
                className={`px-3 py-1 text-xs font-mono font-bold rounded ${
                  selectedTenureTeam === 'ALL'
                    ? 'bg-emerald-500 text-slate-950'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Combined Career ({selectedGm.picks.length} picks)
              </button>
              {selectedGm.tenures.map((t) => (
                <button
                  key={t.teamId}
                  onClick={() => setSelectedTenureTeam(t.teamId)}
                  className={`px-3 py-1 text-xs font-mono font-bold rounded ${
                    selectedTenureTeam === t.teamId
                      ? 'bg-emerald-500 text-slate-950'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t.teamId} Only
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          <div className="bg-slate-900/60 border border-slate-800/80 p-3 rounded">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Picks Analyzed</span>
            <span className="text-2xl font-bold font-mono text-emerald-400">{tendencies.totalPicks}</span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800/80 p-3 rounded">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">R1 Premium Lean</span>
            <span className="text-lg font-bold font-mono text-emerald-400">{tendencies.r1LeanText}</span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800/80 p-3 rounded">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Top Early Priority</span>
            <span className="text-xl font-bold font-mono text-slate-100">
              {tendencies.earlyRoundPriorities[0]?.position || 'N/A'}
            </span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800/80 p-3 rounded">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Primary Feeder School</span>
            <span className="text-lg font-bold font-mono text-slate-200 truncate block">
              {tendencies.topColleges[0]?.college || 'N/A'} ({tendencies.topColleges[0]?.count || 0})
            </span>
          </div>
        </div>

        <div className="pt-2">
          <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            Top Position Draft Capital Spend (Jimmy Johnson Value Points)
          </span>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {sortedCapital.map(([pos, points]) => (
              <div key={pos} className="bg-slate-900 p-2.5 rounded border border-slate-800/80 flex justify-between items-center">
                <span className="text-xs font-mono font-bold text-slate-200">{pos}</span>
                <span className="text-xs font-mono font-bold text-emerald-400">{points.toLocaleString()} pts</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-4">
        <h3 className="text-base font-semibold font-serif text-slate-100 flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-500" />
          Position Tendency Heatmap Matrix
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/80">
                <th className="p-2.5">Draft Round Phase</th>
                {positionGroups.map((pos) => (
                  <th key={pos} className="p-2.5 text-center">
                    {pos}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              <tr>
                <td className="p-2.5 font-bold text-emerald-400">Round 1 (Premium)</td>
                {positionGroups.map((pos) => {
                  const cnt = tendencies.roundMatrix.round1[pos] || 0;
                  return (
                    <td
                      key={pos}
                      className={`p-2.5 text-center font-bold ${
                        cnt > 0 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-600'
                      }`}
                    >
                      {cnt || '-'}
                    </td>
                  );
                })}
              </tr>

              <tr>
                <td className="p-2.5 font-bold text-slate-200">Day 2 (Rounds 2-3)</td>
                {positionGroups.map((pos) => {
                  const cnt = tendencies.roundMatrix.day2[pos] || 0;
                  return (
                    <td
                      key={pos}
                      className={`p-2.5 text-center font-bold ${
                        cnt > 0 ? 'bg-slate-800 text-slate-200' : 'text-slate-600'
                      }`}
                    >
                      {cnt || '-'}
                    </td>
                  );
                })}
              </tr>

              <tr>
                <td className="p-2.5 font-bold text-slate-400">Day 3 (Rounds 4-7)</td>
                {positionGroups.map((pos) => {
                  const cnt = tendencies.roundMatrix.day3[pos] || 0;
                  return (
                    <td
                      key={pos}
                      className={`p-2.5 text-center ${
                        cnt > 0 ? 'text-slate-300' : 'text-slate-600'
                      }`}
                    >
                      {cnt || '-'}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h3 className="text-base font-semibold font-serif text-slate-100 flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-500" />
            Attributed Draft Pick Log ({filteredPicks.length})
          </h3>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search pick..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded pl-8 pr-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <select
              value={roundFilter}
              onChange={(e) =>
                setRoundFilter(e.target.value === 'ALL' ? 'ALL' : parseInt(e.target.value))
              }
              className="bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 p-1.5 rounded"
            >
              <option value="ALL">All Rounds</option>
              <option value="1">Round 1</option>
              <option value="2">Round 2</option>
              <option value="3">Round 3</option>
              <option value="4">Round 4</option>
              <option value="5">Round 5</option>
              <option value="6">Round 6</option>
              <option value="7">Round 7</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-slate-900 text-slate-400 sticky top-0">
              <tr>
                <th className="p-2.5">Year</th>
                <th className="p-2.5">Rnd</th>
                <th className="p-2.5">Pick</th>
                <th className="p-2.5">Player</th>
                <th className="p-2.5">Position</th>
                <th className="p-2.5">College</th>
                <th className="p-2.5">Team</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {filteredPicks.map((p, i) => (
                <tr key={i} className="hover:bg-slate-900/50">
                  <td className="p-2.5 text-slate-400">{p.year}</td>
                  <td className="p-2.5 font-bold text-slate-200">R{p.round}</td>
                  <td className="p-2.5 text-emerald-400 font-bold">#{p.overallPick}</td>
                  <td className="p-2.5 font-serif italic text-slate-100 font-semibold">{p.playerName}</td>
                  <td className="p-2.5">
                    <span className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 text-slate-300 font-bold rounded">
                      {p.position}
                    </span>
                  </td>
                  <td className="p-2.5 text-slate-300">{p.college || '—'}</td>
                  <td className="p-2.5 text-slate-400 font-bold">{p.teamId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-[10px] text-slate-500 font-mono italic">
          * Attributed pick log reflects curated PFR draft history across active GM tenures.
        </p>
      </div>
    </div>
  );
}