import type { WorshipSong, ServiceSection } from '@/types/playcast';

const envApiUrl = (import.meta.env.VITE_API_BASE_URL || '').trim();
export const API_BASE = envApiUrl ? envApiUrl.replace(/\/+$/, '') : '/api';

export function getApiUrl(endpoint: string): string {
  const clean = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  if (API_BASE.endsWith('/api') && clean.startsWith('/api/')) {
    return `${API_BASE}${clean.substring(4)}`;
  }
  return `${API_BASE}${clean}`;
}

export async function fetchHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    return await res.json();
  } catch (err) {
    console.warn('Backend offline, using local state:', err);
    return null;
  }
}

// ----------------- SONGS API -----------------
export async function fetchSongs(): Promise<WorshipSong[]> {
  try {
    const res = await fetch(`${API_BASE}/songs`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.warn('Failed to fetch songs from PHP backend, using local fallback:', err);
    return [];
  }
}

export async function saveSong(song: WorshipSong): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/songs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(song),
    });
    return res.ok;
  } catch (err) {
    console.error('Failed to save song to PHP backend:', err);
    return false;
  }
}

export async function deleteSong(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/songs?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (err) {
    console.error('Failed to delete song:', err);
    return false;
  }
}

// ----------------- SERVICES API -----------------
export async function fetchServices(): Promise<
  { id: string; name: string; isActive: boolean; sections: ServiceSection[] }[]
