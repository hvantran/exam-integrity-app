import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ExamIntegrityStudentShopTemplate,
  type ExamIntegrityStudentPortalSection as PortalSection,
  type EggShopItem,
  type IncubatingEgg,
  DEFAULT_INCUBATING_EGGS,
} from '@hvantran/ui-component-library';
import { useAuth } from '../context/AuthContext';
import { useUserProfile } from '../hooks/useUserProfile';
import { useNavDockMode } from '../hooks/useNavDockMode';
import { getScopedItem, setScopedItem } from '../utils/storage';

const PORTAL_ROUTES: Record<PortalSection, string> = {
  dashboard: '/',
  'my-exams': '/my-exams',
  results: '/my-exams',
  shop: '/shop',
  collection: '/collection',
};

const EGGS_STORAGE_KEY = 'exam_integrity_incubating_eggs';

const StudentManShopPage: React.FC = () => {
  const navigate = useNavigate();
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
    const newEgg: IncubatingEgg = {
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

    try {
      const saved = getScopedItem(EGGS_STORAGE_KEY, currentUserId);
      const currentEggs: IncubatingEgg[] = saved ? JSON.parse(saved) : DEFAULT_INCUBATING_EGGS;
      const updated = [newEgg, ...currentEggs];
      setScopedItem(EGGS_STORAGE_KEY, JSON.stringify(updated), currentUserId);
    } catch {
      // fallback
    }
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

