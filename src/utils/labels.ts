export interface LabelDef {
  name: string;
  color: string; // hex color for any custom drawing
  colorName: 'emerald' | 'rose' | 'cyan' | 'amber' | 'violet' | 'pink' | 'slate';
}

export const PRESET_COLORS = [
  { name: 'emerald', label: 'Green (Target)', hex: '#10b981', classes: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  { name: 'rose', label: 'Red (Avoid)', hex: '#f43f5e', classes: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
  { name: 'cyan', label: 'Blue (Sleeper)', hex: '#06b6d4', classes: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
  { name: 'amber', label: 'Orange (Value)', hex: '#f59e0b', classes: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  { name: 'violet', label: 'Purple (High Potential)', hex: '#8b5cf6', classes: 'bg-violet-500/10 text-violet-400 border-violet-500/20' },
  { name: 'pink', label: 'Pink (Boom/Bust)', hex: '#ec4899', classes: 'bg-pink-500/10 text-pink-400 border-pink-500/20' },
  { name: 'slate', label: 'Gray (Standard)', hex: '#64748b', classes: 'bg-slate-500/10 text-slate-400 border-slate-500/20' }
] as const;

export const DEFAULT_LABELS: LabelDef[] = [
  { name: 'Target', color: '#10b981', colorName: 'emerald' },
  { name: 'Avoid', color: '#f43f5e', colorName: 'rose' },
  { name: 'Draft Sleeper', color: '#06b6d4', colorName: 'cyan' },
];

export function getLabelClasses(colorName: string): string {
  const preset = PRESET_COLORS.find(p => p.name === colorName);
  return preset ? preset.classes : 'bg-slate-500/10 text-slate-400 border-slate-500/20';
}

export function getLabelHex(colorName: string): string {
  const preset = PRESET_COLORS.find(p => p.name === colorName);
  return preset ? preset.hex : '#64748b';
}
