import { useQuery } from '@tanstack/react-query';
import { hatcheryService } from '../services/hatcheryService';
import type { StudentPet, IncubatingEgg } from '@hvantran/ui-component-library';

export interface EquippedCompanion {
  type: 'pet' | 'egg';
  id: string;
  name: string;
  avatarEmoji: string;
  avatarIcon?: string;
  backgroundImage?: string;
  iconUrl?: string;
  backgroundUrl?: string;
  species?: string;
  stageName?: string;
  level?: number;
}

const DEFAULT_ASSETS_CDN_BASE =
  'https://github.com/hvantran/ui-component-library/releases/download/assets-v1';

export function resolveAssetUrl(filename?: string): string | undefined {
  if (!filename) return undefined;
  if (filename.startsWith('http://') || filename.startsWith('https://') || filename.startsWith('/')) {
    return filename;
  }
  const globalEnv =
    typeof globalThis !== 'undefined'
      ? (globalThis as unknown as { process?: { env?: Record<string, string | undefined> } }).process?.env
      : undefined;

  const customBase =
    (typeof window !== 'undefined' &&
      ((window as unknown as Record<string, string | undefined>).__PET_ASSETS_BASE_URL__ ||
       (window as unknown as Record<string, string | undefined>).__ASSETS_BASE_URL__)) ||
    globalEnv?.REACT_APP_PET_ASSETS_BASE_URL ||
    globalEnv?.REACT_APP_ASSETS_BASE_URL;

  if (customBase) {
    return `${String(customBase).replace(/\/$/, '')}/${filename}`;
  }
  return `${DEFAULT_ASSETS_CDN_BASE}/${filename}`;
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
    const avatarIcon =
      (equippedPet as unknown as { avatarIcon?: string; icon?: string }).avatarIcon ||
      (equippedPet as unknown as { avatarIcon?: string; icon?: string }).icon;
    const backgroundImage =
      (equippedPet as unknown as { backgroundImage?: string }).backgroundImage;

    companion = {
      type: 'pet',
      id: equippedPet.id,
      name: equippedPet.name,
      avatarEmoji: equippedPet.avatarEmoji || '🐾',
      avatarIcon,
      backgroundImage,
      iconUrl: resolveAssetUrl(avatarIcon),
      backgroundUrl: resolveAssetUrl(backgroundImage),
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

