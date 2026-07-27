import React from 'react';

export interface StudentManProTipsProps {
  tips: string[];
  variant?: 'elementary' | 'middle' | 'high';
}

/**
 * StudentManProTips
 *
 * Displays a list of exam tips in a styled box, inspired by "The Proctor (Contract Aligned)" screen.
 */
const StudentManProTips: React.FC<StudentManProTipsProps> = ({ tips, variant = 'high' }) => {
  if (!tips?.length) return null;

  const variantClasses = {
    elementary: {
      wrapper:
        'border-cyan-200 bg-gradient-to-b from-cyan-50 via-white to-sky-50 shadow-[0_14px_30px_-28px_rgba(14,165,233,0.45)]',
      icon: 'text-cyan-500',
      title: 'text-cyan-900',
      subtitle: 'text-cyan-700/70',
      item: 'border-cyan-100',
      badge: 'bg-cyan-100 text-cyan-800',
    },
    middle: {
      wrapper:
        'border-emerald-200 bg-gradient-to-b from-emerald-50 via-white to-lime-50 shadow-[0_14px_30px_-28px_rgba(5,150,105,0.45)]',
      icon: 'text-emerald-500',
      title: 'text-emerald-900',
      subtitle: 'text-emerald-700/70',
      item: 'border-emerald-100',
      badge: 'bg-emerald-100 text-emerald-800',
    },
    high: {
      wrapper:
        'border-amber-200 bg-gradient-to-b from-amber-50 via-white to-orange-50 shadow-[0_14px_30px_-28px_rgba(217,119,6,0.45)]',
      icon: 'text-amber-500',
      title: 'text-amber-900',
      subtitle: 'text-slate-500',
      item: 'border-amber-100',
      badge: 'bg-amber-100 text-amber-800',
    },
  }[variant];

  return (
    <aside className={`rounded-2xl border p-4 md:p-5 mb-6 ${variantClasses.wrapper}`}>
      <div className="flex items-center mb-3">
        <span className={`mr-2 text-xl ${variantClasses.icon}`} aria-hidden="true">
          💡
        </span>
        <div>
          <p className={`font-semibold text-base leading-5 ${variantClasses.title}`}>Focus Tips</p>
          <p className={`text-xs ${variantClasses.subtitle}`}>
            Quick reminders to keep your exam flow steady.
          </p>
        </div>
      </div>
      <ul className="list-none m-0 p-0 space-y-2">
        {tips.map((tip, idx) => (
          <li
            key={idx}
            className={`flex items-start rounded-lg bg-white/95 border px-2.5 py-2 text-slate-700 ${variantClasses.item}`}
          >
            <span
              className={`min-w-[24px] h-6 mr-2 inline-flex items-center justify-center rounded-full text-xs font-bold ${variantClasses.badge}`}
            >
              {idx + 1}
            </span>
            <span className="text-xs leading-5">{tip}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default StudentManProTips;
