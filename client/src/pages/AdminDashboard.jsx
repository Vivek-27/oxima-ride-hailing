import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../services/api';
import { MapView } from '../components/MapView';
import { TrendingUp, Clock, Globe, Shield, RefreshCw, CheckCircle2, RotateCcw } from 'lucide-react';

const SUPPORTED_CITIES = [
  { id: 'all_india', name: 'All India (Global)' },
  { id: 'bengaluru', name: 'Bengaluru (Karnataka)' },
  { id: 'mumbai', name: 'Mumbai (Maharashtra)' },
  { id: 'delhi', name: 'Delhi NCR' },
  { id: 'hyderabad', name: 'Hyderabad (Telangana)' },
  { id: 'chennai', name: 'Chennai (Tamil Nadu)' },
  { id: 'kolkata', name: 'Kolkata (West Bengal)' },
  { id: 'pune', name: 'Pune (Maharashtra)' },
  { id: 'ahmedabad', name: 'Ahmedabad (Gujarat)' },
  { id: 'jaipur', name: 'Jaipur (Rajasthan)' },
  { id: 'kochi', name: 'Kochi (Kerala)' }
];

export const AdminDashboard = () => {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [stats, setStats] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [recentRides, setRecentRides] = useState([]);
  const [citySurges, setCitySurges] = useState([]);

  const [selectedCityId, setSelectedCityId] = useState('all_india');
  const [surgeMultiplierInput, setSurgeMultiplierInput] = useState(1.5);
  const [isUpdatingSurge, setIsUpdatingSurge] = useState(false);
  const [surgeMessage, setSurgeMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
    const interval = setInterval(fetchAdminData, 6000);
    return () => clearInterval(interval);
  }, []);

  const fetchAdminData = async () => {
    try {
      const res = await api.get('/admin/stats');
      setStats(res.data.data.stats);
      setDrivers(res.data.data.drivers || []);
      setCitySurges(res.data.data.stats?.citySurges || []);

      const ridesRes = await api.get('/rides/history');
      if (ridesRes.data.data.rides) {
        setRecentRides(ridesRes.data.data.rides);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Real-Time Socket.IO event listeners for live fleet updates
  useEffect(() => {
    if (!socket) return;
    socket.emit('admin:join');

    socket.on('fleet:driver:moved', (data) => {
      setDrivers((prev) =>
        prev.map((d) => {
          if (d._id === data.driverId) {
            return {
              ...d,
              currentLocation: { type: 'Point', coordinates: [data.longitude, data.latitude] },
              currentHeading: data.heading,
              status: data.status
            };
          }
          return d;
        })
      );
    });

    socket.on('fleet:driver:status', () => {
      fetchAdminData();
    });

    socket.on('fleet:ride:completed', () => {
      fetchAdminData();
    });

    socket.on('fleet:surge:updated', () => {
      fetchAdminData();
    });

    return () => {
      socket.off('fleet:driver:moved');
      socket.off('fleet:driver:status');
      socket.off('fleet:ride:completed');
      socket.off('fleet:surge:updated');
    };
  }, [socket]);

  const handleApplySurge = async (e) => {
    e.preventDefault();
    setIsUpdatingSurge(true);
    setSurgeMessage('');

    try {
      const res = await api.post('/admin/surge', {
        cityId: selectedCityId,
        multiplier: parseFloat(surgeMultiplierInput)
      });
      setSurgeMessage(res.data.message || 'Surge pricing updated!');
      fetchAdminData();
      setTimeout(() => setSurgeMessage(''), 4000);
    } catch (err) {
      setSurgeMessage(err.response?.data?.message || 'Failed to update surge');
    } finally {
      setIsUpdatingSurge(false);
    }
  };

  const handleResetCitySurge = async (cityId) => {
    try {
      await api.post('/admin/surge', { cityId, multiplier: 1.0 });
      fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleVerify = async (driverId) => {
    try {
      const res = await api.patch(`/admin/drivers/${driverId}/verify`);
      setDrivers((prev) => prev.map((d) => (d._id === driverId ? res.data.data.driver : d)));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-slate-950">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-slate-950 p-4 sm:p-6 text-white space-y-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Globe className="w-6 h-6 text-blue-400" />
            <span>All-India Fleet Operations</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time live driver monitoring, city surge pricing (3hr TTL), and revenue analytics
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          className="px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 self-start sm:self-auto transition active:scale-95"
        >
          <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
          <span>Refresh Live</span>
        </button>
      </div>

      {/* Real-time Metrics */}
      <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl shadow-xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Active Rides</span>
          <p className="text-2xl sm:text-3xl font-black text-white mt-1">{stats?.activeRidesCount || 0}</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl shadow-xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Drivers Online</span>
          <p className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">
            {stats?.activeDrivers || 0} / {stats?.totalDrivers || 0}
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl shadow-xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Gross Volume</span>
          <p className="text-2xl sm:text-3xl font-black text-white mt-1">₹{stats?.grossVolume?.toFixed(0) || '0'}</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl shadow-xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Platform Revenue (15%)</span>
          <p className="text-2xl sm:text-3xl font-black text-blue-400 mt-1">₹{stats?.platformRevenue?.toFixed(0) || '0'}</p>
        </div>
      </div>

      {/* City-Specific Surge Controller & Map */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Real-time Map */}
        <div className="lg:col-span-7 h-[360px] sm:h-[420px] rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
          <MapView center={[20.5937, 78.9629]} zoom={5} nearbyDrivers={drivers} height="100%" />
        </div>

        {/* City-Specific Surge Pricing Manager */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm text-white">City Surge Pricing (3-Hour TTL)</h3>
              </div>
              <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Expires after 3 hrs</span>
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Select any city across India to activate peak surge pricing. Surges automatically revert to 1.0x after 3 hours.
            </p>

            {surgeMessage && (
              <div className="mb-3 p-2.5 rounded-2xl bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-semibold text-center">
                {surgeMessage}
              </div>
            )}

            <form onSubmit={handleApplySurge} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Select Target Indian City
                </label>
                <select
                  value={selectedCityId}
                  onChange={(e) => setSelectedCityId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-2xl bg-slate-800 border border-slate-700 text-white text-xs font-semibold outline-none focus:border-blue-500"
                >
                  {SUPPORTED_CITIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-2">
                  <span>Surge Multiplier</span>
                  <span className="text-base font-black text-amber-400">{surgeMultiplierInput}x</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="3.5"
                  step="0.1"
                  value={surgeMultiplierInput}
                  onChange={(e) => setSurgeMultiplierInput(e.target.value)}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setSurgeMultiplierInput(1.0);
                    handleResetCitySurge(selectedCityId);
                  }}
                  className="px-4 py-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  Reset (1.0x)
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingSurge}
                  className="flex-1 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-md shadow-blue-600/30 active:scale-95"
                >
                  Apply {surgeMultiplierInput}x for 3 Hours
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Active City Surge Status Table */}
      <div className="max-w-7xl mx-auto bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-400" />
          <span>City Surge Status & Expiry Timers</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {citySurges.map((city) => (
            <div
              key={city.id}
              className={`p-4 rounded-2xl border transition flex items-center justify-between ${
                city.isActive
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-200'
                  : 'bg-slate-800/50 border-slate-800 text-slate-400'
              }`}
            >
              <div>
                <h4 className="text-xs font-bold text-white">{city.name}</h4>
                <p className="text-[11px] font-semibold mt-0.5">
                  {city.isActive ? (
                    <span className="text-amber-400 font-bold">{city.multiplier}x Surge Active</span>
                  ) : (
                    <span>Normal (1.0x)</span>
                  )}
                </p>
                <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  <span>{city.remainingFormatted}</span>
                </p>
              </div>

              {city.isActive && (
                <button
                  onClick={() => handleResetCitySurge(city.id)}
                  title="Reset to 1.0x"
                  className="p-2 rounded-full bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Trip Log with Driver, Rider & Cancellation Reasons */}
      <div className="max-w-7xl mx-auto bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl">
        <h3 className="text-sm font-bold text-white mb-3">Recent Trips Across India</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-bold">
                <th className="pb-2.5">Passenger</th>
                <th className="pb-2.5">Driver & Vehicle</th>
                <th className="pb-2.5">Route</th>
                <th className="pb-2.5">Fare</th>
                <th className="pb-2.5">Status</th>
                <th className="pb-2.5">Cancellation Reason / Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-medium text-slate-300">
              {recentRides.map((r) => (
                <tr key={r._id}>
                  <td className="py-3">
                    <p className="font-bold text-white">{r.rider?.name || 'Rider'}</p>
                    <p className="text-[10px] text-slate-400">{r.rider?.phone || ''}</p>
                  </td>
                  <td className="py-3">
                    {r.driver ? (
                      <>
                        <p className="font-bold text-white">{r.driver.user?.name || 'Driver'}</p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {r.vehicleType} • {r.driver.vehicle?.licensePlate || ''}
                        </p>
                      </>
                    ) : (
                      <span className="text-slate-500 italic">Unassigned</span>
                    )}
                  </td>
                  <td className="py-3 max-w-[220px] truncate">
                    <span className="text-white font-medium">{r.pickup?.address?.split(',')[0]}</span>
                    <span className="text-slate-500"> → </span>
                    <span className="text-white font-medium">{r.destination?.address?.split(',')[0]}</span>
                  </td>
                  <td className="py-3 font-bold text-white">₹{r.fare?.totalFare?.toFixed(0) || '0'}</td>
                  <td className="py-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        r.status === 'COMPLETED'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : r.status === 'CANCELLED'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3 text-slate-400 text-[11px]">
                    {r.status === 'CANCELLED' ? (
                      <span className="text-rose-400 font-semibold bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                        {r.cancellationReason || `Cancelled by ${r.cancelledBy || 'user'}`}
                      </span>
                    ) : (
                      <span className="text-slate-500">Completed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Registered Fleet */}
      <div className="max-w-7xl mx-auto bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl">
        <h3 className="text-sm font-bold text-white mb-3">Registered Fleet & Vehicle Verification</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-bold">
                <th className="pb-2.5">Driver</th>
                <th className="pb-2.5">Vehicle</th>
                <th className="pb-2.5">RC Number</th>
                <th className="pb-2.5">UPI ID</th>
                <th className="pb-2.5">Status</th>
                <th className="pb-2.5">Total Earnings</th>
                <th className="pb-2.5 text-right">RC Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-medium text-slate-300">
              {drivers.map((d) => (
                <tr key={d._id}>
                  <td className="py-3 font-bold text-white">{d.user?.name || 'Driver'}</td>
                  <td className="py-3">
                    {d.vehicle?.make} {d.vehicle?.model} ({d.vehicle?.type})
                  </td>
                  <td className="py-3 font-mono text-[11px] font-bold text-slate-400">
                    {d.vehicle?.rcNumber || 'N/A'}
                  </td>
                  <td className="py-3 font-mono text-[11px] text-blue-400">{d.upiId || 'Not set'}</td>
                  <td className="py-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        d.status === 'ONLINE'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : d.status === 'ON_TRIP' || d.status === 'BUSY'
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {d.status}
                    </span>
                  </td>
                  <td className="py-3 font-bold text-white">₹{d.totalEarnings?.toFixed(0) || '0'}</td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => handleToggleVerify(d._id)}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold border transition ${
                        d.documents?.isVerified
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-rose-500/20 hover:text-rose-400 hover:border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30 hover:bg-emerald-500/20 hover:text-emerald-400'
                      }`}
                    >
                      {d.documents?.isVerified ? 'Verified ✓' : 'Approve RC'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
