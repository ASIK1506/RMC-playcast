import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { LayoutDashboard, Users, Settings, Radio, ArrowLeft, LogOut } from 'lucide-react';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-fuchsia-600/20 text-fuchsia-300 border border-fuchsia-500/30'
        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
    }`;

  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900/60 border-r border-white/5 flex flex-col shrink-0">
        {/* Branding */}
        <div className="p-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-fuchsia-500 to-indigo-600 flex items-center justify-center shadow-md">
              <Radio className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">RMC PlayCast</h2>
              <p className="text-[10px] text-slate-500 font-medium">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
          <NavLink to="/admin" end className={navLinkClass}>
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </NavLink>
          <NavLink to="/admin/users" className={navLinkClass}>
            <Users className="w-4 h-4" />
            User Management
          </NavLink>
          <NavLink to="/admin/settings" className={navLinkClass}>
            <Settings className="w-4 h-4" />
            License & Settings
          </NavLink>
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-white/5 space-y-1.5">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all w-full cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Studio
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all w-full cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 border-t border-white/5 bg-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-fuchsia-500 to-indigo-600 flex items-center justify-center text-xs font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.name || user?.username}</p>
              <p className="text-[10px] text-fuchsia-400 font-medium">Super Administrator</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
