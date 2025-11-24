import React from 'react';
import { RequestStatus } from '../types';
import { STATUS_COLORS } from '../constants';

export const StatusBadge: React.FC<{ status: RequestStatus }> = ({ status }) => {
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUS_COLORS[status]}`}>
      {status}
    </span>
  );
};