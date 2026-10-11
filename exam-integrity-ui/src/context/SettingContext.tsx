import React, { createContext, useContext, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingService, DEFAULT_SETTINGS, type SystemSettings } from '../services/settingService';

export interface SettingContextValue {
  settings: SystemSettings;
  isLoading: boolean;
  error: Error | null;
  updateSettings: (updates: Partial<SystemSettings>) => Promise<SystemSettings>;
  refetch: () => void;
  getSettingNumber: (key: keyof SystemSettings | string, fallback?: number) => number;
}

const SettingContext = createContext<SettingContextValue | undefined>(undefined);

export const SettingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();

  const {
    data: fetchedSettings,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['system-settings'],
    queryFn: () => settingService.getSettings(),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const mergedSettings = useMemo(() => {
    return {
      ...DEFAULT_SETTINGS,
      ...(fetchedSettings || {}),
    };
  }, [fetchedSettings]);

  const updateMutation = useMutation({
    mutationFn: (updates: Partial<SystemSettings>) => settingService.updateSettings(updates),
    onSuccess: (updated) => {
      queryClient.setQueryData<SystemSettings>(['system-settings'], (old) => ({
        ...old,
        ...updated,
      }));
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
    },
  });

  const getSettingNumber = (key: keyof SystemSettings | string, fallback = 0): number => {
    const val = mergedSettings[key];
    if (typeof val === 'number') return val;
    if (val !== undefined && val !== null) {
      const parsed = Number(val);
      if (!Number.isNaN(parsed)) return parsed;
    }
    return DEFAULT_SETTINGS[key] ?? fallback;
  };

  const value: SettingContextValue = useMemo(
    () => ({
      settings: mergedSettings,
      isLoading,
      error: error instanceof Error ? error : null,
      updateSettings: (updates) => updateMutation.mutateAsync(updates),
      refetch: () => refetch(),
      getSettingNumber,
    }),
    [mergedSettings, isLoading, error, updateMutation, refetch],
  );

  return <SettingContext.Provider value={value}>{children}</SettingContext.Provider>;
};

export const useSettings = (): SettingContextValue => {
  const ctx = useContext(SettingContext);
  if (!ctx) {
    // Graceful fallback for components rendered outside provider
    return {
      settings: DEFAULT_SETTINGS,
      isLoading: false,
      error: null,
      updateSettings: async () => DEFAULT_SETTINGS,
      refetch: () => {},
      getSettingNumber: (key, fallback = 0) => (DEFAULT_SETTINGS[key] as number) ?? fallback,
    };
  }
  return ctx;
};

