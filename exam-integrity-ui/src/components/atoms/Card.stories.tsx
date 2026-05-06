import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Card from './Card';

const meta: Meta<typeof Card> = {
  title: 'Atoms/Card',
  component: Card,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
    children: (
      <div>
        <div className="font-semibold text-gray-900">Exam Title</div>
        <div className="text-sm text-gray-500 mt-1">Student: john.doe</div>
      </div>
    ),
  },
};

export const Outlined: Story = {
  args: {
    variant: 'outlined',
    children: (
      <div>
        <div className="font-semibold text-gray-900">Outlined Card</div>
        <div className="text-sm text-gray-500 mt-1">No shadow, only border</div>
      </div>
    ),
  },
};

export const Elevated: Story = {
  args: {
    variant: 'elevated',
    children: (
      <div>
        <div className="font-semibold text-gray-900">Elevated Card</div>
        <div className="text-sm text-gray-500 mt-1">Stronger shadow, no border</div>
      </div>
    ),
  },
};

export const Selected: Story = {
  args: {
    selected: true,
    onClick: () => {},
    children: (
      <div>
        <div className="font-semibold text-gray-900">Selected Card</div>
        <div className="text-sm text-gray-500 mt-1">Active selection state</div>
      </div>
    ),
  },
};

export const SelectableList: Story = {
  render: () => {
    const [selected, setSelected] = React.useState('a');
    const items = [
      { id: 'a', title: 'Math Exam - Midterm', student: 'alice', pending: 2 },
      { id: 'b', title: 'Science Quiz - Week 3', student: 'bob', pending: 1 },
      { id: 'c', title: 'Reading Test', student: 'carol', pending: 3 },
    ];
    return (
      <div className="space-y-3 max-w-sm">
        {items.map((item) => (
          <Card
            key={item.id}
            selected={selected === item.id}
            onClick={() => setSelected(item.id)}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-semibold text-gray-900">{item.title}</div>
                <div className="text-sm text-gray-500">Student: {item.student}</div>
              </div>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                {item.pending} pending
              </span>
            </div>
          </Card>
        ))}
      </div>
    );
  },
};
