import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Settings,
  Radio,
  ArrowLeft,
  LogOut,
  Shield,
} from 'lucide-react';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
      isActive
        ? 'bg-fuchsia-600/15 text-fuchsia-300 border border-fuchsia-500/30 shadow-sm'
        : 'text-slate-400 hover:text-white hover:bg-white/5'
    }`;

  return (
    <div className="flex h-screen bg-[#07090e] text-white selection:bg-fuchsia-600 selection:text-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 bg-[#0b0e15] border-r border-white/10 flex flex-col shrink-0">
        {/* Branding */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-fuchsia-500 via-purple-600 to-indigo-600 flex items-center justify-center shadow-md shadow-fuchsia-500/20 shrink-0">
                <Radio className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0">
                <h2 className="text-xs font-bold text-white tracking-tight truncate">
                  RMC PlayCast
                </h2>
                <p className="text-[10px] text-slate-500 font-medium">Administration</p>
              </div>
            </div>
            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30 uppercase tracking-wider">
              SAAS
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2.5 space-y-1 overflow-y-auto">
          <div className="px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-500">
            Control Center
          </div>
          <NavLink to="/admin" end className={navLinkClass}>
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/admin/users" className={navLinkClass}>
            <Users className="w-3.5 h-3.5" />
            <span>User Management</span>
          </NavLink>
          <NavLink to="/admin/settings" className={navLinkClass}>
            <Settings className="w-3.5 h-3.5" />
            <span>License & System</span>
          </NavLink>
        </nav>

        {/* Bottom Actions */}
        <div className="p-2.5 border-t border-white/10 space-y-1">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all w-full cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-fuchsia-400" />
            <span>Return to Studio</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all w-full cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* User Info */}
        <div className="p-3 border-t border-white/10 bg-black/20">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-fuchsia-500 to-indigo-600 flex items-center justify-center text-[11px] font-bold shadow-sm shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">
                {user?.name || user?.username || 'Super Admin'}
              </p>
              <p className="text-[9px] text-fuchsia-300/80 font-medium truncate flex items-center gap-1">
                <Shield className="w-2.5 h-2.5" />
                <span>Super Administrator</span>
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-[#07090e]">
        <Outlet />
      </main>
    </div>
  );
}
