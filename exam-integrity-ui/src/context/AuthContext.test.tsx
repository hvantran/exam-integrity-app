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
      hostname: 'localhost',
      port: '6090',
    } as any;
    (window as any)._env_ = {};
  });

  afterEach(() => {
    (window as any).location = originalLocation;
    delete (window as any)._env_;
    jest.clearAllMocks();
  });

  it('triggers same-origin logout with redirect_uri in Docker/Nginx on port 6090', async () => {
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
      '/logout?redirect_uri=http%3A%2F%2Flocalhost%3A6090',
    );
  });

  it('triggers gateway logout with port 6081 when running locally on dev server port 3000', async () => {
    window.location = {
      ...originalLocation,
      origin: 'http://localhost:3000',
      href: 'http://localhost:3000/',
      hostname: 'localhost',
      port: '3000',
    } as any;

    (apiClient.get as jest.Mock).mockResolvedValueOnce({
      data: {
        username: 'testuser',
        roles: ['TEACHER'],
      },
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
      'http://localhost:6081/logout?redirect_uri=http%3A%2F%2Flocalhost%3A3000',
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

  it('safely uses same-origin logout when accessed via LAN IP even if env has localhost:6081', async () => {
    window.location = {
      ...originalLocation,
      origin: 'http://192.168.1.6:6090',
      href: 'http://192.168.1.6:6090/',
      hostname: '192.168.1.6',
      port: '6090',
    } as any;
    (window as any)._env_ = {
      REACT_APP_GATEWAY_URL: 'http://localhost:6081',
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
      '/logout?redirect_uri=http%3A%2F%2F192.168.1.6%3A6090',
    );
  });
});
