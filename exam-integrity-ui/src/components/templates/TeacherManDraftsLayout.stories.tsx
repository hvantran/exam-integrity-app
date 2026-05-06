import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import TeacherManDraftsLayout from './TeacherManDraftsLayout';
import {
  Box,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
} from '@mui/material';
import { Chip } from '../atoms';
import { colors } from '../../design-system/tokens';

const meta: Meta<typeof TeacherManDraftsLayout> = {
  title: 'Templates/TeacherManDraftsLayout',
  component: TeacherManDraftsLayout,
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj<typeof TeacherManDraftsLayout>;

const rows = [
  {
    name: 'Kiểm tra Toán học kỳ 1 - 2024',
    subject: 'Toán',
    updated: '2 giờ trước',
    status: 'Đang chỉnh sửa',
  },
  {
    name: 'Đề thi Vật lý cuối kỳ',
    subject: 'Vật lý',
    updated: '1 ngày trước',
    status: 'Chờ duyệt',
  },
  {
    name: 'Bài kiểm tra Hóa học 15 phút',
    subject: 'Hóa học',
    updated: '3 ngày trước',
    status: 'Bản nháp',
  },
];

export const Default: Story = {
  args: {
    children: (
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{ border: `1px solid ${colors.outlineVariant}` }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: colors.surface.container.low }}>
              <TableCell sx={{ fontWeight: 600, fontSize: '13px' }}>Tên đề thi</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '13px' }}>Môn học</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '13px' }}>Cập nhật</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '13px' }}>Trạng thái</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.name} hover>
                <TableCell sx={{ fontSize: '14px', color: colors.on.surface }}>
                  {row.name}
                </TableCell>
                <TableCell sx={{ fontSize: '13px', color: colors.on.surfaceVariant }}>
                  {row.subject}
                </TableCell>
                <TableCell sx={{ fontSize: '13px', color: colors.on.surfaceVariant }}>
                  {row.updated}
                </TableCell>
                <TableCell>
                  <Chip
                    label={row.status}
                    size="small"
                    style={{
                      backgroundColor: `${colors.primary.main}12`,
                      color: colors.primary.main,
                      fontSize: '11px',
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    ),
  },
};
