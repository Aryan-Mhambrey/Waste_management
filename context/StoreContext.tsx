import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, WasteRequest, RequestStatus, Role } from '../types';
import { supabase } from '../services/supabaseClient';

interface StoreContextType {
  currentUser: User | null;
  requests: WasteRequest[];
  loading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (user: Omit<User, 'id'> & { password: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  createRequest: (req: Omit<WasteRequest, 'id' | 'userId' | 'userName' | 'userAddress' | 'status' | 'createdAt'>) => Promise<boolean>;
  updateRequestStatus: (requestId: string, status: RequestStatus) => Promise<void>;
  assignDriver: (requestId: string, driverId: string) => Promise<void>;
  refreshRequests: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [requests, setRequests] = useState<WasteRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize Session
  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const metadata = session.user.user_metadata || {};
          setCurrentUser({
            id: session.user.id,
            email: session.user.email!,
            name: metadata.name || 'User',
            address: metadata.address || '',
            role: (metadata.role as Role) || 'USER'
          });
          await fetchRequests();
        }
      } catch (error) {
        console.error("Session init error:", error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const metadata = session.user.user_metadata || {};
        setCurrentUser({
          id: session.user.id,
          email: session.user.email!,
          name: metadata.name || 'User',
          address: metadata.address || '',
          role: (metadata.role as Role) || 'USER'
        });
        await fetchRequests();
      } else {
        setCurrentUser(null);
        setRequests([]);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('requests')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching requests:', error.message);
      } else {
        const mappedRequests: WasteRequest[] = (data || []).map((r: any) => ({
          id: r.id,
          userId: r.user_id,
          userName: r.user_name,
          userAddress: r.user_address,
          category: r.category,
          description: r.description,
          quantity: r.quantity,
          status: r.status,
          driverId: r.driver_id,
          createdAt: r.created_at,
          aiInsights: r.ai_insights
        }));
        setRequests(mappedRequests);
      }
    } catch (err) {
      console.error("Fetch request exception:", err);
    }
  };

  const login = async (email: string, pass: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) return { success: false, error: error.message };
    return { success: true };
  };

  const register = async (userData: Omit<User, 'id'> & { password: string }) => {
    const { error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          name: userData.name,
          address: userData.address,
          role: userData.role
        }
      }
    });

    if (error) return { success: false, error: error.message };
    return { success: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setRequests([]);
  };

  const createRequest = async (reqData: Omit<WasteRequest, 'id' | 'userId' | 'userName' | 'userAddress' | 'status' | 'createdAt'>) => {
    if (!currentUser) return false;

    try {
      const { error } = await supabase.from('requests').insert({
        user_id: currentUser.id,
        user_name: currentUser.name,
        user_address: currentUser.address,
        category: reqData.category,
        description: reqData.description,
        quantity: reqData.quantity,
        ai_insights: reqData.aiInsights,
        status: 'PENDING'
      });

      if (error) {
        console.error('Create request error:', error);
        return false;
      }
      await fetchRequests();
      return true;
    } catch (err) {
      console.error("Create request exception:", err);
      return false;
    }
  };

  const updateRequestStatus = async (requestId: string, status: RequestStatus) => {
    const { error } = await supabase
      .from('requests')
      .update({ status })
      .eq('id', requestId);

    if (!error) await fetchRequests();
  };

  const assignDriver = async (requestId: string, driverId: string) => {
    const { error } = await supabase
      .from('requests')
      .update({ driver_id: driverId, status: 'ACCEPTED' })
      .eq('id', requestId);

    if (!error) await fetchRequests();
  };

  return (
    <StoreContext.Provider value={{ 
      currentUser, 
      requests, 
      loading,
      login, 
      register, 
      logout, 
      createRequest, 
      updateRequestStatus, 
      assignDriver,
      refreshRequests: fetchRequests
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) throw new Error('useStore must be used within a StoreProvider');
  return context;
};
