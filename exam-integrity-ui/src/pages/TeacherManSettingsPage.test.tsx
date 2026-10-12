import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TeacherManSettingsPage } from './TeacherManSettingsPage';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingContext';
import { useNavDockMode } from '../hooks/useNavDockMode';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../context/SettingContext', () => ({
  useSettings: jest.fn(),
}));

jest.mock('../hooks/useNavDockMode', () => ({
  useNavDockMode: jest.fn(),
  TEACHER_NAV_DOCK_STORAGE_KEY: 'test_dock_key',
}));

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

describe('TeacherManSettingsPage', () => {
  const mockUpdateSettings = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      displayName: 'Teacher User',
      logout: jest.fn(),
    });
    (useNavDockMode as jest.Mock).mockReturnValue(['pinned', jest.fn()]);
    (useSettings as jest.Mock).mockReturnValue({
      settings: {
        egg_shop_price_stars: 250,
        egg_hatch_duration_hours: 8,
        strike_crack_star_cost: 25,
        pet_grow_star_cost: 25,
        pet_grow_exp_gain: 60,
        pet_max_level: 10,
      },
      updateSettings: mockUpdateSettings,
      isLoading: false,
    });
  });

  it('renders settings page with form fields initialized', () => {
    render(<TeacherManSettingsPage />);

    expect(screen.getByText('System & Gameplay Settings')).toBeInTheDocument();
    expect(screen.getByText('Egg Shop Price (Stars)')).toBeInTheDocument();
    expect(screen.getByText('Egg Rarity Drop Rates (% Chance)')).toBeInTheDocument();
    expect(screen.getByText('Common (%)')).toBeInTheDocument();
    expect(screen.getByText('Mythic (%)')).toBeInTheDocument();
    expect(screen.getByText('Pet Growth Cost (Stars)')).toBeInTheDocument();
  });

  it('submits form with updated settings', async () => {
    mockUpdateSettings.mockResolvedValueOnce({});
    render(<TeacherManSettingsPage />);

    const saveBtn = screen.getByRole('button', { name: /save settings/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(mockUpdateSettings).toHaveBeenCalled();
    });
  });
});

