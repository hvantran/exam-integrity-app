import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import MathQuestionInput from './MathQuestionInput';

const meta: Meta<typeof MathQuestionInput> = {
  title: 'Molecules/MathQuestionInput',
  component: MathQuestionInput,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="max-w-2xl mx-auto">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof MathQuestionInput>;

export const SimpleDivisionDetected: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? '');
    return <MathQuestionInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    questionText: '93 645 : 9',
    value: '',
    disabled: false,
  },
};

export const Grade3LongDivision: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? '');
    return <MathQuestionInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    questionText: '93 645 : 9',
    tags: ['grade 3'],
    value: '',
    disabled: false,
  },
};

export const SimpleAdditionDetected: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? '');
    return <MathQuestionInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    questionText: '4 722 + 5 369',
    value: '',
    disabled: false,
  },
};

export const ComplexDetected: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? '');
    return <MathQuestionInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    questionText: '12 740 + 5 037 x 4',
    value: 'Step 1: 5 037 x 4 = 20 148\nStep 2: 12 740 + 20 148 = 32 888\n32 888',
    disabled: false,
  },
};

export const RoundBracketsDetected: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? '');
    return <MathQuestionInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    questionText: '(12 740 - 5 037) x 4',
    value: 'Step 1: 12 740 - 5 037 = 7 703\nStep 2: 7 703 x 4 = 30 812\n30 812',
    disabled: false,
  },
};

export const FallbackTextarea: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? '');
    return <MathQuestionInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    questionText: 'Explain your reasoning for solving this equation.',
    value: '',
    disabled: false,
  },
};
