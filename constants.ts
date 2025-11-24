import { WasteCategory, RequestStatus } from './types';

export const WASTE_CATEGORIES: WasteCategory[] = ['DRY', 'WET', 'E-WASTE'];

export const STATUS_COLORS: Record<RequestStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  ACCEPTED: 'bg-blue-100 text-blue-800 border-blue-200',
  REJECTED: 'bg-red-100 text-red-800 border-red-200',
  COMPLETED: 'bg-green-100 text-green-800 border-green-200',
};

export const CATEGORY_LABELS: Record<WasteCategory, string> = {
  'DRY': 'Dry Waste (Recyclable)',
  'WET': 'Wet Waste (Organic)',
  'E-WASTE': 'E-Waste (Electronic)',
};