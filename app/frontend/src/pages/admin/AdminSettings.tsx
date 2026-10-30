import React, { useEffect, useState } from 'react';
import {
  apiAdminGetSettings,
  apiAdminUpdateSettings,
  apiChangePassword,
  fetchSongs,
} from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
  Settings,
  Shield,
  Key,
  Users,
  Database,
  CheckCircle,
  AlertTriangle,
  Save,
  Server,
  Lock,
  Radio,
  Infinity,
} from 'lucide-react';

export default function AdminSettings() {
  const { user } = useAuth();

  // Settings State
  const [maxUsers, setMaxUsers] = useState<number>(10);
  const [isUnlimited, setIsUnlimited] = useState<boolean>(false);
  const [licenseTier, setLicenseTier] = useState<string>('Standard Church License');
  const [capacity, setCapacity] = useState<{ allowed: boolean; current: number; max: number; unlimited: boolean; tier: string } | null>(null);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status & Feedback States
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState<string | null>(null);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // System Stats
  const [totalSongsCount, setTotalSongsCount] = useState<number | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [settingsRes, songs] = await Promise.all([
          apiAdminGetSettings(),
          fetchSongs().catch(() => []),
        ]);

        if (settingsRes.success && settingsRes.data) {
          const max = settingsRes.data.max_users;
          setMaxUsers(max > 0 ? max : 10);
          setIsUnlimited(max === 0);
          setLicenseTier(settingsRes.data.license_tier || 'Standard Church License');
        }

        if (settingsRes.capacity) {
          setCapacity(settingsRes.capacity);
        }

        if (songs && Array.isArray(songs)) {
          setTotalSongsCount(songs.length);
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsSuccess(null);
    setSettingsError(null);

    const targetMax = isUnlimited ? 0 : Math.max(1, maxUsers);

    try {
      const res = await apiAdminUpdateSettings({
        max_users: targetMax,
        license_tier: licenseTier.trim() || 'Standard Church License',
      });

      if (!res.success) {
        setSettingsError(res.error || 'Failed to update license configuration');
        return;
      }

      setSettingsSuccess('License and capacity settings successfully saved.');
      if (res.capacity) {
        setCapacity(res.capacity);
      }
      setTimeout(() => setSettingsSuccess(null), 4000);
    } catch {
      setSettingsError('Network error while updating license');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess(null);
    setPasswordError(null);

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match');
      return;
    }

    setSavingPassword(true);

    try {
      const res = await apiChangePassword(currentPassword, newPassword);
      if (!res.success) {
        setPasswordError(res.error || 'Failed to update password');
        return;
      }

      setPasswordSuccess('Password successfully updated!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(null), 4000);
    } catch {
      setPasswordError('Network error while changing password');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="p-5 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-white/5">
        <h1 className="text-xl font-extrabold text-white tracking-tight">License & System Settings</h1>
        <p className="text-[13px] text-slate-500 mt-1">
          Configure church license capacity, manage security policies, and monitor system health.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: License & Capacity (2 spans) */}
        <div className="md:col-span-2 space-y-6">
          {/* License Configuration Box */}
          <div className="bg-[#0c0f16] border border-white/10 rounded-xl p-4 sm:p-5 shadow-sm space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center">
                <Users className="w-4 h-4 text-fuchsia-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">License Capacity Policy</h2>
                <p className="text-[11px] text-slate-500">Control operator account limits and subscription tier</p>
              </div>
            </div>

            {settingsSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{settingsSuccess}</span>
              </div>
            )}

            {settingsError && (
              <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{settingsError}</span>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-4">
              {/* License Tier */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">License Tier / Package Name</label>
                <input
                  type="text"
                  value={licenseTier}
                  onChange={(e) => setLicenseTier(e.target.value)}
                  placeholder="e.g. Standard Church License, Multi-Campus Edition"
                  className="w-full px-3 py-2 bg-[#0a0d14] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-fuchsia-500/60 transition"
                />
              </div>

              {/* Account Capacity Limit Toggle */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-300 block">User Account Limit</label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Fixed Limit Option */}
                  <label
                    onClick={() => setIsUnlimited(false)}
                    className={`p-3.5 rounded-lg border transition cursor-pointer flex flex-col justify-between ${
                      !isUnlimited
                        ? 'bg-fuchsia-950/20 border-fuchsia-500/40 text-white'
                        : 'bg-[#0a0d14] border-white/5 text-slate-400 hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold">Fixed User Cap</span>
                      <input
                        type="radio"
                        checked={!isUnlimited}
                        onChange={() => setIsUnlimited(false)}
                        className="text-fuchsia-600 focus:ring-0"
                      />
                    </div>
                    <p className="text-xs text-slate-400 leading-normal">
                      Limit total registered operator accounts to a specific number.
                    </p>
                  </label>

                  {/* Unlimited Option */}
                  <label
                    onClick={() => setIsUnlimited(true)}
                    className={`p-3.5 rounded-lg border transition cursor-pointer flex flex-col justify-between ${
                      isUnlimited
                        ? 'bg-fuchsia-950/20 border-fuchsia-500/40 text-white'
                        : 'bg-[#0a0d14] border-white/5 text-slate-400 hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 font-semibold text-sm">
                        <Infinity className="w-4 h-4 text-fuchsia-400" />
                        <span>Unlimited Accounts</span>
                      </div>
                      <input
                        type="radio"
                        checked={isUnlimited}
                        onChange={() => setIsUnlimited(true)}
                        className="text-fuchsia-600 focus:ring-0"
                      />
                    </div>
                    <p className="text-xs text-slate-400 leading-normal">
                      No restriction on operator accounts. Ideal for enterprise & large worship teams.
                    </p>
                  </label>
                </div>

                {/* Fixed Cap Number Input */}
                {!isUnlimited && (
                  <div className="pt-2">
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <input
                          type="number"
                          min="1"
                          max="10000"
                          value={maxUsers}
                          onChange={(e) => setMaxUsers(parseInt(e.target.value) || 1)}
                          className="w-full px-3 py-2 bg-[#0a0d14] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-fuchsia-500/60 transition font-mono"
                        />
                      </div>
                      <div className="flex gap-2">
                        {[5, 10, 25, 50].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setMaxUsers(preset)}
                            className={`px-3 py-2 text-xs font-semibold rounded-lg border transition cursor-pointer ${
                              maxUsers === preset
                                ? 'bg-fuchsia-600 border-fuchsia-500 text-white'
                                : 'bg-slate-800 border-white/10 text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Live Capacity Feedback */}
              {capacity && (
                <div className="p-3.5 rounded-lg bg-[#0a0d14] border border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Current Usage:</span>
                    <span className="font-bold text-white">
                      {capacity.unlimited ? `${capacity.current} accounts (Unlimited)` : `${capacity.current} of ${capacity.max} accounts (${Math.round((capacity.current / capacity.max) * 100)}%)`}
                    </span>
                  </div>
                  {!capacity.unlimited && (
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-fuchsia-500 transition-all duration-500"
                        style={{ width: `${Math.min(100, (capacity.current / capacity.max) * 100)}%` }}
                      />
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={savingSettings || loading}
                className="flex items-center justify-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold bg-fuchsia-600 hover:bg-fuchsia-500 text-white shadow-sm transition disabled:opacity-50 cursor-pointer w-full sm:w-auto"
              >
                <Save className="w-4 h-4" />
                <span>{savingSettings ? 'Saving Settings...' : 'Save License Policy'}</span>
              </button>
            </form>
          </div>

          {/* Change Super Admin Password */}
          <div className="bg-[#0c0f16] border border-white/10 rounded-xl p-4 sm:p-5 shadow-sm space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <Lock className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Change Super Admin Password</h2>
                <p className="text-[11px] text-slate-500">Update master security credentials for @{user?.username || 'admin'}</p>
              </div>
            </div>

            {passwordSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            {passwordError && (
              <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Current Password *</label>
                <input
                  required
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0a0d14] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500/60 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">New Password * (Min 8 chars)</label>
                  <input
                    required
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0a0d14] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500/60 transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Confirm New Password *</label>
                  <input
                    required
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0a0d14] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500/60 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={savingPassword}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-amber-600 hover:bg-amber-500 text-white transition disabled:opacity-50 cursor-pointer w-full sm:w-auto"
              >
                <Key className="w-4 h-4" />
                <span>{savingPassword ? 'Updating...' : 'Update Password'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: System & Architecture Info (1 span) */}
        <div className="space-y-6">
          {/* Cloud Database Info */}
          <div className="bg-[#0c0f16] border border-white/10 rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Database className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Cloud Database</h3>
                <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">Connected & Synced</span>
              </div>
            </div>

            <div className="space-y-3 pt-2 text-xs border-t border-white/5">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Database Engine</span>
                <span className="font-semibold text-white">MySQL 8.0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Total Worship Songs</span>
                <span className="font-bold text-fuchsia-400">
                  {totalSongsCount !== null ? `${totalSongsCount} Songs` : 'Loading...'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Tamil Bible DB</span>
                <span className="font-semibold text-emerald-400">31,102 Verses</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Shared Data Mode</span>
                <span className="font-semibold text-white">Multi-Operator Central</span>
              </div>
            </div>
          </div>

          {/* Architecture Guardrails Reminder */}
          <div className="bg-[#0c0f16] border border-white/10 rounded-xl p-4 sm:p-5 shadow-sm space-y-3 text-xs">
            <div className="flex items-center gap-2 text-slate-300 font-bold uppercase tracking-wider text-[10px]">
              <Shield className="w-3.5 h-3.5 text-fuchsia-400" />
              <span>SaaS Security Core</span>
            </div>
            <ul className="space-y-2 text-slate-400 leading-relaxed list-disc list-inside">
              <li>Authentication is strictly enforced on the PHP backend via cryptographically secure session tokens.</li>
              <li>Each user has individual credentials and session audit trails.</li>
              <li>Super Admin can remotely revoke sessions and enforce immediate lockouts.</li>
              <li>Database holds all song lyrics and playlist states centrally.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
