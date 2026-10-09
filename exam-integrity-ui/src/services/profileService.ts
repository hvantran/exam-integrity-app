import apiClient from './apiClient';

export interface UserProfileStats {
  totalStars: number;
  completedExams: number;
  highestScore10: number;
}

export interface UserProfileGamification {
  level: number;
  badges: string[];
  unlockedAvatars: string[];
}

export interface UserProfile {
  id: string;
  userId: string;
  role: string;
  grade?: number;
  stats: UserProfileStats;
  gamification: UserProfileGamification;
  preferences?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export const profileService = {
  getMyProfile: async (): Promise<UserProfile> => {
    const response = await apiClient.get<UserProfile>('/api/profiles/me');
    return response.data;
  },

  getUserProfile: async (userId: string): Promise<UserProfile> => {
    const response = await apiClient.get<UserProfile>(`/api/profiles/${encodeURIComponent(userId)}`);
    return response.data;
  },
};

export default profileService;

