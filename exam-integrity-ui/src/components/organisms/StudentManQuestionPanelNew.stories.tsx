import React, { useState } from 'react';
import { StoryFn, Meta } from '@storybook/react';
import StudentManQuestionPanelNew, {
  StudentManQuestionPanelNewProps,
} from './StudentManQuestionPanelNew';

export default {
  title: 'Organisms/StudentManQuestionPanelNew',
  component: StudentManQuestionPanelNew,
  argTypes: {
    onAnswerChange: { action: 'answer changed' },
    onFlag: { action: 'flag toggled' },
  },
} as Meta<typeof StudentManQuestionPanelNew>;

const Template: StoryFn<StudentManQuestionPanelNewProps> = (
  args: StudentManQuestionPanelNewProps,
) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string>(args.selectedAnswer);
  const [flagged, setFlagged] = useState<boolean>(args.flagged);

  return (
    <StudentManQuestionPanelNew
      {...args}
      selectedAnswer={selectedAnswer}
      flagged={flagged}
      onAnswerChange={(answer: string) => {
        setSelectedAnswer(answer);
        args.onAnswerChange?.(answer);
      }}
      onFlag={() => {
        setFlagged((f: boolean) => !f);
        args.onFlag?.();
      }}
    />
  );
};

export const Default = Template.bind({});
Default.args = {
  questionNumber: 1,
  questionText: 'What is the capital of France?',
  questionType: 'MCQ',
  options: [
    { key: 'A', text: 'Berlin' },
    { key: 'B', text: 'Madrid' },
    { key: 'C', text: 'Paris' },
    { key: 'D', text: 'Rome' },
  ],
  selectedAnswer: '',
  flagged: false,
  proctorStatus: 'active',
  contractInfo: 'You are under contract monitoring. Please follow the exam rules.',
};

export const Flagged = Template.bind({});
Flagged.args = {
  ...Default.args,
  flagged: true,
};

export const WithProctorInactive = Template.bind({});
WithProctorInactive.args = {
  ...Default.args,
  proctorStatus: 'inactive',
};

export const WithContractInfo = Template.bind({});
WithContractInfo.args = {
  ...Default.args,
  contractInfo: 'This is a contract-aligned exam. All actions are monitored.',
};
