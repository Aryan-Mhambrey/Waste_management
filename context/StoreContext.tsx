import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, WasteRequest, RequestStatus, Role } from '../types';

interface StoreContextType {
  currentUser: User | null;
  users: User[];
  requests: WasteRequest[];
  login: (email: string, password: string) => boolean;
  register: (user: Omit<User, 'id'>) => boolean;
  logout: () => void;
  createRequest: (req: Omit<WasteRequest, 'id' | 'userId' | 'userName' | 'userAddress' | 'status' | 'createdAt'>) => void;
  updateRequestStatus: (requestId: string, status: RequestStatus) => void;
  assignDriver: (requestId: string, driverId: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Initial Mock Data
const MOCK_USERS: User[] = [
  { id: '1', name: 'John Doe', email: 'user@test.com', address: '123 Green St, Eco City', role: 'USER', password: 'password' },
  { id: '2', name: 'Driver Mike', email: 'driver@test.com', address: 'Depot 1', role: 'DRIVER', password: 'password' }
];

const MOCK_REQUESTS: WasteRequest[] = [
  {
    id: 'req_1',
    userId: '1',
    userName: 'John Doe',
    userAddress: '123 Green St, Eco City',
    category: 'E-WASTE',
    description: 'Old laptop battery and wires',
    quantity: '1 bag',
    status: 'PENDING',
    createdAt: Date.now() - 100000,
    aiInsights: 'Handle with care. Lithium batteries can be fire hazards.'
  }
];

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load from local storage or fallback to mock
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('ecosort_users');
    return saved ? JSON.parse(saved) : MOCK_USERS;
  });

  const [requests, setRequests] = useState<WasteRequest[]>(() => {
    const saved = localStorage.getItem('ecosort_requests');
    return saved ? JSON.parse(saved) : MOCK_REQUESTS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('ecosort_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Persistence Effects
  useEffect(() => localStorage.setItem('ecosort_users', JSON.stringify(users)), [users]);
  useEffect(() => localStorage.setItem('ecosort_requests', JSON.stringify(requests)), [requests]);
  useEffect(() => {
    if (currentUser) localStorage.setItem('ecosort_current_user', JSON.stringify(currentUser));
    else localStorage.removeItem('ecosort_current_user');
  }, [currentUser]);

  const login = (email: string, pass: string): boolean => {
    const user = users.find(u => u.email === email && u.password === pass);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const register = (userData: Omit<User, 'id'>): boolean => {
    if (users.some(u => u.email === userData.email)) return false;
    const newUser = { ...userData, id: crypto.randomUUID() };
    setUsers([...users, newUser]);
    setCurrentUser(newUser);
    return true;
  };

  const logout = () => setCurrentUser(null);

  const createRequest = (reqData: Omit<WasteRequest, 'id' | 'userId' | 'userName' | 'userAddress' | 'status' | 'createdAt'>) => {
    if (!currentUser) return;
    const newReq: WasteRequest = {
      id: crypto.randomUUID(),
      userId: currentUser.id,
      userName: currentUser.name,
      userAddress: currentUser.address,
      status: 'PENDING',
      createdAt: Date.now(),
      ...reqData
    };
    setRequests(prev => [newReq, ...prev]);
  };

  const updateRequestStatus = (requestId: string, status: RequestStatus) => {
    setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status } : r));
  };

  const assignDriver = (requestId: string, driverId: string) => {
      setRequests(prev => prev.map(r => r.id === requestId ? { ...r, driverId, status: 'ACCEPTED' } : r));
  }

  return (
    <StoreContext.Provider value={{ currentUser, users, requests, login, register, logout, createRequest, updateRequestStatus, assignDriver }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) throw new Error('useStore must be used within a StoreProvider');
  return context;
};