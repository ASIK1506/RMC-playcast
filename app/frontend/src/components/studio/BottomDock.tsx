import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Music,
  Image as ImageIcon,
  LayoutTemplate,
  Clock,
  Search,
  Plus,
  Play,
  Pause,
  RotateCcw,
  Check,
  ChevronUp,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import type { WorshipSong, PlayCastSlide, ServiceTimer } from '@/types/playcast';
import type { DisplaySettings } from '@/lib/sync';
import { bibleBooks, getChapterVerses } from '@/data/tamil-bible';
import { Button } from '@/components/ui/button';

interface BottomDockProps {
  songLibrary: WorshipSong[];
  settings: DisplaySettings;
  activeTimer?: ServiceTimer | null;
  onUpdateTimer?: (timer: ServiceTimer | null) => void;
  onAddScriptureToService: (verse: {
    bookTamil: string;
    chapter: number;
    verse: number;
    text: string;
    reference: string;
  }) => void;
  onAddSongToService: (song: WorshipSong) => void;
  onApplyBackground: (bg: {
    type: 'gradient' | 'solid' | 'transparent';
    gradientFrom?: string;
    gradientTo?: string;
    color?: string;
  }) => void;
  onApplyTemplate: (
    templateId: 'fullscreen' | 'lower-third' | 'box' | 'trendy' | 'minimal'
  ) => void;
}

