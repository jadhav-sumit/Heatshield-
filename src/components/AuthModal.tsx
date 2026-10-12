import React, { useState } from 'react';
import { X, Eye, EyeOff, ShieldCheck, UserPlus, LogIn, AlertCircle, CheckCircle2 } from 'lucide-react';
import { UserProfile, UserRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode: 'login' | 'register';
  onLoginSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode,
  onLoginSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('Traffic Police');
  const [badgeNumber, setBadgeNumber] = useState('');

  // Status & validation states
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const validateEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Validation
    if (!validateEmail(email)) {
      setErrorMsg('Please enter a valid email address (e.g., officer@traffic.gov.in).');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (mode === 'register') {
      if (!fullName.trim()) {
        setErrorMsg('Please enter your full name.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match. Please re-enter confirm password.');
        return;
      }
    }

    setIsLoading(true);

    // Simulated authentic authentication flow
    setTimeout(() => {
      setIsLoading(false);
      const userProfile: UserProfile = {
        id: `usr-${Date.now()}`,
        fullName: mode === 'register' ? fullName : (email.split('@')[0] || 'Demo Officer'),
        email,
        role: role,
        badgeNumber: badgeNumber.trim() || undefined,
        isLoggedIn: true,
      };

      setSuccessMsg(
        mode === 'register'
          ? `Demo Account registered successfully as ${role}! Redirecting...`
          : `Demo Logged in successfully as ${userProfile.fullName} (${role})!`
      );

      setTimeout(() => {
        onLoginSuccess(userProfile);
        onClose();
      }, 1000);
    }, 600);
  };

  const handleModeSwitch = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-[#FAF8F5] border border-stone-300 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#123624] text-white p-5 flex items-center justify-between border-b border-[#214E37]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
              {mode === 'login' ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">
                {mode === 'login' ? 'Duty Access Login' : 'Register New Account'}
              </h3>
              <p className="text-xs text-emerald-200">HeatShield AI Duty Portal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-300 hover:text-white hover:bg-[#1D4E36] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Demo Mode Notice Banner */}
        <div className="bg-amber-50 border-b border-amber-200/80 px-4 py-2.5 text-xs text-amber-900 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Prototype Authentication Notice: </span>
            This form uses simulated local authentication for hackathon evaluation. Production deployments connect directly to Firebase Authentication or Enterprise OAuth.
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Inspector Ramesh Kulkarni"
                className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600 text-stone-900"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. officer@punepolice.gov.in"
              className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600 text-stone-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600 pr-10 text-stone-900"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600 pr-10 text-stone-900"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              User Role <span className="text-red-500">*</span>
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600 text-stone-900"
            >
              <option value="Traffic Police">Traffic Police (Officer / Marshal)</option>
              <option value="Outdoor Worker">Outdoor Worker (Municipal / Courier / Transit)</option>
              <option value="Administrator">Administrator (Ward Health / Supervisor)</option>
              <option value="Citizen">Citizen (Public Heat Safety Monitor)</option>
            </select>
          </div>

          {mode === 'register' && (role === 'Traffic Police' || role === 'Outdoor Worker') && (
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Badge / Employee ID (Optional)
              </label>
              <input
                type="text"
                value={badgeNumber}
                onChange={(e) => setBadgeNumber(e.target.value)}
                placeholder="e.g. TP-PUNE-4102"
                className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600 text-stone-900"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-2.5 px-4 rounded-xl font-bold text-sm bg-[#123624] hover:bg-[#1B4D35] text-white shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span className="inline-block animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            ) : mode === 'login' ? (
              <>
                <LogIn className="w-4 h-4" />
                Sign In to Dashboard
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Create Demo Account
              </>
            )}
          </button>

          <div className="text-center pt-3 border-t border-stone-200">
            {mode === 'login' ? (
              <p className="text-xs text-stone-600">
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => handleModeSwitch('register')}
                  className="font-bold text-emerald-700 hover:text-emerald-800 underline ml-1"
                >
                  Register here
                </button>
              </p>
            ) : (
              <p className="text-xs text-stone-600">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => handleModeSwitch('login')}
                  className="font-bold text-emerald-700 hover:text-emerald-800 underline ml-1"
                >
                  Sign in here
                </button>
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
