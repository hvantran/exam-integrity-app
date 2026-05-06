import React, { useState } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import Chip from './Chip';
import { CircleCheckIcon } from 'lucide-react';

const meta: Meta<typeof Chip> = {
  title: 'Atoms/Chip',
  component: Chip,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Chip>;

/**
 * Default filled chip with primary color
 */
export const Default: Story = {
  args: {
    label: 'Default Chip',
  },
};

/**
 * Outlined variant for secondary emphasis
 */
export const Outlined: Story = {
  args: {
    label: 'Outlined Chip',
    variant: 'outlined',
  },
};

/**
 * Primary color variant (filled)
 */
export const Primary: Story = {
  args: {
    label: 'Primary Color',
    color: 'primary',
  },
};

/**
 * Primary color outlined
 */
export const PrimaryOutlined: Story = {
  args: {
    label: 'Primary Outlined',
    color: 'primary',
    variant: 'outlined',
  },
};

/**
 * Warning color for caution or review indicators
 */
export const Warning: Story = {
  args: {
    label: 'Needs Review',
    color: 'warning',
  },
};

/**
 * Warning outlined variant
 */
export const WarningOutlined: Story = {
  args: {
    label: 'Warning Outlined',
    color: 'warning',
    variant: 'outlined',
  },
};

/**
 * Error color for failures or alerts
 */
export const Error: Story = {
  args: {
    label: 'Error State',
    color: 'error',
  },
};

/**
 * Success color for positive indicators
 */
export const Success: Story = {
  args: {
    label: 'Completed',
    color: 'success',
  },
};

/**
 * Small size (default)
 */
export const Small: Story = {
  args: {
    label: 'Small Tag',
    size: 'small',
  },
};

/**
 * Medium size for more prominence
 */
export const Medium: Story = {
  args: {
    label: 'Medium Tag',
    size: 'medium',
  },
};

/**
 * Chip with leading icon
 */
export const WithIcon: Story = {
  args: {
    label: 'Verified',
    icon: <CircleCheckIcon />,
    color: 'success',
  },
};

/**
 * Removable chip with onDelete callback
 */
export const Removable: Story = {
  args: {
    label: 'Click to remove',
    onDelete: () => alert('Chip deleted!'),
  },
};

/**
 * Disabled chip state
 */
export const Disabled: Story = {
  args: {
    label: 'Disabled',
    disabled: true,
  },
};

/**
 * Tag collection - realistic exam/question tags
 */
export const TagCollection: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Chip label="Science" />
      <Chip label="Grade 4" />
      <Chip label="Midterm" />
      <Chip label="Reading Comprehension" />
      <Chip label="2024" />
    </div>
  ),
};

/**
 * Status collection - question types and states
 */
export const StatusCollection: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Chip label="MCQ" color="primary" />
      <Chip label="Short Answer" color="primary" />
      <Chip label="5 pts" color="secondary" />
      <Chip label="Unreviewed" color="warning" />
      <Chip label="Parser Warning" color="warning" variant="outlined" />
    </div>
  ),
};

/**
 * Removable tags - realistic filter/input scenario
 */
export const RemovableTags: Story = {
  render: () => {
    const [tags, setTags] = useState(['React', 'TypeScript', 'Storybook']);
    return (
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Chip
            key={tag}
            label={tag}
            onDelete={() => setTags(tags.filter((t) => t !== tag))}
            color="primary"
            variant="outlined"
          />
        ))}
      </div>
    );
  },
};

/**
 * Icon with delete action
 */
export const IconWithDelete: Story = {
  args: {
    label: 'Verified Tag',
    icon: <CircleCheckIcon />,
    onDelete: () => alert('Removed!'),
    color: 'success',
  },
};

/**
 * Color and variant combinations
 */
export const ColorVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <Chip label="Primary Filled" color="primary" />
        <Chip label="Primary Outlined" color="primary" variant="outlined" />
      </div>
      <div className="flex flex-wrap gap-2">
        <Chip label="Warning Filled" color="warning" />
        <Chip label="Warning Outlined" color="warning" variant="outlined" />
      </div>
      <div className="flex flex-wrap gap-2">
        <Chip label="Error Filled" color="error" />
        <Chip label="Error Outlined" color="error" variant="outlined" />
      </div>
      <div className="flex flex-wrap gap-2">
        <Chip label="Success Filled" color="success" />
        <Chip label="Success Outlined" color="success" variant="outlined" />
      </div>
    </div>
  ),
};
