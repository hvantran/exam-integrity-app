import { parseComparison } from './StudentManQuestionPanelContent';

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
});