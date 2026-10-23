import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Car, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, quickSwitchAccount } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/rider';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const loggedInUser = await login(email, password);
      if (loggedInUser.role === 'driver') {
        navigate('/driver');
      } else if (loggedInUser.role === 'admin') {
        navigate('/admin');
      } else {
        navigate(from);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (testEmail, testRole) => {
    setEmail(testEmail);
    setPassword('password123');
    if (testRole === 'admin') setPassword('adminpassword123');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/20">
            <Car className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-black text-white">Welcome Back to Oxima</h2>
          <p className="text-xs text-slate-400 mt-1">Sign in to your account</p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Email Address</label>
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus-within:border-emerald-500 transition">
              <Mail className="w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rider@oxima.com"
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Password</label>
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus-within:border-emerald-500 transition">
              <Lock className="w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600 font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 font-black text-sm transition shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Account Quick-Fill */}
        <div className="mt-6 pt-6 border-t border-slate-800">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block text-center mb-2.5">
            ⚡ Quick-Fill Demo Credentials:
          </span>
          <div className="grid grid-cols-3 gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => handleQuickFill('rider@oxima.com', 'rider')}
              className="py-1.5 px-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-medium text-center border border-slate-700 transition"
            >
              Rider
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('alex.driver@oxima.com', 'driver')}
              className="py-1.5 px-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-medium text-center border border-slate-700 transition"
            >
              Driver
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('admin@oxima.com', 'admin')}
              className="py-1.5 px-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-medium text-center border border-slate-700 transition"
            >
              Admin
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-emerald-400 font-bold hover:underline">
            Register now
          </Link>
        </p>
      </div>
    </div>
  );
};
