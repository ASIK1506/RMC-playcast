import React, { useEffect, useState, useCallback } from 'react';
import {
  apiAdminGetUsers,
  apiAdminCreateUser,
  apiAdminUpdateUser,
  apiAdminSetUserStatus,
  apiAdminResetPassword,
  apiAdminRevokeSessions,
  apiAdminDeleteUser,
  type AdminUser,
} from '@/lib/api';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  MoreVertical,
  Shield,
  User,
  Key,
  LogOut,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  Eye,
  EyeOff,
} from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [capacity, setCapacity] = useState<{ allowed: boolean; current: number; max: number; unlimited: boolean; tier: string } | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isResetPassOpen, setIsResetPassOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [activeMenuUserId, setActiveMenuUserId] = useState<string | null>(null);

  // Form states
  const [createForm, setCreateForm] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    expiresAt: '',
    notes: '',
  });
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    expiresAt: '',
    notes: '',
  });
  const [resetPassForm, setResetPassForm] = useState({
    password: '',
    mustChange: true,
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [tempPassResult, setTempPassResult] = useState<string | null>(null);
  const [copiedTempPass, setCopiedTempPass] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiAdminGetUsers({
        q: search,
        status: statusFilter,
        page,
        limit: 15,
      });
      if (res.success && res.data) {
        setUsers(res.data);
        if (res.pagination) {
          setTotalPages(res.pagination.totalPages);
          setTotalCount(res.pagination.total);
        }
        if (res.capacity) {
          setCapacity(res.capacity);
        }
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Handle Create User
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);

    try {
      const res = await apiAdminCreateUser({
        name: createForm.name.trim(),
        username: createForm.username.trim(),
        email: createForm.email.trim(),
        phone: createForm.phone.trim() || undefined,
        password: createForm.password || undefined,
        expiresAt: createForm.expiresAt || undefined,
        notes: createForm.notes.trim() || undefined,
      });

      if (!res.success) {
        setFormError(res.error || 'Failed to create user');
        setFormLoading(false);
        return;
      }

      if (res.temporaryPassword) {
        setTempPassResult(res.temporaryPassword);
      } else {
        setIsCreateOpen(false);
        resetCreateForm();
      }
      loadUsers();
    } catch {
      setFormError('Network error while creating user');
    } finally {
      setFormLoading(false);
    }
  };

  const resetCreateForm = () => {
    setCreateForm({
      name: '',
      username: '',
      email: '',
      phone: '',
      password: '',
      expiresAt: '',
      notes: '',
    });
    setTempPassResult(null);
    setFormError(null);
  };

  // Handle Edit User
  const openEditModal = (u: AdminUser) => {
    setSelectedUser(u);
    setEditForm({
      name: u.name,
      email: u.email,
      phone: u.phone || '',
      expiresAt: u.expiresAt ? u.expiresAt.substring(0, 10) : '',
      notes: u.notes || '',
    });
    setFormError(null);
    setIsEditOpen(true);
    setActiveMenuUserId(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setFormError(null);
    setFormLoading(true);

    try {
      const res = await apiAdminUpdateUser(selectedUser.id, {
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        phone: editForm.phone.trim() || undefined,
        expiresAt: editForm.expiresAt || null,
        notes: editForm.notes.trim() || undefined,
      });

      if (!res.success) {
        setFormError(res.error || 'Failed to update user');
        setFormLoading(false);
        return;
      }

      setIsEditOpen(false);
      loadUsers();
    } catch {
      setFormError('Network error while updating user');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle Toggle Status
  const handleToggleStatus = async (u: AdminUser) => {
    setActiveMenuUserId(null);
    const newStatus = u.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    try {
      const res = await apiAdminSetUserStatus(u.id, newStatus);
      if (res.success) {
        loadUsers();
      } else {
        alert(res.error || 'Failed to update user status');
      }
    } catch {
      alert('Network error while toggling status');
    }
  };

  // Handle Reset Password
  const openResetPassModal = (u: AdminUser) => {
    setSelectedUser(u);
    setResetPassForm({ password: '', mustChange: true });
    setFormError(null);
    setIsResetPassOpen(true);
    setActiveMenuUserId(null);
  };

  const handleResetPassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    if (resetPassForm.password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return;
    }
    setFormLoading(true);
    setFormError(null);

    try {
      const res = await apiAdminResetPassword(
        selectedUser.id,
        resetPassForm.password,
        resetPassForm.mustChange
      );
      if (!res.success) {
        setFormError(res.error || 'Failed to reset password');
        setFormLoading(false);
        return;
      }
      setIsResetPassOpen(false);
      alert('Password updated successfully. Active sessions revoked.');
      loadUsers();
    } catch {
      setFormError('Network error while resetting password');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle Revoke Sessions
  const handleRevokeSessions = async (u: AdminUser) => {
    setActiveMenuUserId(null);
    if (!confirm(`Are you sure you want to sign out ${u.username} from all devices?`)) return;

    try {
      const res = await apiAdminRevokeSessions(u.id);
      if (res.success) {
        alert('All active sessions for ' + u.username + ' have been terminated.');
        loadUsers();
      } else {
        alert(res.error || 'Failed to revoke sessions');
      }
    } catch {
      alert('Network error while revoking sessions');
    }
  };

  // Handle Delete User
  const openDeleteModal = (u: AdminUser) => {
    setSelectedUser(u);
    setIsDeleteOpen(true);
    setActiveMenuUserId(null);
  };

  const handleDeleteSubmit = async () => {
    if (!selectedUser) return;
    setFormLoading(true);

    try {
      const res = await apiAdminDeleteUser(selectedUser.id);
      if (!res.success) {
        alert(res.error || 'Failed to delete user');
        setFormLoading(false);
        return;
      }
      setIsDeleteOpen(false);
      loadUsers();
    } catch {
      alert('Network error while deleting user');
    } finally {
      setFormLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTempPass(true);
    setTimeout(() => setCopiedTempPass(false), 2000);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-white tracking-tight">User Management</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-fuchsia-950/80 text-fuchsia-300 border border-fuchsia-500/30">
              {totalCount} Total
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Manage operator accounts, provision credentials, and monitor access sessions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadUsers()}
            className="p-2.5 rounded-xl bg-slate-900 border border-white/10 text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-fuchsia-400' : ''}`} />
          </button>

          <button
            onClick={() => {
              resetCreateForm();
              setIsCreateOpen(true);
            }}
            disabled={capacity ? !capacity.allowed : false}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-lg cursor-pointer ${
              capacity && !capacity.allowed
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
                : 'bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white shadow-fuchsia-600/30'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            Add New User
          </button>
        </div>
      </div>

      {/* Capacity Warning Banner if nearing or reached limit */}
      {capacity && (
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${capacity.unlimited || capacity.allowed ? 'bg-emerald-400' : 'bg-rose-500 animate-pulse'}`} />
            <div>
              <span className="text-sm font-semibold text-slate-200">
                License Capacity: {capacity.unlimited ? 'Unlimited Accounts' : `${capacity.current} / ${capacity.max} Accounts Used`}
              </span>
              <span className="text-xs text-slate-400 ml-2">({capacity.tier})</span>
            </div>
          </div>
          {!capacity.unlimited && (
            <div className="w-full sm:w-48 bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  capacity.current >= capacity.max ? 'bg-rose-500' : 'bg-gradient-to-r from-fuchsia-500 to-indigo-500'
                }`}
                style={{ width: `${Math.min(100, (capacity.current / capacity.max) * 100)}%` }}
              />
            </div>
          )}
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name, username, or email..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-fuchsia-500 transition"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="bg-slate-900/80 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-fuchsia-500 transition cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="DISABLED">Disabled Only</option>
            <option value="EXPIRED">Expired Only</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/90 text-xs uppercase tracking-wider text-slate-400 border-b border-white/5">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Active Sessions</th>
                <th className="px-6 py-4">Last Login</th>
                <th className="px-6 py-4">Expires</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-fuchsia-400" />
                    Loading accounts...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    No users found matching your search criteria.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isSuperAdmin = u.role === 'SUPER_ADMIN';
                  const isActive = u.status === 'ACTIVE';
                  const isExpired = u.status === 'EXPIRED';

                  return (
                    <tr key={u.id} className="hover:bg-slate-800/40 transition">
                      {/* Name & Username */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                              isSuperAdmin
                                ? 'bg-gradient-to-br from-fuchsia-600 to-indigo-600 text-white'
                                : 'bg-slate-800 text-slate-300 border border-white/10'
                            }`}
                          >
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-white truncate flex items-center gap-1.5">
                              {u.name}
                              {u.mustChangePassword && (
                                <span className="text-[10px] text-amber-400 bg-amber-950/60 border border-amber-500/30 px-1.5 py-0.2 rounded" title="Must change password on next login">
                                  Temp Pass
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-400 truncate">
                              @{u.username} • {u.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                            isSuperAdmin
                              ? 'bg-fuchsia-950/60 text-fuchsia-300 border border-fuchsia-500/30'
                              : 'bg-slate-800 text-slate-300 border border-white/5'
                          }`}
                        >
                          {isSuperAdmin ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                          {isSuperAdmin ? 'Super Admin' : 'Operator'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            isActive
                              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                              : isExpired
                              ? 'bg-amber-950/60 text-amber-400 border border-amber-500/30'
                              : 'bg-rose-950/60 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isActive ? 'bg-emerald-400' : isExpired ? 'bg-amber-400' : 'bg-rose-400'
                            }`}
                          />
                          {u.status}
                        </span>
                      </td>

                      {/* Active Sessions */}
                      <td className="px-6 py-4">
                        {u.activeSessions > 0 ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-500/20">
                            {u.activeSessions} active
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500">None</span>
                        )}
                      </td>

                      {/* Last Login */}
                      <td className="px-6 py-4 text-xs text-slate-400">
                        {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : 'Never'}
                      </td>

                      {/* Expiration */}
                      <td className="px-6 py-4 text-xs text-slate-400">
                        {u.expiresAt ? (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            {new Date(u.expiresAt).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-slate-500">Permanent</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right relative">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(u)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
                            title="Edit User"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <div className="relative">
                            <button
                              onClick={() => setActiveMenuUserId(activeMenuUserId === u.id ? null : u.id)}
                              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {/* Dropdown Menu */}
                            {activeMenuUserId === u.id && (
                              <div
                                className="absolute right-0 mt-1 w-48 bg-slate-950 border border-white/10 rounded-xl shadow-2xl z-30 py-1.5 text-left text-xs"
                                onMouseLeave={() => setActiveMenuUserId(null)}
                              >
                                {!isSuperAdmin && (
                                  <button
                                    onClick={() => handleToggleStatus(u)}
                                    className="w-full px-3.5 py-2 flex items-center gap-2 hover:bg-white/5 text-slate-200 transition cursor-pointer"
                                  >
                                    {isActive ? (
                                      <>
                                        <XCircle className="w-3.5 h-3.5 text-rose-400" />
                                        <span>Deactivate Account</span>
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                                        <span>Activate Account</span>
                                      </>
                                    )}
                                  </button>
                                )}

                                <button
                                  onClick={() => openResetPassModal(u)}
                                  className="w-full px-3.5 py-2 flex items-center gap-2 hover:bg-white/5 text-slate-200 transition cursor-pointer"
                                >
                                  <Key className="w-3.5 h-3.5 text-amber-400" />
                                  <span>Reset Password</span>
                                </button>

                                {u.activeSessions > 0 && (
                                  <button
                                    onClick={() => handleRevokeSessions(u)}
                                    className="w-full px-3.5 py-2 flex items-center gap-2 hover:bg-white/5 text-slate-200 transition cursor-pointer"
                                  >
                                    <LogOut className="w-3.5 h-3.5 text-indigo-400" />
                                    <span>Revoke All Sessions</span>
                                  </button>
                                )}

                                {!isSuperAdmin && (
                                  <>
                                    <div className="border-t border-white/5 my-1" />
                                    <button
                                      onClick={() => openDeleteModal(u)}
                                      className="w-full px-3.5 py-2 flex items-center gap-2 hover:bg-red-500/10 text-rose-400 hover:text-rose-300 transition cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      <span>Delete Account</span>
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-slate-900/80 border-t border-white/5 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Page {page} of {totalPages} ({totalCount} total)
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-medium text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-medium text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ==================== CREATE USER MODAL ==================== */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-600 to-indigo-600 flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Create User Account</h3>
                  <p className="text-xs text-slate-400">Add an operator with individual login credentials</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* If Temporary Password Result Screen */}
            {tempPassResult ? (
              <div className="p-6 space-y-4">
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-emerald-300">Account Created Successfully</h4>
                    <p className="text-xs text-emerald-400/80">
                      Share the temporary password below with the operator. They will be prompted to change it upon first login.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-white/10 space-y-2">
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Temporary Password</span>
                  <div className="flex items-center justify-between bg-black/40 p-3 rounded-lg border border-white/5">
                    <code className="text-base font-mono font-bold text-fuchsia-300">{tempPassResult}</code>
                    <button
                      onClick={() => copyToClipboard(tempPassResult)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-xs font-semibold transition cursor-pointer"
                    >
                      {copiedTempPass ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedTempPass ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsCreateOpen(false);
                    resetCreateForm();
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold transition cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
                {formError && (
                  <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Full Name *</label>
                    <input
                      required
                      type="text"
                      value={createForm.name}
                      onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                      placeholder="e.g. John Doe"
                      className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-fuchsia-500"
                    />
                  </div>

                  {/* Username */}
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Username *</label>
                    <input
                      required
                      type="text"
                      value={createForm.username}
                      onChange={(e) => setCreateForm({ ...createForm, username: e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, '') })}
                      placeholder="e.g. jdoe"
                      className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-fuchsia-500"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Email Address *</label>
                  <input
                    required
                    type="email"
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    placeholder="e.g. operator@church.org"
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-fuchsia-500"
                  />
                </div>

                {/* Optional Phone & Expiration */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Phone Number (Optional)</label>
                    <input
                      type="text"
                      value={createForm.phone}
                      onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                      placeholder="+91 9876543210"
                      className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-fuchsia-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Account Expiry (Optional)</label>
                    <input
                      type="date"
                      value={createForm.expiresAt}
                      onChange={(e) => setCreateForm({ ...createForm, expiresAt: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-fuchsia-500"
                    />
                  </div>
                </div>

                {/* Password (Optional - auto generated if empty) */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Password <span className="text-slate-500 font-normal">(Leave empty to auto-generate temporary password)</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={createForm.password}
                      onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                      placeholder="Optional custom password (min. 6 chars)"
                      className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-fuchsia-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Admin Notes (Optional)</label>
                  <input
                    type="text"
                    value={createForm.notes}
                    onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
                    placeholder="e.g. Media team member, youth pastor"
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-fuchsia-500"
                  />
                </div>

                {/* Footer Buttons */}
                <div className="pt-2 flex items-center justify-end gap-3 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="px-5 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white shadow-lg shadow-fuchsia-600/30 transition disabled:opacity-50 cursor-pointer"
                  >
                    {formLoading ? 'Creating...' : 'Create Account'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ==================== EDIT USER MODAL ==================== */}
      {isEditOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center">
                  <Edit2 className="w-5 h-5 text-fuchsia-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Edit User Profile</h3>
                  <p className="text-xs text-slate-400">@{selectedUser.username}</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Full Name *</label>
                <input
                  required
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-fuchsia-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Email Address *</label>
                <input
                  required
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-fuchsia-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-fuchsia-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Account Expiration</label>
                  <input
                    type="date"
                    value={editForm.expiresAt}
                    onChange={(e) => setEditForm({ ...editForm, expiresAt: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-fuchsia-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Notes</label>
                <input
                  type="text"
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-fuchsia-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2 rounded-xl text-sm font-semibold bg-fuchsia-600 hover:bg-fuchsia-500 text-white transition disabled:opacity-50 cursor-pointer"
                >
                  {formLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== RESET PASSWORD MODAL ==================== */}
      {isResetPassOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-950/60 border border-amber-500/30 flex items-center justify-center">
                  <Key className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Reset Password</h3>
                  <p className="text-xs text-slate-400">For {selectedUser.name} (@{selectedUser.username})</p>
                </div>
              </div>
              <button
                onClick={() => setIsResetPassOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleResetPassSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">New Password *</label>
                <input
                  required
                  type="password"
                  value={resetPassForm.password}
                  onChange={(e) => setResetPassForm({ ...resetPassForm, password: e.target.value })}
                  placeholder="Min 6 characters"
                  className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={resetPassForm.mustChange}
                  onChange={(e) => setResetPassForm({ ...resetPassForm, mustChange: e.target.checked })}
                  className="rounded border-white/20 bg-slate-900 text-amber-500 focus:ring-0"
                />
                Require user to change password on next sign-in
              </label>

              <div className="p-3 rounded-xl bg-slate-900 border border-white/5 text-[11px] text-slate-400">
                Resetting password will immediately invalidate all currently active sessions on all devices for this account.
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsResetPassOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2 rounded-xl text-sm font-semibold bg-amber-600 hover:bg-amber-500 text-white transition disabled:opacity-50 cursor-pointer"
                >
                  {formLoading ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== DELETE USER CONFIRMATION MODAL ==================== */}
      {isDeleteOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-white/10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-950/60 border border-rose-500/30 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Delete User Account</h3>
                <p className="text-xs text-rose-400/80">Permanent Action</p>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-300">
                Are you sure you want to permanently delete the account for <strong className="text-white">{selectedUser.name}</strong> (@{selectedUser.username})?
              </p>
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/20 text-xs text-rose-300/90">
                This will revoke all active sessions and permanently remove their user credentials. Songs and media created by the church remain intact.
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsDeleteOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteSubmit}
                  disabled={formLoading}
                  className="px-5 py-2 rounded-xl text-sm font-semibold bg-rose-600 hover:bg-rose-500 text-white transition disabled:opacity-50 cursor-pointer"
                >
                  {formLoading ? 'Deleting...' : 'Delete Permanently'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
