export type ItemType = 'scripture' | 'lyrics' | 'presentation' | 'announcement' | 'countdown';

export interface PlayCastSlide {
  id: string;
  label: string; // e.g. "Verse 1", "Chorus 1", "Bridge", "சங்கீதம் 23:1"
  type: ItemType;
  textTamil?: string;
  textEnglish?: string;
  title?: string;
  reference?: string;
  notes?: string;
  duration?: number; // seconds for auto-advance
  templateId?: 'fullscreen' | 'lower-third' | 'box' | 'trendy' | 'minimal';
  background?: {
    type: 'transparent' | 'solid' | 'gradient' | 'image';
    color?: string;
    gradientFrom?: string;
    gradientTo?: string;
    imageUrl?: string;
    overlay?: number; // 0 to 100
  };
}

export interface PresenterInfo {
  name: string;
  role: string;
  autoShow?: boolean;
}

export interface ServiceItem {
  id: string;
  title: string;
  tamilTitle?: string;
  category: 'Welcome' | 'Worship' | 'Scripture' | 'Sermon' | 'Prayer' | 'Announcements';
  arrangement: string; // "Default", "Shorter", "Custom"
  slides: PlayCastSlide[];
  presenterInfo?: PresenterInfo;
}

export interface ServiceSection {
  id: string;
  name: string;
  items: ServiceItem[];
}

export interface WorshipSong {
  id: string;
  title: string;
  tamilTitle?: string;
  author?: string;
  key?: string;
  presenterInfo?: PresenterInfo;
  sections: {
    tag: string; // "Verse 1", "Chorus", etc.
    tamilText?: string;
    englishText?: string;
  }[];
}

export type OverlayPosition = 'bottom-left' | 'bottom-center' | 'bottom-right' | 'top-left' | 'full-bottom';
export type OverlayTimingMode = 'persistent' | 'auto-hide';

export interface ChurchMemberPreset {
  id: string;
  name: string;
  role: string;
  category: 'Pastor' | 'Board Member' | 'Worship Leader' | 'Scripture Reader' | 'Elder' | 'Guest' | 'General';
  notes?: string;
}

export interface ScreenOverlay {
  id: string;
  type: 'speaker' | 'ticker' | 'quick_slide';
  name?: string;
  title?: string;
  subtitle?: string;
  position?: OverlayPosition;
  timingMode?: OverlayTimingMode;
  autoHideSeconds?: number;
  category?: string;
  tickerText?: string;
  quickSlideText?: string;
  active: boolean;
  activatedAt?: number;
}

export interface ServiceTimer {
  id: string;
  label: string;
  type: 'clock' | 'countdown' | 'elapsed';
  totalSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
}

export interface TemplateStyle {
  id: 'fullscreen' | 'lower-third' | 'box' | 'trendy' | 'minimal';
  name: string;
  description: string;
  previewClass: string;
}
