import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  Radio,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Layers,
  Sparkles,
  Tv,
  MonitorPlay,
  ShieldAlert,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function Login() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  // Redirect if already logged in
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) return;
    setError('');
    setIsSubmitting(true);

    try {
      const result = await login(username.trim(), password);
      if (!result.success) {
        setError(result.error || 'Invalid username or password');
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-screen bg-[#06080d]">
        <div className="w-9 h-9 border-3 border-fuchsia-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full h-screen min-h-screen lg:h-screen lg:max-h-screen flex flex-col lg:flex-row bg-[#06080d] text-white selection:bg-fuchsia-600 selection:text-white overflow-y-auto lg:overflow-hidden">
      {/* =========================================================================
          LEFT COLUMN: Software Showcase & Dashboard Visual (Fit-To-Screen)
          ========================================================================= */}
      <div className="relative w-full lg:w-[56%] xl:w-[58%] h-auto lg:h-full flex flex-col justify-between p-6 sm:p-8 lg:p-8 xl:p-10 bg-gradient-to-br from-[#12072b] via-[#0c061e] to-[#06080d] border-b lg:border-b-0 lg:border-r border-white/10 shrink-0 lg:shrink">
        {/* Ambient atmospheric lighting */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-fuchsia-600/12 blur-[120px]" />
          <div className="absolute top-1/2 -right-32 w-96 h-96 rounded-full bg-indigo-600/12 blur-[120px]" />
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
              backgroundSize: '28px 28px',
            }}
          />
        </div>

        {/* Center: Scaled Window Mockup with Looping Software Video */}
        <div className="relative z-10 flex-1 min-h-0 flex items-center justify-center my-auto py-2 sm:py-4">
          <div className="w-full max-w-2xl xl:max-w-3xl rounded-xl border border-white/15 bg-slate-950/90 shadow-2xl shadow-purple-950/50 overflow-hidden flex flex-col group">
            {/* macOS Chrome Header */}
            <div className="h-6 sm:h-7 bg-slate-900/90 border-b border-white/10 px-3 sm:px-3.5 flex items-center justify-between select-none shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-rose-500/80" />
                <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-amber-500/80" />
                <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <div className="text-[9px] sm:text-[10px] font-medium text-slate-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 animate-pulse" />
                <span>RMC PlayCast Studio — Live Console</span>
              </div>
              <div className="w-8" />
            </div>

            {/* Dashboard Mockup Video Loop - Full Frame & Aspect Ratio Preserved */}
            <div className="relative w-full bg-slate-950 overflow-hidden flex items-center justify-center">
              <video
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                poster="/dashboard-preview.jpg"
                className="w-full h-auto max-h-[62vh] block object-contain transition-transform duration-500 group-hover:scale-[1.005]"
              >
                <source src="/dashboard-preview.webm" type="video/webm" />
                <img
                  src="/dashboard-preview.jpg"
                  alt="RMC PlayCast Church Presentation Dashboard"
                  className="w-full h-auto max-h-[62vh] block object-contain"
                />
              </video>
              <div className="absolute inset-0 ring-1 ring-inset ring-white/10 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Bottom Feature Badges */}
        <div className="relative z-10 flex flex-wrap items-center gap-2 shrink-0">
          {[
            { label: 'Lyrics & Scripture', icon: <Layers className="w-3 h-3 text-fuchsia-400" /> },
            { label: 'Live Overlays', icon: <Sparkles className="w-3 h-3 text-indigo-400" /> },
            { label: 'OBS Outputs', icon: <Tv className="w-3 h-3 text-rose-400" /> },
            { label: 'Stage Display', icon: <MonitorPlay className="w-3 h-3 text-emerald-400" /> },
          ].map((pill) => (
            <div
              key={pill.label}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/10 bg-slate-900/70 backdrop-blur-md text-[11px] font-semibold text-slate-300 shadow-sm"
            >
              {pill.icon}
              <span>{pill.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* =========================================================================
          RIGHT COLUMN: Login Form (Fit-To-Screen, Compact & Clean)
          ========================================================================= */}
      <div className="w-full lg:w-[44%] xl:w-[42%] h-auto lg:h-full flex flex-col justify-between p-6 sm:p-8 lg:p-8 xl:p-12 bg-[#06080d] shrink-0 lg:shrink">
        {/* Top Spacer */}
        <div className="hidden lg:block shrink-0" />

        {/* Main Form Box */}
        <div className="w-full max-w-sm mx-auto my-auto py-4">
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-fuchsia-500 via-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-fuchsia-500/25">
              <Radio className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-lg font-extrabold text-white tracking-tight">
              RMC PlayCast
            </span>
          </div>

          {/* Heading */}
          <div className="mb-6">
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Welcome back
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Sign in to your workspace to continue.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Banner */}
            {error && (
              <div className="flex items-start gap-2.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-lg px-3.5 py-2.5 text-xs animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Username / Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="login-username"
                className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider"
              >
                Username or Email
              </label>
              <input
                id="login-username"
                type="text"
                autoComplete="username"
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                disabled={isSubmitting}
                className="w-full bg-[#0a0d14] border border-white/10 rounded-lg px-3.5 py-2.5 text-white placeholder:text-slate-600 text-xs focus:outline-none focus:ring-1 focus:ring-fuchsia-500 focus:border-fuchsia-500 transition-all disabled:opacity-50"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="login-password"
                className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  disabled={isSubmitting}
                  className="w-full bg-[#0a0d14] border border-white/10 rounded-lg px-3.5 py-2.5 pr-10 text-white placeholder:text-slate-600 text-xs focus:outline-none focus:ring-1 focus:ring-fuchsia-500 focus:border-fuchsia-500 transition-all disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Options Row: Keep Signed In + Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-0.5 select-none">
              <label className="flex items-center gap-1.5 text-slate-400 hover:text-slate-300 cursor-pointer text-[11px]">
                <input
                  type="checkbox"
                  checked={keepSignedIn}
                  onChange={(e) => setKeepSignedIn(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-white/20 bg-[#0a0d14] text-fuchsia-600 focus:ring-0 cursor-pointer accent-fuchsia-600"
                />
                <span>Keep me signed in</span>
              </label>

              <button
                type="button"
                onClick={() => setIsForgotPasswordOpen(true)}
                className="text-slate-400 hover:text-fuchsia-400 transition-colors cursor-pointer font-medium text-[11px]"
              >
                Forgot password?
              </button>
            </div>

            {/* Sign In Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !username.trim() || !password}
              className="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white font-bold py-2.5 px-4 rounded-lg transition-all duration-150 shadow-md shadow-fuchsia-600/25 hover:shadow-fuchsia-600/40 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none cursor-pointer mt-1 text-xs"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing in…</span>
                </>
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="pt-4 text-center shrink-0">
          <p className="text-slate-600 text-[11px]">
            RMC PlayCast &copy; {new Date().getFullYear()} — SRI Infy LLC. All rights reserved.
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Dialog open={isForgotPasswordOpen} onOpenChange={setIsForgotPasswordOpen}>
        <DialogContent className="max-w-md bg-slate-950 border border-white/10 text-slate-200 p-6">
          <DialogHeader className="space-y-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-1">
              <ShieldAlert className="w-4.5 h-4.5" />
            </div>
            <DialogTitle className="text-sm font-bold text-white">
              Password Reset Assistance
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2.5 text-xs text-slate-300 pt-1">
            <p>
              For security, church operator account credentials and password resets are
              managed centrally by your organization&apos;s Super Administrator.
            </p>
            <div className="bg-slate-900 border border-white/5 rounded-lg p-3 space-y-1">
              <div className="font-semibold text-white">Need a Password Reset?</div>
              <p className="text-slate-400 text-[11px]">
                Please contact your church Super Administrator (<code className="text-fuchsia-300">@admin</code>)
                who can issue an instant password reset or temporary credentials from the Super Admin Panel.
              </p>
            </div>
          </div>
          <div className="pt-3 flex justify-end">
            <Button
              size="sm"
              onClick={() => setIsForgotPasswordOpen(false)}
              className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-xs h-8"
            >
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
