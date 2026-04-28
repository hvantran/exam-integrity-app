import React from 'react';
import { Box, Typography, Chip, Button } from '@mui/material';
import ScheduleIcon from '@mui/icons-material/Schedule';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import GradeIcon from '@mui/icons-material/Grade';
import { colors, borderRadius, shadow, spacing } from '../../../design-system/tokens';

export interface ExamCardProps {
  title: string;
  /** Primary subject tag e.g. "Toán", "Tiếng Việt" */
  subject: string;
  /** Grade tag e.g. "Lớp 4" */
  grade?: string;
  /** Type tag e.g. "Giữa kỳ", "Đọc hiểu" */
  type?: string;
  durationMinutes: number;
  questionCount: number;
  points?: number;
  /**
   * When true the left accent bar uses Trust Blue (assigned/active).
   * When false it uses a neutral surface-variant colour.
   */
  isHighlighted?: boolean;
  onStart?: () => void;
}

/**
 * Molecule — StudentManExamCard
 *
 * Exam card used in the Student Portal Landing Page grid.
 * Per Zen Integrity System: white card, 1px outline-variant border, 4px
 * left accent bar (Trust Blue when highlighted, neutral otherwise).
 */
const StudentManExamCard: React.FC<ExamCardProps> = ({
  title,
  subject,
  grade,
  type,
  durationMinutes,
  questionCount,
  points,
  isHighlighted = false,
  onStart,
}) => {
  const accentColor = isHighlighted ? colors.primary.container : colors.surface.container.highest;

  return (
    <Box
      sx={{
        position: 'relative',
        backgroundColor: colors.surface.container.lowest,
        border: `1px solid ${colors.outlineVariant}`,
        borderRadius: borderRadius.lg,
        padding: `${spacing.stackLg}px`,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        transition: 'box-shadow 0.3s ease',
        '&:hover': { boxShadow: shadow.cardActive },
      }}
    >
      {/* Left accent bar — 4px Trust Blue strip per spec */}
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          backgroundColor: accentColor,
          borderRadius: `${borderRadius.lg} 0 0 ${borderRadius.lg}`,
        }}
      />

      <Box sx={{ flex: 1 }}>
        {/* Tags */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '8px', mb: `${spacing.stackMd}px` }}>
          {[subject, grade, type].filter(Boolean).map((tag) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              sx={{
                height: 20,
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                backgroundColor: colors.surface.container.low,
                color: colors.primary.container,
                borderRadius: borderRadius.sm,
                '& .MuiChip-label': { px: '6px', py: 0 },
              }}
            />
          ))}
        </Box>

        {/* Title */}
        <Typography
          sx={{
            fontSize: '20px',
            fontWeight: 600,
            lineHeight: '28px',
            color: colors.on.surface,
            mb: `${spacing.stackMd}px`,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {title}
        </Typography>

        {/* Metadata row */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            mt: `${spacing.stackMd}px`,
            pt: `${spacing.stackMd}px`,
            borderTop: `1px solid ${colors.surface.container.highest}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px', color: colors.on.surfaceVariant }}>
            <ScheduleIcon sx={{ fontSize: 18 }} />
            <Typography sx={{ fontSize: '14px', fontWeight: 500, lineHeight: '20px' }}>
              {durationMinutes} min
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px', color: colors.on.surfaceVariant }}>
            <FormatListNumberedIcon sx={{ fontSize: 18 }} />
            <Typography sx={{ fontSize: '14px', fontWeight: 500, lineHeight: '20px' }}>
              {questionCount} questions
            </Typography>
          </Box>
          {points !== undefined && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px', color: colors.on.surfaceVariant }}>
              <GradeIcon sx={{ fontSize: 18 }} />
              <Typography sx={{ fontSize: '14px', fontWeight: 500, lineHeight: '20px' }}>
                {points} pts
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* CTA button */}
      <Button
        variant={isHighlighted ? 'contained' : 'outlined'}
        fullWidth
        onClick={onStart}
        sx={{
          mt: `${spacing.stackLg}px`,
          py: '12px',
          fontSize: '14px',
          fontWeight: 500,
          borderRadius: borderRadius.default,
          ...(isHighlighted
            ? {
                backgroundColor: colors.primary.deep,
                color: colors.primary.on,
                '&:hover': { backgroundColor: '#001d66' },
              }
            : {
                borderColor: colors.outlineVariant,
                color: colors.primary.deep,
                '&:hover': { backgroundColor: colors.surface.container.low },
              }),
        }}
      >
        Start Exam
      </Button>
    </Box>
  );
};

export default StudentManExamCard;
