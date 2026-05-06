import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@mui/material';
import AnswerBox from './AnswerBox';

const meta: Meta<typeof AnswerBox> = {
  title: 'Molecules/AnswerBox',
  component: AnswerBox,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AnswerBox>;

const mcqOptions = ['A. 12 + 8 = 20', 'B. 12 + 8 = 18', 'C. 12 + 8 = 22', 'D. 12 + 8 = 24'];

export const MultipleChoice: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? mcqOptions[0]);
    return (
      <Box sx={{ maxWidth: 560 }}>
        <AnswerBox {...args} value={value} onChange={setValue} />
      </Box>
    );
  },
  args: {
    questionId: 'mcq-1',
    questionType: 'MCQ',
    options: mcqOptions,
    value: mcqOptions[0],
    disabled: false,
  },
};

export const Essay: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? '');
    return (
      <Box sx={{ maxWidth: 720 }}>
        <AnswerBox {...args} value={value} onChange={setValue} />
      </Box>
    );
  },
  args: {
    questionId: 'essay-1',
    questionType: 'ESSAY_LONG',
    value: 'Plants need sunlight, water, and nutrients from the soil to grow well.',
    disabled: false,
  },
};

export const Disabled: Story = {
  args: {
    questionId: 'disabled-1',
    questionType: 'MCQ',
    options: mcqOptions,
    value: mcqOptions[1],
    onChange: () => {},
    disabled: true,
  },
};

export const Loading: Story = {
  args: {
    questionId: 'loading-1',
    questionType: 'MCQ',
    options: mcqOptions,
    value: '',
    onChange: () => {},
    isLoading: true,
  },
};
