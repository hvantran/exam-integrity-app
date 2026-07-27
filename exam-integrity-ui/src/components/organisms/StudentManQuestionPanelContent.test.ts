import React from 'react';
import { render, screen } from '@testing-library/react';
import StudentManQuestionPanelContent, { parseComparison } from './StudentManQuestionPanelContent';

jest.mock('../molecules/MathInput', () => {
  const mockReact = require('react');
  return {
    MathQuestionInput: ({ questionText }: { questionText: string }) =>
      mockReact.createElement('div', { 'data-testid': 'math-question-input' }, questionText),
  };
});


describe('parseComparison', () => {
  it('parses two numbers separated by ellipsis', () => {
    expect(parseComparison('76 635 … 76 653')).toEqual({
      left: '76 635',
      right: '76 653',
    });
  });

  it('parses formula-like operands', () => {
    expect(parseComparison('47 526 ... 47 520 + 6')).toEqual({
      left: '47 526',
      right: '47 520 + 6',
    });
  });

  it('parses parenthesized formula with multiplication operator x', () => {
    expect(parseComparison('20 000 ... 2 000 x (500 - 492)')).toEqual({
      left: '20 000',
      right: '2 000 x (500 - 492)',
    });
  });

  it('rejects fill-in-result prompt', () => {
    expect(parseComparison('229 + 126 x 3 = ...')).toBeNull();
  });

  it('rejects prose question ending with dotted answer line', () => {
    const prompt =
      'Một mảnh vườn hình chữ nhật có chiều dài 24 m, chiều rộng 16 m. Người ta làm hàng rào xung quanh mảnh vườn, mỗi mét hàng rào giá 85 000 đồng. Hỏi số tiền cần trả để làm hàng rào là bao nhiêu đồng? ……………………………………………………………………………………';
    expect(parseComparison(prompt)).toBeNull();
  });

  it('rejects operands containing alphabetic prose text', () => {
    expect(parseComparison('Số lớn hơn ... 99')).toBeNull();
    expect(parseComparison('99 ... số bé hơn')).toBeNull();
  });

  describe('measurement unit operands', () => {
    it('parses mixed-unit left operand with plain right operand', () => {
      expect(parseComparison('8kg 234g ... 8320g')).toEqual({
        left: '8kg 234g',
        right: '8320g',
      });
    });

    it('parses plain left operand with mixed-unit right operand', () => {
      expect(parseComparison('8320g ... 8kg 234g')).toEqual({
        left: '8320g',
        right: '8kg 234g',
      });
    });

    it('parses both operands with measurement units', () => {
      expect(parseComparison('5m 30cm ... 530cm')).toEqual({
        left: '5m 30cm',
        right: '530cm',
      });
    });

    it('parses length units with unicode ellipsis', () => {
      expect(parseComparison('2km 500m … 2500m')).toEqual({
        left: '2km 500m',
        right: '2500m',
      });
    });

    it('parses liquid volume units', () => {
      expect(parseComparison('1l 250ml ... 1250ml')).toEqual({
        left: '1l 250ml',
        right: '1250ml',
      });
    });

    it('rejects measurement value on only one side when other side is prose', () => {
      expect(parseComparison('8kg 234g ... số nặng hơn')).toBeNull();
    });
  });
});

describe('StudentManQuestionPanelContent', () => {
  it('renders a normal question-part textarea for prose prompts like "a. Góc đỉnh: ..."', () => {
    render(
      React.createElement(StudentManQuestionPanelContent, {
        questionNumber: 1,
        questionText: 'Điền thông tin',
        questionType: 'ESSAY_SHORT',
        questionParts: [{ key: 'a', prompt: 'a. Góc đỉnh: ...' }],
        selectedAnswerParts: [{ key: 'a', answer: '' }],
        onAnswerChange: () => {},
        onAnswerPartsChange: () => {},
      }),
    );

    expect(screen.queryByTestId('math-question-input')).toBeNull();
    expect(screen.getByPlaceholderText('Nhập câu trả lời cho phần này')).toBeTruthy();
  });
});