import apiClient from './apiClient';
import { profileService, UserProfile } from './profileService';

jest.mock('./apiClient');

describe('profileService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('getMyProfile calls GET /api/profiles/me', async () => {
    const mockProfile: UserProfile = {
      id: 'profile-1',
      userId: 'student1',
      role: 'STUDENT',
      grade: 5,
      stats: {
        totalStars: 50,
        completedExams: 6,
        highestScore10: 9.5,
      },
      gamification: {
        level: 3,
        badges: ['STAR_MASTER'],
        unlockedAvatars: [],
      },
    };

    (apiClient.get as jest.Mock).mockResolvedValueOnce({ data: mockProfile });

    const result = await profileService.getMyProfile();

    expect(apiClient.get).toHaveBeenCalledWith('/api/profiles/me');
    expect(result.stats.totalStars).toBe(50);
    expect(result.userId).toBe('student1');
  });

  it('getUserProfile calls GET /api/profiles/:userId', async () => {
    const mockProfile: UserProfile = {
      id: 'profile-2',
      userId: 'student2',
      role: 'STUDENT',
      stats: {
        totalStars: 20,
        completedExams: 2,
        highestScore10: 10.0,
      },
      gamification: {
        level: 2,
        badges: [],
        unlockedAvatars: [],
      },
    };

    (apiClient.get as jest.Mock).mockResolvedValueOnce({ data: mockProfile });

    const result = await profileService.getUserProfile('student2');

    expect(apiClient.get).toHaveBeenCalledWith('/api/profiles/student2');
    expect(result.stats.totalStars).toBe(20);
  });
});

