import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import StudentManShopPage from './StudentManShopPage';
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
    ExamIntegrityStudentShopTemplate: ({
      studentName,
      starCount,
      onPurchaseEgg,
      onNavigate,
      onLogout,
    }: any) => (
      <div data-testid="mock-shop-template">
        <div data-testid="student-name">{studentName}</div>
        <div data-testid="star-count">{starCount}</div>
        <button
          type="button"
          data-testid="mock-buy-egg"
          onClick={() =>
            onPurchaseEgg?.({
              id: 'mystery-egg-1',
              name: 'Ancient Mysterious Egg',
              tier: 'dragon',
              rarity: 'Common',
              price: 250,
              description: 'Test',
              hatchedPetName: 'Mystery Pet',
              petElement: 'Cosmic',
              hatchDurationHours: 8,
            })
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

  it('renders student shop with profile stars and name', () => {
    render(<StudentManShopPage />);

    expect(screen.getByTestId('student-name')).toHaveTextContent('Alice Student');
    expect(screen.getByTestId('star-count')).toHaveTextContent('500');
  });

  it('handles purchasing egg and persists to scoped storage', () => {
    render(<StudentManShopPage />);

    const buyBtn = screen.getByTestId('mock-buy-egg');
    fireEvent.click(buyBtn);

    const saved = localStorage.getItem('exam_integrity_student-123_incubating_eggs');
    expect(saved).not.toBeNull();
    const parsed = JSON.parse(saved!);
    expect(parsed[0].name).toBe('Ancient Mysterious Egg');
    expect(parsed[0].hatchDurationHours).toBe(8);
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
