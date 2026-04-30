import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Button, CircularProgress, IconButton,
  InputAdornment, TextField, Typography, Alert,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import SchoolIcon from '@mui/icons-material/School';
import { useAuth } from '../context/AuthContext';
import { colors, borderRadius, shadow, spacing } from '../design-system/tokens';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const from = (location.state as { from?: string })?.from ?? '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter your username and password.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const authUser = await login(username.trim(), password);
      // Use freshly-returned user data — not the stale closure from useAuth()
      const isAdminUser = authUser.roles.includes('ADMIN');
      const dest = isAdminUser ? '/teacher/ingestion' : (from === '/login' ? '/' : from);
      navigate(dest, { replace: true });
    } catch {
      setError('Incorrect username or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-2">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="w-full max-w-[420px] bg-surface border border-outline rounded-2xl shadow-md px-6 py-8 flex flex-col gap-6"
        style={{ boxShadow: '0px 4px 20px rgba(0,0,0,0.03)' }}
      >
        {/* Logo + heading */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary mb-3">
            <SchoolIcon sx={{ color: '#fff', fontSize: 30 }} />
          </div>
          <div className="text-2xl font-bold text-on-surface tracking-tight">ExamIntegrity</div>
          <div className="text-sm text-on-surface mt-1">Sign in to continue</div>
        </div>

        {/* Error alert */}
        {error && <Alert severity="error" className="rounded-md">{error}</Alert>}

        {/* Username */}
        <TextField
          label="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          autoComplete="username"
          autoFocus
          fullWidth
          disabled={isLoading}
          size="small"
        />

        {/* Password */}
        <TextField
          label="Password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoComplete="current-password"
          fullWidth
          disabled={isLoading}
          size="small"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => setShowPassword(v => !v)}
                  edge="end"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {/* Submit */}
        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={isLoading}
          className="h-11 font-semibold rounded-md"
        >
          {isLoading ? <CircularProgress size={20} color="inherit" /> : 'Sign In'}
        </Button>

        {/* Dev hint */}
        <div className="p-3 rounded bg-primary/5 border border-primary/20">
          <span className="text-xs text-on-surface block">
            <strong>Student (USER):</strong> user / user123
          </span>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
