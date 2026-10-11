import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ExamIntegrityStudentShopTemplate,
  type ExamIntegrityStudentPortalSection as PortalSection,
  type EggShopItem,
  type IncubatingEgg,
} from '@hvantran/ui-component-library';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { useUserProfile } from '../hooks/useUserProfile';
import { useNavDockMode } from '../hooks/useNavDockMode';
import { hatcheryService } from '../services/hatcheryService';
import type { UserProfile } from '../services/profileService';
import { getScopedItem, setScopedItem } from '../utils/storage';

const PORTAL_ROUTES: Record<PortalSection, string> = {
  dashboard: '/',
  'my-exams': '/my-exams',
  results: '/my-exams',
  shop: '/shop',
  collection: '/collection',
};

const EGGS_STORAGE_KEY = 'exam_integrity_incubating_eggs';

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
  const { logout, displayName, user } = useAuth();
  const { data: profile } = useUserProfile();
  const totalStars = profile?.stats?.totalStars ?? 0;
  const [dockMode, setDockMode] = useNavDockMode();

  const currentUserId = profile?.userId || user?.username || null;

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

    const fallbackEgg: IncubatingEgg = {
      id: `egg-${Date.now()}`,
      name: item.name,
      tier: item.tier,
      rarity: item.rarity,
      crackProgress: 0,
      hatchedPetName: item.hatchedPetName,
      hatchedSpecies: item.name,
      isMystery: item.id.includes('mystery'),
      hatchDurationHours: item.hatchDurationHours ?? 8,
      remainingSeconds: (item.hatchDurationHours ?? 8) * 3600,
    };

    const saveEggToStorage = (eggToSave: IncubatingEgg) => {
      try {
        const saved = getScopedItem(EGGS_STORAGE_KEY, currentUserId);
        const currentEggs: IncubatingEgg[] = saved ? JSON.parse(saved) : [];
        const updated = [eggToSave, ...currentEggs];
        setScopedItem(EGGS_STORAGE_KEY, JSON.stringify(updated), currentUserId);
      } catch {
        // fallback
      }
    };

    saveEggToStorage(fallbackEgg);

    Promise.resolve(hatcheryService.purchaseEgg())
      .then((res) => {
        if (res && res.egg) {
          try {
            const saved = getScopedItem(EGGS_STORAGE_KEY, currentUserId);
            const currentEggs: IncubatingEgg[] = saved ? JSON.parse(saved) : [];
            const updated = currentEggs.map((e) => (e.id === fallbackEgg.id ? res.egg : e));
            setScopedItem(EGGS_STORAGE_KEY, JSON.stringify(updated), currentUserId);
          } catch {
            // fallback
          }
          if (res.remainingStars !== undefined) {
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
        }
        queryClient?.invalidateQueries({ queryKey: ['user-profile', 'me'] });
      })
      .catch(() => {
        // already saved fallback
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

