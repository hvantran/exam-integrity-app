import React from 'react';
import { Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { resolveGradeTier } from '../hooks/useGradeTheme';

const GRADES = [
  { value: 'auto', label: 'Auto (Profile/Tag)' },
  { value: '1', label: 'Grade 1 (Elementary)' },
  { value: '2', label: 'Grade 2 (Elementary)' },
  { value: '3', label: 'Grade 3 (Elementary)' },
  { value: '4', label: 'Grade 4 (Elementary)' },
  { value: '5', label: 'Grade 5 (Elementary)' },
  { value: '6', label: 'Grade 6 (Middle)' },
  { value: '7', label: 'Grade 7 (Middle)' },
  { value: '8', label: 'Grade 8 (Middle)' },
  { value: '9', label: 'Grade 9 (Middle)' },
  { value: '10', label: 'Grade 10 (High)' },
  { value: '11', label: 'Grade 11 (High)' },
  { value: '12', label: 'Grade 12 (High)' },
];

export const StudentGradeSwitcherPill: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { overrideGrade, setOverrideGrade, effectiveGrade, canSwitchGrade } = useAuth();
  const tier = resolveGradeTier(effectiveGrade);

  const tierBadge =
    tier === 'elementary'
      ? { text: '🌟 Elementary (Gr 1-5)', bg: 'bg-amber-100 text-amber-900 border-amber-300' }
      : tier === 'middle'
        ? { text: '🎯 Middle (Gr 6-9)', bg: 'bg-emerald-100 text-emerald-900 border-emerald-300' }
        : { text: '🎓 High (Gr 10-12)', bg: 'bg-blue-100 text-blue-900 border-blue-300' };

  if (!canSwitchGrade) {
    return (
      <div className={`inline-flex items-center gap-2 text-xs ${className}`}>
        <span className={`px-2 py-0.5 rounded-full font-bold border ${tierBadge.bg}`}>
          {tierBadge.text}
        </span>
        <span
          className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 shadow-sm"
          title="Grade is fixed to your student account and cannot be switched"
        >
          <Lock size={12} className="text-slate-500" />
          {effectiveGrade ? `Grade ${effectiveGrade}` : 'Assigned Grade'}
        </span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 text-xs ${className}`}>
      <span className={`px-2 py-0.5 rounded-full font-bold border ${tierBadge.bg}`}>
        {tierBadge.text}
      </span>
      <label htmlFor="grade-switcher-select" className="sr-only">
        Select Grade
      </label>
      <select
        id="grade-switcher-select"
        value={overrideGrade == null ? 'auto' : String(overrideGrade)}
        onChange={(e) => {
          const val = e.target.value;
          setOverrideGrade(val === 'auto' ? null : Number(val));
        }}
        className="rounded-lg border border-slate-300 bg-white/90 px-2 py-1 text-xs font-semibold text-slate-800 shadow-sm focus:border-amber-500 focus:outline-none"
      >
        {GRADES.map((g) => (
          <option key={g.value} value={g.value}>
            {g.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default StudentGradeSwitcherPill;

