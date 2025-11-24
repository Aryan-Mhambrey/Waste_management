export type Role = 'USER' | 'DRIVER';

export type WasteCategory = 'DRY' | 'WET' | 'E-WASTE';

export type RequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED';

export interface User {
  id: string;
  name: string;
  email: string;
  address: string;
  role: Role;
  password?: string; // In a real app, this would be hashed or not stored in frontend state
}

export interface WasteRequest {
  id: string;
  userId: string;
  userName: string;
  userAddress: string;
  category: WasteCategory;
  description: string;
  quantity: string; // e.g., "2 bags", "5 kg"
  status: RequestStatus;
  driverId?: string;
  createdAt: number;
  aiInsights?: string; // Optional AI advice stored with request
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}