import { useQuery } from '@tanstack/react-query';
import { hatcheryService } from '../services/hatcheryService';
import type { StudentPet, IncubatingEgg } from '@hvantran/ui-component-library';

export interface EquippedCompanion {
  type: 'pet' | 'egg';
  id: string;
  name: string;
  avatarEmoji: string;
  species?: string;
  stageName?: string;
  level?: number;
}

export function useEquippedCompanion() {
  const petsQuery = useQuery<StudentPet[]>({
    queryKey: ['hatchery', 'pets'],
    queryFn: () => hatcheryService.getMyPets(),
    staleTime: 60000,
  });

  const eggsQuery = useQuery<IncubatingEgg[]>({
    queryKey: ['hatchery', 'incubator'],
    queryFn: () => hatcheryService.getIncubatorEggs(),
    staleTime: 60000,
  });

  const equippedPet = petsQuery.data?.find((p) => p.isEquipped);
  const equippedEgg = eggsQuery.data?.find((e) => e.isEquipped);

  let companion: EquippedCompanion | null = null;
  if (equippedPet) {
    companion = {
      type: 'pet',
      id: equippedPet.id,
      name: equippedPet.name,
      avatarEmoji: equippedPet.avatarEmoji || '🐾',
      species: equippedPet.species,
      stageName: equippedPet.stageName,
      level: equippedPet.level,
    };
  } else if (equippedEgg) {
    companion = {
      type: 'egg',
      id: equippedEgg.id,
      name: equippedEgg.name,
      avatarEmoji: '🥚',
      species: equippedEgg.isMystery ? 'Mystery Egg' : equippedEgg.hatchedSpecies,
    };
  }

  return {
    companion,
    isLoading: petsQuery.isLoading || eggsQuery.isLoading,
  };
}

export default useEquippedCompanion;

