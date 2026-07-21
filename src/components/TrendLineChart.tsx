import React from 'react';
import { Player } from '../types';
import { TrendingUp, TrendingDown, Calendar, ShieldCheck } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine
} from 'recharts';

interface TrendLineChartProps {
  player: Player;
}

export default function TrendLineChart({ player }: TrendLineChartProps) {
  // Read history directly from the player's local data structure
  const rawHistory = player.gradeHistory || [];
  
  // Update the latest point ("Pre-Draft" or "Current") in real-time to match editedPlayer's live grade
  const trendData = rawHistory.map((point) => {
    if (point.milestone === 'Pre-Draft' || point.date === 'Current') {
      return { ...point, grade: player.overallGrade };
    }
    return point;
  });

  // Calculate grade change statistics
  const initialGrade = trendData.length > 0 ? trendData[0].grade : player.overallGrade;
  const currentGrade = player.overallGrade;
  const totalGain = currentGrade - initialGrade;

  // Determine Y-axis domain boundaries to keep the line centered and visually balanced
  const grades = trendData.map((d) => d.grade);
  const minGrade = grades.length > 0 ? Math.min(...grades) : 50;
  const maxGrade = grades.length > 0 ? Math.max(...grades) : 99;
  const yMin = Math.max(50, Math.floor(minGrade - 3));
  const yMax = Math.min(100, Math.ceil(maxGrade + 3));

  // Custom tooltips matching the premium dark aesthetic
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 shadow-xl">
          <p className="text-xs font-bold text-slate-100">{data.milestone}</p>
          <p className="text-[10px] text-slate-400 font-mono mb-1">{data.date}</p>
          <div className="flex items-center gap-1.5 justify-between">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Grade:</span>
            <span className="text-xs font-extrabold font-mono text-cyan-400">{payload[0].value}/99</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 md:p-6 space-y-4">
      {/* Title Header */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            Stock Trend Analysis (Recharts)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Fluctuation of overall grade over primary draft cycles</p>
        </div>

        {/* Dynamic stock trend pill */}
        <div className={`flex items-center gap-1.5 px-3 py-1 border rounded-lg text-xs font-mono font-bold ${
          totalGain > 0 
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
            : totalGain < 0 
              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
              : 'bg-slate-800 text-slate-400 border-slate-700'
        }`}>
          {totalGain > 0 ? (
            <>
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+{totalGain} Stock Rise</span>
            </>
          ) : totalGain < 0 ? (
            <>
              <TrendingDown className="w-3.5 h-3.5 animate-bounce" />
              <span>{totalGain} Stock Slip</span>
            </>
          ) : (
            <span>Flat Consensus</span>
          )}
        </div>
      </div>

      {/* Recharts Container */}
      <div className="w-full h-[180px] bg-slate-950/20 rounded-lg p-2 overflow-hidden relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={trendData}
            margin={{ top: 15, right: 15, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorGrade" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#1e293b" 
              opacity={0.4} 
              vertical={false}
            />
            
            <XAxis 
              dataKey="milestone" 
              tick={{ fill: '#64748b', fontSize: 9, fontFamily: 'monospace' }}
              axisLine={false}
              tickLine={false}
              dy={8}
            />
            
            <YAxis 
              domain={[yMin, yMax]}
              tick={{ fill: '#64748b', fontSize: 9, fontFamily: 'monospace' }}
              axisLine={false}
              tickLine={false}
              dx={-5}
            />
            
            <Tooltip 
              content={<CustomTooltip />}
              cursor={{ stroke: '#06b6d4', strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            
            <Area
              type="monotone"
              dataKey="grade"
              stroke="#10b981"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorGrade)"
              activeDot={{ r: 6, fill: '#06b6d4', stroke: '#020617', strokeWidth: 2 }}
              dot={{ r: 4, fill: '#10b981', stroke: '#020617', strokeWidth: 1.5 }}
            />
            
            {/* Draw a subtle reference line at the current live overall grade */}
            <ReferenceLine 
              y={currentGrade} 
              stroke="#06b6d4" 
              strokeDasharray="3 3" 
              opacity={0.3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Information strip */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-500" />
          <div>
            <p className="text-xs font-semibold text-slate-300">Hover graph to analyze draft stock</p>
            <p className="text-[10px] text-slate-500">Live rendering via Recharts engine mapping historical evaluation</p>
          </div>
        </div>
        <div className="text-right flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded border border-slate-800 font-mono text-[10px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Local Data Structure Model</span>
        </div>
      </div>
    </div>
  );
}
