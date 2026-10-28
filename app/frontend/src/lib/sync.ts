// Cross-tab sync using BroadcastChannel with localStorage fallback
// Used to sync the presenter view with display, projector, stage, and remote windows
import type { PlayCastSlide, ScreenOverlay, ServiceTimer } from '@/types/playcast';
import { getApiUrl } from '@/lib/api';

export interface DisplaySettings {
  fontSize: number;
  fontColor: string;
  backgroundColor: string;
  backgroundType: 'solid' | 'gradient' | 'transparent' | 'image';
  gradientFrom: string;
  gradientTo: string;
  backgroundImage: string;
  backgroundOverlay: number;
  textAlign: 'left' | 'center' | 'right';
  showReference: boolean;
  referencePosition: 'top' | 'bottom';
  transition: 'fade' | 'slide' | 'none';
  padding: number;
  // PlayCast template settings
  templateId?: 'fullscreen' | 'lower-third' | 'box' | 'trendy' | 'minimal';
  bilingualLayout?: 'stacked' | 'side-by-side' | 'primary-only';
  primaryLanguage?: 'tamil' | 'english';
}

export interface DisplayState {
  // Legacy verse support for OBS backward compatibility
  verse: {
    bookTamil: string;
    chapter: number;
    verse: number;
    text: string;
    reference: string;
  } | null;

  // PlayCast Enhanced Slide State
  currentSlide: PlayCastSlide | null;
  nextSlide: PlayCastSlide | null;
  isLive: boolean;
  isBlank: boolean;
  activeOverlay: ScreenOverlay | null;
  timer: ServiceTimer | null;
  stageMessage?: string | null;
  serviceName?: string;
  settings: DisplaySettings;
  timestamp?: number;
}

export const defaultSettings: DisplaySettings = {
  fontSize: 48,
  fontColor: '#ffffff',
  backgroundColor: '#0a0a14',
  backgroundType: 'gradient',
  gradientFrom: '#090916',
  gradientTo: '#21183c',
  backgroundImage: '',
  backgroundOverlay: 60,
  textAlign: 'center',
  showReference: true,
  referencePosition: 'bottom',
  transition: 'fade',
  padding: 60,
  templateId: 'fullscreen',
  bilingualLayout: 'stacked',
  primaryLanguage: 'tamil',
};

const CHANNEL_NAME = 'playcast-obs-sync';
const LEGACY_CHANNEL_NAME = 'tamil-bible-obs-sync';
const STORAGE_KEY = 'playcast-obs-state';
const LEGACY_STORAGE_KEY = 'tamil-bible-obs-state';

type MessageHandler = (state: DisplayState) => void;

class SyncManager {
  private channel: BroadcastChannel | null = null;
  private legacyChannel: BroadcastChannel | null = null;
  private listeners: Set<MessageHandler> = new Set();
  private currentState: DisplayState = {
    verse: null,
    currentSlide: null,
    nextSlide: null,
    isLive: false,
    isBlank: false,
    activeOverlay: null,
    timer: null,
    settings: defaultSettings,
  };

  constructor() {
    if (typeof window === 'undefined') return;

    // Initialize BroadcastChannels
    if ('BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel(CHANNEL_NAME);
        this.channel.onmessage = (event) => {
          this.currentState = event.data;
          this.notifyListeners();
        };

        this.legacyChannel = new BroadcastChannel(LEGACY_CHANNEL_NAME);
        this.legacyChannel.onmessage = (event) => {
          // If receiving legacy event, map it
          if (event.data && !event.data.currentSlide && event.data.verse) {
            this.currentState = {
              ...this.currentState,
              verse: event.data.verse,
              isLive: event.data.isLive,
              settings: event.data.settings || this.currentState.settings,
            };
            this.notifyListeners();
          }
        };
      } catch {
        // Fall back to localStorage
      }
    }

    // Storage event fallback for cross-tab updates
    window.addEventListener('storage', (event) => {
      if ((event.key === STORAGE_KEY || event.key === LEGACY_STORAGE_KEY) && event.newValue) {
        try {
          const parsed = JSON.parse(event.newValue);
          this.currentState = {
            ...this.currentState,
            ...parsed,
          };
          this.notifyListeners();
        } catch {
          // Ignore parse errors
        }
      }
    });

    // Load initial state
    try {
      const stored = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
      if (stored) {
        this.currentState = JSON.parse(stored);
      }
    } catch {
      // Ignore
    }
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.currentState));
  }

  broadcast(state: DisplayState) {
    const updatedState = { ...state, timestamp: Date.now() };
    this.currentState = updatedState;

    // Send via main PlayCast BroadcastChannel
    try {
      this.channel?.postMessage(updatedState);
    } catch {
      // Ignore
    }

    // Send legacy format to legacy channel for backwards compatibility
    try {
      this.legacyChannel?.postMessage({
        verse: updatedState.verse,
        isLive: updatedState.isLive,
        settings: updatedState.settings,
      });
    } catch {
      // Ignore
    }

    // Persist to localStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedState));
      localStorage.setItem(
        LEGACY_STORAGE_KEY,
        JSON.stringify({
          verse: updatedState.verse,
          isLive: updatedState.isLive,
          settings: updatedState.settings,
        })
      );
    } catch {
      // Ignore
    }

    // Persist to PHP backend REST API for OBS Studio CEF & cross-browser synchronization
    try {
      fetch('/api/live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedState),
      }).catch(() => {});
    } catch {
      // Ignore
    }

    // Notify local listeners in the current tab
    this.notifyListeners();
  }

  subscribe(handler: MessageHandler) {
    this.listeners.add(handler);
    handler(this.currentState);
    return () => {
      this.listeners.delete(handler);
    };
  }

  getState(): DisplayState {
    return this.currentState;
  }

  destroy() {
    this.channel?.close();
    this.legacyChannel?.close();
    this.listeners.clear();
  }
}

export const syncManager = new SyncManager();