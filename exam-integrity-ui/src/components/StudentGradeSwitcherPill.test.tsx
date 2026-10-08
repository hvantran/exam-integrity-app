import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import StudentGradeSwitcherPill from './StudentGradeSwitcherPill';
import { useAuth } from '../context/AuthContext';

jest.mock('../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

const mockUseAuth = useAuth as jest.Mock;

describe('StudentGradeSwitcherPill', () => {
  it('renders locked indicator and no dropdown when student cannot switch grade', () => {
    mockUseAuth.mockReturnValue({
      user: { username: 'student-1', roles: ['STUDENT'], grade: 5 },
      canSwitchGrade: false,
      effectiveGrade: 5,
      overrideGrade: null,
      setOverrideGrade: jest.fn(),
    });

    render(<StudentGradeSwitcherPill />);

    expect(screen.getByText('Grade 5')).toBeTruthy();
    expect(screen.queryByRole('combobox')).toBeNull();
  });

  it('renders interactive select dropdown when user is permitted to switch grade', () => {
    const setOverrideGradeMock = jest.fn();
    mockUseAuth.mockReturnValue({
      user: { username: 'admin-1', roles: ['ADMIN'] },
      canSwitchGrade: true,
      effectiveGrade: 8,
      overrideGrade: 8,
      setOverrideGrade: setOverrideGradeMock,
    });

    render(<StudentGradeSwitcherPill />);

    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select).toBeTruthy();
    expect(select.value).toBe('8');

    fireEvent.change(select, { target: { value: '10' } });
    expect(setOverrideGradeMock).toHaveBeenCalledWith(10);
  });
});

