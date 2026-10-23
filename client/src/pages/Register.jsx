import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Car, Lock, Mail, User, Phone, ArrowRight, Shield } from 'lucide-react';

export const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'rider',
    vehicleMake: 'Toyota',
    vehicleModel: 'Camry',
    vehicleType: 'Economy',
    licensePlate: 'OXIMA-' + Math.floor(1000 + Math.random() * 9000)
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role
      };

      if (formData.role === 'driver') {
        payload.vehicle = {
          make: formData.vehicleMake,
          model: formData.vehicleModel,
          type: formData.vehicleType,
          licensePlate: formData.licensePlate
        };
      }

      const user = await register(payload);
      if (user.role === 'driver') {
        navigate('/driver');
      } else {
        navigate('/rider');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-md">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/20">
            <Car className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-black text-white">Create an Account</h2>
          <p className="text-xs text-slate-400 mt-1">Join the Oxima mobility network</p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role Choice */}
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5">I want to join as:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'rider' })}
                className={`py-2.5 rounded-xl text-xs font-bold border transition ${
                  formData.role === 'rider'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                🚗 Rider
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'driver' })}
                className={`py-2.5 rounded-xl text-xs font-bold border transition ${
                  formData.role === 'driver'
                    ? 'bg-teal-500/20 text-teal-300 border-teal-500'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                🚕 Driver
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Full Name</label>
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus-within:border-emerald-500 transition">
                <User className="w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full bg-transparent text-sm text-white outline-none font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Phone Number</label>
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus-within:border-emerald-500 transition">
                <Phone className="w-4 h-4 text-slate-500" />
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 555 123 4567"
                  className="w-full bg-transparent text-sm text-white outline-none font-medium"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Email Address</label>
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus-within:border-emerald-500 transition">
              <Mail className="w-4 h-4 text-slate-500" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                className="w-full bg-transparent text-sm text-white outline-none font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Password</label>
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus-within:border-emerald-500 transition">
              <Lock className="w-4 h-4 text-slate-500" />
              <input
                type="password"
                name="password"
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                placeholder="Min 6 characters"
                className="w-full bg-transparent text-sm text-white outline-none font-medium"
              />
            </div>
          </div>

          {/* Conditional Driver Details */}
          {formData.role === 'driver' && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <span className="text-[11px] font-bold uppercase text-teal-400 tracking-wider block">
                Vehicle Specifications
              </span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  name="vehicleMake"
                  placeholder="Make (e.g. Toyota)"
                  value={formData.vehicleMake}
                  onChange={handleChange}
                  className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white outline-none"
                />
                <input
                  type="text"
                  name="vehicleModel"
                  placeholder="Model (e.g. Camry)"
                  value={formData.vehicleModel}
                  onChange={handleChange}
                  className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleChange}
                  className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white outline-none"
                >
                  <option value="Economy">Economy</option>
                  <option value="Premier">Premier</option>
                  <option value="XL">XL</option>
                  <option value="Moto">Moto</option>
                </select>
                <input
                  type="text"
                  name="licensePlate"
                  placeholder="License Plate"
                  value={formData.licensePlate}
                  onChange={handleChange}
                  className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white uppercase outline-none font-mono"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 font-black text-sm transition shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Complete Registration'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-emerald-400 font-bold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};
