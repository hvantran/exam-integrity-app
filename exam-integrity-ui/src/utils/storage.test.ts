import {
  getUserStorageKey,
  getScopedItem,
  setScopedItem,
  removeScopedItem,
} from './storage';

describe('storage utility', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('getUserStorageKey', () => {
    it('generates user-scoped key with userId', () => {
      expect(getUserStorageKey('override_grade', 'student1')).toBe(
        'exam_integrity_student1_override_grade'
      );
      expect(getUserStorageKey('exam_integrity_override_grade', 'student1')).toBe(
        'exam_integrity_student1_override_grade'
      );
      expect(getUserStorageKey('exam_integrity_nav_mode', 'teacher_bob')).toBe(
        'exam_integrity_teacher_bob_nav_mode'
      );
      expect(getUserStorageKey('exam_draft_123', 'author1')).toBe(
        'exam_integrity_author1_draft_123'
      );
    });

    it('generates unscoped key when userId is missing or empty', () => {
      expect(getUserStorageKey('override_grade')).toBe('exam_integrity_override_grade');
      expect(getUserStorageKey('override_grade', null)).toBe('exam_integrity_override_grade');
      expect(getUserStorageKey('override_grade', '')).toBe('exam_integrity_override_grade');
      expect(getUserStorageKey('override_grade', '   ')).toBe('exam_integrity_override_grade');
    });
  });

  describe('scoped storage CRUD & isolation', () => {
    it('isolates state between different users', () => {
      setScopedItem('pets', JSON.stringify(['dragon']), 'student_alice');
      setScopedItem('pets', JSON.stringify(['phoenix']), 'student_bob');

      expect(getScopedItem('pets', 'student_alice')).toBe(JSON.stringify(['dragon']));
      expect(getScopedItem('pets', 'student_bob')).toBe(JSON.stringify(['phoenix']));
      expect(
        localStorage.getItem('exam_integrity_student_alice_pets')
      ).toBe(JSON.stringify(['dragon']));
      expect(
        localStorage.getItem('exam_integrity_student_bob_pets')
      ).toBe(JSON.stringify(['phoenix']));
    });

    it('migrates legacy unpartitioned key when user accesses it', () => {
      localStorage.setItem('exam_integrity_override_grade', '5');

      const loaded = getScopedItem('override_grade', 'teacher1');
      expect(loaded).toBe('5');

      // Migrated to user key and legacy key removed
      expect(
        localStorage.getItem('exam_integrity_teacher1_override_grade')
      ).toBe('5');
      expect(localStorage.getItem('exam_integrity_override_grade')).toBeNull();
    });

    it('removes scoped and legacy keys cleanly', () => {
      localStorage.setItem('exam_integrity_override_grade', '5');
      setScopedItem('override_grade', '6', 'teacher1');

      removeScopedItem('override_grade', 'teacher1');

      expect(getScopedItem('override_grade', 'teacher1')).toBeNull();
      expect(
        localStorage.getItem('exam_integrity_teacher1_override_grade')
      ).toBeNull();
      expect(localStorage.getItem('exam_integrity_override_grade')).toBeNull();
    });
  });
});

