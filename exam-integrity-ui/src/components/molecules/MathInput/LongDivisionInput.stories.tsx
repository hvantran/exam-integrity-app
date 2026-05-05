import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import type { ParsedFormula } from '../../../utils/mathFormulaAnalyzer';
import LongDivisionInput from './LongDivisionInput';

const meta: Meta<typeof LongDivisionInput> = {
  title: 'Molecules/LongDivisionInput',
  component: LongDivisionInput,
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
type Story = StoryObj<typeof LongDivisionInput>;

const divisionNoRemainder: ParsedFormula = {
  type: 'SIMPLE_DIVISION',
  formula: '93 645 : 9',
  displayFormula: '93 645 : 9',
  operator: ':',
  operatorCount: 1,
  hasDecimal: false,
  operands: [93645, 9],
};

const divisionWithRemainder: ParsedFormula = {
  type: 'SIMPLE_DIVISION',
  formula: '93 647 : 9',
  displayFormula: '93 647 : 9',
  operator: ':',
  operatorCount: 1,
  hasDecimal: false,
  operands: [93647, 9],
};

const divisionSmall: ParsedFormula = {
  type: 'SIMPLE_DIVISION',
  formula: '72 : 8',
  displayFormula: '72 : 8',
  operator: ':',
  operatorCount: 1,
  hasDecimal: false,
  operands: [72, 8],
};

/** Grade-3 long-division: 93 645 ÷ 9 = 10 405 (no remainder) */
export const NoRemainder: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? '');
    return <LongDivisionInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    formula: divisionNoRemainder,
    value: '',
    disabled: false,
  },
};

/** Grade-3 long-division: 93 647 ÷ 9 — quotient 10 405 remainder 2 */
export const WithRemainder: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? '');
    return <LongDivisionInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    formula: divisionWithRemainder,
    value: '',
    disabled: false,
  },
};

/** Grade-3 long-division: small numbers — 72 ÷ 8 = 9 */
export const SmallNumbers: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? '');
    return <LongDivisionInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    formula: divisionSmall,
    value: '',
    disabled: false,
  },
};

/** Pre-filled with the correct answer — disabled read-only view */
export const Disabled: Story = {
  args: {
    formula: divisionNoRemainder,
    value: '10405',
    disabled: true,
    onChange: () => {},
  },
};
