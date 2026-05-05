import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import ScrollArea from './ScrollArea';

const meta: Meta<typeof ScrollArea> = {
  title: 'Molecules/ScrollArea',
  component: ScrollArea,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ScrollArea>;

const items = Array.from({ length: 6 }, (_, i) => `Question item ${i + 1}`);

export const Default: Story = {
  args: {
    hasMore: true,
    isLoading: false,
    children: (
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <div key={item} className="rounded border border-gray-200 bg-white px-3 py-2 text-sm">
            {item}
          </div>
        ))}
      </div>
    ),
  },
};

export const Loading: Story = {
  args: {
    hasMore: true,
    isLoading: true,
    children: (
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <div key={item} className="rounded border border-gray-200 bg-white px-3 py-2 text-sm">
            {item}
          </div>
        ))}
      </div>
    ),
  },
};

export const EndReached: Story = {
  args: {
    hasMore: false,
    endMessage: <span>All results loaded</span>,
    children: (
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <div key={item} className="rounded border border-gray-200 bg-white px-3 py-2 text-sm">
            {item}
          </div>
        ))}
      </div>
    ),
  },
};
