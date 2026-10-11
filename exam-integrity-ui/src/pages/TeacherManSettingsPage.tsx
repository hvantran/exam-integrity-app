import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  ExamIntegrityTeacherDashboardTemplate as TeacherManDashboardLayout,
  Button,
  type ExamIntegrityDashboardSection as DashboardSection,
} from '@hvantran/ui-component-library';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingContext';
import { useNavDockMode, TEACHER_NAV_DOCK_STORAGE_KEY } from '../hooks/useNavDockMode';
import { DEFAULT_SETTINGS, type SystemSettings } from '../services/settingService';
import { Save, RotateCcw, Sparkles, Egg, Award, Settings as SettingsIcon } from 'lucide-react';

const SECTION_ROUTES: Record<DashboardSection | 'settings', string> = {
  dashboard: '/teacher/dashboard',
  ingestion: '/teacher/ingestion',
  review: '/teacher/ingestion',
  scoring: '/teacher/scoring',
  'question-bank': '/teacher/question-bank',
  reports: '/teacher/ingestion',
  settings: '/teacher/settings',
};

export const TeacherManSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { logout, displayName } = useAuth();
  const [dockMode, setDockMode] = useNavDockMode('pinned', TEACHER_NAV_DOCK_STORAGE_KEY);
  const { settings, updateSettings, isLoading } = useSettings();

  const [formState, setFormState] = useState<SystemSettings>(settings);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFormState(settings);
  }, [settings]);

  const handleNavigate = (section: DashboardSection) => navigate(SECTION_ROUTES[section]);

  const handleChange = (key: keyof SystemSettings, value: number) => {
    setFormState((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await updateSettings(formState);
      toast.success('System settings saved successfully!');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = () => {
    setFormState(DEFAULT_SETTINGS);
    toast.info('Settings form reset to default values. Click Save to apply.');
  };

  return (
    <TeacherManDashboardLayout
      activeSection={'settings' as any}
      userName={displayName}
      onNavigate={handleNavigate}
      onLogout={logout}
      dockMode={dockMode}
      onDockModeChange={setDockMode}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <SettingsIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                System & Gameplay Settings
              </h1>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Configure student egg shop prices, companion pet growth, incubation timers, and star economy parameters.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="neutral"
              size="sm"
              icon={<RotateCcw size={15} />}
              iconPlacement="left"
              onClick={handleResetDefaults}
              disabled={isSaving || isLoading}
            >
              Reset Defaults
            </Button>
            <Button
              type="submit"
              form="settings-form"
              variant="primary"
              size="sm"
              icon={<Save size={15} />}
              iconPlacement="left"
              disabled={isSaving || isLoading}
            >
              {isSaving ? 'Saving…' : 'Save Settings'}
            </Button>
          </div>
        </div>

        <form id="settings-form" onSubmit={handleSave} className="space-y-6">
          {/* Egg Shop & Hatchery Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 border-b border-gray-100 dark:border-gray-700 pb-3">
              <Egg className="w-5 h-5 text-amber-500" />
              <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
                Egg Shop & Incubation Chamber
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Egg Shop Price (Stars)
                </label>
                <input
                  type="number"
                  min={0}
                  className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={formState.egg_shop_price_stars ?? 250}
                  onChange={(e) => handleChange('egg_shop_price_stars', Number(e.target.value))}
                  required
                />
                <span className="text-[11px] text-gray-400">Stars required to adopt mystery eggs.</span>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Hatch Incubation Duration (Hours)
                </label>
                <input
                  type="number"
                  min={1}
                  className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={formState.egg_hatch_duration_hours ?? 8}
                  onChange={(e) => handleChange('egg_hatch_duration_hours', Number(e.target.value))}
                  required
                />
                <span className="text-[11px] text-gray-400">Total hours an egg must incubate before hatching.</span>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Strike Crack Cost (Stars)
                </label>
                <input
                  type="number"
                  min={0}
                  className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={formState.strike_crack_star_cost ?? 25}
                  onChange={(e) => handleChange('strike_crack_star_cost', Number(e.target.value))}
                  required
                />
                <span className="text-[11px] text-gray-400">Stars spent per egg crack to accelerate hatching.</span>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Equip Egg Cost (Stars)
                </label>
                <input
                  type="number"
                  min={0}
                  className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={formState.equip_egg_star_cost ?? 25}
                  onChange={(e) => handleChange('equip_egg_star_cost', Number(e.target.value))}
                  required
                />
                <span className="text-[11px] text-gray-400">Stars to equip an incubating egg companion.</span>
              </div>
            </div>
          </div>

          {/* Pet Growth & Evolution Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 border-b border-gray-100 dark:border-gray-700 pb-3">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
                Companion Pet Growth & Progression
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Pet Growth Cost (Stars)
                </label>
                <input
                  type="number"
                  min={0}
                  className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={formState.pet_grow_star_cost ?? 25}
                  onChange={(e) => handleChange('pet_grow_star_cost', Number(e.target.value))}
                  required
                />
                <span className="text-[11px] text-gray-400">Stars required to feed / train companion pet.</span>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  EXP Gain Per Feeding
                </label>
                <input
                  type="number"
                  min={1}
                  className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={formState.pet_grow_exp_gain ?? 60}
                  onChange={(e) => handleChange('pet_grow_exp_gain', Number(e.target.value))}
                  required
                />
                <span className="text-[11px] text-gray-400">Experience points awarded per growth action.</span>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Max Pet Level Ceiling
                </label>
                <input
                  type="number"
                  min={1}
                  className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={formState.pet_max_level ?? 10}
                  onChange={(e) => handleChange('pet_max_level', Number(e.target.value))}
                  required
                />
                <span className="text-[11px] text-gray-400">Highest achievable pet level.</span>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Base EXP for Level 2
                </label>
                <input
                  type="number"
                  min={10}
                  className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={formState.pet_base_exp_needed ?? 100}
                  onChange={(e) => handleChange('pet_base_exp_needed', Number(e.target.value))}
                  required
                />
                <span className="text-[11px] text-gray-400">Initial EXP threshold for Level 1 to 2.</span>
              </div>
            </div>
          </div>

          {/* Gamification Economy Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 border-b border-gray-100 dark:border-gray-700 pb-3">
              <Award className="w-5 h-5 text-amber-500" />
              <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
                Star Rewards & Gamification Economy
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Stars Per Score Point (10-Point Scale)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min={0}
                  className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={formState.stars_per_score_point ?? 1.0}
                  onChange={(e) => handleChange('stars_per_score_point', Number(e.target.value))}
                  required
                />
                <span className="text-[11px] text-gray-400">Ratio of stars earned per exam score point.</span>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Stars Per User Profile Level Up
                </label>
                <input
                  type="number"
                  min={1}
                  className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={formState.stars_per_user_level ?? 20}
                  onChange={(e) => handleChange('stars_per_user_level', Number(e.target.value))}
                  required
                />
                <span className="text-[11px] text-gray-400">Cumulative stars required for student profile level up.</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </TeacherManDashboardLayout>
  );
};

export default TeacherManSettingsPage;
