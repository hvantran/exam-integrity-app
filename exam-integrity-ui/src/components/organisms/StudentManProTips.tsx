import React from 'react';
import { Box, Typography, List, ListItem, ListItemIcon, ListItemText, Paper } from '@mui/material';
import TipsAndUpdatesRoundedIcon from '@mui/icons-material/TipsAndUpdatesRounded';

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
    <Paper elevation={0} sx={{ bgcolor: 'grey.100', borderRadius: 3, p: 2, mb: 3 }}>
      <Box display="flex" alignItems="center" mb={1}>
        <TipsAndUpdatesRoundedIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="subtitle1" fontWeight={600} color="primary.main">
          Exam Tips
        </Typography>
      </Box>
      <List dense disablePadding>
        {tips.map((tip, idx) => (
          <ListItem key={idx} sx={{ pl: 0 }}>
            <ListItemIcon sx={{ minWidth: 32 }}>
              <Typography variant="body2" color="primary" fontWeight={500}>{idx + 1}.</Typography>
            </ListItemIcon>
            <ListItemText primary={<Typography variant="subtitle2">{tip}</Typography>} />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default StudentManProTips;
