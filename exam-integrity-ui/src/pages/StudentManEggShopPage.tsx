import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ExamIntegrityStudentEggShopTemplate,
  type ExamIntegrityStudentPortalSection as PortalSection,
  type EggShopItem,
  type IncubatingEgg,
  type StudentPet,
  type EggShopTab,
  DEFAULT_INCUBATING_EGGS,
  DEFAULT_STUDENT_PETS,
} from '@hvantran/ui-component-library';
import { useAuth } from '../context/AuthContext';
import { useUserProfile } from '../hooks/useUserProfile';
import { useNavDockMode } from '../hooks/useNavDockMode';
import { useStudentPageTheme } from '../hooks/useGradeTheme';
import { hatcheryService } from '../services/hatcheryService';
import { getScopedItem, setScopedItem } from '../utils/storage';

const PORTAL_ROUTES: Record<PortalSection, string> = {
  dashboard: '/',
  'my-exams': '/my-exams',
  results: '/my-exams',
  shop: '/shop',
  collection: '/collection',
};

const EGGS_STORAGE_KEY = 'exam_integrity_incubating_eggs';
const PETS_STORAGE_KEY = 'exam_integrity_student_pets';

const StudentManEggShopPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, displayName, user } = useAuth();
  const { data: profile } = useUserProfile();
  const totalStars = profile?.stats?.totalStars ?? 0;
  const theme = useStudentPageTheme();
  const [dockMode, setDockMode] = useNavDockMode();

  const currentUserId = profile?.userId || user?.username || null;
  const loadedUserRef = useRef<string | null>(currentUserId);

  const isCollectionRoute = location.pathname.includes('/collection');
  const [activeTab, setActiveTab] = useState<EggShopTab>(
    isCollectionRoute ? 'hatchery' : 'shop',
  );

  useEffect(() => {
    if (location.pathname.includes('/collection')) {
      setActiveTab('hatchery');
    } else if (location.pathname.includes('/shop')) {
      setActiveTab('shop');
    }
  }, [location.pathname]);

  const [incubatingEggs, setIncubatingEggs] = useState<IncubatingEgg[]>(() => {
    try {
      const saved = getScopedItem(EGGS_STORAGE_KEY, currentUserId);
      return saved ? JSON.parse(saved) : DEFAULT_INCUBATING_EGGS;
    } catch {
      return DEFAULT_INCUBATING_EGGS;
    }
  });

  const [pets, setPets] = useState<StudentPet[]>(() => {
    try {
      const saved = getScopedItem(PETS_STORAGE_KEY, currentUserId);
      return saved ? JSON.parse(saved) : DEFAULT_STUDENT_PETS;
    } catch {
      return DEFAULT_STUDENT_PETS;
    }
  });

  useEffect(() => {
    if (currentUserId && loadedUserRef.current !== currentUserId) {
      loadedUserRef.current = currentUserId;
      try {
        const savedEggs = getScopedItem(EGGS_STORAGE_KEY, currentUserId);
        setIncubatingEggs(savedEggs ? JSON.parse(savedEggs) : DEFAULT_INCUBATING_EGGS);
      } catch {
        setIncubatingEggs(DEFAULT_INCUBATING_EGGS);
      }
      try {
        const savedPets = getScopedItem(PETS_STORAGE_KEY, currentUserId);
        setPets(savedPets ? JSON.parse(savedPets) : DEFAULT_STUDENT_PETS);
      } catch {
        setPets(DEFAULT_STUDENT_PETS);
      }
    }
  }, [currentUserId]);

  useEffect(() => {
    let isMounted = true;
    Promise.all([hatcheryService.getIncubatorEggs(), hatcheryService.getMyPets()])
      .then(([serverEggs, serverPets]) => {
        if (!isMounted) return;
        if (serverEggs && serverEggs.length > 0) {
          setIncubatingEggs(serverEggs);
        }
        if (serverPets && serverPets.length > 0) {
          setPets(serverPets);
        }
      })
      .catch(() => {
        // Fallback to local storage or defaults if offline or backend empty
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (currentUserId && loadedUserRef.current !== currentUserId) {
      return;
    }
    setScopedItem(EGGS_STORAGE_KEY, JSON.stringify(incubatingEggs), currentUserId);
  }, [incubatingEggs, currentUserId]);

  useEffect(() => {
    if (currentUserId && loadedUserRef.current !== currentUserId) {
      return;
    }
    setScopedItem(PETS_STORAGE_KEY, JSON.stringify(pets), currentUserId);
  }, [pets, currentUserId]);

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
    hatcheryService.hatchEgg(eggId).catch(() => {
      // ignore or optimistic
    });
    setIncubatingEggs((prev) => prev.filter((egg) => egg.id !== eggId));
    setPets((prev) => [hatchedPet, ...prev]);
  };

  const handleGrowPet = (petId: string, starsSpent: number) => {
    hatcheryService.growPet(petId).catch(() => {
      // ignore or optimistic
    });
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
    <ExamIntegrityStudentEggShopTemplate
      studentName={displayName || 'Student'}
      starCount={totalStars}
      isElementary={theme.isElementary}
      activeSection={isCollectionRoute ? 'collection' : 'shop'}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      incubatingEggs={incubatingEggs}
      pets={pets}
      onPurchaseEgg={handlePurchaseEgg}
      onEggHatched={handleEggHatched}
      onGrowPet={handleGrowPet}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
      dockMode={dockMode}
      onDockModeChange={setDockMode}
    />
  );
};

export default StudentManEggShopPage;
