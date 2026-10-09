import { useQuery } from '@tanstack/react-query';
import { profileService, UserProfile } from '../services/profileService';

export function useUserProfile() {
  return useQuery<UserProfile>({
    queryKey: ['user-profile', 'me'],
    queryFn: () => profileService.getMyProfile(),
    staleTime: 30000,
  });
}

export function useStudentProfile(userId?: string) {
  return useQuery<UserProfile>({
    queryKey: ['user-profile', userId],
    queryFn: () => profileService.getUserProfile(userId!),
    enabled: !!userId,
  });
}

export default useUserProfile;

