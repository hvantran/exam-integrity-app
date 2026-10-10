import apiClient from './apiClient';
import type { IncubatingEgg, StudentPet } from '@hvantran/ui-component-library';

export interface EggHatchResponse {
  id: string;
  name: string;
  species: string;
  rarity: string;
  tier: string;
  element: string;
  stageName: string;
  avatarEmoji: string;
}

export const hatcheryService = {
  getIncubatorEggs: async (): Promise<IncubatingEgg[]> => {
    const res = await apiClient.get<IncubatingEgg[]>('/api/hatchery/incubator');
    return res.data;
  },

  getMyPets: async (): Promise<StudentPet[]> => {
    const res = await apiClient.get<StudentPet[]>('/api/hatchery/pets');
    return res.data;
  },

  strikeEgg: async (eggId: string): Promise<IncubatingEgg> => {
    const res = await apiClient.post<IncubatingEgg>(`/api/hatchery/incubator/${eggId}/strike`);
    return res.data;
  },

  hatchEgg: async (eggId: string, fixedRoll?: number): Promise<StudentPet> => {
    const params = fixedRoll !== undefined ? { fixedRoll } : {};
    const res = await apiClient.post<StudentPet>(`/api/hatchery/incubator/${eggId}/hatch`, null, {
      params,
    });
    return res.data;
  },

  growPet: async (petId: string): Promise<{ pet: StudentPet; remainingStars: number }> => {
    const res = await apiClient.post<{ pet: StudentPet; remainingStars: number }>(
      `/api/hatchery/pets/${petId}/grow`,
    );
    return res.data;
  },
};

