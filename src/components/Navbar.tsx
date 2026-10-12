import React from 'react';
import { 
  MapPin, 
  RefreshCw, 
  Download, 
  LogIn, 
  User as UserIcon, 
  LogOut, 
  ShieldAlert, 
  Radio, 
  Menu, 
  X,
  Sparkles
} from 'lucide-react';
import { LocationInfo, UserProfile } from '../types';

interface NavbarProps {
  location: LocationInfo;
  user: UserProfile | null;
  onOpenLocationModal: () => void;
  onOpenAuthModal: (mode: 'login' | 'register') => void;
  onLogout: () => void;
  onRefreshConditions: () => void;
  onExportCsv: () => void;
  isRefreshing: boolean;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  activeTab: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  location,
  user,
  onOpenLocationModal,
  onOpenAuthModal,
  onLogout,
  onRefreshConditions,
  onExportCsv,
  isRefreshing,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#153424] text-[#FAF8F5] border-b border-[#234A36] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-emerald-200 hover:text-white hover:bg-[#1E4532] transition"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-md border border-emerald-400/30">
                <span className="font-extrabold text-white text-lg tracking-tight font-mono">H+</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg text-white tracking-tight">HeatShield AI</span>
                  <span className="hidden sm:inline-flex text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-700/60">
                    Climate Tech
                  </span>
                </div>
                <span className="text-[11px] text-emerald-200/80 hidden sm:block">
                  Smart Heat-Risk Monitoring & Duty Planner
                </span>
              </div>
            </div>
          </div>

          {/* Location Selector & Status Pill */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={onOpenLocationModal}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1E4532] hover:bg-[#25543D] border border-emerald-600/40 text-xs sm:text-sm text-emerald-100 transition shadow-inner group"
              title="Click to change location or search any city worldwide"
            >
              <MapPin className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition" />
              <div className="text-left max-w-[130px] sm:max-w-[210px] truncate">
                <span className="font-semibold text-white block truncate">{location.city || location.name}</span>
                <span className="text-[10px] text-emerald-300/80 block truncate">{location.country}</span>
              </div>
              <span className="hidden md:inline-block text-[11px] font-medium text-emerald-300 ml-1 underline decoration-dotted">
                Change
              </span>
            </button>

            {/* Live / Demo Data Indicator */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-emerald-950/60 border-emerald-800">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${location.isLive ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${location.isLive ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
              </span>
              <span className={location.isLive ? 'text-emerald-300' : 'text-amber-300'}>
                {location.isLive ? 'Live Open-Meteo' : 'Demo Simulation'}
              </span>
            </div>

            {/* Refresh Conditions Button */}
            <button
              onClick={onRefreshConditions}
              disabled={isRefreshing}
              className="p-2 sm:px-3 sm:py-1.5 rounded-lg bg-[#1E4532] hover:bg-[#25543D] border border-emerald-600/40 text-emerald-100 text-xs sm:text-sm flex items-center gap-1.5 transition disabled:opacity-50"
              title="Refresh ambient weather and heat risk metrics"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {/* Export CSV Button */}
            <button
              onClick={onExportCsv}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700/80 hover:bg-emerald-600 text-white text-xs sm:text-sm font-medium transition shadow-sm"
              title="Download verified heat-risk data as CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            {/* User Profile or Login/Register */}
            {user?.isLoggedIn ? (
              <div className="flex items-center gap-2 pl-2 border-l border-emerald-800/80">
                <div className="hidden md:flex flex-col text-right">
                  <span className="text-xs font-semibold text-white">{user.fullName}</span>
                  <span className="text-[10px] text-emerald-300 font-mono">{user.role}</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs border border-emerald-400 shadow-sm">
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
                <button
                  onClick={onLogout}
                  className="p-1.5 rounded-lg hover:bg-[#1E4532] text-emerald-300 hover:text-white transition"
                  title="Sign out of demo session"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => onOpenAuthModal('login')}
                  className="px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-emerald-200 hover:text-white hover:bg-[#1E4532] transition"
                >
                  Log In
                </button>
                <button
                  onClick={() => onOpenAuthModal('register')}
                  className="px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition shadow-sm"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
