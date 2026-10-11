import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ExamIntegrityStudentShopTemplate,
  type ExamIntegrityStudentPortalSection as PortalSection,
  type EggShopItem,
} from '@hvantran/ui-component-library';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { useUserProfile } from '../hooks/useUserProfile';
import { useNavDockMode } from '../hooks/useNavDockMode';
import { hatcheryService } from '../services/hatcheryService';
import type { UserProfile } from '../services/profileService';

const PORTAL_ROUTES: Record<PortalSection, string> = {
  dashboard: '/',
  'my-exams': '/my-exams',
  results: '/my-exams',
  shop: '/shop',
  collection: '/collection',
};

function useSafeQueryClient() {
  try {
    return useQueryClient();
  } catch {
    return null;
  }
}

const StudentManShopPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useSafeQueryClient();
  const { logout, displayName } = useAuth();
  const { data: profile } = useUserProfile();
  const totalStars = profile?.stats?.totalStars ?? 0;
  const [dockMode, setDockMode] = useNavDockMode();

  const handleLogout = () => {
    logout();
  };

  const handleNavigate = (section: PortalSection) => navigate(PORTAL_ROUTES[section]);

  const handlePurchaseEgg = (item: EggShopItem) => {
    const eggCost = item.price || 250;

    // Optimistically deduct stars
    queryClient?.setQueryData<UserProfile>(['user-profile', 'me'], (old) => {
      if (!old) return old;
      return {
        ...old,
        stats: {
          ...old.stats,
          totalStars: Math.max(0, (old.stats?.totalStars ?? 0) - eggCost),
        },
      };
    });

    Promise.resolve(hatcheryService.purchaseEgg())
      .then((res) => {
        if (res && res.remainingStars !== undefined) {
          queryClient?.setQueryData<UserProfile>(['user-profile', 'me'], (old) => {
            if (!old) return old;
            return {
              ...old,
              stats: {
                ...old.stats,
                totalStars: res.remainingStars,
              },
            };
          });
        }
        queryClient?.invalidateQueries({ queryKey: ['user-profile', 'me'] });
      })
      .catch(() => {
        queryClient?.invalidateQueries({ queryKey: ['user-profile', 'me'] });
      });
  };

  return (
    <ExamIntegrityStudentShopTemplate
      studentName={displayName || 'Student'}
      starCount={totalStars}
      onPurchaseEgg={handlePurchaseEgg}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
      dockMode={dockMode}
      onDockModeChange={setDockMode}
    />
  );
};

export default StudentManShopPage;
