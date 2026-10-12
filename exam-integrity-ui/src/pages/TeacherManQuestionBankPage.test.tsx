import { extractOptionParts, serializeOption } from './TeacherManQuestionBankPage';

describe('TeacherManQuestionBankPage MCQ option helpers', () => {
  it('extractOptionParts handles plain text without image', () => {
    expect(extractOptionParts('Paris')).toEqual({ text: 'Paris' });
    expect(extractOptionParts('A. London')).toEqual({ text: 'London' });
    expect(extractOptionParts('')).toEqual({ text: '' });
  });

  it('extractOptionParts separates text and base64 image data', () => {
    const raw = 'Cat data:image/png;base64,sampleBase64Data';
    expect(extractOptionParts(raw)).toEqual({
      text: 'Cat',
      imageBase64: 'data:image/png;base64,sampleBase64Data',
    });
  });

  it('extractOptionParts strips option label prefix with image', () => {
    const raw = 'B. Dog data:image/jpeg;base64,dogImage';
    expect(extractOptionParts(raw)).toEqual({
      text: 'Dog',
      imageBase64: 'data:image/jpeg;base64,dogImage',
    });
  });

  it('extractOptionParts handles image only option', () => {
    const raw = 'data:image/webp;base64,onlyImage';
    expect(extractOptionParts(raw)).toEqual({
      text: '',
      imageBase64: 'data:image/webp;base64,onlyImage',
    });
  });

  it('serializeOption formats option text and image correctly', () => {
    expect(serializeOption('Apple')).toBe('Apple');
    expect(serializeOption('Apple', 'data:image/png;base64,appleImg')).toBe('Apple data:image/png;base64,appleImg');
    expect(serializeOption('', 'data:image/png;base64,appleImg')).toBe('data:image/png;base64,appleImg');
    expect(serializeOption('')).toBe('');
  });
});
