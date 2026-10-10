import { draftRepository } from './draftRepository';
import type { DraftQuestionDTO } from '../types/exam.types';

describe('draftRepository', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const mockQuestions: DraftQuestionDTO[] = [
    {
      id: 'q1',
      questionNumber: 1,
      content: 'What is 2 + 2?',
      type: 'MCQ',
      points: 10,
      truncated: false,
      parserConfidence: 1,
      reviewStatus: 'APPROVED',
    },
  ];

  it('saves and retrieves draft cache with userId', () => {
    draftRepository.saveDraftCache('draft-1', mockQuestions, 'author1');

    const cached = draftRepository.getDraftCache('draft-1', 'author1');
    expect(cached).toEqual(mockQuestions);

    // Stored with user-scoped key
    expect(
      localStorage.getItem('exam_integrity_author1_draft_draft-1')
    ).toBe(JSON.stringify(mockQuestions));

    // Other user cannot see this draft
    expect(draftRepository.getDraftCache('draft-1', 'author2')).toBeNull();
  });

  it('clears draft cache for specific user', () => {
    draftRepository.saveDraftCache('draft-1', mockQuestions, 'author1');
    draftRepository.clearDraftCache('draft-1', 'author1');

    expect(draftRepository.getDraftCache('draft-1', 'author1')).toBeNull();
    expect(
      localStorage.getItem('exam_integrity_author1_draft_draft-1')
    ).toBeNull();
  });

  it('supports unpartitioned legacy caching when userId is not provided', () => {
    draftRepository.saveDraftCache('draft-legacy', mockQuestions);

    expect(draftRepository.getDraftCache('draft-legacy')).toEqual(mockQuestions);
    expect(
      localStorage.getItem('exam_integrity_draft_draft-legacy')
    ).toBe(JSON.stringify(mockQuestions));
  });
});

