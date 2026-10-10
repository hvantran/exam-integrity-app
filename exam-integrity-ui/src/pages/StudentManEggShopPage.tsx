import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ExamIntegrityEggShop,
  ExamIntegrityPetHatchery,
  ExamIntegrityStudentLandingTemplate as StudentManLandingLayout,
  type ExamIntegrityStudentPortalSection as PortalSection,
  type EggShopItem,
  type IncubatingEgg,
  type StudentPet,
  DEFAULT_INCUBATING_EGGS,
  DEFAULT_STUDENT_PETS,
} from '@hvantran/ui-component-library';
import { useAuth } from '../context/AuthContext';
import { useUserProfile } from '../hooks/useUserProfile';
import { useNavDockMode } from '../hooks/useNavDockMode';
import { useStudentPageTheme } from '../hooks/useGradeTheme';

const PORTAL_ROUTES: Record<PortalSection, string> = {
  dashboard: '/',
  'my-exams': '/my-exams',
  results: '/my-exams',
  shop: '/shop',
};

const EGGS_STORAGE_KEY = 'exam_integrity_incubating_eggs';
const PETS_STORAGE_KEY = 'exam_integrity_student_pets';

const StudentManEggShopPage: React.FC = () => {
  const navigate = useNavigate();
  const { logout, displayName } = useAuth();
  const { data: profile } = useUserProfile();
  const totalStars = profile?.stats?.totalStars ?? 0;
  const theme = useStudentPageTheme();
  const [dockMode, setDockMode] = useNavDockMode();
  const [activeTab, setActiveTab] = useState<'shop' | 'hatchery'>('shop');

  const [incubatingEggs, setIncubatingEggs] = useState<IncubatingEgg[]>(() => {
    try {
      const saved = localStorage.getItem(EGGS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_INCUBATING_EGGS;
    } catch {
      return DEFAULT_INCUBATING_EGGS;
    }
  });

  const [pets, setPets] = useState<StudentPet[]>(() => {
    try {
      const saved = localStorage.getItem(PETS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_STUDENT_PETS;
    } catch {
      return DEFAULT_STUDENT_PETS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(EGGS_STORAGE_KEY, JSON.stringify(incubatingEggs));
    } catch {
      // storage unavailable or full
    }
  }, [incubatingEggs]);

  useEffect(() => {
    try {
      localStorage.setItem(PETS_STORAGE_KEY, JSON.stringify(pets));
    } catch {
      // storage unavailable or full
    }
  }, [pets]);

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
    setIncubatingEggs((prev) => [newEgg, ...prev]);
  };

  const handleEggHatched = (eggId: string, hatchedPet: StudentPet) => {
    setIncubatingEggs((prev) => prev.filter((egg) => egg.id !== eggId));
    setPets((prev) => [hatchedPet, ...prev]);
  };

  const handleGrowPet = (petId: string, starsSpent: number) => {
    setPets((prev) =>
      prev.map((pet) => {
        if (pet.id !== petId) return pet;
        const newExp = pet.currentExp + starsSpent;
        const shouldLevelUp = newExp >= pet.expNeeded && pet.level < pet.maxLevel;
        return {
          ...pet,
          currentExp: shouldLevelUp ? newExp - pet.expNeeded : newExp,
          level: shouldLevelUp ? pet.level + 1 : pet.level,
        };
      }),
    );
  };

  return (
    <StudentManLandingLayout
      studentName={displayName || 'Student'}
      starCount={totalStars}
      activeSection="shop"
      pageTitle={theme.isElementary ? 'Pet Egg Emporium & Hatchery 🐣' : '3D Pet Egg Shop'}
      pageSubtitle={
        theme.isElementary
          ? 'Spend earned stars on mysterious 3D eggs, hatch companion beasts, and nurture pets!'
          : 'Purchase 3D mystery eggs using stars earned from exams and manage companion pets.'
      }
      onNavigate={handleNavigate}
      onLogout={handleLogout}
      dockMode={dockMode}
      onDockModeChange={setDockMode}
    >
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            data-testid="tab-egg-shop"
            onClick={() => setActiveTab('shop')}
            className={`px-5 py-2.5 rounded-full font-extrabold text-sm transition-all shadow-sm ${
              activeTab === 'shop'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-amber-200 ring-2 ring-amber-300'
                : 'bg-white dark:bg-stone-800 text-slate-700 dark:text-stone-300 hover:bg-amber-50 hover:text-amber-800 border border-slate-200 dark:border-stone-700'
            }`}
          >
            🛒 3D Egg Shop
          </button>
          <button
            type="button"
            data-testid="tab-pet-hatchery"
            onClick={() => setActiveTab('hatchery')}
            className={`px-5 py-2.5 rounded-full font-extrabold text-sm transition-all shadow-sm ${
              activeTab === 'hatchery'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-amber-200 ring-2 ring-amber-300'
                : 'bg-white dark:bg-stone-800 text-slate-700 dark:text-stone-300 hover:bg-amber-50 hover:text-amber-800 border border-slate-200 dark:border-stone-700'
            }`}
          >
            🐣 Pet Hatchery & Sanctuary ({incubatingEggs.length} eggs)
          </button>
        </div>

        {activeTab === 'shop' ? (
          <ExamIntegrityEggShop
            starBalance={totalStars}
            onPurchaseEgg={handlePurchaseEgg}
            onOpenHatchery={() => setActiveTab('hatchery')}
          />
        ) : (
          <ExamIntegrityPetHatchery
            starBalance={totalStars}
            incubatingEggs={incubatingEggs}
            pets={pets}
            onGrowPet={handleGrowPet}
            onEggHatched={handleEggHatched}
          />
        )}
      </div>
    </StudentManLandingLayout>
  );
};

export default StudentManEggShopPage;
