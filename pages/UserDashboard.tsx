import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { WasteCategory } from '../types';
import { WASTE_CATEGORIES, CATEGORY_LABELS } from '../constants';
import { Button } from '../components/Button';
import { Input, TextArea } from '../components/Input';
import { StatusBadge } from '../components/StatusBadge';
import { analyzeWasteDescription } from '../services/geminiService';
import { Plus, History, LogOut, Wand2, Leaf, AlertTriangle, Loader2, Edit2, Check, X, MapPin } from 'lucide-react';

export const UserDashboard: React.FC = () => {
  const { currentUser, requests, createRequest, logout, isDataLoading, updateUserName, updateUserAddress } = useStore();
  const [activeTab, setActiveTab] = useState<'NEW' | 'HISTORY'>('NEW');

  // Form State
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<WasteCategory>('DRY');
  const [quantity, setQuantity] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<{tips: string, confidence: number} | null>(null);

  // Profile Editing State
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState('');
  const [isNameSaving, setIsNameSaving] = useState(false);

  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editAddressValue, setEditAddressValue] = useState('');
  const [isAddressSaving, setIsAddressSaving] = useState(false);

  const myRequests = requests.filter(r => r.userId === currentUser?.id);

  const handleAiAnalyze = async () => {
    if (!description) return;
    setAiLoading(true);
    const analysis = await analyzeWasteDescription(description);
    setAiLoading(false);

    if (analysis) {
      setCategory(analysis.category);
      setQuantity(prev => prev || analysis.estimatedWeightGuess); // Auto fill if empty
      setAiAnalysis({ tips: analysis.safetyTips, confidence: analysis.confidence });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    const success = await createRequest({
      category,
      description,
      quantity,
      aiInsights: aiAnalysis?.tips
    });
    setSubmitLoading(false);

    if (success) {
      // Reset
      setDescription('');
      setQuantity('');
      setCategory('DRY');
      setAiAnalysis(null);
      setActiveTab('HISTORY');
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  // Name Editing Handlers
  const startEditingName = () => {
    setEditNameValue(currentUser?.name || '');
    setIsEditingName(true);
  };

  const cancelEditingName = () => {
    setIsEditingName(false);
    setEditNameValue('');
  };

  const saveName = async () => {
    if (!editNameValue.trim()) return;
    setIsNameSaving(true);
    const success = await updateUserName(editNameValue);
    setIsNameSaving(false);
    if (success) {
      setIsEditingName(false);
    }
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') saveName();
    else if (e.key === 'Escape') cancelEditingName();
  };

  // Address Editing Handlers
  const startEditingAddress = () => {
    setEditAddressValue(currentUser?.address || '');
    setIsEditingAddress(true);
  };

  const cancelEditingAddress = () => {
    setIsEditingAddress(false);
    setEditAddressValue('');
  };

  const saveAddress = async () => {
    if (!editAddressValue.trim()) return;
    setIsAddressSaving(true);
    const success = await updateUserAddress(editAddressValue);
    setIsAddressSaving(false);
    if (success) {
      setIsEditingAddress(false);
    }
  };

  const handleAddressKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') saveAddress();
    else if (e.key === 'Escape') cancelEditingAddress();
  };

  return (
    <div className="min-h-screen bg-emerald-50/50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-emerald-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 p-2.5 rounded-lg text-emerald-600">
              <Leaf className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800 leading-none">EcoSort</h1>
              
              <div className="flex flex-col gap-0.5 mt-1.5">
                {/* Name Edit */}
                {isEditingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editNameValue}
                      onChange={(e) => setEditNameValue(e.target.value)}
                      onKeyDown={handleNameKeyDown}
                      className="text-sm border border-emerald-300 rounded px-2 py-0.5 focus:outline-none focus:border-emerald-500 text-gray-900 bg-white w-32"
                      placeholder="Enter name"
                      autoFocus
                    />
                    <button 
                      onClick={saveName} 
                      disabled={isNameSaving}
                      className="text-emerald-600 hover:text-emerald-700 bg-emerald-50 p-0.5 rounded transition-colors"
                    >
                      {isNameSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                    </button>
                    <button 
                      onClick={cancelEditingName} 
                      className="text-red-500 hover:text-red-600 bg-red-50 p-0.5 rounded transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                    <span>{currentUser?.name}</span>
                    <button 
                      onClick={startEditingName}
                      className="text-gray-400 hover:text-emerald-600 transition-colors"
                      title="Edit Name"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {/* Address Edit */}
                {isEditingAddress ? (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    <input
                      type="text"
                      value={editAddressValue}
                      onChange={(e) => setEditAddressValue(e.target.value)}
                      onKeyDown={handleAddressKeyDown}
                      className="text-xs border border-emerald-300 rounded px-2 py-0.5 focus:outline-none focus:border-emerald-500 text-gray-900 bg-white w-48"
                      placeholder="Enter address"
                      autoFocus
                    />
                    <button 
                      onClick={saveAddress} 
                      disabled={isAddressSaving}
                      className="text-emerald-600 hover:text-emerald-700 bg-emerald-50 p-0.5 rounded transition-colors"
                    >
                      {isAddressSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                    </button>
                    <button 
                      onClick={cancelEditingAddress} 
                      className="text-red-500 hover:text-red-600 bg-red-50 p-0.5 rounded transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <MapPin className="w-3 h-3" />
                    <span>{currentUser?.address || 'No address set'}</span>
                    <button 
                      onClick={startEditingAddress}
                      className="text-gray-400 hover:text-emerald-600 transition-colors ml-1"
                      title="Update Address"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <Button variant="secondary" onClick={handleLogout} className="text-sm">
            <LogOut className="w-4 h-4" /> Sign Out
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button 
            onClick={() => setActiveTab('NEW')}
            className={`pb-4 px-2 flex items-center gap-2 font-medium transition-colors relative ${
              activeTab === 'NEW' ? 'text-emerald-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Plus className="w-4 h-4" /> New Pickup
            {activeTab === 'NEW' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-600 rounded-t-full"></span>}
          </button>
          <button 
            onClick={() => setActiveTab('HISTORY')}
            className={`pb-4 px-2 flex items-center gap-2 font-medium transition-colors relative ${
              activeTab === 'HISTORY' ? 'text-emerald-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <History className="w-4 h-4" /> Request History
            {activeTab === 'HISTORY' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-600 rounded-t-full"></span>}
          </button>
        </div>

        {activeTab === 'NEW' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100">
                <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-sm">1</span>
                  Describe Your Waste
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <div className="flex justify-between items-end mb-1">
                      <label className="text-sm font-medium text-gray-700">What items do you have?</label>
                      <button 
                        type="button" 
                        onClick={handleAiAnalyze}
                        disabled={!description || aiLoading}
                        className="text-xs flex items-center gap-1 text-purple-600 hover:text-purple-700 disabled:opacity-50 font-semibold"
                      >
                        <Wand2 className="w-3 h-3" /> {aiLoading ? 'Analyzing...' : 'Auto-Categorize with AI'}
                      </button>
                    </div>
                    <TextArea 
                      label=""
                      placeholder="e.g. Old newspapers, plastic bottles, banana peels, broken monitor..."
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      rows={3}
                    />
                  </div>

                  {aiAnalysis && (
                    <div className="bg-purple-50 border border-purple-100 p-4 rounded-xl flex gap-3 items-start animate-fade-in">
                      <Wand2 className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-purple-800">AI Suggestion</p>
                        <p className="text-sm text-purple-700 mt-1">{aiAnalysis.tips}</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <div className="space-y-2">
                        {WASTE_CATEGORIES.map(cat => (
                          <label key={cat} className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            category === cat 
                              ? 'border-emerald-500 bg-emerald-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}>
                            <input 
                              type="radio" 
                              name="category" 
                              value={cat} 
                              checked={category === cat}
                              onChange={() => setCategory(cat)}
                              className="hidden"
                            />
                            <div className={`w-4 h-4 rounded-full border mr-3 flex items-center justify-center ${
                              category === cat ? 'border-emerald-500' : 'border-gray-400'
                            }`}>
                              {category === cat && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
                            </div>
                            <span className="text-sm font-medium text-gray-700">{CATEGORY_LABELS[cat]}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Input 
                        label="Quantity / Weight" 
                        placeholder="e.g. 2 Bags, 5 Kg"
                        value={quantity}
                        onChange={e => setQuantity(e.target.value)}
                      />
                      <div className="mt-6 bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                        <div className="flex items-center gap-2 text-yellow-800 mb-2">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="text-xs font-bold uppercase">Pickup Note</span>
                        </div>
                        <p className="text-xs text-yellow-700 leading-relaxed">
                          Please ensure waste is segregated correctly. Drivers may reject mixed waste upon inspection.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <Button type="submit" className="w-full md:w-auto" isLoading={submitLoading} disabled={!description || !quantity}>
                      Submit Pickup Request
                    </Button>
                  </div>
                </form>
              </div>
            </div>

            <div className="hidden md:block">
              <div className="bg-emerald-800 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="font-bold text-lg mb-2">Why Segregate?</h3>
                  <p className="text-emerald-100 text-sm mb-6">Proper segregation ensures maximum recycling and minimal landfill impact.</p>
                  <ul className="space-y-4 text-sm">
                    <li className="flex gap-3">
                      <span className="w-6 h-6 bg-emerald-700 rounded-full flex items-center justify-center text-xs">♻️</span>
                      <span>Dry waste gets recycled into new products.</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="w-6 h-6 bg-emerald-700 rounded-full flex items-center justify-center text-xs">🌱</span>
                      <span>Wet waste becomes compost for farms.</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="w-6 h-6 bg-emerald-700 rounded-full flex items-center justify-center text-xs">⚡</span>
                      <span>E-waste is safely processed for metals.</span>
                    </li>
                  </ul>
                </div>
                {/* Decorative background circle */}
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-700 rounded-full opacity-50"></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {isDataLoading && myRequests.length === 0 ? (
              <div className="py-12 flex justify-center text-emerald-600">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : myRequests.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                <Leaf className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-gray-500 font-medium">No requests yet</h3>
                <p className="text-gray-400 text-sm">Create a new pickup request to get started</p>
              </div>
            ) : (
              myRequests.map(req => (
                <div key={req.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <StatusBadge status={req.status} />
                        <span className="text-xs text-gray-400">ID: {req.id.slice(0, 8)}</span>
                        <span className="text-xs text-gray-400">• {new Date(req.createdAt).toLocaleDateString()}</span>
                      </div>
                      <h3 className="font-semibold text-gray-800">{CATEGORY_LABELS[req.category]}</h3>
                      <p className="text-gray-600 text-sm mt-1">{req.description} ({req.quantity})</p>
                      {req.aiInsights && (
                        <p className="text-xs text-purple-600 mt-2 flex items-center gap-1">
                          <Wand2 className="w-3 h-3" /> Tip: {req.aiInsights}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
};