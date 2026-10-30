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
      <div className="flex items-center justify-center w-full h-screen bg-[#07090e]">
        <div className="w-10 h-10 border-4 border-fuchsia-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#07090e] text-white selection:bg-fuchsia-600 selection:text-white overflow-x-hidden">
      {/* =========================================================================
          LEFT COLUMN: Visual Representation & Software Showcase
          ========================================================================= */}
      <div className="relative w-full lg:w-[56%] xl:w-[58%] min-h-[460px] lg:min-h-screen flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16 overflow-hidden bg-gradient-to-br from-[#12072b] via-[#0d0722] to-[#07090e] border-b lg:border-b-0 lg:border-r border-white/10">
        {/* Ambient atmospheric glow orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-fuchsia-600/15 blur-[140px]" />
          <div className="absolute top-1/3 -right-40 w-[550px] h-[550px] rounded-full bg-indigo-600/15 blur-[150px]" />
          <div className="absolute -bottom-32 left-1/4 w-[500px] h-[500px] rounded-full bg-purple-700/10 blur-[130px]" />
          {/* Subtle grid texture overlay */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
              backgroundSize: '32px 32px',
            }}
          />
        </div>

        {/* Top: Pill Badge & Hero Headline */}
        <div className="relative z-10 max-w-xl">
          {/* Category Pill Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-fuchsia-500/30 bg-fuchsia-950/40 backdrop-blur-md shadow-sm mb-4">
            <span className="w-2 h-2 rounded-full bg-fuchsia-400 animate-pulse" />
            <span className="text-[11px] font-bold tracking-widest uppercase text-fuchsia-300">
              CHURCH PRESENTATION & OBS STUDIO
            </span>
          </div>

          {/* Hero Headline */}
          <h1 className="text-3xl sm:text-4xl lg:text-4xl xl:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
            Run your whole service{' '}
            <span className="bg-gradient-to-r from-fuchsia-400 via-purple-300 to-indigo-300 text-transparent bg-clip-text">
              from one screen.
            </span>
          </h1>
        </div>

        {/* Center: Framed Software Preview Window */}
        <div className="relative z-10 my-6 lg:my-8 w-full max-w-2xl">
          <div className="group relative rounded-2xl border border-white/15 bg-slate-950/90 shadow-2xl shadow-purple-950/60 overflow-hidden transition-all duration-500 hover:border-fuchsia-500/40 hover:shadow-fuchsia-950/40">
            {/* macOS / Window Titlebar Header */}
            <div className="h-7 bg-slate-900/90 border-b border-white/10 px-3.5 flex items-center justify-between select-none">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <div className="text-[10px] font-medium text-slate-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400" />
                <span>RMC PlayCast Studio — Live Worship & Broadcast Console</span>
              </div>
              <div className="w-10" />
            </div>

            {/* Dashboard Screenshot Mockup */}
            <div className="relative w-full aspect-[16/9] bg-slate-950 overflow-hidden">
              <img
                src="/dashboard-preview.jpg"
                alt="RMC PlayCast Church Presentation Dashboard"
                className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.015]"
                onError={(e) => {
                  // Fallback visual canvas if image not available
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />

              {/* Subtle glass reflection highlight */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-white/[0.04] pointer-events-none" />
              <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-b-2xl pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Bottom Feature Badges */}
        <div className="relative z-10 flex flex-wrap items-center gap-2 sm:gap-2.5 pt-2">
          {[
            { label: 'Lyrics & Scripture', icon: <Layers className="w-3.5 h-3.5 text-fuchsia-400" /> },
            { label: 'Live Overlays', icon: <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> },
            { label: 'OBS Outputs', icon: <Tv className="w-3.5 h-3.5 text-rose-400" /> },
            { label: 'Stage Display', icon: <MonitorPlay className="w-3.5 h-3.5 text-emerald-400" /> },
          ].map((pill) => (
            <div
              key={pill.label}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-white/10 bg-slate-900/70 backdrop-blur-md text-xs font-semibold text-slate-300 shadow-sm transition-colors hover:border-fuchsia-500/30 hover:text-white"
            >
              {pill.icon}
              <span>{pill.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* =========================================================================
          RIGHT COLUMN: Login Form Card
          ========================================================================= */}
      <div className="w-full lg:w-[44%] xl:w-[42%] flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16 bg-[#07090e]">
        {/* Top Spacer for symmetrical alignment */}
        <div className="hidden lg:block" />

        {/* Main Login Form Container */}
        <div className="w-full max-w-sm sm:max-w-md mx-auto my-auto">
          {/* Logo & Product Name */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-500 via-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-fuchsia-500/30">
              <Radio className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-extrabold text-white tracking-tight">
              RMC PlayCast
            </span>
          </div>

          {/* Welcome Heading */}
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back
            </h2>
            <p className="text-sm text-slate-400 mt-1.5">
              Sign in to your workspace to continue.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Banner */}
            {error && (
              <div className="flex items-start gap-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl px-4 py-3 text-xs sm:text-sm animate-in fade-in slide-in-from-top-2 duration-300">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Username / Email Field */}
            <div className="space-y-2">
              <label
                htmlFor="login-username"
                className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider"
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
                className="w-full bg-[#0d111a] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500/60 transition-all disabled:opacity-50"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label
                htmlFor="login-password"
                className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider"
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
                  className="w-full bg-[#0d111a] border border-white/10 rounded-xl px-4 py-3.5 pr-12 text-white placeholder:text-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500/60 transition-all disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Options Row: Keep Signed In + Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-1 select-none">
              <label className="flex items-center gap-2 text-slate-400 hover:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={keepSignedIn}
                  onChange={(e) => setKeepSignedIn(e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-[#0d111a] text-fuchsia-600 focus:ring-fuchsia-500 focus:ring-offset-0 cursor-pointer accent-fuchsia-600"
                />
                <span>Keep me signed in</span>
              </label>

              <button
                type="button"
                onClick={() => setIsForgotPasswordOpen(true)}
                className="text-slate-400 hover:text-fuchsia-400 transition-colors cursor-pointer font-medium"
              >
                Forgot password?
              </button>
            </div>

            {/* Sign In Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !username.trim() || !password}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-fuchsia-600/25 hover:shadow-fuchsia-600/40 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none cursor-pointer mt-2 text-sm"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing in…</span>
                </>
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight className="w-4 h-4 ml-0.5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="pt-8 text-center">
          <p className="text-slate-500 text-xs">
            RMC PlayCast &copy; {new Date().getFullYear()} — SRI Infy LLC. All rights reserved.
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Dialog open={isForgotPasswordOpen} onOpenChange={setIsForgotPasswordOpen}>
        <DialogContent className="max-w-md bg-slate-950 border border-white/10 text-slate-200 p-6">
          <DialogHeader className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-1">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <DialogTitle className="text-base font-bold text-white">
              Password Reset Assistance
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-xs text-slate-300 pt-2">
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
          <div className="pt-4 flex justify-end">
            <Button
              size="sm"
              onClick={() => setIsForgotPasswordOpen(false)}
              className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-xs"
            >
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
