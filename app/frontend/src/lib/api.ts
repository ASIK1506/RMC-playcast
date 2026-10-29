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
