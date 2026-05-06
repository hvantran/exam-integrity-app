import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Combobox from './Combobox';

const meta: Meta<typeof Combobox> = {
  title: 'Molecules/Combobox',
  component: Combobox,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Combobox>;

const TAG_OPTIONS = [
  { value: 'algebra', label: 'Algebra' },
  { value: 'geometry', label: 'Geometry' },
  { value: 'fractions', label: 'Fractions' },
  { value: 'word-problems', label: 'Word Problems' },
];

export const Default: Story = {
  render: () => {
    const [value, setValue] = React.useState('');
    const [selected, setSelected] = React.useState<string[]>([]);
    return (
      <div className="w-[320px] space-y-2">
        <Combobox
          value={value}
          onChange={setValue}
          onSelect={(tag) => {
            if (!selected.includes(tag)) {
              setSelected((prev) => [...prev, tag]);
            }
          }}
          options={TAG_OPTIONS}
          placeholder="Select or type a tag"
        />
        <div className="text-sm text-gray-600">Selected: {selected.join(', ') || 'none'}</div>
      </div>
    );
  },
};