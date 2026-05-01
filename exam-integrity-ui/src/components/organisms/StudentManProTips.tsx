import React from 'react';


export interface StudentManProTipsProps {
    tips: string[];
}

/**
 * StudentManProTips
 *
 * Displays a list of exam tips in a styled box, inspired by "The Proctor (Contract Aligned)" screen.
 */
const StudentManProTips: React.FC<StudentManProTipsProps> = ({ tips }) => {
    if (!tips?.length) return null;
    return (
        <aside className="rounded-2xl border border-amber-200 bg-gradient-to-b from-amber-50 via-white to-orange-50 p-4 md:p-5 mb-6 shadow-[0_14px_30px_-28px_rgba(217,119,6,0.45)]">
            <div className="flex items-center mb-3">
                <span className="mr-2 text-amber-500 text-xl" aria-hidden="true">💡</span>
                <div>
                    <p className="text-amber-900 font-semibold text-base leading-5">Focus Tips</p>
                    <p className="text-xs text-slate-500">Quick reminders to keep your exam flow steady.</p>
                </div>
            </div>
            <ul className="list-none m-0 p-0 space-y-2">
                {tips.map((tip, idx) => (
                    <li key={idx} className="flex items-start rounded-lg bg-white/95 border border-amber-100 px-2.5 py-2 text-slate-700">
                        <span className="min-w-[24px] h-6 mr-2 inline-flex items-center justify-center rounded-full bg-amber-100 text-amber-800 text-xs font-bold">{idx + 1}</span>
                        <span className="text-xs leading-5">{tip}</span>
                    </li>
                ))}
            </ul>
        </aside>
    );
};

export default StudentManProTips;
