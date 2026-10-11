import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import StudentManCollectionPage from './StudentManCollectionPage';
import { useAuth } from '../context/AuthContext';
import { useUserProfile } from '../hooks/useUserProfile';
import { useNavDockMode } from '../hooks/useNavDockMode';
import { hatcheryService } from '../services/hatcheryService';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../services/hatcheryService', () => ({
  hatcheryService: {
    getIncubatorEggs: jest.fn().mockResolvedValue([]),
    getMyPets: jest.fn().mockResolvedValue([]),
    hatchEgg: jest.fn().mockResolvedValue({}),
    growPet: jest.fn().mockResolvedValue({}),
  },
}));

jest.mock('../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../hooks/useUserProfile', () => ({
  useUserProfile: jest.fn(),
}));

jest.mock('../hooks/useNavDockMode', () => ({
  useNavDockMode: jest.fn(),
}));

jest.mock('@hvantran/ui-component-library', () => {
  const actual = jest.requireActual('@hvantran/ui-component-library');
  return {
    ...actual,
    ExamIntegrityStudentCollectionTemplate: ({
      studentName,
      starCount,
      incubatingEggs,
      pets,
      onEggHatched,
      onGrowPet,
      onNavigate,
      onLogout,
    }: any) => (
      <div data-testid="mock-collection-template">
        <div data-testid="student-name">{studentName}</div>
        <div data-testid="star-count">{starCount}</div>
        <div data-testid="egg-count">{incubatingEggs?.length ?? 0}</div>
        <div data-testid="pet-count">{pets?.length ?? 0}</div>
        <button
          type="button"
          data-testid="mock-hatch-egg"
          onClick={() =>
            onEggHatched?.('egg-1', {
              id: 'pet-new',
              name: 'Sun Fledgling',
              species: 'Solar Phoenix',
              rarity: 'Epic',
              level: 1,
              maxLevel: 10,
              currentExp: 0,
              expNeeded: 100,
              growthCostInStars: 25,
              stats: { vitality: 50, wisdom: 50, integrityBond: 50 },
            })
          }
        >
          Hatch Egg
        </button>
        <button
          type="button"
          data-testid="mock-grow-pet"
          onClick={() => onGrowPet?.('pet-new', 25)}
        >
          Grow Pet
        </button>
        <button
          type="button"
          data-testid="mock-nav-shop"
          onClick={() => onNavigate?.('shop')}
        >
          Go Shop
        </button>
        <button type="button" data-testid="mock-logout" onClick={() => onLogout?.()}>
          Logout
        </button>
      </div>
    ),
  };
});

describe('StudentManCollectionPage', () => {
  const mockLogout = jest.fn();
  const mockSetDockMode = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();

    (useAuth as jest.Mock).mockReturnValue({
      logout: mockLogout,
      displayName: 'Alice Student',
      user: { username: 'alice', roles: ['STUDENT'] },
    });

    (useUserProfile as jest.Mock).mockReturnValue({
      data: {
        userId: 'student-123',
        stats: { totalStars: 500 },
      },
    });

    (useNavDockMode as jest.Mock).mockReturnValue(['pinned', mockSetDockMode]);
  });

  it('renders student collection with profile stars and name', () => {
    render(<StudentManCollectionPage />);

    expect(screen.getByTestId('student-name')).toHaveTextContent('Alice Student');
    expect(screen.getByTestId('star-count')).toHaveTextContent('500');
  });

  it('loads server eggs and pets into state', async () => {
    (hatcheryService.getIncubatorEggs as jest.Mock).mockResolvedValue([
      { id: 'server-egg-1', name: 'Server Egg', tier: 'dragon', crackProgress: 0.5 },
    ]);
    (hatcheryService.getMyPets as jest.Mock).mockResolvedValue([
      { id: 'server-pet-1', name: 'Server Pet', species: 'Dragon', level: 2, currentExp: 10, expNeeded: 100 },
    ]);

    render(<StudentManCollectionPage />);

    await waitFor(() => {
      expect(screen.getByTestId('egg-count')).toHaveTextContent('1');
      expect(screen.getByTestId('pet-count')).toHaveTextContent('1');
    });
  });

  it('handles egg hatching and adds pet to state', async () => {
    render(<StudentManCollectionPage />);

    fireEvent.click(screen.getByTestId('mock-hatch-egg'));

    await waitFor(() => {
      expect(hatcheryService.hatchEgg).toHaveBeenCalledWith('egg-1');
      expect(screen.getByTestId('pet-count')).not.toHaveTextContent('0');
    });
  });

  it('handles growing a pet with star spending', async () => {
    render(<StudentManCollectionPage />);

    fireEvent.click(screen.getByTestId('mock-hatch-egg'));
    fireEvent.click(screen.getByTestId('mock-grow-pet'));

    await waitFor(() => {
      expect(hatcheryService.growPet).toHaveBeenCalledWith('pet-new');
    });
  });

  it('navigates to shop section when requested', () => {
    render(<StudentManCollectionPage />);

    fireEvent.click(screen.getByTestId('mock-nav-shop'));
    expect(mockNavigate).toHaveBeenCalledWith('/shop');
  });

  it('invokes logout on handleLogout', () => {
    render(<StudentManCollectionPage />);

    fireEvent.click(screen.getByTestId('mock-logout'));
    expect(mockLogout).toHaveBeenCalled();
  });
});
