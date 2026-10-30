import React, { useEffect, useState } from 'react';
import { apiAdminDashboard, type AdminDashboardData } from '@/lib/api';
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  Shield,
  Activity,
  UserPlus,
  Server,
  Sparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function AdminDashboard() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    apiAdminDashboard().then((res) => {
      if (res.success && res.data) setData(res.data);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="w-8 h-8 border-2 border-fuchsia-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-6">
        <Server className="w-10 h-10 text-slate-600 mb-2" />
        <p className="text-sm font-semibold text-slate-300">Unable to load dashboard data</p>
        <p className="text-xs text-slate-500 mt-1">Please check your database connection or try logging in again.</p>
      </div>
    );
  }

  const capacityPercent = data.capacity.unlimited
    ? 0
    : data.capacity.max > 0
    ? Math.round((data.capacity.current / data.capacity.max) * 100)
    : 0;

  return (
    <div className="p-5 lg:p-8 space-y-5 max-w-7xl mx-auto">
      {/* Executive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-white tracking-tight">System Dashboard</h1>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Cloud DB
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Overview of SaaS operator accounts, licensing capacity, and security activity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => navigate('/admin/users')}
            className="h-8 text-xs font-semibold bg-fuchsia-600 hover:bg-fuchsia-500 text-white shadow-sm cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5 mr-1.5" />
            <span>Manage Users</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/admin/settings')}
            className="h-8 text-xs border-white/10 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer"
          >
            <span>License Policy</span>
          </Button>
        </div>
      </div>

      {/* Stats Grid: Sleek, Anti-Slop Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <StatCard
          icon={<Users className="w-4 h-4 text-slate-300" />}
          label="Total Accounts"
          value={data.totalUsers}
          subtext="Provisioned operators"
        />
        <StatCard
          icon={<UserCheck className="w-4 h-4 text-emerald-400" />}
          label="Active Accounts"
          value={data.activeUsers}
          badge={{ text: 'Active', color: 'emerald' }}
        />
        <StatCard
          icon={<UserX className="w-4 h-4 text-rose-400" />}
          label="Disabled"
          value={data.disabledUsers}
          subtext={data.disabledUsers > 0 ? 'Access suspended' : 'No accounts disabled'}
        />
        <StatCard
          icon={<Clock className="w-4 h-4 text-amber-400" />}
          label="Expired"
          value={data.expiredUsers}
          subtext={data.expiredUsers > 0 ? 'Requires renewal' : 'All accounts valid'}
        />
      </div>

      {/* Row 2: Capacity Gauge + Recently Registered */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Capacity Card */}
        <div className="bg-[#0c0f16] border border-white/10 rounded-xl p-4 sm:p-5 shadow-sm space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center text-fuchsia-400">
                <Shield className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs font-bold text-white tracking-wide">License & Capacity</h3>
            </div>
            <span className="text-[10px] font-semibold text-fuchsia-300 bg-fuchsia-950/40 border border-fuchsia-500/30 px-2 py-0.5 rounded-full">
              {data.capacity.tier}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span>Account Limit Policy:</span>
              <span className="text-white font-semibold">
                {data.capacity.unlimited
                  ? 'Unlimited Accounts Policy (0)'
                  : `${data.capacity.max} Accounts Fixed Cap`}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Currently In Use:</span>
              <span className="text-white font-semibold">
                {data.capacity.current} {data.capacity.current === 1 ? 'account' : 'accounts'}
              </span>
            </div>

            {!data.capacity.unlimited && data.capacity.max > 0 ? (
              <div className="pt-2">
                <div className="w-full bg-slate-900 border border-white/5 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      capacityPercent >= 90
                        ? 'bg-rose-500'
                        : capacityPercent >= 75
                        ? 'bg-amber-500'
                        : 'bg-fuchsia-500'
                    }`}
                    style={{ width: `${Math.min(capacityPercent, 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1.5">
                  <span>{data.capacity.max - data.capacity.current} remaining</span>
                  <span>{capacityPercent}% utilized</span>
                </div>
              </div>
            ) : (
              <div className="pt-1 flex items-center gap-2 text-[11px] text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Unlimited account capacity active — no hard limits applied.</span>
              </div>
            )}
          </div>
        </div>

        {/* Recently Registered Users */}
        <div className="bg-[#0c0f16] border border-white/10 rounded-xl p-4 sm:p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Users className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs font-bold text-white tracking-wide">Recent Operator Accounts</h3>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              {data.recentUsers.length} shown
            </span>
          </div>

          <div className="space-y-1.5">
            {data.recentUsers.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No operator accounts registered yet.</p>
            ) : (
              data.recentUsers.slice(0, 5).map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-900/40 border border-white/5 hover:border-white/10 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-6 h-6 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                      {u.name?.charAt(0)?.toUpperCase() || u.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate leading-tight">
                        {u.name || u.username}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">
                        @{u.username} • {u.email}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      u.status === 'ACTIVE'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                        : u.status === 'DISABLED'
                        ? 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                        : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {u.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Row 3: Security & Activity Audit Log */}
      <div className="bg-[#0c0f16] border border-white/10 rounded-xl p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Activity className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white tracking-wide">Security Audit Trail</h3>
              <p className="text-[10px] text-slate-500">Live access logs, credential changes, and system events</p>
            </div>
          </div>
          <span className="text-[10px] text-slate-500">
            {data.recentActivity.length} events logged
          </span>
        </div>

        <div className="overflow-x-auto rounded-lg border border-white/5">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/5 bg-slate-900/60 text-slate-400">
                <th className="text-left py-2 px-3 font-semibold text-[11px]">Timestamp</th>
                <th className="text-left py-2 px-3 font-semibold text-[11px]">User</th>
                <th className="text-left py-2 px-3 font-semibold text-[11px]">Action</th>
                <th className="text-left py-2 px-3 font-semibold text-[11px]">IP Address</th>
                <th className="text-left py-2 px-3 font-semibold text-[11px]">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.recentActivity.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500">
                    No security events recorded yet.
                  </td>
                </tr>
              ) : (
                data.recentActivity.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/30 transition-colors">
                    <td className="py-2 px-3 text-slate-400 font-mono text-[10px] whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('en-IN', {
                        dateStyle: 'short',
                        timeStyle: 'medium',
                      })}
                    </td>
                    <td className="py-2 px-3 text-white font-medium">
                      {log.username ? `@${log.username}` : 'System'}
                    </td>
                    <td className="py-2 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${getActionBadgeStyle(
                          log.action
                        )}`}
                      >
                        {formatActionLabel(log.action)}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-400 font-mono text-[10px]">
                      {log.ipAddress}
                    </td>
                    <td className="py-2 px-3 text-slate-400 text-[11px]">
                      {formatDetails(log.details)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  subtext,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  subtext?: string;
  badge?: { text: string; color: string };
}) {
  return (
    <div className="bg-[#0c0f16] border border-white/10 rounded-xl p-3.5 sm:p-4 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </span>
        <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center shrink-0">
          {icon}
        </div>
      </div>
      <div>
        <p className="text-2xl font-extrabold text-white tracking-tight">{value}</p>
        {subtext && <p className="text-[10px] text-slate-500 mt-0.5 truncate">{subtext}</p>}
        {badge && (
          <div className="flex items-center gap-1 mt-1 text-[10px] text-emerald-400 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>{badge.text}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function formatActionLabel(action: string): string {
  switch (action) {
    case 'LOGIN_SUCCESS':
      return 'Sign In';
    case 'LOGIN_FAILED':
      return 'Failed Login';
    case 'LOGIN_BLOCKED':
      return 'Blocked';
    case 'LOGOUT':
      return 'Sign Out';
    case 'USER_CREATED':
      return 'User Created';
    case 'USER_UPDATED':
      return 'User Updated';
    case 'USER_DELETED':
      return 'User Deleted';
    case 'USER_STATUS_CHANGE':
      return 'Status Changed';
    case 'PASSWORD_CHANGED':
      return 'Password Changed';
    case 'PASSWORD_RESET_ADMIN':
      return 'Admin Pass Reset';
    case 'SESSIONS_REVOKED':
      return 'Sessions Revoked';
    case 'LICENSE_UPDATED':
      return 'License Updated';
    default:
      return action.replace(/_/g, ' ');
  }
}

function getActionBadgeStyle(action: string): string {
  if (action.includes('SUCCESS') || action === 'USER_CREATED') {
    return 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30';
  }
  if (action.includes('FAILED') || action.includes('BLOCKED') || action.includes('DELETED')) {
    return 'bg-rose-500/15 text-rose-400 border border-rose-500/30';
  }
  if (action.includes('REVOKED') || action.includes('STATUS')) {
    return 'bg-amber-500/15 text-amber-400 border border-amber-500/30';
  }
  if (action.includes('PASSWORD')) {
    return 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30';
  }
  return 'bg-fuchsia-500/15 text-fuchsia-400 border border-fuchsia-500/30';
}

function formatDetails(details: Record<string, unknown> | null): string {
  if (!details || Object.keys(details).length === 0) return '—';
  if (details.username) return `Target: @${details.username}`;
  if (details.max_users !== undefined) return `Limit set to ${details.max_users}`;
  if (details.reason) return String(details.reason);
  if (details.status) return `Status: ${details.status}`;
  return JSON.stringify(details);
}
