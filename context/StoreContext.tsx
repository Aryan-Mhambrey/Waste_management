import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, WasteRequest, RequestStatus, Role } from '../types';
import { supabase } from '../services/supabaseClient';

interface StoreContextType {
  currentUser: User | null;
  requests: WasteRequest[];
  loading: boolean;
  isDataLoading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (user: Omit<User, 'id'> & { password: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  createRequest: (req: Omit<WasteRequest, 'id' | 'userId' | 'userName' | 'userAddress' | 'status' | 'createdAt'>) => Promise<boolean>;
  updateRequestStatus: (requestId: string, status: RequestStatus) => Promise<void>;
  assignDriver: (requestId: string, driverId: string) => Promise<void>;
  refreshRequests: () => Promise<void>;
  updateUserName: (name: string) => Promise<boolean>;
  updateUserAddress: (address: string) => Promise<boolean>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [requests, setRequests] = useState<WasteRequest[]>([]);
  const [loading, setLoading] = useState(true); // App-level loading (Auth)
  const [isDataLoading, setIsDataLoading] = useState(false); // Data-level loading

  // Helper to safely parse user from session
  const parseUser = (sessionUser: any): User => {
    const metadata = sessionUser.user_metadata || {};
    return {
      id: sessionUser.id,
      email: sessionUser.email!,
      name: metadata.name || 'User',
      address: metadata.address || '',
      role: (metadata.role as Role) || 'USER'
    };
  };

  // Fetch requests independently of auth loading
  // Wrapped in useCallback to allow usage in dependency arrays
  const fetchRequests = useCallback(async (silent: boolean = false) => {
    if (!silent) setIsDataLoading(true);
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
    } finally {
      if (!silent) setIsDataLoading(false);
    }
  }, []);

  // Initialize Session
  useEffect(() => {
    let mounted = true;

    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && mounted) {
          setCurrentUser(parseUser(session.user));
          // Call fetchRequests but DO NOT await it to keep initial load fast
          fetchRequests();
        }
      } catch (error) {
        console.error("Session init error:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setCurrentUser(parseUser(session.user));
        if (event === 'SIGNED_IN') fetchRequests();
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setRequests([]);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchRequests]);

  // Realtime Subscription
  useEffect(() => {
    if (!currentUser) return;

    // Subscribe to changes in the 'requests' table
    const channel = supabase
      .channel('public:requests')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'requests' },
        (payload) => {
          console.log('Realtime update received:', payload);
          // Refresh data silently (no loading spinner) when data changes
          fetchRequests(true);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser, fetchRequests]);

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
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Logout error (ignoring):", error);
    } finally {
      // Always force local state clear
      setCurrentUser(null);
      setRequests([]);
    }
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
      // Optimistically fetch or just let real-time handle it (fetching for now)
      fetchRequests();
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

  const updateUserName = async (name: string) => {
    if (!currentUser) return false;

    try {
      const { data, error } = await supabase.auth.updateUser({
        data: { name }
      });

      if (error) {
        console.error("Error updating user name:", error);
        return false;
      }

      if (data.user) {
        setCurrentUser(parseUser(data.user));
        return true;
      }
    } catch (err) {
      console.error("Update user name exception:", err);
    }
    return false;
  };

  const updateUserAddress = async (address: string) => {
    if (!currentUser) return false;

    try {
      const { data, error } = await supabase.auth.updateUser({
        data: { address }
      });

      if (error) {
        console.error("Error updating user address:", error);
        return false;
      }

      if (data.user) {
        setCurrentUser(parseUser(data.user));
        return true;
      }
    } catch (err) {
      console.error("Update user address exception:", err);
    }
    return false;
  };

  return (
    <StoreContext.Provider value={{ 
      currentUser, 
      requests, 
      loading,
      isDataLoading,
      login, 
      register, 
      logout, 
      createRequest, 
      updateRequestStatus, 
      assignDriver,
      refreshRequests: () => fetchRequests(false),
      updateUserName,
      updateUserAddress
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