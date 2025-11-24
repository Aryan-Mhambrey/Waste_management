import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Role } from '../types';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Recycle, Truck, UserCircle } from 'lucide-react';

export const Auth: React.FC = () => {
  const { login, register } = useStore();
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<Role>('USER');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    address: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      const success = login(formData.email, formData.password);
      if (!success) setError('Invalid email or password');
    } else {
      if (!formData.name || !formData.email || !formData.password || (!formData.address && role === 'USER')) {
        setError('Please fill all fields');
        return;
      }
      const success = register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        address: formData.address || 'N/A', // Drivers might not need personal address for this demo
        role
      });
      if (!success) setError('Email already registered');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl flex overflow-hidden min-h-[600px]">
        {/* Left Side - Hero */}
        <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-emerald-600 text-white p-12 relative">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/leaf.png')]"></div>
          <Recycle className="w-24 h-24 mb-6" />
          <h1 className="text-4xl font-bold mb-4 text-center">EcoSort</h1>
          <p className="text-center text-emerald-100 text-lg leading-relaxed">
            Join our community to manage waste efficiently. Separate, Request, and Track your waste disposal with AI-powered assistance.
          </p>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <div className="flex justify-end mb-4">
            <button 
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-emerald-600 text-sm font-semibold hover:underline"
            >
              {isLogin ? 'Create Account' : 'Back to Login'}
            </button>
          </div>

          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {isLogin ? 'Welcome Back' : 'Get Started'}
          </h2>
          <p className="text-gray-500 mb-8">
            {isLogin ? 'Enter your details to access your dashboard' : 'Create your account to start recycling'}
          </p>

          {!isLogin && (
            <div className="flex gap-4 mb-6">
              <button
                type="button"
                onClick={() => setRole('USER')}
                className={`flex-1 p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                  role === 'USER' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-400 hover:border-emerald-200'
                }`}
              >
                <UserCircle className="w-6 h-6" />
                <span className="font-semibold text-sm">Resident</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('DRIVER')}
                className={`flex-1 p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                  role === 'DRIVER' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-400 hover:border-emerald-200'
                }`}
              >
                <Truck className="w-6 h-6" />
                <span className="font-semibold text-sm">Collector</span>
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <Input 
                  label="Full Name" 
                  placeholder="e.g. Jane Doe"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
                {role === 'USER' && (
                  <Input 
                    label="Address" 
                    placeholder="e.g. 123 Green St, Eco City"
                    value={formData.address}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                  />
                )}
              </>
            )}
            
            <Input 
              label="Email" 
              type="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
            
            <Input 
              label="Password" 
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />

            {error && <div className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</div>}

            <Button type="submit" className="w-full py-3 mt-4">
              {isLogin ? 'Sign In' : 'Create Account'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};