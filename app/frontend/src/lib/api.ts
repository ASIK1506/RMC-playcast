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
