import { useEffect } from 'react';
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
  element?: string;
  stageName?: string;
  level?: number;
}

export const COMPANION_ELEMENT_COLORS: Record<string, string> = {
  flora: '#10b981',
  water: '#0ea5e9',
  fire: '#f59e0b',
  wind: '#14b8a6',
  ice: '#06b6d4',
  earth: '#b45309',
  lightning: '#eab308',
  cosmic: '#8b5cf6',
  shadow: '#6366f1',
  astral: '#ec4899',
  void: '#a855f7',
  temporal: '#f97316',
  divine: '#e11d48',
};

export function resolveElementColor(element?: string): string {
  if (!element) return '#3b82f6';
  const clean = element.toLowerCase().trim();
  for (const [key, color] of Object.entries(COMPANION_ELEMENT_COLORS)) {
    if (clean.includes(key)) {
      return color;
    }
  }
  return COMPANION_ELEMENT_COLORS[clean] || '#3b82f6';
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
      element: equippedPet.element,
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

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    if (companion?.type === 'pet') {
      if (companion.element) {
        const cleanElement = String(companion.element).toLowerCase().trim();
        root.setAttribute('data-companion-element', cleanElement);
        const accent = resolveElementColor(cleanElement);
        root.style.setProperty('--companion-accent', accent);
      }
      if (companion.backgroundUrl) {
        root.style.setProperty('--companion-bg-image', `url(${companion.backgroundUrl})`);
      }
      if (companion.iconUrl) {
        root.style.setProperty('--companion-avatar-icon', `url(${companion.iconUrl})`);
      }
    } else {
      root.removeAttribute('data-companion-element');
      root.style.removeProperty('--companion-accent');
      root.style.removeProperty('--companion-bg-image');
      root.style.removeProperty('--companion-avatar-icon');
    }
  }, [companion]);

  return {
    companion,
    isLoading: petsQuery.isLoading || eggsQuery.isLoading,
  };
}

export default useEquippedCompanion;

