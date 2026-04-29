import React from 'react';
import { Box, Typography, Avatar, Button } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import { colors, borderRadius, spacing } from '../../design-system/tokens';
import { APP_BAR_HEIGHT } from './AppTopBar';

export const STUDENT_SIDEBAR_WIDTH = 256;

export type PortalSection = 'dashboard' | 'my-exams' | 'results';

const NAV_ITEMS: { id: PortalSection; label: string; Icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard', Icon: DashboardIcon },
  { id: 'my-exams', label: 'My Exams', Icon: AssignmentIcon },
  { id: 'results', label: 'Results', Icon: AnalyticsIcon },
];

export interface PortalSidebarProps {
  activeSection?: PortalSection;
  studentName?: string;
  studentRole?: string;
  onNavigate?: (section: PortalSection) => void;
  onHelp?: () => void;
}

/**
 * Organism — StudentManPortalSidebar
 *
 * Left sidebar for the Student Portal (Landing Page screen).
 * Sticky, 256px wide, white background.
 * Contains: student avatar + name, nav items, bottom help button.
 */
const StudentManPortalSidebar: React.FC<PortalSidebarProps> = ({
  activeSection = 'dashboard',
  studentName = 'Student',
  studentRole = 'Learning Center',
  onNavigate,
  onHelp,
}) => (
  <Box
    component="aside"
    sx={{
      position: 'fixed',
      left: 0,
      top: APP_BAR_HEIGHT,
      width: STUDENT_SIDEBAR_WIDTH,
      height: `calc(100vh - ${APP_BAR_HEIGHT}px)`,
      zIndex: 80,
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      pt: `${spacing.stackLg}px`,
      pb: `${spacing.stackLg}px`,
      borderRight: `1px solid ${colors.outlineVariant}`,
      backgroundColor: colors.surface.container.lowest,
      overflowY: 'auto',
    }}
  >
    {/* Student identity block */}
    <Box sx={{ px: 3, mb: 4, display: 'flex', alignItems: 'center', gap: '12px' }}>
      <Avatar
        sx={{
          width: 40,
          height: 40,
          bgcolor: colors.primary.fixedDim,
          color: colors.primary.deep,
          fontSize: 16,
          fontWeight: 700,
          border: `1px solid ${colors.outlineVariant}`,
        }}
      >
        {studentName.slice(0, 2).toUpperCase()}
      </Avatar>
      <Box>
        <Typography sx={{ fontSize: '18px', fontWeight: 700, color: colors.on.surface, lineHeight: 1.3 }}>
          {studentName}
        </Typography>
        <Typography sx={{ fontSize: '14px', fontWeight: 500, color: colors.on.surfaceVariant, lineHeight: '20px' }}>
          {studentRole}
        </Typography>
      </Box>
    </Box>

    {/* Navigation */}
    <Box component="nav" sx={{ flex: 1, fontFamily: '"Public Sans", sans-serif' }}>
      {NAV_ITEMS.map(({ id, label, Icon }) => {
        const isActive = activeSection === id;
        return (
          <Box
            key={id}
            component="a"
            href="#"
            onClick={(e: React.MouseEvent) => { e.preventDefault(); onNavigate?.(id); }}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              px: '16px',
              py: '12px',
              mx: isActive ? 0 : '8px',
              borderRadius: isActive ? 0 : borderRadius.lg,
              borderLeft: isActive ? `4px solid ${colors.primary.container}` : '4px solid transparent',
              borderTopRightRadius: borderRadius.lg,
              borderBottomRightRadius: borderRadius.lg,
              backgroundColor: isActive ? colors.surface.container.low : 'transparent',
              color: isActive ? colors.primary.container : colors.on.surfaceVariant,
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 500,
              transition: 'background-color 0.15s ease, transform 0.2s ease',
              '&:hover': {
                backgroundColor: isActive ? colors.surface.container.low : colors.surface.container.low,
                transform: 'translateX(2px)',
              },
            }}
          >
            <Icon sx={{ fontSize: 22 }} />
            {label}
          </Box>
        );
      })}
    </Box>

    {/* Help button */}
    <Box sx={{ px: 2, mt: 'auto' }}>
      <Button
        startIcon={<SupportAgentIcon sx={{ fontSize: 18 }} />}
        fullWidth
        variant="outlined"
        onClick={onHelp}
        sx={{
          borderColor: colors.outlineVariant,
          color: colors.on.surfaceVariant,
          fontSize: '14px',
          fontWeight: 500,
          borderRadius: borderRadius.default,
          '&:hover': { backgroundColor: colors.surface.container.low },
        }}
      >
        Online Help
      </Button>
    </Box>
  </Box>
);

export default StudentManPortalSidebar;
