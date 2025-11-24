export type Role = 'USER' | 'DRIVER';

export type WasteCategory = 'DRY' | 'WET' | 'E-WASTE';

export type RequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED';

export interface User {
  id: string;
  name: string;
  email: string;
  address: string;
  role: Role;
}

export interface WasteRequest {
  id: string;
  userId: string;
  userName: string;
  userAddress: string;
  category: WasteCategory;
  description: string;
  quantity: string;
  status: RequestStatus;
  driverId?: string;
  createdAt: string; // Changed to ISO string for Supabase compatibility
  aiInsights?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}