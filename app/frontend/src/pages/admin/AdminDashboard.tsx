import React, { useEffect, useState } from 'react';
import { apiAdminDashboard, type AdminDashboardData } from '@/lib/api';
import { Users, UserCheck, UserX, Clock, Shield, Activity, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiAdminDashboard().then((res) => {
      if (res.success && res.data) setData(res.data);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-fuchsia-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-slate-400">Failed to load dashboard data.</p>
      </div>
    );
  }

  const capacityPercent = data.capacity.unlimited
    ? 0
    : data.capacity.max > 0
    ? Math.round((data.capacity.current / data.capacity.max) * 100)
    : 0;

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-sm text-slate-400 mt-1">System overview and recent activity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Users" value={data.totalUsers} color="fuchsia" />
        <StatCard icon={UserCheck} label="Active" value={data.activeUsers} color="emerald" />
        <StatCard icon={UserX} label="Disabled" value={data.disabledUsers} color="red" />
        <StatCard icon={Clock} label="Expired" value={data.expiredUsers} color="amber" />
      </div>

      {/* Capacity Gauge + License */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-fuchsia-400" />
            <h3 className="text-sm font-bold text-white">License & Capacity</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">License Tier</span>
              <span className="text-fuchsia-300 font-semibold">{data.capacity.tier}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">User Capacity</span>
              <span className="text-white font-semibold">
                {data.capacity.unlimited
                  ? '∞ Unlimited'
                  : `${data.capacity.current} / ${data.capacity.max}`}
              </span>
            </div>
            {!data.capacity.unlimited && data.capacity.max > 0 && (
              <div className="pt-1">
                <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      capacityPercent >= 90
                        ? 'bg-red-500'
                        : capacityPercent >= 70
                        ? 'bg-amber-500'
                        : 'bg-fuchsia-500'
                    }`}
                    style={{ width: `${Math.min(capacityPercent, 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1 text-right">{capacityPercent}% used</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Recently Registered</h3>
          </div>
          <div className="space-y-2">
            {data.recentUsers.length === 0 ? (
              <p className="text-xs text-slate-500">No users registered yet.</p>
            ) : (
              data.recentUsers.map((u) => (
                <div key={u.id} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                      {u.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-white truncate">{u.name || u.username}</p>
                      <p className="text-[10px] text-slate-500 truncate">{u.email}</p>
                    </div>
                  </div>
                  <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                    u.status === 'ACTIVE' ? 'bg-emerald-500/15 text-emerald-400' :
                    u.status === 'DISABLED' ? 'bg-red-500/15 text-red-400' :
                    'bg-amber-500/15 text-amber-400'
                  }`}>
                    {u.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Audit Log */}
      <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-bold text-white">Recent Activity Log</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/5 text-slate-400">
                <th className="text-left py-2 px-2 font-semibold">Time</th>
                <th className="text-left py-2 px-2 font-semibold">User</th>
                <th className="text-left py-2 px-2 font-semibold">Action</th>
                <th className="text-left py-2 px-2 font-semibold">IP</th>
                <th className="text-left py-2 px-2 font-semibold">Details</th>
              </tr>
            </thead>
            <tbody>
              {data.recentActivity.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-slate-500">
                    No activity recorded yet.
                  </td>
                </tr>
              ) : (
                data.recentActivity.map((log) => (
                  <tr key={log.id} className="border-b border-white/5 hover:bg-slate-800/30 transition-colors">
                    <td className="py-2 px-2 text-slate-400 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="py-2 px-2 text-white font-medium">{log.username || '—'}</td>
                    <td className="py-2 px-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-slate-400 font-mono text-[10px]">{log.ipAddress}</td>
                    <td className="py-2 px-2 text-slate-500 max-w-[200px] truncate">
                      {log.details && Object.keys(log.details).length > 0 ? JSON.stringify(log.details) : '—'}
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

function StatCard({ icon: Icon, label, value, color }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number; color: string }) {
  const colorMap: Record<string, string> = {
    fuchsia: 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    red: 'bg-red-500/10 text-red-400 border-red-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };
  const iconColorMap: Record<string, string> = {
    fuchsia: 'text-fuchsia-400',
    emerald: 'text-emerald-400',
    red: 'text-red-400',
    amber: 'text-amber-400',
  };

  return (
    <div className={`rounded-2xl border p-5 ${colorMap[color] || colorMap.fuchsia}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400 mb-1">{label}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
        </div>
        <Icon className={`w-8 h-8 ${iconColorMap[color] || iconColorMap.fuchsia} opacity-60`} />
      </div>
    </div>
  );
}

function getActionColor(action: string): string {
  if (action.includes('LOGIN_SUCCESS')) return 'bg-emerald-500/15 text-emerald-400';
  if (action.includes('LOGIN_FAILED') || action.includes('LOGIN_BLOCKED')) return 'bg-red-500/15 text-red-400';
  if (action.includes('CREATED')) return 'bg-blue-500/15 text-blue-400';
  if (action.includes('DISABLED') || action.includes('REVOKED')) return 'bg-amber-500/15 text-amber-400';
  if (action.includes('PASSWORD')) return 'bg-indigo-500/15 text-indigo-400';
  if (action.includes('LICENSE') || action.includes('UPDATED')) return 'bg-fuchsia-500/15 text-fuchsia-400';
  return 'bg-slate-500/15 text-slate-400';
}
