import React from 'react';
import { Box } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import FlagIcon from '@mui/icons-material/Flag';
import { colors, borderRadius } from '../../design-system/tokens';
import { Button } from '../atoms';

export interface ExamNavigationBarProps {
  canGoPrev: boolean;
  canGoNext: boolean;
  isFlagged?: boolean;
  isLastQuestion?: boolean;
  flaggedCount?: number;
  onPrevious: () => void;
  onNext: () => void;
  onFlag: () => void;
  onSubmit: () => void;
  onReviewFlagged?: () => void;
}

/**
 * Organism — StudentManExamNavigationBar
 *
 * Fixed bottom-of-content navigation strip from "Student Portal – Active Exam".
 * Back / Next on the left; Flag in the centre; Submit on the right.
 */
const StudentManExamNavigationBar: React.FC<ExamNavigationBarProps> = ({
  canGoPrev,
  canGoNext,
  isFlagged = false,
  isLastQuestion = false,
  onPrevious,
  onNext,
  onFlag,
  onSubmit,
  flaggedCount = 0,
  onReviewFlagged,
}) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 1.5,
      flexWrap: 'wrap',
      pt: 3,
      borderTop: `1px solid ${colors.outlineVariant}`,
      mt: 3,
    }}
  >
    {/* Left cluster */}
    <Button
      variant="secondary"
      disabled={!canGoPrev}
      startIcon={<ArrowBackIcon sx={{ fontSize: 16 }} />}
      onClick={onPrevious}
    >
      Back
    </Button>

    <Button
      variant="secondary"
      disabled={!canGoNext}
      endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
      onClick={onNext}
    >
      Next
    </Button>

    {/* Spacer */}
    <Box sx={{ flex: 1 }} />

    {/* Flag */}
    <Button
      variant="ghost"
      startIcon={
        <FlagIcon
          sx={{
            fontSize: 16,
            color: isFlagged ? '#F59E0B' : colors.on.surfaceVariant,
          }}
        />
      }
      onClick={onFlag}
    >
      {isFlagged ? 'Unflag' : 'Flag'}
    </Button>

    {/* Review Flagged — only on last question and if flagged exist */}
    {isLastQuestion && flaggedCount > 0 && onReviewFlagged && (
      <Button
        variant="outlined"
        onClick={onReviewFlagged}
        sx={{ marginLeft: 8, color: '#F59E0B', borderColor: '#F59E0B', fontWeight: 600 }}
      >
        Review Flagged ({flaggedCount})
      </Button>
    )}

    {/* Submit — only shown on last question or always visible */}
    <Button variant="danger" onClick={onSubmit}>
      Submit
    </Button>
  </Box>
);

export default StudentManExamNavigationBar;
