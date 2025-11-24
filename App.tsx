import React from 'react';
import { createRoot } from 'react-dom/client';
import { StoreProvider, useStore } from './context/StoreContext';
import { Auth } from './pages/Auth';
import { UserDashboard } from './pages/UserDashboard';
import { DriverDashboard } from './pages/DriverDashboard';
import { Recycle } from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentUser, loading } = useStore();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-50">
        <div className="flex flex-col items-center gap-4">
          <Recycle className="w-12 h-12 text-emerald-600 animate-spin" />
          <p className="text-emerald-800 font-medium">Loading EcoSort...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Auth />;
  }

  return currentUser.role === 'DRIVER' ? <DriverDashboard /> : <UserDashboard />;
};

const App: React.FC = () => {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
};

export default App;