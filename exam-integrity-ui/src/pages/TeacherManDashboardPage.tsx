/** Teacher dashboard: shows published exam list + create-from-bank dialog. */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TeacherManDashboardLayout } from '../components/templates';
import { Skeleton } from '../components/molecules';
import { Button, Chip } from '../components/atoms';
import { useExamList, useCreateExamFromBank, useDeleteExam } from '../hooks/useExams';
import { useAuth } from '../context/AuthContext';
import type { DashboardSection } from '../components/organisms';
import type { CreateExamFromBankCommand } from '../types/exam.types';
import { colors } from '../design-system/tokens';
import { Clock, Minus, Trash2 } from 'lucide-react';
const SECTION_ROUTES: Record<DashboardSection, string> = {
    dashboard: '/teacher/dashboard',
    ingestion: '/teacher/ingestion',
    review: '/teacher/ingestion',
    scoring: '/teacher/scoring',
    'question-bank': '/teacher/question-bank',
    reports: '/teacher/ingestion',
};

interface CreateExamDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (cmd: CreateExamFromBankCommand) => void;
    isLoading: boolean;
    error?: string | null;
}

const CreateExamDialog: React.FC<CreateExamDialogProps> = ({ open, onClose, onSubmit, isLoading, error }) => {
    const [title, setTitle] = useState('');
    const [durationMin, setDurationMin] = useState(60);
    const [tagInput, setTagInput] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [reviewNotes, setReviewNotes] = useState('');
    const [mcqCount, setMcqCount] = useState(10);
    const [essayShortCount, setEssayShortCount] = useState(1);
    const [essayLongCount, setEssayLongCount] = useState(1);

    const handleAddTag = () => {
        const t = tagInput.trim();
        if (t && !tags.includes(t)) setTags(prev => [...prev, t]);
        setTagInput('');
    };

    const handleRemoveTag = (t: string) => setTags(prev => prev.filter(x => x !== t));

    const handleSubmit = () => {
        if (!title.trim()) return;
        onSubmit({
            title: title.trim(),
            durationSeconds: durationMin * 60,
            tags: tags.length > 0 ? tags : undefined,
            reviewNotes: reviewNotes.trim() || undefined,
            mcqCount,
            essayShortCount,
            essayLongCount,
        });
    };

    const handleClose = () => {
        if (isLoading) return;
        setTitle(''); setDurationMin(60); setTagInput(''); setTags([]);
        setReviewNotes(''); setMcqCount(10); setEssayShortCount(1); setEssayLongCount(1);
        onClose();
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface bg-opacity-30">
            <div className="bg-surface rounded-xl shadow-lg w-full max-w-lg p-6 relative">
                <Button variant="ghost" size="sm" className="!absolute !top-3 !right-3 !min-w-0 !p-1 !rounded-full" onClick={handleClose}>&times;</Button>
                <h2 className="text-lg font-bold mb-4">Create Exam from Question Bank</h2>
                {error && <div className="mb-2 text-error bg-errorContainer rounded px-2 py-1 text-sm">{error}</div>}
                <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleSubmit(); }}>
                    <div>
                        <label className="block text-xs font-medium text-on-surface mb-1">Exam Name</label>
                        <input
                            className="w-full border border-outline rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-on-surface mb-1">Duration (minutes)</label>
                        <input
                            type="number"
                            min={1}
                            className="w-full border border-outline rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            value={durationMin}
                            onChange={e => setDurationMin(Math.max(1, Number(e.target.value)))}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-on-surface mb-1">Tags</label>
                        <div className="flex gap-2 mb-1">
                            <input
                                className="flex-1 border border-outline rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Add tag and press Enter"
                                value={tagInput}
                                onChange={e => setTagInput(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                            />
                        </div>
                        {tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                                {tags.map(t => (
                                    <Chip
                                        key={t}
                                        label={t}
                                        size="small"
                                        onDelete={() => handleRemoveTag(t)}
                                        style={{ backgroundColor: `${colors.primary.main}18`, color: colors.primary.main }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                    <div>
                        <div className="text-xs font-semibold text-on-surface mb-2">Question Bank Selection</div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-on-surface mb-1"># MCQ</label>
                                <input
                                    type="number"
                                    min={0}
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    value={mcqCount}
                                    onChange={e => setMcqCount(Math.max(0, Number(e.target.value)))}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1"># Essay Short</label>
                                <input
                                    type="number"
                                    min={0}
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    value={essayShortCount}
                                    onChange={e => setEssayShortCount(Math.max(0, Number(e.target.value)))}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1"># Essay Long</label>
                                <input
                                    type="number"
                                    min={0}
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    value={essayLongCount}
                                    onChange={e => setEssayLongCount(Math.max(0, Number(e.target.value)))}
                                />
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
                        <textarea
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                            value={reviewNotes}
                            onChange={e => setReviewNotes(e.target.value)}
                            rows={2}
                            placeholder="Optional notes for this exam"
                        />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="neutral" onClick={handleClose} disabled={isLoading}>Cancel</Button>
                        <Button type="submit" variant="primary" disabled={isLoading || !title.trim() || (mcqCount + essayShortCount + essayLongCount === 0)}>
                            {isLoading ? 'Creating…' : 'Create Exam'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ── Exam Card ────────────────────────────────────────────────────────────────

interface ExamCardProps {
    title: string;
    durationSeconds: number;
    questionCount: number;
    totalPoints: number;
    tags?: string[];
    onDelete: () => void;
}

const ExamCard: React.FC<ExamCardProps> = ({ title, durationSeconds, questionCount, totalPoints, tags, onDelete }) => (
    <div className="relative overflow-hidden border border-gray-300 rounded-xl p-4 bg-white shadow-sm">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary-700 rounded-l-xl" />
        <div className="font-semibold text-base text-gray-900 mb-2">{title}</div>
        <div className="flex gap-4 mb-2 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1">
                <Clock size={16} className="text-gray-400" />
                {Math.round(durationSeconds / 60)} min
            </span>
            <span className="inline-flex items-center gap-1">
                <Minus size={16} className="text-gray-400" />
                {questionCount} questions
            </span>
            <span>{totalPoints} pts</span>
        </div>
        {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
                {tags.map(t => (
                    <span key={t} className="bg-primary-100 text-primary text-xs px-2 py-0.5 rounded-full font-medium">{t}</span>
                ))}
            </div>
        )}
        <div className="flex justify-end mt-3">
            <Button variant="outlined" size="sm" className="text-xs" onClick={onDelete} type="button" icon={<Trash2 size={16} className="text-error-700" />}>
                Delete
            </Button>
        </div>
    </div>
);

// ── Page ─────────────────────────────────────────────────────────────────────

const TeacherManDashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const { data: exams, isLoading } = useExamList();
    const createFromBank = useCreateExamFromBank();
    const deleteExam = useDeleteExam();

    const handleLogout = () => { logout(); navigate('/login', { replace: true }); };
    const handleNavigate = (section: DashboardSection) => navigate(SECTION_ROUTES[section]);

    const handleCreate = (cmd: CreateExamFromBankCommand) => {
        setCreateError(null);
        createFromBank.mutate(cmd, {
            onSuccess: () => setDialogOpen(false),
            onError: (e: Error) => setCreateError(e.message),
        });
    };

    const handleDeleteConfirm = () => {
        if (!deleteTarget) return;
        setDeleteError(null);
        deleteExam.mutate(deleteTarget.id, {
            onSuccess: () => setDeleteTarget(null),
            onError: (e: Error) => setDeleteError(e.message),
        });
    };

    return (
        <TeacherManDashboardLayout
            activeSection="dashboard"
            onNavigate={handleNavigate}
            onCreateExam={() => setDialogOpen(true)}
            onLogout={handleLogout}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                    <div className="text-sm text-gray-500 mt-1">Published exams available to students</div>
                </div>
                <Button variant="primary" onClick={() => setDialogOpen(true)}>
                    <span className="text-lg font-bold">+</span>
                    Create Exam from Bank
                </Button>
            </div>

            {/* Content */}
            {isLoading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 py-2">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <Skeleton key={index} height={220} />
                    ))}
                </div>
            )}

            {!isLoading && (!exams || exams.length === 0) && (
                <div className="text-center py-16 text-gray-400 border border-dashed border-gray-300 rounded-2xl">
                    <div className="text-base font-semibold mb-2">No published exams yet</div>
                    <div className="text-sm">Create an exam from the question bank or publish a draft to get started.</div>
                </div>
            )}

            {!isLoading && exams && exams.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {exams.map(exam => (
                        <div key={exam.id}>
                            <ExamCard
                                title={exam.title}
                                durationSeconds={exam.durationSeconds}
                                questionCount={exam.questionCount}
                                totalPoints={exam.totalPoints}
                                tags={exam.tags}
                                onDelete={() => setDeleteTarget({ id: exam.id, title: exam.title })}
                            />
                        </div>
                    ))}
                </div>
            )}

            <CreateExamDialog
                open={dialogOpen}
                onClose={() => { setDialogOpen(false); setCreateError(null); }}
                onSubmit={handleCreate}
                isLoading={createFromBank.isPending}
                error={createError}
            />

            {/* Delete confirmation dialog (Tailwind-based) */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-xs p-6 relative">
                        <Button variant="ghost" size="sm" className="!absolute !top-3 !right-3 !min-w-0 !p-1 !rounded-full" onClick={() => { if (!deleteExam.isPending) setDeleteTarget(null); }}>&times;</Button>
                        <h2 className="text-lg font-bold mb-3">Delete Exam</h2>
                        {deleteError && <div className="mb-2 text-red-600 bg-red-50 rounded px-2 py-1 text-sm">{deleteError}</div>}
                        <div className="mb-4 text-gray-700">
                            Are you sure you want to delete <strong>{deleteTarget.title}</strong>? This action cannot be undone.<br />
                            <span className="text-gray-500 text-xs">Questions in the question bank will not be affected.</span>
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <Button variant="neutral" onClick={() => setDeleteTarget(null)} disabled={deleteExam.isPending}>Cancel</Button>
                            <Button variant="danger" onClick={handleDeleteConfirm} disabled={deleteExam.isPending}>
                                {deleteExam.isPending ? 'Deleting…' : 'Delete'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </TeacherManDashboardLayout>
    );
};

export default TeacherManDashboardPage;
