import React from 'react';
import { createRoot } from 'react-dom/client';
import { StoreProvider, useStore } from './context/StoreContext';
import { Auth } from './pages/Auth';
import { UserDashboard } from './pages/UserDashboard';
import { DriverDashboard } from './pages/DriverDashboard';

const AppContent: React.FC = () => {
  const { currentUser } = useStore();

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