export const BottomDock: React.FC<BottomDockProps> = ({
  songLibrary,
  settings,
  activeTimer,
  onUpdateTimer,
  onAddScriptureToService,
  onAddSongToService,
  onApplyBackground,
  onApplyTemplate,
}) => {
  const [activeTab, setActiveTab] = useState<
    'scripture' | 'lyrics' | 'media' | 'templates' | 'timers'
  >('scripture');
  const [isCollapsed, setIsCollapsed] = useState(false);

  // 1. Scripture Tab State
  const [selectedBookId, setSelectedBookId] = useState(19); // Default Psalms (சங்கீதம்)
  const [selectedChapter, setSelectedChapter] = useState(23); // Default Chapter 23
  const [verseSearchQuery, setVerseSearchQuery] = useState('');

  const currentBook = bibleBooks.find((b) => b.id === selectedBookId) || bibleBooks[0];
  const chapterVerses = getChapterVerses(selectedBookId, selectedChapter);

  // 2. Lyrics Library State
  const [songSearchQuery, setSongSearchQuery] = useState('');

  // 3. Timers State & Engine
  const [countdownDuration, setCountdownDuration] = useState(300); // 5 min
  const [countdownRemaining, setCountdownRemaining] = useState(300);
  const [isCountdownRunning, setIsCountdownRunning] = useState(false);

  const [sermonDuration, setSermonDuration] = useState(1800); // 30 min
  const [sermonRemaining, setSermonRemaining] = useState(1800);
  const [isSermonRunning, setIsSermonRunning] = useState(false);

  // Pre-Service Countdown Timer Tick
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isCountdownRunning) {
      interval = setInterval(() => {
        setCountdownRemaining((prev) => {
          if (prev <= 1) {
            setIsCountdownRunning(false);
            if (onUpdateTimer) {
              onUpdateTimer({
                id: 'timer-preservice',
                label: 'Pre-Service Countdown',
                type: 'countdown',
                totalSeconds: countdownDuration,
                remainingSeconds: 0,
                isRunning: false,
              });
            }
            return 0;
          }
          const next = prev - 1;
          if (onUpdateTimer) {
            onUpdateTimer({
              id: 'timer-preservice',
              label: 'Pre-Service Countdown',
              type: 'countdown',
              totalSeconds: countdownDuration,
              remainingSeconds: next,
              isRunning: true,
            });
          }
          return next;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isCountdownRunning, countdownDuration, onUpdateTimer]);

  // Sermon Timer Tick
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isSermonRunning) {
      interval = setInterval(() => {
        setSermonRemaining((prev) => {
          if (prev <= 1) {
            setIsSermonRunning(false);
            if (onUpdateTimer) {
              onUpdateTimer({
                id: 'timer-sermon',
                label: 'Sermon Timer',
                type: 'countdown',
                totalSeconds: sermonDuration,
                remainingSeconds: 0,
                isRunning: false,
              });
            }
            return 0;
          }
          const next = prev - 1;
          if (onUpdateTimer) {
            onUpdateTimer({
              id: 'timer-sermon',
              label: 'Sermon Timer',
              type: 'countdown',
              totalSeconds: sermonDuration,
              remainingSeconds: next,
              isRunning: true,
            });
          }
          return next;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSermonRunning, sermonDuration, onUpdateTimer]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Background Presets
  const backgroundPresets = [
    {
      name: 'Midnight Spiritual',
      type: 'gradient' as const,
      gradientFrom: '#090916',
      gradientTo: '#21183c',
    },
    {
      name: 'Golden Light Sanctuary',
      type: 'gradient' as const,
      gradientFrom: '#1c150b',
      gradientTo: '#3d2b0e',
    },
    {
      name: 'Deep Ocean Praise',
      type: 'gradient' as const,
      gradientFrom: '#081726',
      gradientTo: '#103957',
    },
    {
      name: 'Royal Magenta',
      type: 'gradient' as const,
      gradientFrom: '#1c0a21',
      gradientTo: '#4d1257',
    },
    {
      name: 'Minimal Dark Charcoal',
      type: 'solid' as const,
      color: '#0d0f14',
    },
    {
      name: 'Pure Transparent (OBS)',
      type: 'transparent' as const,
    },
  ];

  const isBgActive = (bg: (typeof backgroundPresets)[0]) => {
    if (bg.type === 'transparent') return settings.backgroundType === 'transparent';
    if (bg.type === 'solid') return settings.backgroundType === 'solid';
    return settings.backgroundType === bg.type && settings.gradientFrom === bg.gradientFrom;
  };

  const filteredSongs = songLibrary.filter((song) => {
    if (!songSearchQuery.trim()) return true;
    const q = songSearchQuery.toLowerCase();
    return (
      song.title.toLowerCase().includes(q) ||
      (song.tamilTitle && song.tamilTitle.toLowerCase().includes(q)) ||
      song.sections.some(
        (s) =>
          (s.tamilText && s.tamilText.toLowerCase().includes(q)) ||
          (s.englishText && s.englishText.toLowerCase().includes(q))
      )
    );
  });

  return (
    <div
      className={`border-t border-border/40 bg-slate-950/95 flex flex-col min-h-0 select-none shrink-0 z-20 backdrop-blur-md transition-all duration-200 w-full max-w-full min-w-0 overflow-x-hidden ${
        isCollapsed ? 'h-10 overflow-hidden' : 'h-64'
      }`}
    >
      {/* Top Navigation Tabs */}
      <div className="h-10 px-3 border-b border-white/10 flex items-center gap-1 overflow-x-auto bg-slate-900/60 shrink-0">
        <button
          onClick={() => {
            setActiveTab('scripture');
            if (isCollapsed) setIsCollapsed(false);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer shrink-0 ${
            activeTab === 'scripture'
              ? 'bg-fuchsia-600/30 text-fuchsia-300 border border-fuchsia-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-amber-400" />
          <span>Scripture (வேதாகமம்)</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('lyrics');
            if (isCollapsed) setIsCollapsed(false);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer shrink-0 ${
            activeTab === 'lyrics'
              ? 'bg-fuchsia-600/30 text-fuchsia-300 border border-fuchsia-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Music className="w-3.5 h-3.5 text-fuchsia-400" />
          <span>Lyrics Library</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('media');
            if (isCollapsed) setIsCollapsed(false);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer shrink-0 ${
            activeTab === 'media'
              ? 'bg-fuchsia-600/30 text-fuchsia-300 border border-fuchsia-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
          <span>Media & Backgrounds</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('templates');
            if (isCollapsed) setIsCollapsed(false);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer shrink-0 ${
            activeTab === 'templates'
              ? 'bg-fuchsia-600/30 text-fuchsia-300 border border-fuchsia-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <LayoutTemplate className="w-3.5 h-3.5 text-indigo-400" />
          <span>Templates</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('timers');
            if (isCollapsed) setIsCollapsed(false);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer shrink-0 ${
            activeTab === 'timers'
              ? 'bg-fuchsia-600/30 text-fuchsia-300 border border-fuchsia-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>Timers</span>
          {(isCountdownRunning || isSermonRunning) && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping ml-0.5" />
          )}
        </button>

        {/* Collapse / Expand Toggle */}
        <div className="ml-auto flex items-center pr-1 shrink-0">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center gap-1 text-[11px] font-medium text-slate-300 hover:text-white px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-white/10 cursor-pointer transition-all"
            title={isCollapsed ? 'Expand Bottom Dock' : 'Collapse Bottom Dock'}
          >
            {isCollapsed ? (
              <>
                <ChevronUp className="w-3.5 h-3.5 text-fuchsia-400" />
                <span className="text-[10px]">Expand Dock</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                <span className="text-[10px]">Collapse</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tab Content Canvas */}
      {!isCollapsed && (
        <div className="flex-1 min-h-0 overflow-y-auto p-3 w-full max-w-full min-w-0">
          {/* TAB 1: SCRIPTURE ENGINE */}
          {activeTab === 'scripture' && (
            <div className="h-full flex gap-3 min-w-0">
              {/* Left: Book & Chapter Picker */}
              <div className="w-48 flex flex-col gap-2 shrink-0 border-r border-white/5 pr-3">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Select Book (புத்தகம்)
                </label>
                <select
                  value={selectedBookId}
                  onChange={(e) => {
                    setSelectedBookId(Number(e.target.value));
                    setSelectedChapter(1);
                  }}
                  className="w-full bg-slate-900 border border-white/10 rounded-md px-2.5 py-1.5 text-xs font-medium text-white focus:outline-none focus:border-fuchsia-500"
                >
                  {bibleBooks.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.nameTamil} ({b.name})
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Chapter
                    </label>
                    <select
                      value={selectedChapter}
                      onChange={(e) => setSelectedChapter(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-white/10 rounded-md px-2 py-1 text-xs font-medium text-white"
                    >
                      {Array.from({ length: currentBook.chapters }, (_, i) => i + 1).map((ch) => (
                        <option key={ch} value={ch}>
                          {ch}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Right: Verse List */}
              <div className="flex-1 overflow-y-auto pr-1 min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  {currentBook.nameTamil} {selectedChapter} — VERSES ({chapterVerses.length})
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 min-w-0">
                  {chapterVerses.map((v) => (
                    <div
                      key={v.verse}
                      onClick={() =>
                        onAddScriptureToService({
                          bookTamil: currentBook.nameTamil,
                          chapter: selectedChapter,
                          verse: v.verse,
                          text: v.text,
                          reference: `${currentBook.nameTamil} ${selectedChapter}:${v.verse}`,
                        })
                      }
                      className="p-2.5 rounded-lg bg-slate-900/60 hover:bg-slate-900 border border-white/10 hover:border-fuchsia-500/50 text-left text-xs cursor-pointer transition-all flex items-start gap-2 group min-w-0"
                    >
                      <span className="font-bold text-amber-400 font-mono text-[11px] shrink-0 mt-0.5">
                        {v.verse}
                      </span>
                      <p className="line-clamp-2 text-slate-300 font-['Noto_Sans_Tamil'] group-hover:text-white flex-1 min-w-0">
                        {v.text}
                      </p>
                      <Plus className="w-3.5 h-3.5 text-slate-500 group-hover:text-fuchsia-400 shrink-0 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LYRICS LIBRARY */}
          {activeTab === 'lyrics' && (
            <div className="h-full flex flex-col gap-2 min-w-0">
              <div className="flex items-center justify-between gap-3 min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground shrink-0">
                  Worship Songs ({filteredSongs.length})
                </span>
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={songSearchQuery}
                    onChange={(e) => setSongSearchQuery(e.target.value)}
                    placeholder="Search song title or lyrics..."
                    className="w-full bg-slate-900 border border-white/10 rounded-md pl-8 pr-3 py-1 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-fuchsia-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 min-w-0">
                {filteredSongs.map((song) => (
                  <div
                    key={song.id}
                    onClick={() => onAddSongToService(song)}
                    className="p-3 rounded-lg bg-slate-900/60 hover:bg-slate-900 border border-white/10 hover:border-fuchsia-500/50 text-left cursor-pointer transition-all group min-w-0 overflow-hidden flex flex-col justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center justify-between gap-2 min-w-0">
                        <span className="font-semibold text-xs text-white group-hover:text-fuchsia-300 truncate">
                          {song.title}
                        </span>
                        {song.key && (
                          <span className="text-[9px] bg-slate-800 text-slate-400 px-1 rounded font-mono shrink-0">
                            Key: {song.key}
                          </span>
                        )}
                      </div>
                      {song.tamilTitle && (
                        <div className="text-[11px] text-muted-foreground mt-0.5 truncate">
                          {song.tamilTitle}
                        </div>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-2 flex items-center justify-between pt-1 border-t border-white/5">
                      <span>{song.sections.length} parts</span>
                      <span className="text-fuchsia-400 font-medium group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                        + Add to Service
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: MEDIA & BACKGROUNDS */}
          {activeTab === 'media' && (
            <div className="h-full space-y-2 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Select Slide Background Theme
                </span>
                <span className="text-[10px] text-fuchsia-400">
                  Updates active slides and live broadcast instantly
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 min-w-0">
                {backgroundPresets.map((bg) => {
                  const active = isBgActive(bg);
                  return (
                    <div
                      key={bg.name}
                      onClick={() => onApplyBackground(bg)}
                      className={`aspect-video rounded-xl p-2.5 border cursor-pointer transition-all flex flex-col justify-between text-xs font-semibold shadow-md group relative overflow-hidden min-w-0 ${
                        active
                          ? 'border-fuchsia-400 ring-2 ring-fuchsia-500 shadow-lg shadow-fuchsia-500/30'
                          : 'border-white/10 hover:border-white/30'
                      }`}
                      style={{
                        background:
                          bg.type === 'gradient'
                            ? `linear-gradient(135deg, ${bg.gradientFrom}, ${bg.gradientTo})`
                            : bg.type === 'transparent'
                            ? 'transparent'
                            : bg.color || '#0d0f14',
                      }}
                    >
                      <div className="flex items-center justify-between relative z-10">
                        {active && (
                          <span className="bg-fuchsia-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full flex items-center gap-0.5 shadow">
                            <Check className="w-2.5 h-2.5" /> Active
                          </span>
                        )}
                      </div>
                      <div className="absolute inset-0 bg-black/25 group-hover:bg-transparent transition-colors" />
                      <span className="relative z-10 text-[11px] text-white drop-shadow truncate">
                        {bg.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: TEMPLATES */}
          {activeTab === 'templates' && (
            <div className="h-full space-y-2 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Presentation Template Styles
                </span>
                <span className="text-[10px] text-fuchsia-400">
                  Switches layout format in real-time
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 min-w-0">
                {[
                  {
                    id: 'fullscreen' as const,
                    name: 'Fullscreen Sanctuary',
                    desc: 'Standard clean centered presentation with bilingual stacking',
                  },
                  {
                    id: 'lower-third' as const,
                    name: 'OBS Lower-Third Banner',
                    desc: 'Broadcast overlay for church cameras with alpha channel',
                  },
                  {
                    id: 'box' as const,
                    name: 'Frosted Glass Box',
                    desc: 'Modern frosted glass backdrop for scripture & prayer',
                  },
                  {
                    id: 'trendy' as const,
                    name: 'Trendy Accent Modern',
                    desc: 'Contemporary youth worship layout with accent pill badges',
                  },
                ].map((tpl) => {
                  const active = settings.templateId === tpl.id;
                  return (
                    <div
                      key={tpl.id}
                      onClick={() => onApplyTemplate(tpl.id)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between min-w-0 ${
                        active
                          ? 'bg-fuchsia-950/50 border-fuchsia-400 ring-2 ring-fuchsia-500 shadow-lg shadow-fuchsia-500/20'
                          : 'bg-slate-900/60 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-white">{tpl.name}</span>
                          {active && (
                            <span className="text-[9px] bg-fuchsia-500 text-white font-bold px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                              <Check className="w-2.5 h-2.5" /> Active
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-muted-foreground leading-normal">
                          {tpl.desc}
                        </div>
                      </div>
                      <div className="mt-2 text-[10px] font-semibold text-fuchsia-400 flex items-center gap-1">
                        {active ? 'Currently Selected' : 'Click to Apply'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: TIMERS (Fully Functional Live Countdown Engine) */}
          {activeTab === 'timers' && (
            <div className="h-full flex items-center justify-around text-center p-2 gap-4 min-w-0">
              {/* TIMER 1: Pre-Service Countdown */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 w-72 flex flex-col items-center">
                <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3 text-fuchsia-400" />
                  Pre-Service Countdown
                </span>

                <div
                  className={`text-3xl font-mono font-bold my-1.5 tracking-wider ${
                    countdownRemaining === 0
                      ? 'text-emerald-400 animate-pulse'
                      : isCountdownRunning
                      ? 'text-fuchsia-400 animate-pulse'
                      : 'text-white'
                  }`}
                >
                  {formatTime(countdownRemaining)}
                </div>

                {/* Preset Buttons */}
                <div className="flex items-center gap-1 mb-2">
                  {[
                    { label: '3m', sec: 180 },
                    { label: '5m', sec: 300 },
                    { label: '10m', sec: 600 },
                    { label: '15m', sec: 900 },
                  ].map((p) => (
                    <button
                      key={p.label}
                      onClick={() => {
                        setCountdownDuration(p.sec);
                        setCountdownRemaining(p.sec);
                        setIsCountdownRunning(false);
                      }}
                      className={`text-[10px] px-2 py-0.5 rounded font-mono border transition-colors cursor-pointer ${
                        countdownDuration === p.sec
                          ? 'bg-fuchsia-600 text-white border-fuchsia-500'
                          : 'bg-slate-800 text-slate-300 border-white/10 hover:bg-slate-700'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 w-full">
                  <Button
                    size="sm"
                    onClick={() => {
                      if (countdownRemaining === 0) setCountdownRemaining(countdownDuration);
                      setIsCountdownRunning(!isCountdownRunning);
                    }}
                    className={`flex-1 text-xs font-semibold cursor-pointer ${
                      isCountdownRunning
                        ? 'bg-amber-600 hover:bg-amber-500 text-white'
                        : 'bg-fuchsia-600 hover:bg-fuchsia-500 text-white'
                    }`}
                  >
                    {isCountdownRunning ? (
                      <>
                        <Pause className="w-3 h-3 mr-1 fill-white" /> Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 mr-1 fill-white" /> Start
                      </>
                    )}
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsCountdownRunning(false);
                      setCountdownRemaining(countdownDuration);
                      if (onUpdateTimer) onUpdateTimer(null);
                    }}
                    className="text-xs border-white/10 hover:bg-slate-800 cursor-pointer"
                    title="Reset Countdown"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {/* TIMER 2: Sermon Duration Timer */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 w-72 flex flex-col items-center">
                <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3 text-emerald-400" />
                  Sermon Timer
                </span>

                <div
                  className={`text-3xl font-mono font-bold my-1.5 tracking-wider ${
                    sermonRemaining <= 120 && sermonRemaining > 0
                      ? 'text-amber-400 animate-pulse'
                      : sermonRemaining === 0
                      ? 'text-rose-500 animate-pulse'
                      : isSermonRunning
                      ? 'text-emerald-400'
                      : 'text-white'
                  }`}
                >
                  {formatTime(sermonRemaining)}
                </div>

                {/* Preset Buttons */}
                <div className="flex items-center gap-1 mb-2">
                  {[
                    { label: '20m', sec: 1200 },
                    { label: '30m', sec: 1800 },
                    { label: '45m', sec: 2700 },
                    { label: '60m', sec: 3600 },
                  ].map((p) => (
                    <button
                      key={p.label}
                      onClick={() => {
                        setSermonDuration(p.sec);
                        setSermonRemaining(p.sec);
                        setIsSermonRunning(false);
                      }}
                      className={`text-[10px] px-2 py-0.5 rounded font-mono border transition-colors cursor-pointer ${
                        sermonDuration === p.sec
                          ? 'bg-emerald-600 text-white border-emerald-500'
                          : 'bg-slate-800 text-slate-300 border-white/10 hover:bg-slate-700'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 w-full">
                  <Button
                    size="sm"
                    onClick={() => {
                      if (sermonRemaining === 0) setSermonRemaining(sermonDuration);
                      setIsSermonRunning(!isSermonRunning);
                    }}
                    className={`flex-1 text-xs font-semibold cursor-pointer ${
                      isSermonRunning
                        ? 'bg-amber-600 hover:bg-amber-500 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    }`}
                  >
                    {isSermonRunning ? (
                      <>
                        <Pause className="w-3 h-3 mr-1 fill-white" /> Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 mr-1 fill-white" /> Start
                      </>
                    )}
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsSermonRunning(false);
                      setSermonRemaining(sermonDuration);
                      if (onUpdateTimer) onUpdateTimer(null);
                    }}
                    className="text-xs border-white/10 hover:bg-slate-800 cursor-pointer"
                    title="Reset Sermon Timer"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
