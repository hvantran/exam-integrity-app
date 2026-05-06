import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { toast } from 'react-toastify';
import AppToastContainer from './AppToastContainer';

const meta: Meta<typeof AppToastContainer> = {
  title: 'Molecules/AppToastContainer',
  component: AppToastContainer,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AppToastContainer>;

const ToastStoryDemo: React.FC = () => {
  React.useEffect(() => {
    toast.dismiss();
    toast.success('Exam created successfully.');
  }, []);

  return (
    <div className="p-6 flex flex-wrap gap-3">
      <button
        type="button"
        className="px-4 py-2 rounded-md bg-primary text-white text-sm font-semibold"
        onClick={() => toast.success('Exam created successfully.')}
      >
        Show Success Toast
      </button>
      <button
        type="button"
        className="px-4 py-2 rounded-md bg-error text-white text-sm font-semibold"
        onClick={() => toast.error('Failed to delete exam. Please try again.')}
      >
        Show Error Toast
      </button>
      <button
        type="button"
        className="px-4 py-2 rounded-md bg-secondary text-white text-sm font-semibold"
        onClick={() => toast.info('Draft saved to local cache.')}
      >
        Show Info Toast
      </button>
      <AppToastContainer />
    </div>
  );
};

export const Playground: Story = {
  render: () => <ToastStoryDemo />,
};
