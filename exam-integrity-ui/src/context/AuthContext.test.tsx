import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import apiClient from '../services/apiClient';

jest.mock('../services/apiClient');

describe('AuthContext logout', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    delete (window as any).location;
    window.location = {
      ...originalLocation,
      origin: 'http://localhost:6090',
      href: 'http://localhost:6090/',
    } as any;
    (window as any)._env_ = {};
  });

  afterEach(() => {
    (window as any).location = originalLocation;
    jest.clearAllMocks();
  });

  it('triggers gateway logout with redirect_uri and sets isLoggingOut flag', async () => {
    (apiClient.get as jest.Mock).mockResolvedValueOnce({
      data: {
        username: 'testuser',
        roles: ['TEACHER'],
        firstName: 'Test',
        lastName: 'Teacher',
      },
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.isLoggingOut).toBe(false);

    act(() => {
      result.current.logout();
    });

    expect(result.current.isLoggingOut).toBe(true);
    expect(window.location.href).toBe(
      'http://localhost:6081/logout?redirect_uri=http%3A%2F%2Flocalhost%3A6090',
    );
  });

  it('honors runtime REACT_APP_GATEWAY_URL from window._env_', async () => {
    (window as any)._env_ = {
      REACT_APP_GATEWAY_URL: 'https://gateway.example.com',
    };
    (apiClient.get as jest.Mock).mockResolvedValueOnce({
      data: { username: 'student1', roles: ['STUDENT'] },
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await Promise.resolve();
    });

    act(() => {
      result.current.logout();
    });

    expect(result.current.isLoggingOut).toBe(true);
    expect(window.location.href).toBe(
      'https://gateway.example.com/logout?redirect_uri=http%3A%2F%2Flocalhost%3A6090',
    );
  });
});
