/**
 * User-scoped localStorage utilities for exam-integrity-ui.
 * Partitions storage keys with userId (e.g. `exam_integrity_${userId}_${key}`)
 * to prevent cross-user state collisions on shared browsers.
 */

export const STORAGE_PREFIX = 'exam_integrity';

/**
 * Builds a user-partitioned storage key.
 *
 * @param baseKey Name of the key (e.g. 'override_grade', 'incubating_eggs', 'exam_integrity_nav_mode')
 * @param userId Optional user identifier (e.g. username, sub, or user profile id)
 * @returns Scoped storage key format:
 *   - With userId: `exam_integrity_${userId}_${cleanKey}`
 *   - Without userId: `exam_integrity_${cleanKey}`
 */
export function getUserStorageKey(baseKey: string, userId?: string | null): string {
  let cleanKey = baseKey;
  if (cleanKey.startsWith('exam_integrity_')) {
    cleanKey = cleanKey.substring('exam_integrity_'.length);
  } else if (cleanKey.startsWith('exam_draft_')) {
    cleanKey = cleanKey.substring('exam_'.length);
  } else if (cleanKey.startsWith('exam_integrity')) {
    cleanKey = cleanKey.substring('exam_integrity'.length).replace(/^_+/, '');
  }

  const sanitizedUser = userId ? userId.trim() : '';
  if (sanitizedUser) {
    return `${STORAGE_PREFIX}_${sanitizedUser}_${cleanKey}`;
  }
  return `${STORAGE_PREFIX}_${cleanKey}`;
}

/**
 * Gets an item from localStorage with user partitioning and legacy key migration.
 */
export function getScopedItem(baseKey: string, userId?: string | null): string | null {
  try {
    const userKey = getUserStorageKey(baseKey, userId);
    const val = localStorage.getItem(userKey);
    if (val !== null) return val;

    if (userId) {
      // Check legacy exact baseKey
      if (baseKey !== userKey) {
        const legacyVal = localStorage.getItem(baseKey);
        if (legacyVal !== null) {
          localStorage.setItem(userKey, legacyVal);
          localStorage.removeItem(baseKey);
          return legacyVal;
        }
      }

      // Check legacy unpartitioned prefix key
      const unpartitionedKey = getUserStorageKey(baseKey, null);
      if (unpartitionedKey !== userKey && unpartitionedKey !== baseKey) {
        const unpartitionedVal = localStorage.getItem(unpartitionedKey);
        if (unpartitionedVal !== null) {
          localStorage.setItem(userKey, unpartitionedVal);
          localStorage.removeItem(unpartitionedKey);
          return unpartitionedVal;
        }
      }
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Saves an item to localStorage with user partitioning.
 */
export function setScopedItem(baseKey: string, value: string, userId?: string | null): void {
  try {
    const userKey = getUserStorageKey(baseKey, userId);
    localStorage.setItem(userKey, value);
  } catch {
    // Ignore storage errors (private mode, quota exceeded)
  }
}

/**
 * Removes an item from localStorage, cleaning up both user-scoped and legacy keys.
 */
export function removeScopedItem(baseKey: string, userId?: string | null): void {
  try {
    const userKey = getUserStorageKey(baseKey, userId);
    localStorage.removeItem(userKey);
    if (userId) {
      if (baseKey !== userKey) {
        localStorage.removeItem(baseKey);
      }
      const unpartitionedKey = getUserStorageKey(baseKey, null);
      if (unpartitionedKey !== userKey) {
        localStorage.removeItem(unpartitionedKey);
      }
    }
  } catch {
    // Ignore storage errors
  }
}

