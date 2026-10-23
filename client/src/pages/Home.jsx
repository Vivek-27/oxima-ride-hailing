import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, ShieldCheck } from 'lucide-react';

export const Home = () => {
  const { user, login, register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'driver') navigate('/driver');
      else if (user.role === 'admin') navigate('/admin');
      else navigate('/rider');
    }
  }, [isAuthenticated, user, navigate]);

  const [isRegister, setIsRegister] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('rider');

  // Driver vehicle state (6 standardized categories)
  const [vehicleType, setVehicleType] = useState('Mini');
  const [vehicleMake, setVehicleMake] = useState('Maruti Suzuki');
  const [vehicleModel, setVehicleModel] = useState('WagonR');
  const [licensePlate, setLicensePlate] = useState('');
  const [rcNumber, setRcNumber] = useState('');
  const [upiId, setUpiId] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        const payload = { name, email, phone, password, role };
        if (role === 'driver') {
          if (!rcNumber.trim()) {
            throw new Error('Vehicle RC number is mandatory for driver registration');
          }
          payload.upiId = upiId.trim();
          payload.vehicle = {
            make: vehicleMake.trim() || 'Vehicle',
            model: vehicleModel.trim() || 'Standard',
            type: vehicleType,
            licensePlate: (licensePlate.trim() || 'TS-09-AB-1234').toUpperCase(),
            rcNumber: rcNumber.trim().toUpperCase()
          };
        }
        const newUser = await register(payload);
        if (newUser.role === 'driver') navigate('/driver');
        else navigate('/rider');
      } else {
        const loggedUser = await login(email, password);
        if (loggedUser.role === 'driver') navigate('/driver');
        else if (loggedUser.role === 'admin') navigate('/admin');
        else navigate('/rider');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Authentication failed. Please check details.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminQuickFill = () => {
    setIsAdminMode(true);
    setIsRegister(false);
    setEmail('admin@oxima.com');
    setPassword('adminpassword123');
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-4 bg-slate-950">
      <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-2xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-white">
        {/* Admin Quick Switch Pill in Top Right */}
        <div className="absolute top-5 right-5">
          <button
            type="button"
            onClick={handleAdminQuickFill}
            className="text-[11px] font-bold text-blue-400 hover:text-blue-300 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/30 flex items-center gap-1 transition active:scale-95"
            title="Admin Login Shortcut"
          >
            <ShieldCheck className="w-3 h-3 text-blue-400" />
            <span>Admin Portal</span>
          </button>
        </div>

        <div className="mb-6 text-left">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white mb-3 shadow-lg shadow-blue-500/30 font-black text-xl">
            O
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {isRegister ? 'Create Oxima Account' : isAdminMode ? 'Admin Portal Sign In' : 'Sign in to Oxima'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {isRegister
              ? 'Enter your details to get moving across Hyderabad'
              : isAdminMode
              ? 'Enter administrator credentials to access fleet operations'
              : 'Enter your email and password to continue'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isRegister && (
            <>
              {/* Role Toggle */}
              <div className="flex bg-slate-800 p-1 rounded-2xl mb-2 border border-slate-700">
                <button
                  type="button"
                  onClick={() => setRole('rider')}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                    role === 'rider' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Rider
                </button>
                <button
                  type="button"
                  onClick={() => setRole('driver')}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                    role === 'driver' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Driver
                </button>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Sneha Reddy"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-800/80 border border-slate-700 text-white text-xs font-medium outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98480 12345"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-800/80 border border-slate-700 text-white text-xs font-medium outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Driver Specific Fields (6 Categories) */}
              {role === 'driver' && (
                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-3">
                  <span className="text-[10px] font-bold uppercase text-blue-400 tracking-wider block">
                    Driver & Vehicle Registration (1 Driver = 1 Vehicle)
                  </span>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1">Vehicle Category (6 Types)</label>
                    <select
                      value={vehicleType}
                      onChange={(e) => setVehicleType(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-semibold outline-none"
                    >
                      <option value="Moto">Moto (Bike / Scooter - 1 Seat)</option>
                      <option value="Auto">Auto Rickshaw (3 Seats)</option>
                      <option value="Mini">Mini (Hatchback - 4 Seats)</option>
                      <option value="Sedan">Sedan (Comfort - 4 Seats)</option>
                      <option value="SUV">SUV (Spacious - 6 Seats)</option>
                      <option value="Electric">Electric (Green EV Cab - 4 Seats)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">Make</label>
                      <input
                        type="text"
                        placeholder="e.g. Maruti / Tata"
                        value={vehicleMake}
                        onChange={(e) => setVehicleMake(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">Model</label>
                      <input
                        type="text"
                        placeholder="e.g. WagonR / Nexon"
                        value={vehicleModel}
                        onChange={(e) => setVehicleModel(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">License Plate</label>
                      <input
                        type="text"
                        required
                        placeholder="TS-09-AB-1234"
                        value={licensePlate}
                        onChange={(e) => setLicensePlate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs uppercase font-mono font-bold outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">Unique RC Number</label>
                      <input
                        type="text"
                        required
                        placeholder="RC-TS-9988"
                        value={rcNumber}
                        onChange={(e) => setRcNumber(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs uppercase font-mono font-bold outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1">Driver UPI ID (Optional)</label>
                    <input
                      type="text"
                      placeholder="driver@okhdfcbank / driver@paytm"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs outline-none"
                    />
                  </div>
                </div>
              )}
            </>
          )}

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Email Address</label>
            <input
              type="email"
              required
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-800/80 border border-slate-700 text-white text-xs font-medium outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Password</label>
            <input
              type="password"
              required
              minLength={6}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-800/80 border border-slate-700 text-white text-xs font-medium outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-2 rounded-full bg-white hover:bg-slate-100 text-slate-950 font-black text-sm transition shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]"
          >
            {loading ? 'Please wait...' : isRegister ? 'Register & Continue' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setIsAdminMode(false);
              setError('');
            }}
            className="text-xs text-slate-400 hover:text-white font-semibold transition"
          >
            {isRegister ? 'Already registered? Sign in' : "New to Oxima? Create an account"}
          </button>
        </div>
      </div>
    </div>
  );
};
