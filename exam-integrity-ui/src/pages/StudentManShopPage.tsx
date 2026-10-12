import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ExamIntegrityStudentShopTemplate,
  type ExamIntegrityStudentPortalSection as PortalSection,
  type EggShopItem,
  createMysteryEggItem,
} from '@hvantran/ui-component-library';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { useUserProfile } from '../hooks/useUserProfile';
import { useNavDockMode } from '../hooks/useNavDockMode';
import { useSettings } from '../context/SettingContext';
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
  const { getSettingNumber } = useSettings();
  const totalStars = profile?.stats?.totalStars ?? 0;
  const [dockMode, setDockMode] = useNavDockMode();

  const eggPrice = getSettingNumber('egg_shop_price_stars', 250);
  const hatchDurationHours = getSettingNumber('egg_hatch_duration_hours', 8);
  const dropRates = useMemo(() => ({
    Common: getSettingNumber('egg_drop_rate_common', 50),
    Rare: getSettingNumber('egg_drop_rate_rare', 28),
    Epic: getSettingNumber('egg_drop_rate_epic', 14),
    Legendary: getSettingNumber('egg_drop_rate_legendary', 6),
    Mythic: getSettingNumber('egg_drop_rate_mythic', 2),
  }), [getSettingNumber]);

  const shopItems: EggShopItem[] = useMemo(() => [
    createMysteryEggItem({
      price: eggPrice,
      hatchDurationHours,
      dropRates,
    }),
  ], [eggPrice, hatchDurationHours, dropRates]);

  const handleLogout = () => {
    logout();
  };

  const handleNavigate = (section: PortalSection) => navigate(PORTAL_ROUTES[section]);

  const handlePurchaseEgg = (item: EggShopItem) => {
    const eggCost = item.price ?? eggPrice;

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
      items={shopItems}
      dropRates={dropRates}
      onPurchaseEgg={handlePurchaseEgg}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
      dockMode={dockMode}
      onDockModeChange={setDockMode}
    />
  );
};

export default StudentManShopPage;