> {
  try {
    const res = await fetch(`${API_BASE}/services`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.warn('Failed to fetch services from PHP backend:', err);
    return [];
  }
}

export async function saveService(service: {
  id: string;
  name: string;
  isActive?: boolean;
  sections: ServiceSection[];
}): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/services`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(service),
    });
    return res.ok;
  } catch (err) {
    console.error('Failed to save service to PHP backend:', err);
    return false;
  }
}

// ----------------- LIVE STATE SYNC -----------------
export async function postLiveBroadcastState(state: any): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/live`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ----------------- BIBLE API -----------------
export interface ApiBibleBook {
  id: number;
  name: string;
  nameTamil: string;
  chapters: number;
  testament: 'old' | 'new';
}

export interface ApiBibleVerse {
  verse: number;
  text: string;
}

export async function fetchBibleBooks(): Promise<ApiBibleBook[]> {
  try {
    const res = await fetch(`${API_BASE}/bible/books`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.warn('Using local fallback for Bible books:', err);
    return [];
  }
}

export async function fetchBibleChapter(
  bookId: number,
  chapter: number
): Promise<ApiBibleVerse[]> {
  try {
    const res = await fetch(
      `${API_BASE}/bible/chapter?bookId=${bookId}&chapter=${chapter}`
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.warn('Failed to fetch chapter from backend:', err);
    return [];
  }
}

export async function searchBibleApi(query: string): Promise<
  {
    bookId: number;
    book: string;
    bookTamil: string;
    chapter: number;
    verse: number;
    text: string;
    reference: string;
  }[]
> {
  try {
    const res = await fetch(
      `${API_BASE}/bible/search?q=${encodeURIComponent(query)}`
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.warn('Failed to search Bible from backend:', err);
    return [];
  }
}

// ----------------- BACKGROUNDS API -----------------
export interface ApiBackground {
  id: string;
  name: string;
  type: 'gradient' | 'solid' | 'transparent' | 'image' | 'video';
  gradientFrom?: string | null;
  gradientTo?: string | null;
  color?: string | null;
  imageUrl?: string | null;
  videoUrl?: string | null;
  isDefault?: boolean;
}

export async function fetchBackgrounds(): Promise<ApiBackground[]> {
  try {
    const res = await fetch(`${API_BASE}/backgrounds`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.warn('Failed to fetch backgrounds from backend:', err);
    return [];
  }
}

export async function saveBackground(bg: ApiBackground): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/backgrounds`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bg),
    });
    return res.ok;
  } catch (err) {
    console.error('Failed to save background to backend:', err);
    return false;
  }
}

export async function deleteBackground(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/backgrounds?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (err) {
    console.error('Failed to delete background:', err);
    return false;
  }
}

// ----------------- TEMPLATES API -----------------
export interface ApiTemplate {
  id: string;
  name: string;
  description?: string;
  layoutType: 'fullscreen' | 'lower-third' | 'box' | 'trendy' | 'minimal';
  config?: any;
  isDefault?: boolean;
}

export async function fetchTemplates(): Promise<ApiTemplate[]> {
  try {
    const res = await fetch(`${API_BASE}/templates`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.warn('Failed to fetch templates from backend:', err);
    return [];
  }
}

export async function saveTemplate(tpl: ApiTemplate): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/templates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tpl),
    });
    return res.ok;
  } catch (err) {
    console.error('Failed to save template to backend:', err);
    return false;
  }
}

// ----------------- MEDIA API -----------------
export interface ApiMediaItem {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio';
  url: string;
  size: number;
  createdAt?: string;
}

export async function fetchMedia(): Promise<ApiMediaItem[]> {
  try {
    const res = await fetch(`${API_BASE}/media`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.warn('Failed to fetch media from backend:', err);
    return [];
  }
}

export async function uploadMedia(file: File): Promise<ApiMediaItem | null> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/media/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error(`Upload failed HTTP ${res.status}`);
    const json = await res.json();
    return json.data || null;
  } catch (err) {
    console.error('Failed to upload media to backend:', err);
    return null;
  }
}

export async function deleteMedia(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/media?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (err) {
    console.error('Failed to delete media:', err);
    return false;
  }
}

// ==================== AUTHENTICATION API ====================

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  name: string;
  phone?: string;
  role: 'SUPER_ADMIN' | 'USER';
  status: 'ACTIVE' | 'DISABLED' | 'EXPIRED';
  mustChangePassword?: boolean;
  expiresAt?: string | null;
  lastLoginAt?: string | null;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  expiresAt?: string;
  user?: AuthUser;
  error?: string;
}

// Token management — stored in memory + localStorage for persistence across reloads
let _authToken: string | null = null;

export function getAuthToken(): string | null {
  if (_authToken) return _authToken;
  try {
    _authToken = localStorage.getItem('playcast_auth_token');
  } catch {
    // ignore
  }
  return _authToken;
}

export function setAuthToken(token: string | null): void {
  _authToken = token;
  try {
    if (token) {
      localStorage.setItem('playcast_auth_token', token);
    } else {
      localStorage.removeItem('playcast_auth_token');
    }
  } catch {
    // ignore
  }
}

export function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken();
  if (token) {
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  }
  return { 'Content-Type': 'application/json' };
}

// --- Auth Endpoints ---

export async function apiLogin(username: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const json = await res.json();
  if (json.success && json.token) {
    setAuthToken(json.token);
  }
  return json;
}

export async function apiLogout(): Promise<void> {
  try {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
  } catch {
    // ignore network errors on logout
  }
  setAuthToken(null);
}

export async function apiGetMe(): Promise<{ success: boolean; user?: AuthUser }> {
  const token = getAuthToken();
  if (!token) return { success: false };
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      if (res.status === 401) setAuthToken(null);
      return { success: false };
    }
    return await res.json();
  } catch {
    return { success: false };
  }
}

export async function apiChangePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  const res = await fetch(`${API_BASE}/auth/change-password`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  return await res.json();
}

// ==================== ADMIN API ====================

export interface AdminDashboardData {
  totalUsers: number;
  activeUsers: number;
  disabledUsers: number;
  expiredUsers: number;
  capacity: { allowed: boolean; current: number; max: number; unlimited: boolean; tier: string };
  recentUsers: Array<{ id: string; username: string; email: string; name: string; role: string; status: string; created_at: string; last_login_at: string | null }>;
  recentActivity: Array<{ id: number; userId: string | null; username: string; action: string; details: Record<string, unknown>; ipAddress: string; createdAt: string }>;
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  name: string;
  phone?: string;
  role: string;
  status: string;
  mustChangePassword: boolean;
  expiresAt?: string | null;
  notes?: string | null;
  activeSessions: number;
  lastLoginAt?: string | null;
  createdAt: string;
}

export async function apiAdminDashboard(): Promise<{ success: boolean; data?: AdminDashboardData }> {
  const res = await fetch(`${API_BASE}/admin/dashboard`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    if (res.status === 401) setAuthToken(null);
    return { success: false };
  }
  return await res.json();
}

export async function apiAdminGetUsers(params?: { q?: string; status?: string; page?: number; limit?: number }): Promise<{ success: boolean; data?: AdminUser[]; pagination?: { page: number; limit: number; total: number; totalPages: number }; capacity?: { allowed: boolean; current: number; max: number; unlimited: boolean; tier: string } }> {
  const searchParams = new URLSearchParams();
  if (params?.q) searchParams.set('q', params.q);
  if (params?.status) searchParams.set('status', params.status);
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.limit) searchParams.set('limit', String(params.limit));
  const qs = searchParams.toString();
  const res = await fetch(`${API_BASE}/admin/users${qs ? `?${qs}` : ''}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) return { success: false };
  return await res.json();
}

export async function apiAdminCreateUser(data: { name: string; username: string; email: string; phone?: string; password?: string; status?: string; expiresAt?: string; notes?: string }): Promise<{ success: boolean; error?: string; temporaryPassword?: string | null; data?: { id: string; username: string; email: string; name: string; role: string; status: string; expiresAt?: string | null } }> {
  const res = await fetch(`${API_BASE}/admin/users`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return await res.json();
}

export async function apiAdminUpdateUser(userId: string, data: { name?: string; email?: string; phone?: string; notes?: string; expiresAt?: string | null }): Promise<{ success: boolean; error?: string }> {
  const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return await res.json();
}

export async function apiAdminDeleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
  const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return await res.json();
}

export async function apiAdminSetUserStatus(userId: string, status: 'ACTIVE' | 'DISABLED'): Promise<{ success: boolean; error?: string }> {
  const res = await fetch(`${API_BASE}/admin/users/${userId}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });
  return await res.json();
}

export async function apiAdminResetPassword(userId: string, newPassword: string, mustChangePassword = true): Promise<{ success: boolean; error?: string }> {
  const res = await fetch(`${API_BASE}/admin/users/${userId}/reset-password`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ newPassword, mustChangePassword }),
  });
  return await res.json();
}

export async function apiAdminRevokeSessions(userId: string): Promise<{ success: boolean; error?: string }> {
  const res = await fetch(`${API_BASE}/admin/users/${userId}/revoke-sessions`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  return await res.json();
}

export async function apiAdminGetSettings(): Promise<{ success: boolean; data?: { max_users: number; license_tier: string }; capacity?: { allowed: boolean; current: number; max: number; unlimited: boolean; tier: string } }> {
  const res = await fetch(`${API_BASE}/admin/settings`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) return { success: false };
  return await res.json();
}

export async function apiAdminUpdateSettings(data: { max_users: number; license_tier: string }): Promise<{ success: boolean; error?: string }> {
  const res = await fetch(`${API_BASE}/admin/settings`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return await res.json();
}
