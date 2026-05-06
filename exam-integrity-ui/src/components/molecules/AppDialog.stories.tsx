import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import AppDialog, { DialogContent, DialogFooter, DialogHeader } from './AppDialog';
import { Button } from '../atoms';

const meta: Meta<typeof AppDialog> = {
  title: 'Molecules/AppDialog',
  component: AppDialog,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AppDialog>;

export const Playground: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false);

    return (
      <div className="p-6">
        <Button onClick={() => setOpen(true)}>Open Dialog</Button>
        <AppDialog open={open} onClose={() => setOpen(false)}>
          <DialogHeader>Confirm Action</DialogHeader>
          <DialogContent>
            <p className="text-sm text-gray-600">
              This shared dialog molecule is used for confirmation and form flows.
            </p>
          </DialogContent>
          <DialogFooter>
            <Button variant="neutral" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setOpen(false)}>Confirm</Button>
          </DialogFooter>
        </AppDialog>
      </div>
    );
  },
};
