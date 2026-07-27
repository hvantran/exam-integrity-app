import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SelectQuestionsFromBankDialog from './SelectQuestionsFromBankDialog';
import { Button } from '../atoms';
import type { CreateExamFromBankCommand } from '../../types/exam.types';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const meta: Meta<typeof SelectQuestionsFromBankDialog> = {
  title: 'Molecules/SelectQuestionsFromBankDialog',
  component: SelectQuestionsFromBankDialog,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <Story />
      </QueryClientProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SelectQuestionsFromBankDialog>;

export const Playground: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);

    const handleSubmit = (_cmd: CreateExamFromBankCommand) => {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setOpen(false);
      }, 1500);
    };

    return (
      <div className="p-6">
        <Button onClick={() => setOpen(true)}>Select Questions from Bank</Button>
        <SelectQuestionsFromBankDialog
          open={open}
          onClose={() => setOpen(false)}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    );
  },
};

export const EditMode: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);

    const handleSubmitSelection = (_selectedQuestionIds: string[]) => {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setOpen(false);
      }, 1200);
    };

    return (
      <div className="p-6">
        <Button onClick={() => setOpen(true)}>Manage Exam Questions</Button>
        <SelectQuestionsFromBankDialog
          open={open}
          onClose={() => setOpen(false)}
          mode="edit"
          initialTitle="Math Quiz - Grade 5"
          initialDurationMin={45}
          initialSelectedQuestionIds={['q-bank-1', 'q-bank-2']}
          onSubmitSelection={handleSubmitSelection}
          isLoading={isLoading}
        />
      </div>
    );
  },
};
