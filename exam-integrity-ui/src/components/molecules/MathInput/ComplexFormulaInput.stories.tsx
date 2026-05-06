import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import type { ParsedFormula } from '../../../utils/mathFormulaAnalyzer';
import ComplexFormulaInput from './ComplexFormulaInput';

const meta: Meta<typeof ComplexFormulaInput> = {
  title: 'Molecules/ComplexFormulaInput',
  component: ComplexFormulaInput,
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
type Story = StoryObj<typeof ComplexFormulaInput>;

const mixedOperatorsFormula: ParsedFormula = {
  type: 'COMPLEX_FORMULA',
  formula: '93 645 : 9 x 5',
  displayFormula: '93 645 : 9 x 5',
  operatorCount: 2,
  hasDecimal: false,
};

const precedenceFormula: ParsedFormula = {
  type: 'COMPLEX_FORMULA',
  formula: '12 740 + 5 037 x 4',
  displayFormula: '12 740 + 5 037 x 4',
  operatorCount: 2,
  hasDecimal: false,
};

const roundBracketsFormula: ParsedFormula = {
  type: 'COMPLEX_FORMULA',
  formula: '(12 740 - 5 037) x 4',
  displayFormula: '(12 740 - 5 037) x 4',
  operatorCount: 2,
  hasDecimal: false,
};

export const MixedOperators: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? '');
    return <ComplexFormulaInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    formula: mixedOperatorsFormula,
    value: '= 93 645 : 9 = 10 405\n= 10 405 x 5 = 52 025\n= 52025',
    disabled: false,
  },
};

export const WithPrecedenceHint: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? '');
    return <ComplexFormulaInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    formula: precedenceFormula,
    value: '= 5 037 x 4 = 20 148\n= 12 740 + 20 148 = 32 888\n= 32888',
    disabled: false,
  },
};

export const WithRoundBrackets: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? '');
    return <ComplexFormulaInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    formula: roundBracketsFormula,
    value: '= 12 740 - 5 037 = 7 703\n= 7 703 x 4 = 30 812\n= 30812',
    disabled: false,
  },
};

export const EmptyState: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? '');
    return <ComplexFormulaInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    formula: mixedOperatorsFormula,
    value: '',
    disabled: false,
  },
};
