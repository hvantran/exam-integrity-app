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
        <div className="bg-gray-100 rounded-xl p-4 mb-6">
            <div className="flex items-center mb-2">
                {/* Replace with a suitable icon or emoji if needed */}
                <span className="mr-2 text-blue-500 text-xl">💡</span>
                <span className="text-blue-700 font-semibold text-base">Exam Tips</span>
            </div>
            <ul className="list-none m-0 p-0">
                {tips.map((tip, idx) => (
                    <li key={idx} className="flex items-start pl-0 text-orange-700 mb-1">
                        <span className="min-w-[32px] font-medium text-blue-600">{idx + 1}.</span>
                        <span className="text-sm font-light ml-1">{tip}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default StudentManProTips;
