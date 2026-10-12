import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import StudentManShopPage from './StudentManShopPage';
import { useAuth } from '../context/AuthContext';
import { useUserProfile } from '../hooks/useUserProfile';
import { useNavDockMode } from '../hooks/useNavDockMode';
import { hatcheryService } from '../services/hatcheryService';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
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

jest.mock('../services/hatcheryService', () => ({
  hatcheryService: {
    purchaseEgg: jest.fn().mockResolvedValue({
      success: true,
      egg: { id: 'egg-purchased', name: 'Ancient Mysterious Egg' },
      remainingStars: 250,
    }),
  },
}));

jest.mock('@hvantran/ui-component-library', () => {
  const actual = jest.requireActual('@hvantran/ui-component-library');
  return {
    ...actual,
    ExamIntegrityStudentShopTemplate: ({
      studentName,
      starCount,
      items,
      dropRates,
      onPurchaseEgg,
      onNavigate,
      onLogout,
    }: any) => (
      <div data-testid="mock-shop-template">
        <div data-testid="student-name">{studentName}</div>
        <div data-testid="star-count">{starCount}</div>
        <div data-testid="egg-price">{items?.[0]?.price}</div>
        <div data-testid="egg-duration">{items?.[0]?.hatchDurationHours}</div>
        <div data-testid="drop-common">{dropRates?.Common}</div>
        <button
          type="button"
          data-testid="mock-buy-egg"
          onClick={() =>
            onPurchaseEgg?.(
              items?.[0] || {
                id: 'mystery-egg-1',
                name: 'Ancient Mysterious Egg',
                tier: 'dragon',
                rarity: 'Common',
                price: 250,
                description: 'Test',
                hatchedPetName: 'Mystery Pet',
                petElement: 'Cosmic',
                hatchDurationHours: 8,
              }
            )
          }
        >
          Buy Mystery Egg
        </button>
        <button
          type="button"
          data-testid="mock-nav-collection"
          onClick={() => onNavigate?.('collection')}
        >
          Go Collection
        </button>
        <button type="button" data-testid="mock-logout" onClick={() => onLogout?.()}>
          Logout
        </button>
      </div>
    ),
  };
});

describe('StudentManShopPage', () => {
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

  it('renders student shop with profile stars, name, and settings values', () => {
    render(<StudentManShopPage />);

    expect(screen.getByTestId('student-name')).toHaveTextContent('Alice Student');
    expect(screen.getByTestId('star-count')).toHaveTextContent('500');
    expect(screen.getByTestId('egg-price')).toHaveTextContent('250');
    expect(screen.getByTestId('egg-duration')).toHaveTextContent('8');
    expect(screen.getByTestId('drop-common')).toHaveTextContent('50');
  });

  it('handles purchasing egg and persists via hatcheryService without using local storage', async () => {
    render(<StudentManShopPage />);

    const buyBtn = screen.getByTestId('mock-buy-egg');
    fireEvent.click(buyBtn);

    expect(hatcheryService.purchaseEgg).toHaveBeenCalled();
    await waitFor(() => {
      const saved = localStorage.getItem('exam_integrity_student-123_incubating_eggs');
      expect(saved).toBeNull();
    });
  });

  it('navigates to collection section when requested', () => {
    render(<StudentManShopPage />);

    fireEvent.click(screen.getByTestId('mock-nav-collection'));
    expect(mockNavigate).toHaveBeenCalledWith('/collection');
  });

  it('invokes logout on handleLogout', () => {
    render(<StudentManShopPage />);

    fireEvent.click(screen.getByTestId('mock-logout'));
    expect(mockLogout).toHaveBeenCalled();
  });
});
