import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ExamIntegrityStudentCollectionTemplate,
  type ExamIntegrityStudentPortalSection as PortalSection,
  type IncubatingEgg,
  type StudentPet,
  DEFAULT_INCUBATING_EGGS,
  DEFAULT_STUDENT_PETS,
  getExportedPetLibrary,
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
const PETS_STORAGE_KEY = 'exam_integrity_student_pets';

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
  const totalStars = profile?.stats?.totalStars ?? 0;
  const [dockMode, setDockMode] = useNavDockMode();

  const currentUserId = profile?.userId || user?.username || null;
  const loadedUserRef = useRef<string | null>(currentUserId);

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
    try {
      const exported = getExportedPetLibrary();
      hatcheryService.syncPetLibrary(exported).catch(() => {});
    } catch {
      // ignore
    }

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

  const handleEggHatched = (eggId: string, hatchedPet: StudentPet) => {
    setIncubatingEggs((prev) => prev.filter((egg) => egg.id !== eggId));
    setPets((prev) => [hatchedPet, ...prev]);

    Promise.resolve(hatcheryService.hatchEgg(eggId))
      .then((serverPet) => {
        if (serverPet && serverPet.id) {
          setPets((prev) => [
            serverPet,
            ...prev.filter((p) => p.id !== hatchedPet.id && p.id !== serverPet.id),
          ]);
        }
      })
      .catch(() => {
        // fallback keeps hatchedPet
      });
  };

  const handleGrowPet = (petId: string, starsSpent: number) => {
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

