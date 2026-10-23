import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Shield, History, Car, Compass } from 'lucide-react';
import { RideHistoryModal } from './RideHistoryModal';

export const Navbar = () => {
  const { user, driver, logout } = useAuth();
  const location = useLocation();
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const isDriverOnline =
    driver?.status === 'ONLINE' ||
    driver?.status === 'ON_TRIP' ||
    driver?.status === 'BUSY';

  const navLinkClass = (path) =>
    `px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
      location.pathname === path
        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
        : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
    }`;

  return (
    <>
      <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-2xl border-b border-slate-800/90 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Brand & Navigation */}
          <div className="flex items-center gap-4 sm:gap-6">
            <Link
              to="/"
              className="text-lg font-black tracking-tight text-white flex items-center gap-2"
            >
              <div className="w-6 h-6 rounded-xl bg-blue-600 flex items-center justify-center text-white text-xs font-black shadow-md shadow-blue-500/30">
                O
              </div>
              <span className="hidden sm:inline">Oxima</span>
            </Link>

            {user && (
              <nav className="flex items-center gap-1 sm:gap-2">
                {/* Rider Role */}
                {user.role === 'rider' && (
                  <Link to="/rider" className={navLinkClass('/rider')}>
                    <span className="flex items-center gap-1">
                      <Compass className="w-3.5 h-3.5 sm:hidden" />
                      <span>Book Ride</span>
                    </span>
                  </Link>
                )}

                {/* Driver Role */}
                {user.role === 'driver' && (
                  <Link
                    to="/driver"
                    className={`${navLinkClass('/driver')} flex items-center gap-1.5`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${isDriverOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`}
                    ></span>
                    <span>Driver Cockpit</span>
                  </Link>
                )}

                {/* Admin Role */}
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className={`${navLinkClass('/admin')} flex items-center gap-1`}
                  >
                    <Shield className="w-3.5 h-3.5 text-blue-400" />
                    <span>Admin Fleet</span>
                  </Link>
                )}

                {/* Trip History for All */}
                <button
                  type="button"
                  onClick={() => setShowHistoryModal(true)}
                  className="px-3 py-1.5 rounded-full text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/70 flex items-center gap-1.5 transition"
                >
                  <History className="w-3.5 h-3.5 text-amber-400" />
                  <span>My Trips</span>
                </button>
              </nav>
            )}
          </div>

          {/* User Profile & Actions */}
          {user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 text-slate-950 font-black text-[11px] flex items-center justify-center ring-2 ring-amber-400/30">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="font-bold text-white hidden sm:inline">
                  {user.name.split(' ')[0]}
                </span>
                <span className="text-[9px] uppercase font-black px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400">
                  {user.role}
                </span>
              </div>

              <button
                onClick={logout}
                className="p-2 rounded-full text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/"
                className="px-4 py-1.5 rounded-full bg-white hover:bg-slate-100 text-slate-900 text-xs font-black transition shadow-md"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Trip History Modal */}
      <RideHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        role={user?.role || 'rider'}
      />
    </>
  );
};
