import React from 'react';
import { Box, Typography, Card, CardContent, Button, Stack, Chip } from '@mui/material';

export interface StudentManQuestionPanelNewProps {
  questionNumber: number;
  questionText: string;
  questionType: string;
  options: { key: string; text: string }[];
  selectedAnswer: string;
  onAnswerChange: (answer: string) => void;
  flagged: boolean;
  onFlag: () => void;
  proctorStatus?: string;
  contractInfo?: string;
}

/**
 * StudentManQuestionPanelNew
 *
 * UI inspired by "The Proctor (Contract Aligned)" screen from Stitch project 8122037334464308531.
 */
const StudentManQuestionPanelNew: React.FC<StudentManQuestionPanelNewProps> = ({
  questionNumber,
  questionText,
  questionType,
  options,
  selectedAnswer,
  onAnswerChange,
  flagged,
  onFlag,
  proctorStatus,
  contractInfo,
}) => {
  return (
    <Card sx={{ borderRadius: 3, boxShadow: 3, p: 0, overflow: 'visible' }}>
      <CardContent sx={{ pb: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="subtitle2" color="text.secondary">
            Question {questionNumber}
          </Typography>
          <Chip
            label={flagged ? 'Flagged for Review' : 'Mark for Review'}
            color={flagged ? 'warning' : 'default'}
            variant={flagged ? 'filled' : 'outlined'}
            size="small"
            onClick={onFlag}
            sx={{ fontWeight: 500 }}
          />
        </Stack>
        <Typography variant="h6" fontWeight={600} mb={2}>
          {questionText}
        </Typography>
        <Stack spacing={1} mb={2}>
          {options.map(option => (
            <Button
              key={option.key}
              variant={selectedAnswer === option.key ? 'contained' : 'outlined'}
              color={selectedAnswer === option.key ? 'primary' : 'inherit'}
              fullWidth
              sx={{
                justifyContent: 'flex-start',
                textTransform: 'none',
                fontWeight: selectedAnswer === option.key ? 600 : 400,
                borderRadius: 2,
                borderWidth: 2,
                borderColor: selectedAnswer === option.key ? 'primary.main' : 'grey.300',
                backgroundColor: selectedAnswer === option.key ? 'primary.50' : 'background.paper',
                boxShadow: selectedAnswer === option.key ? 2 : 0,
              }}
              onClick={() => onAnswerChange(option.key)}
              disabled={!!proctorStatus && proctorStatus !== 'active'}
            >
              <Box mr={2} fontWeight={600}>
                {option.key}
              </Box>
              {option.text}
            </Button>
          ))}
        </Stack>
        {contractInfo && (
          <Box mt={2} p={2} bgcolor="grey.100" borderRadius={2}>
            <Typography variant="body2" color="text.secondary">
              {contractInfo}
            </Typography>
          </Box>
        )}
        {proctorStatus && (
          <Box mt={2}>
            <Chip
              label={`Proctor: ${proctorStatus}`}
              color={proctorStatus === 'active' ? 'success' : 'error'}
              variant="outlined"
              size="small"
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentManQuestionPanelNew;
