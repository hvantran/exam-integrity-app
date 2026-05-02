import React from 'react';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { colors, borderRadius } from '../../design-system/tokens';

/**
 * Exam tips banner using Zen Integrity System design tokens.
 */
const ExamTips: React.FC = () => (
  <div
    className="mb-3 flex gap-1.5 p-2"
    style={{
      borderRadius: borderRadius.default,
      backgroundColor: `${colors.primary.main}0d`,
      border: `1px solid ${colors.primary.main}30`,
    }}
  >
    <InfoOutlinedIcon style={{ color: colors.primary.main, fontSize: 20, flexShrink: 0, marginTop: '1px' }} />
    <div>
      <div style={{ fontWeight: 600, fontSize: '13px', color: colors.primary.main, marginBottom: '2px' }}>
        Exam Instructions
      </div>
      <ul className="m-0 pl-5" style={{ fontSize: '13px', color: colors.on.surfaceVariant }}>
        <li>The system will automatically submit your exam when time runs out.</li>
        <li>Read each question carefully before answering to avoid mistakes.</li>
        <li>Use the <strong>Flag</strong> feature if you are unsure about an answer.</li>
      </ul>
    </div>
  </div>
);

export default ExamTips;
