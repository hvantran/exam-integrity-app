import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  ExamIntegrityTeacherSettingsTemplate,
  useTheme,
  type ExamIntegrityDashboardSection as DashboardSection,
} from '@hvantran/ui-component-library';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingContext';
import { useNavDockMode, TEACHER_NAV_DOCK_STORAGE_KEY } from '../hooks/useNavDockMode';
import { DEFAULT_SETTINGS, type SystemSettings } from '../services/settingService';

const SECTION_ROUTES: Record<DashboardSection, string> = {
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
  const { theme, setTheme } = useTheme();
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
    <ExamIntegrityTeacherSettingsTemplate
      userName={displayName}
      onNavigate={handleNavigate}
      onLogout={logout}
      dockMode={dockMode}
      onDockModeChange={setDockMode}
      themeMode={theme}
      onThemeModeChange={setTheme}
      settings={formState}
      onSettingsChange={handleChange}
      onSave={handleSave}
      onResetDefaults={handleResetDefaults}
      isLoading={isLoading}
      isSaving={isSaving}
    />
  );
};

export default TeacherManSettingsPage;
