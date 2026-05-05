import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import type { ParsedFormula } from '../../../utils/mathFormulaAnalyzer';
import SimpleArithmeticInput from './SimpleArithmeticInput';

const meta: Meta<typeof SimpleArithmeticInput> = {
  title: 'Molecules/SimpleArithmeticInput',
  component: SimpleArithmeticInput,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="max-w-xl mx-auto">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SimpleArithmeticInput>;

const additionFormula: ParsedFormula = {
  type: 'SIMPLE_ADDITION',
  formula: '4 722 + 5 369',
  displayFormula: '4 722 + 5 369',
  operator: '+',
  operatorCount: 1,
  hasDecimal: false,
  operands: [4722, 5369],
};

const subtractionFormula: ParsedFormula = {
  type: 'SIMPLE_SUBTRACTION',
  formula: '14 751 - 10 162',
  displayFormula: '14 751 - 10 162',
  operator: '-',
  operatorCount: 1,
  hasDecimal: false,
  operands: [14751, 10162],
};

const multiplicationFormula: ParsedFormula = {
  type: 'SIMPLE_MULTIPLICATION',
  formula: '5 037 x 4',
  displayFormula: '5 037 x 4',
  operator: 'x',
  operatorCount: 1,
  hasDecimal: false,
  operands: [5037, 4],
};

const divisionFormula: ParsedFormula = {
  type: 'SIMPLE_DIVISION',
  formula: '93 645 : 9',
  displayFormula: '93 645 : 9',
  operator: ':',
  operatorCount: 1,
  hasDecimal: false,
  operands: [93645, 9],
};

export const Addition: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? '');
    return <SimpleArithmeticInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    formula: additionFormula,
    value: '',
    disabled: false,
  },
};

export const Subtraction: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? '');
    return <SimpleArithmeticInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    formula: subtractionFormula,
    value: '',
    disabled: false,
  },
};

export const Multiplication: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? '');
    return <SimpleArithmeticInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    formula: multiplicationFormula,
    value: '',
    disabled: false,
  },
};

export const Division: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? '');
    return <SimpleArithmeticInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    formula: divisionFormula,
    value: '',
    disabled: false,
  },
};

export const Disabled: Story = {
  args: {
    formula: additionFormula,
    value: '10091',
    disabled: true,
    onChange: () => {},
  },
};
