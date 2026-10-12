import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ExamIntegrityStudentCollectionTemplate,
  type ExamIntegrityStudentPortalSection as PortalSection,
  type IncubatingEgg,
  type StudentPet,
  getExportedPetLibrary,
} from '@hvantran/ui-component-library';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { useUserProfile } from '../hooks/useUserProfile';
import { useNavDockMode } from '../hooks/useNavDockMode';
import { useSettings } from '../context/SettingContext';
import { hatcheryService } from '../services/hatcheryService';
import type { UserProfile } from '../services/profileService';
import { removeScopedItem } from '../utils/storage';

const PORTAL_ROUTES: Record<PortalSection, string> = {
  dashboard: '/',
  'my-exams': '/my-exams',
  results: '/my-exams',
  shop: '/shop',
  collection: '/collection',
};

const LEGACY_EGGS_STORAGE_KEY = 'exam_integrity_incubating_eggs';
const LEGACY_PETS_STORAGE_KEY = 'exam_integrity_student_pets';

function useSafeQueryClient() {
  try {
    return useQueryClient();
  } catch {
    return null;
  }
}

const StudentManCollectionPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useSafeQueryClient();
  const { logout, displayName, user } = useAuth();
  const { data: profile } = useUserProfile();
  const { getSettingNumber } = useSettings();
  const totalStars = profile?.stats?.totalStars ?? 0;
  const [dockMode, setDockMode] = useNavDockMode();
  const crackCost = getSettingNumber('strike_crack_star_cost', 25);

  const currentUserId = profile?.userId || user?.username || null;

  const [incubatingEggs, setIncubatingEggs] = useState<IncubatingEgg[]>([]);
  const [pets, setPets] = useState<StudentPet[]>([]);

  useEffect(() => {
    let isMounted = true;
    try {
      const exported = getExportedPetLibrary();
      hatcheryService.syncPetLibrary(exported).catch(() => {});
    } catch {
      // ignore
    }

    if (currentUserId) {
      removeScopedItem(LEGACY_EGGS_STORAGE_KEY, currentUserId);
      removeScopedItem(LEGACY_PETS_STORAGE_KEY, currentUserId);
    }

    Promise.all([hatcheryService.getIncubatorEggs(), hatcheryService.getMyPets()])
      .then(([serverEggs, serverPets]) => {
        if (!isMounted) return;
        setIncubatingEggs(serverEggs ?? []);
        setPets(serverPets ?? []);
      })
      .catch(() => {
        if (!isMounted) return;
        setIncubatingEggs([]);
        setPets([]);
      });

    return () => {
      isMounted = false;
    };
  }, [currentUserId]);

  const handleLogout = () => {
    logout();
  };

  const handleNavigate = (section: PortalSection) => navigate(PORTAL_ROUTES[section]);

  const handleEggHatched = async (eggId: string, clientFallbackPet?: StudentPet) => {
    setIncubatingEggs((prev) => prev.filter((egg) => egg.id !== eggId));
    if (clientFallbackPet) {
      setPets((prev) => [clientFallbackPet, ...prev]);
    }
    try {
      const serverPet = await hatcheryService.hatchEgg(eggId);
      if (serverPet && serverPet.id) {
        setPets((prev) => [
          serverPet,
          ...prev.filter((p) => p.id !== serverPet.id && p.id !== clientFallbackPet?.id),
        ]);
        return serverPet;
      }
    } catch {
      // server hatch failed; fallback already kept
      if (clientFallbackPet) {
        return clientFallbackPet;
      }
    }
  };

  const handleGrowPet = (petId: string, starsSpent: number) => {
    const targetPet = pets.find((p) => p.id === petId);
    if (targetPet && targetPet.level >= (targetPet.maxLevel || 10)) {
      return;
    }

    // Optimistically deduct stars
    queryClient?.setQueryData<UserProfile>(['user-profile', 'me'], (old) => {
      if (!old) return old;
      return {
        ...old,
        stats: {
          ...old.stats,
          totalStars: Math.max(0, (old.stats?.totalStars ?? 0) - starsSpent),
        },
      };
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

    Promise.resolve(hatcheryService.growPet(petId))
      .then((res) => {
        if (res && res.pet) {
          setPets((prev) => prev.map((p) => (p.id === petId ? { ...p, ...res.pet } : p)));
        }
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
        // fallback
      });
  };

  const handleStrikeCrack = (eggId: string, starsSpent: number) => {
    queryClient?.setQueryData<UserProfile>(['user-profile', 'me'], (old) => {
      if (!old) return old;
      return {
        ...old,
        stats: {
          ...old.stats,
          totalStars: Math.max(0, (old.stats?.totalStars ?? 0) - starsSpent),
        },
      };
    });

    Promise.resolve(hatcheryService.strikeEgg(eggId))
      .then((updatedEgg) => {
        if (updatedEgg && updatedEgg.id) {
          setIncubatingEggs((prev) =>
            prev.map((e) => (e.id === eggId ? { ...e, ...updatedEgg } : e))
          );
        }
        queryClient?.invalidateQueries({ queryKey: ['user-profile', 'me'] });
      })
      .catch(() => {
        // fallback
      });
  };

  return (
    <ExamIntegrityStudentCollectionTemplate
      studentName={displayName || 'Student'}
      starCount={totalStars}
      crackCostInStars={crackCost}
      incubatingEggs={incubatingEggs}
      pets={pets}
      onEggHatched={handleEggHatched}
      onGrowPet={handleGrowPet}
      onStrikeCrack={handleStrikeCrack}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
      dockMode={dockMode}
      onDockModeChange={setDockMode}
    />
  );
};

export default StudentManCollectionPage;
