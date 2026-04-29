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
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: colors.background,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        noValidate
        sx={{
          width: '100%',
          maxWidth: 420,
          backgroundColor: colors.surface.default,
          border: `1px solid ${colors.outlineVariant}`,
          borderRadius: borderRadius.xl,
          boxShadow: shadow.cardActive,
          px: { xs: 3, sm: `${spacing.gutter * 1.5}px` },
          py: 5,
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
        }}
      >
        {/* Logo + heading */}
        <Box sx={{ textAlign: 'center' }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 56,
              height: 56,
              borderRadius: '50%',
              backgroundColor: colors.primary.main,
              mb: 2,
            }}
          >
            <SchoolIcon sx={{ color: '#fff', fontSize: 30 }} />
          </Box>
          <Typography
            variant="h5"
            sx={{ fontWeight: 700, color: colors.on.surface, letterSpacing: '-0.5px' }}
          >
            ExamIntegrity
          </Typography>
          <Typography variant="body2" sx={{ color: colors.on.surfaceVariant, mt: 0.5 }}>
            Sign in to continue
          </Typography>
        </Box>

        {/* Error alert */}
        {error && <Alert severity="error" sx={{ borderRadius: borderRadius.md }}>{error}</Alert>}

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
          sx={{ height: 44, fontWeight: 600, borderRadius: borderRadius.md }}
        >
          {isLoading ? <CircularProgress size={20} color="inherit" /> : 'Sign In'}
        </Button>

        {/* Dev hint */}
        <Box
          sx={{
            p: 1.5,
            borderRadius: borderRadius.default,
            backgroundColor: `${colors.primary.main}0d`,
            border: `1px solid ${colors.primary.main}30`,
          }}
        >
          <Typography variant="caption" sx={{ color: colors.on.surfaceVariant, display: 'block' }}>
            <strong>Student (USER):</strong> user / user123
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginPage;
