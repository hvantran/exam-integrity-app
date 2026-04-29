/** Teacher dashboard: shows published exam list + create-from-bank dialog. */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Button, Typography, CircularProgress, Alert,
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Chip, Stack, Divider, Grid,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { TeacherManDashboardLayout } from '../components/templates';
import { useExamList, useCreateExamFromBank, useDeleteExam } from '../hooks/useExams';
import { useAuth } from '../context/AuthContext';
import { colors, typography, spacing, borderRadius } from '../design-system/tokens';
import type { DashboardSection } from '../components/organisms';
import type { CreateExamFromBankCommand } from '../types/exam.types';

const SECTION_ROUTES: Record<DashboardSection, string> = {
    dashboard: '/teacher/dashboard',
    ingestion: '/teacher/ingestion',
    review: '/teacher/ingestion',
    'question-bank': '/teacher/question-bank',
    reports: '/teacher/ingestion',
};

// ── Create-from-Bank Dialog ──────────────────────────────────────────────────

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

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 700, color: colors.on.surface }}>
                Create Exam from Question Bank
            </DialogTitle>
            <Divider />
            <DialogContent sx={{ pt: 2 }}>
                <Stack spacing={2.5}>
                    {error && <Alert severity="error">{error}</Alert>}

                    <TextField
                        label="Exam Name"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        fullWidth
                        required
                        size="small"
                    />

                    <TextField
                        label="Duration (minutes)"
                        type="number"
                        value={durationMin}
                        onChange={e => setDurationMin(Math.max(1, Number(e.target.value)))}
                        fullWidth
                        size="small"
                        inputProps={{ min: 1 }}
                    />

                    <Box>
                        <Typography variant="caption" sx={{ color: colors.on.surfaceVariant, mb: 0.5, display: 'block' }}>
                            Tags
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                            <TextField
                                size="small"
                                placeholder="Add tag and press Enter"
                                value={tagInput}
                                onChange={e => setTagInput(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                                sx={{ flex: 1 }}
                            />
                        </Box>
                        {tags.length > 0 && (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {tags.map(t => (
                                    <Chip key={t} label={t} size="small" onDelete={() => handleRemoveTag(t)} />
                                ))}
                            </Box>
                        )}
                    </Box>

                    <Divider>
                        <Typography variant="caption" sx={{ color: colors.on.surfaceVariant }}>
                            Question Bank Selection
                        </Typography>
                    </Divider>

                    <Grid container spacing={2}>
                        <Grid item xs={4}>
                            <Typography variant="caption" sx={{ color: colors.on.surfaceVariant, mb: 0.5, display: 'block' }}>
                                Number of multiple Choice (MCQ)
                            </Typography>
                            <TextField
                                type="number"
                                value={mcqCount}
                                onChange={e => setMcqCount(Math.max(0, Number(e.target.value)))}
                                fullWidth
                                size="small"
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <Typography variant="caption" sx={{ color: colors.on.surfaceVariant, mb: 0.5, display: 'block' }}>
                                Number of Essay Short Questions
                            </Typography>
                            <TextField
                                type="number"
                                value={essayShortCount}
                                onChange={e => setEssayShortCount(Math.max(0, Number(e.target.value)))}
                                fullWidth
                                size="small"
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <Typography variant="caption" sx={{ color: colors.on.surfaceVariant, mb: 0.5, display: 'block' }}>
                                Number of Essay Long Questions
                            </Typography>
                            <TextField
                                type="number"
                                value={essayLongCount}
                                onChange={e => setEssayLongCount(Math.max(0, Number(e.target.value)))}
                                fullWidth
                                size="small"
                            />
                        </Grid>
                    </Grid>

                    <TextField
                        label="Notes"
                        value={reviewNotes}
                        onChange={e => setReviewNotes(e.target.value)}
                        fullWidth
                        multiline
                        rows={2}
                        size="small"
                        placeholder="Optional notes for this exam"
                    />
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={handleClose} disabled={isLoading}>Cancel</Button>
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={isLoading || !title.trim() || (mcqCount + essayShortCount + essayLongCount === 0)}
                    startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : undefined}
                >
                    {isLoading ? 'Creating…' : 'Create Exam'}
                </Button>
            </DialogActions>
        </Dialog>
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
    <Box
        sx={{
            backgroundColor: colors.surface.container.lowest,
            border: `1px solid ${colors.outlineVariant}`,
            borderRadius: borderRadius.xl,
            p: `${spacing.stackMd}px`,
            position: 'relative',
            overflow: 'hidden',
        }}
    >
        <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, backgroundColor: colors.primary.main }} />
        <Typography
            sx={{
                fontSize: typography.scale.uiLabel.fontSize,
                fontWeight: 600,
                color: colors.on.surface,
                mb: 1,
            }}
        >
            {title}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 1, color: colors.on.surfaceVariant, fontSize: '13px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <AccessTimeIcon sx={{ fontSize: 14 }} />
                {Math.round(durationSeconds / 60)} min
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <HelpOutlineIcon sx={{ fontSize: 14 }} />
                {questionCount} questions
            </Box>
            <Typography sx={{ fontSize: '13px', color: colors.on.surfaceVariant }}>
                {totalPoints} pts
            </Typography>
        </Box>
        {tags && tags.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {tags.map(t => (
                    <Chip
                        key={t}
                        label={t}
                        size="small"
                        sx={{
                            backgroundColor: colors.primary.fixed,
                            color: colors.primary.main,
                            fontSize: '11px',
                            height: 20,
                        }}
                    />
                ))}
            </Box>
        )}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1.5 }}>
            <Button
                size="small"
                color="error"
                startIcon={<DeleteOutlineIcon sx={{ fontSize: 16, color: 'red' }} />}
                onClick={onDelete}
                sx={{
                    fontSize: '12px',
                    color: '#d32f2f',
                    borderColor: '#d32f2f',
                    textTransform: 'none',
                    '&:hover': { backgroundColor: '#d32f2f14', borderColor: '#b71c1c' },
                }}>
                Delete
            </Button>
        </Box>
    </Box>
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
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: `${spacing.stackLg}px` }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: colors.on.surface }}>
                        Dashboard
                    </Typography>
                    <Typography sx={{ fontSize: '14px', color: colors.on.surfaceVariant, mt: 0.5 }}>
                        Published exams available to students
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setDialogOpen(true)}
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                    Create Exam from Bank
                </Button>
            </Box>

            {/* Content */}
            {isLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                    <CircularProgress />
                </Box>
            )}

            {!isLoading && (!exams || exams.length === 0) && (
                <Box
                    sx={{
                        textAlign: 'center',
                        py: 8,
                        color: colors.on.surfaceVariant,
                        border: `1px dashed ${colors.outlineVariant}`,
                        borderRadius: borderRadius.xl,
                    }}
                >
                    <Typography sx={{ fontSize: '16px', fontWeight: 500, mb: 1 }}>No published exams yet</Typography>
                    <Typography sx={{ fontSize: '14px' }}>
                        Create an exam from the question bank or publish a draft to get started.
                    </Typography>
                </Box>
            )}

            {!isLoading && exams && exams.length > 0 && (
                <Grid container spacing={2}>
                    {exams.map(exam => (
                        <Grid item xs={12} sm={6} md={4} key={exam.id}>
                            <ExamCard
                                title={exam.title}
                                durationSeconds={exam.durationSeconds}
                                questionCount={exam.questionCount}
                                totalPoints={exam.totalPoints}
                                tags={exam.tags}
                                onDelete={() => setDeleteTarget({ id: exam.id, title: exam.title })}
                            />
                        </Grid>
                    ))}
                </Grid>
            )}

            <CreateExamDialog
                open={dialogOpen}
                onClose={() => { setDialogOpen(false); setCreateError(null); }}
                onSubmit={handleCreate}
                isLoading={createFromBank.isPending}
                error={createError}
            />

            {/* Delete confirmation dialog */}
            <Dialog open={!!deleteTarget} onClose={() => { if (!deleteExam.isPending) setDeleteTarget(null); }} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: 700 }}>Delete Exam</DialogTitle>
                <DialogContent>
                    {deleteError && <Alert severity="error" sx={{ mb: 1 }}>{deleteError}</Alert>}
                    <Typography>
                        Are you sure you want to delete <strong>{deleteTarget?.title}</strong>? This action cannot be undone.
                        Questions in the question bank will not be affected.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setDeleteTarget(null)} disabled={deleteExam.isPending}>Cancel</Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleDeleteConfirm}
                        disabled={deleteExam.isPending}
                        startIcon={deleteExam.isPending ? <CircularProgress size={16} color="inherit" /> : undefined}
                    >
                        {deleteExam.isPending ? 'Deleting…' : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>
        </TeacherManDashboardLayout>
    );
};

export default TeacherManDashboardPage;
