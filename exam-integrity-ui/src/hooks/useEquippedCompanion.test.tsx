import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEquippedCompanion } from './useEquippedCompanion';
import { hatcheryService } from '../services/hatcheryService';

jest.mock('../services/hatcheryService', () => ({
  hatcheryService: {
    getMyPets: jest.fn(),
    getIncubatorEggs: jest.fn(),
  },
}));

describe('useEquippedCompanion', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('returns null companion when no pets or eggs are equipped', async () => {
    (hatcheryService.getMyPets as jest.Mock).mockResolvedValue([
      { id: 'pet-1', name: 'Pet One', isEquipped: false },
    ]);
    (hatcheryService.getIncubatorEggs as jest.Mock).mockResolvedValue([
      { id: 'egg-1', name: 'Egg One', isEquipped: false },
    ]);

    const { result } = renderHook(() => useEquippedCompanion(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.companion).toBeNull();
  });

  it('resolves equipped pet companion correctly', async () => {
    (hatcheryService.getMyPets as jest.Mock).mockResolvedValue([
      {
        id: 'pet-1',
        name: 'Sun Ember Phoenix',
        avatarEmoji: '🔥',
        avatarIcon: 'phoenix-stage-2-icon.png',
        backgroundImage: 'phoenix-stage-2-bg.png',
        species: 'Primordial Phoenix',
        element: 'Fire',
        stageName: 'Juvenile',
        level: 3,
        isEquipped: true,
      },
    ]);
    (hatcheryService.getIncubatorEggs as jest.Mock).mockResolvedValue([]);

    const { result } = renderHook(() => useEquippedCompanion(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.companion).toEqual({
      type: 'pet',
      id: 'pet-1',
      name: 'Sun Ember Phoenix',
      avatarEmoji: '🔥',
      avatarIcon: 'phoenix-stage-2-icon.png',
      backgroundImage: 'phoenix-stage-2-bg.png',
      iconUrl:
        'https://github.com/hvantran/ui-component-library/releases/download/assets-v1/phoenix-stage-2-icon.png',
      backgroundUrl:
        'https://github.com/hvantran/ui-component-library/releases/download/assets-v1/phoenix-stage-2-bg.png',
      species: 'Primordial Phoenix',
      element: 'Fire',
      stageName: 'Juvenile',
      level: 3,
    });
  });

  it('resolves equipped incubating egg when no pet is equipped', async () => {
    (hatcheryService.getMyPets as jest.Mock).mockResolvedValue([]);
    (hatcheryService.getIncubatorEggs as jest.Mock).mockResolvedValue([
      {
        id: 'egg-1',
        name: 'Celestial Dragon Egg',
        hatchedSpecies: 'Celestial Dragon',
        isMystery: false,
        isEquipped: true,
      },
    ]);

    const { result } = renderHook(() => useEquippedCompanion(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.companion).toEqual({
      type: 'egg',
      id: 'egg-1',
      name: 'Celestial Dragon Egg',
      avatarEmoji: '🥚',
      species: 'Celestial Dragon',
    });
  });
});

