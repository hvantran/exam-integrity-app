import apiClient from './apiClient';

export interface SystemSettings {
  egg_shop_price_stars?: number;
  egg_hatch_duration_hours?: number;
  egg_drop_rate_common?: number;
  egg_drop_rate_rare?: number;
  egg_drop_rate_epic?: number;
  egg_drop_rate_legendary?: number;
  egg_drop_rate_mythic?: number;
  strike_crack_star_cost?: number;
  strike_crack_progress_boost?: number;
  strike_crack_time_reduced_seconds?: number;
  equip_egg_star_cost?: number;
  pet_grow_star_cost?: number;
  pet_grow_exp_gain?: number;
  pet_base_exp_needed?: number;
  pet_exp_growth_multiplier?: number;
  pet_max_level?: number;
  stars_per_score_point?: number;
  stars_per_answered_question?: number;
  stars_per_user_level?: number;
  [key: string]: any;
}

export const DEFAULT_SETTINGS: SystemSettings = {
  egg_shop_price_stars: 250,
  egg_hatch_duration_hours: 8,
  egg_drop_rate_common: 50,
  egg_drop_rate_rare: 28,
  egg_drop_rate_epic: 14,
  egg_drop_rate_legendary: 6,
  egg_drop_rate_mythic: 2,
  strike_crack_star_cost: 25,
  strike_crack_progress_boost: 0.25,
  strike_crack_time_reduced_seconds: 7200,
  equip_egg_star_cost: 25,
  pet_grow_star_cost: 25,
  pet_grow_exp_gain: 60,
  pet_base_exp_needed: 100,
  pet_exp_growth_multiplier: 1.35,
  pet_max_level: 10,
  stars_per_score_point: 1.0,
  stars_per_answered_question: 0.5,
  stars_per_user_level: 20,
};

export const settingService = {
  getSettings: async (): Promise<SystemSettings> => {
    const res = await apiClient.get<SystemSettings>('/api/settings');
    return res.data;
  },

  updateSettings: async (updates: Partial<SystemSettings>): Promise<SystemSettings> => {
    const res = await apiClient.put<SystemSettings>('/api/settings', updates);
    return res.data;
  },
};

