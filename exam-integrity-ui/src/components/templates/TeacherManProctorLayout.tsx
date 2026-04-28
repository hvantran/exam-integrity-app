import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { colors, typography, spacing, borderRadius } from '../../design-system/tokens';

const PROCTOR_APP_BAR_HEIGHT = 64;
const PROCTOR_SIDEBAR_WIDTH = 256;

export type ProctorNavSection = 'dashboard' | 'exam' | 'results' | 'reports';

export interface ProctorLayoutProps {
  brandName?: string;
  timerDisplay?: string;
  progressPercent?: number;
  isProctoringActive?: boolean;
  completedCount?: number;
  totalCount?: number;
  activeNavSection?: ProctorNavSection;
  onNavigate?: (section: ProctorNavSection) => void;
  onSubmit?: () => void;
  children: React.ReactNode;
}

const navLabels: { section: ProctorNavSection; label: string }[] = [
  { section: 'dashboard', label: 'Bang dieu khien' },
  { section: 'exam',      label: 'Ky thi' },
  { section: 'results',   label: 'Ket qua' },
  { section: 'reports',   label: 'Bao cao' },
];

const TeacherManProctorLayout: React.FC<ProctorLayoutProps> = ({
  brandName = 'IntegrityEngine',
  timerDisplay = '00:59:59',
  progressPercent = 25,
  isProctoringActive = true,
  completedCount = 12,
  totalCount = 40,
  activeNavSection = 'exam',
  onNavigate,
  onSubmit,
  children,
}) => (
  <Box sx={{ minHeight: '100vh', backgroundColor: colors.background }}>
    {/* 4px progress bar */}
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: 4,
        backgroundColor: colors.surface.container.highest,
        zIndex: 110,
      }}
    >
      <Box
        sx={{
          height: '100%',
          width: `${progressPercent}%`,
          backgroundColor: colors.primary.main,
          transition: 'width 0.5s ease',
        }}
      />
    </Box>

    {/* Specialized proctor AppBar */}
    <Box
      component="header"
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: PROCTOR_APP_BAR_HEIGHT,
        zIndex: 100,
        backgroundColor: colors.surface.container.lowest,
        borderBottom: `1px solid ${colors.surface.container.high}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: `${spacing.margin}px`,
      }}
    >
      {/* Left: brand + horizontal nav */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: `${spacing.stackLg}px` }}>
        <Typography
          sx={{
            fontFamily: typography.fontFamily.sans,
            fontSize: '20px',
            fontWeight: 700,
            color: colors.primary.deep,
            letterSpacing: '-0.02em',
            userSelect: 'none',
          }}
        >
          {brandName}
        </Typography>
        <Box
          component="nav"
          sx={{
            display: { xs: 'none', md: 'flex' },
            gap: '4px',
          }}
        >
          {navLabels.map(({ section, label }) => {
            const isActive = activeNavSection === section;
            return (
              <Box
                key={section}
                component="button"
                onClick={() => onNavigate?.(section)}
                sx={{
                  px: '12px',
                  py: '8px',
                  border: 'none',
                  borderBottom: isActive ? `2px solid ${colors.primary.main}` : '2px solid transparent',
                  backgroundColor: 'transparent',
                  color: isActive ? colors.primary.main : colors.on.surfaceVariant,
                  fontFamily: typography.fontFamily.sans,
                  fontSize: typography.scale.uiLabel.fontSize,
                  fontWeight: isActive ? 600 : 400,
                  cursor: 'pointer',
                  borderRadius: '0',
                  transition: 'color 0.15s, border-color 0.15s',
                  '&:hover': { color: colors.primary.main },
                }}
              >
                {label}
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Right: proctor controls */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: `${spacing.stackMd}px` }}>
        {isProctoringActive && (
          <Chip
            icon={<FiberManualRecordIcon sx={{ fontSize: '10px !important', color: `${colors.secondary.main} !important`, animation: 'pulse 1.5s infinite' }} />}
            label="Proctoring Active"
            sx={{
              display: { xs: 'none', lg: 'flex' },
              backgroundColor: colors.secondary.container,
              color: colors.secondary.onContainer,
              fontFamily: typography.fontFamily.sans,
              fontSize: typography.scale.labelCaps.fontSize,
              fontWeight: 600,
              letterSpacing: typography.scale.labelCaps.letterSpacing,
              height: 28,
            }}
          />
        )}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: colors.surface.container.default,
            border: `1px solid ${colors.outlineVariant}`,
            borderRadius: borderRadius.default,
            px: '12px',
            py: '6px',
          }}
        >
          <TimerOutlinedIcon sx={{ fontSize: 18, color: colors.on.surfaceVariant }} />
          <Typography
            sx={{
              fontFamily: typography.fontFamily.mono,
              fontSize: typography.scale.uiLabel.fontSize,
              fontWeight: 500,
              color: colors.on.surface,
              letterSpacing: '0.05em',
            }}
          >
            {timerDisplay}
          </Typography>
        </Box>
        {onSubmit && (
          <Box
            component="button"
            onClick={onSubmit}
            sx={{
              px: '16px',
              py: '8px',
              backgroundColor: colors.primary.main,
              color: colors.primary.on,
              border: 'none',
              borderRadius: borderRadius.default,
              fontFamily: typography.fontFamily.sans,
              fontSize: typography.scale.uiLabel.fontSize,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background-color 0.15s',
              '&:hover': { backgroundColor: colors.primary.deep },
            }}
          >
            Nop bai
          </Box>
        )}
      </Box>
    </Box>

    {/* Question progress sidebar */}
    <Box
      component="aside"
      sx={{
        position: 'fixed',
        left: 0,
        top: PROCTOR_APP_BAR_HEIGHT,
        width: PROCTOR_SIDEBAR_WIDTH,
        height: `calc(100vh - ${PROCTOR_APP_BAR_HEIGHT}px)`,
        zIndex: 80,
        backgroundColor: colors.surface.container.low,
        borderRight: `1px solid ${colors.outlineVariant}`,
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        p: `${spacing.stackLg}px`,
        overflowY: 'auto',
      }}
    >
      <Typography
        sx={{
          fontFamily: typography.fontFamily.sans,
          fontSize: typography.scale.uiLabel.fontSize,
          fontWeight: 700,
          color: colors.on.surface,
          mb: '4px',
        }}
      >
        Tien do lam bai
      </Typography>
      <Typography
        sx={{
          fontFamily: typography.fontFamily.sans,
          fontSize: typography.scale.labelCaps.fontSize,
          color: colors.on.surfaceVariant,
          mb: `${spacing.stackMd}px`,
        }}
      >
        Da hoan thanh {completedCount}/{totalCount}
      </Typography>
      {/* Question number grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
        {Array.from({ length: totalCount || 0 }, (_, i) => {
          const num = i + 1;
          const done = num <= (completedCount || 0);
          return (
            <Box
              key={num}
              sx={{
                width: 36,
                height: 36,
                borderRadius: borderRadius.default,
                border: `1px solid ${done ? colors.primary.main : colors.outlineVariant}`,
                backgroundColor: done ? colors.primary.main : colors.surface.container.lowest,
                color: done ? colors.primary.on : colors.on.surface,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: typography.fontFamily.sans,
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              {num}
            </Box>
          );
        })}
      </Box>
    </Box>

    {/* Main content */}
    <Box
      component="main"
      sx={{
        ml: { xs: 0, md: `${PROCTOR_SIDEBAR_WIDTH}px` },
        pt: `${PROCTOR_APP_BAR_HEIGHT}px`,
        minHeight: '100vh',
        overflowY: 'auto',
      }}
    >
      <Box sx={{ p: `${spacing.margin}px` }}>
        {children}
      </Box>
    </Box>
  </Box>
);

export default TeacherManProctorLayout;
