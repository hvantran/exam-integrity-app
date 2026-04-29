import React from 'react';
import { Box, List, ListItemButton, ListItemText, Typography, Chip } from '@mui/material';

export interface StudentManFlaggedSidebarProps {
  flaggedMap: Record<number, boolean>;
  totalQuestions: number;
  onJumpTo: (questionNumber: number) => void;
  currentQuestion: number;
}

const StudentManFlaggedSidebar: React.FC<StudentManFlaggedSidebarProps> = ({ flaggedMap, totalQuestions, onJumpTo, currentQuestion }) => {
  const flaggedNumbers = Object.entries(flaggedMap)
    .filter(([_, flagged]) => flagged)
    .map(([num]) => Number(num))
    .sort((a, b) => a - b);

  if (flaggedNumbers.length === 0) {
    return (
      <Box p={2}>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          No flagged questions
        </Typography>
      </Box>
    );
  }

  return (
    <Box p={2}>
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
        Flagged Questions
        <Chip label={flaggedNumbers.length} size="small" color="warning" sx={{ ml: 1 }} />
      </Typography>
      <List dense>
        {flaggedNumbers.map(num => (
          <ListItemButton
            key={num}
            selected={num === currentQuestion}
            onClick={() => onJumpTo(num)}
            sx={{ borderRadius: 2, mb: 0.5 }}
          >
            <ListItemText primary={`Question ${num}`} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
};

export default StudentManFlaggedSidebar;
