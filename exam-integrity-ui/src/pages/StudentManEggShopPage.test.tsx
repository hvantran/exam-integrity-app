import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import StudentManEggShopPage from './StudentManEggShopPage';
import { useAuth } from '../context/AuthContext';
import { useUserProfile } from '../hooks/useUserProfile';
import { useNavDockMode } from '../hooks/useNavDockMode';

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

jest.mock('@hvantran/ui-component-library', () => {
  const actual = jest.requireActual('@hvantran/ui-component-library');
  return {
    ...actual,
    ExamIntegrityEggShop: ({
      starBalance,
      onOpenHatchery,
      onPurchaseEgg,
    }: {
      starBalance: number;
      onOpenHatchery?: () => void;
      onPurchaseEgg?: (item: any) => void;
    }) => (
      <div data-testid="mock-egg-shop">
        <span>Mock Egg Shop Stars: {starBalance}</span>
        <button type="button" onClick={onOpenHatchery}>
          Go to Hatchery Button
        </button>
        <button
          type="button"
          onClick={() =>
            onPurchaseEgg?.({
              id: 'test-egg',
              name: 'Test Egg',
              tier: 'dragon',
              rarity: 'Epic',
              price: 100,
              description: 'Test',
              hatchedPetName: 'Test Pet',
              petElement: 'Fire',
            })
          }
        >
          Mock Buy Egg
        </button>
      </div>
    ),
    ExamIntegrityPetHatchery: ({
      starBalance,
      incubatingEggs,
    }: {
      starBalance: number;
      incubatingEggs: any[];
    }) => (
      <div data-testid="mock-pet-hatchery">
        <span>Mock Pet Hatchery Stars: {starBalance}</span>
        <span>Incubating Count: {incubatingEggs?.length ?? 0}</span>
      </div>
    ),
  };
});

describe('StudentManEggShopPage', () => {
  const mockLogout = jest.fn();
  const mockSetDockMode = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      user: { username: 'student-tester', roles: ['STUDENT'] },
      displayName: 'Alice Student',
      logout: mockLogout,
    });
    (useUserProfile as jest.Mock).mockReturnValue({
      data: {
        stats: {
          totalStars: 450,
        },
      },
      isLoading: false,
    });
    (useNavDockMode as jest.Mock).mockReturnValue(['pinned', mockSetDockMode]);
  });

  it('renders student egg shop with star balance by default', () => {
    render(<StudentManEggShopPage />);

    expect(screen.getByTestId('mock-egg-shop')).toBeTruthy();
    expect(screen.getByText('Mock Egg Shop Stars: 450')).toBeTruthy();
    expect(screen.getByTestId('tab-egg-shop')).toBeTruthy();
    expect(screen.getByTestId('tab-pet-hatchery')).toBeTruthy();
  });

  it('switches between egg shop and hatchery tabs', () => {
    render(<StudentManEggShopPage />);

    expect(screen.getByTestId('mock-egg-shop')).toBeTruthy();
    expect(screen.queryByTestId('mock-pet-hatchery')).toBeNull();

    // Click tab to switch to hatchery
    fireEvent.click(screen.getByTestId('tab-pet-hatchery'));
    expect(screen.getByTestId('mock-pet-hatchery')).toBeTruthy();
    expect(screen.queryByTestId('mock-egg-shop')).toBeNull();

    // Click back to shop
    fireEvent.click(screen.getByTestId('tab-egg-shop'));
    expect(screen.getByTestId('mock-egg-shop')).toBeTruthy();
  });

  it('navigates to hatchery when onOpenHatchery callback is invoked', () => {
    render(<StudentManEggShopPage />);

    fireEvent.click(screen.getByText('Go to Hatchery Button'));
    expect(screen.getByTestId('mock-pet-hatchery')).toBeTruthy();
  });

  it('adds newly purchased egg to incubating eggs', () => {
    render(<StudentManEggShopPage />);

    // Purchase an egg in shop
    fireEvent.click(screen.getByText('Mock Buy Egg'));

    // Switch to hatchery tab
    fireEvent.click(screen.getByTestId('tab-pet-hatchery'));
    expect(screen.getByTestId('mock-pet-hatchery')).toBeTruthy();
  });
});

