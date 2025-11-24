import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Button } from '../components/Button';
import { StatusBadge } from '../components/StatusBadge';
import { Truck, LogOut, MapPin, CheckCircle, XCircle, Navigation, User, RefreshCw, Loader2 } from 'lucide-react';
import { WasteRequest } from '../types';

export const DriverDashboard: React.FC = () => {
  const { currentUser, requests, updateRequestStatus, assignDriver, logout, refreshRequests, isDataLoading } = useStore();
  const [filter, setFilter] = useState<'AVAILABLE' | 'MY_TASKS'>('AVAILABLE');
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Available requests are PENDING and not assigned
  const availableRequests = requests.filter(r => r.status === 'PENDING');
  
  // My tasks are those assigned to this driver
  const myTasks = requests.filter(r => r.driverId === currentUser?.id);

  const displayedRequests = filter === 'AVAILABLE' ? availableRequests : myTasks;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshRequests();
    setIsRefreshing(false);
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleAccept = async (req: WasteRequest) => {
    if (currentUser) {
      setLoadingAction(req.id);
      await assignDriver(req.id, currentUser.id);
      setLoadingAction(null);
    }
  };

  const handleStatusUpdate = async (id: string, status: 'REJECTED' | 'COMPLETED') => {
    if (status === 'REJECTED') {
      if (!window.confirm('Are you sure you want to reject this pickup request? This will mark it as rejected for the user.')) {
        return;
      }
    }
    setLoadingAction(id);
    await updateRequestStatus(id, status);
    setLoadingAction(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Driver Header */}
      <header className="bg-emerald-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-800 p-2 rounded-lg border border-emerald-700">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">EcoSort Driver</h1>
              <p className="text-xs text-emerald-300">Logged in as {currentUser?.name}</p>
            </div>
          </div>
          <Button variant="secondary" onClick={handleLogout} className="bg-emerald-800 border-emerald-700 text-white hover:bg-emerald-700 text-sm">
            <LogOut className="w-4 h-4" /> Exit
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 uppercase font-semibold">Pending Requests</p>
            <p className="text-2xl font-bold text-gray-800">{availableRequests.length}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 uppercase font-semibold">My Active Tasks</p>
            <p className="text-2xl font-bold text-emerald-600">{myTasks.filter(t => t.status === 'ACCEPTED').length}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 uppercase font-semibold">Completed Today</p>
            <p className="text-2xl font-bold text-gray-800">{myTasks.filter(t => t.status === 'COMPLETED').length}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('AVAILABLE')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === 'AVAILABLE' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              Available Requests
            </button>
            <button
              onClick={() => setFilter('MY_TASKS')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === 'MY_TASKS' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              My Schedule
            </button>
          </div>
          <button 
            onClick={handleRefresh}
            className={`p-2 rounded-full hover:bg-gray-200 transition-colors ${isRefreshing ? 'animate-spin' : ''}`}
            title="Refresh Data"
          >
            <RefreshCw className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {isDataLoading && displayedRequests.length === 0 ? (
            <div className="col-span-full py-12 flex justify-center text-gray-400">
               <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : displayedRequests.length === 0 ? (
            <div className="col-span-full py-12 text-center text-gray-400">
              <p>No requests found in this category.</p>
            </div>
          ) : (
            displayedRequests.map(req => (
              <div key={req.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <StatusBadge status={req.status} />
                    <span className="text-xs font-mono text-gray-400">#{req.id.slice(0,6)}</span>
                  </div>
                  
                  <div className="flex items-start gap-3 mb-4">
                    <MapPin className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-800">{req.userAddress}</p>
                      <p className="text-sm text-gray-500">Distance: ~2.4 km (Mock)</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 mb-6">
                    <User className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-800">{req.userName}</p>
                      <p className="text-xs text-gray-500">User ID: {req.userId.slice(0,8)}...</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <div className="flex justify-between mb-2">
                      <span className="text-xs font-bold text-gray-500 uppercase">Category</span>
                      <span className="text-xs font-bold text-gray-800">{req.category}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-xs font-bold text-gray-500 uppercase">Quantity</span>
                      <span className="text-xs font-bold text-gray-800">{req.quantity}</span>
                    </div>
                    <p className="text-sm text-gray-700 border-t border-gray-200 pt-2 mt-2">
                      "{req.description}"
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                  {filter === 'AVAILABLE' ? (
                    <>
                      <Button 
                        variant="danger"
                        onClick={() => handleStatusUpdate(req.id, 'REJECTED')} 
                        className="flex-1 justify-center"
                        isLoading={loadingAction === req.id}
                      >
                        <XCircle className="w-4 h-4" /> Reject
                      </Button>
                      <Button 
                        onClick={() => handleAccept(req)} 
                        className="flex-1 justify-center"
                        isLoading={loadingAction === req.id}
                      >
                        Accept Request
                      </Button>
                    </>
                  ) : (
                    <>
                      {req.status === 'ACCEPTED' && (
                        <>
                          <Button 
                            variant="danger" 
                            onClick={() => handleStatusUpdate(req.id, 'REJECTED')}
                            className="flex-1 justify-center"
                            isLoading={loadingAction === req.id}
                          >
                            <XCircle className="w-4 h-4" /> Reject
                          </Button>
                          <Button 
                            onClick={() => handleStatusUpdate(req.id, 'COMPLETED')}
                            className="flex-1 justify-center"
                            isLoading={loadingAction === req.id}
                          >
                            <CheckCircle className="w-4 h-4" /> Complete
                          </Button>
                        </>
                      )}
                      {req.status === 'COMPLETED' && (
                         <span className="text-green-600 font-bold text-sm flex items-center gap-1">
                           <CheckCircle className="w-4 h-4" /> Completed
                         </span>
                      )}
                      {req.status === 'REJECTED' && (
                         <span className="text-red-600 font-bold text-sm flex items-center gap-1">
                           <XCircle className="w-4 h-4" /> Rejected
                         </span>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};