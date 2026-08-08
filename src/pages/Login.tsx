import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/axios';
import { useMutation } from '@tanstack/react-query';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const loginMutation = useMutation({
    mutationFn: async (credentials?: { email?: string; password?: string }) => {
      const payload = {
        email: credentials?.email || email,
        password: credentials?.password || password
      };
      const response = await api.post('/users/login', payload);
      return response.data;
    },
    onSuccess: (data: any) => {
      login(data.data.user, data.token);
      navigate('/dashboard');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to login');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    loginMutation.mutate({ email, password });
  };

  const handleDemoLogin = (role: 'admin' | 'manager' | 'employee') => {
    setError('');
    
    const credentials = {
      admin: { email: 'admin@demo.com', password: 'demoPassword123' },
      manager: { email: 'manager@demo.com', password: 'demoPassword123' },
      employee: { email: 'employee@demo.com', password: 'demoPassword123' }
    };
    
    const selectedCreds = credentials[role];
    setEmail(selectedCreds.email);
    setPassword(selectedCreds.password);
    
    loginMutation.mutate(selectedCreds);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-[0_0_40px_rgba(0,0,0,0.15)]">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900">ERP</h1>
          <h5 className="text-md font-bold text-slate-900">Inventory and Sales Management System</h5>
          <p className="mt-2 text-sm text-slate-500">Sign in to your account to continue</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="admin@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="flex w-full justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:bg-indigo-400 transition-colors"
          >
            {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-slate-500">or login as</span>
            </div>
          </div>
          
          <div className="mt-6 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => handleDemoLogin('admin')}
              disabled={loginMutation.isPending}
              className="flex-1 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors border border-slate-200"
            >
              Demo Admin
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('manager')}
              disabled={loginMutation.isPending}
              className="flex-1 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors border border-slate-200"
            >
              Demo Manager
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('employee')}
              disabled={loginMutation.isPending}
              className="flex-1 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors border border-slate-200"
            >
              Demo Employee
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};