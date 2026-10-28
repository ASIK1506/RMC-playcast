import React from 'react';
import {
  Play,
  Square,
  EyeOff,
  Trash2,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Megaphone,
  Radio,
  SlidersHorizontal,
  Tv,
} from 'lucide-react';
import type { PlayCastSlide, ScreenOverlay } from '@/types/playcast';
import type { DisplaySettings } from '@/lib/sync';
import { Button } from '@/components/ui/button';
import { SlideRenderer } from './SlideRenderer';

interface LiveDualMonitorsProps {
  previewSlide: PlayCastSlide | null;
  liveSlide: PlayCastSlide | null;
  isLive: boolean;
  isBlank: boolean;
  overlay: ScreenOverlay | null;
  settings: DisplaySettings;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onGoLive: () => void;
  onStop: () => void;
  onToggleBlank: () => void;
  onClearAll: () => void;
  onPrevSlide: () => void;
  onNextSlide: () => void;
  onToggleSpeakerOverlay: () => void;
  onToggleTickerOverlay: () => void;
  onChangeTransition: (trans: 'fade' | 'slide' | 'none') => void;
}

export const LiveDualMonitors: React.FC<LiveDualMonitorsProps> = ({
  previewSlide,
  liveSlide,
  isLive,
  isBlank,
  overlay,
  settings,
  isCollapsed = false,
  onToggleCollapse,
  onGoLive,
  onStop,
  onToggleBlank,
  onClearAll,
  onPrevSlide,
  onNextSlide,
  onToggleSpeakerOverlay,
  onToggleTickerOverlay,
  onChangeTransition,
}) => {
  if (isCollapsed) {
    return (
      <aside className="w-12 bg-slate-950/95 border-l border-border/40 flex flex-col items-center py-3 px-1 select-none shrink-0 transition-all duration-300 justify-between">
        <div className="flex flex-col items-center gap-3 w-full">
          {onToggleCollapse && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleCollapse}
              className="w-8 h-8 text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              title="Expand Side Preview Monitors"
            >
              <ChevronLeft className="w-4 h-4 text-fuchsia-400" />
            </Button>
          )}

          <div
            className={`w-2.5 h-2.5 rounded-full ${
              isLive && !isBlank ? 'bg-rose-500 animate-pulse' : 'bg-slate-600'
            }`}
            title={isLive ? 'Currently Live' : 'Offline'}
          />

          <span className="[writing-mode:vertical-lr] rotate-180 text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">
            {isLive ? 'LIVE' : 'MONITORS'}
          </span>
        </div>

        <div className="flex flex-col items-center gap-2">
          {isLive ? (
            <Button
              variant="destructive"
              size="icon"
              onClick={onStop}
              className="w-8 h-8 bg-rose-600 hover:bg-rose-500 cursor-pointer animate-pulse border border-rose-400"
              title="Stop Live (Esc)"
            >
              <Square className="w-3.5 h-3.5 fill-white" />
            </Button>
          ) : (
            <Button
              size="icon"
              onClick={onGoLive}
              disabled={!previewSlide}
              className="w-8 h-8 bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 cursor-pointer disabled:opacity-30"
              title="Go Live"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleBlank}
            className={`w-8 h-8 cursor-pointer ${
              isBlank ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400 hover:text-white'
            }`}
            title={isBlank ? 'Restore Screen' : 'Blank Screen'}
          >
            <EyeOff className="w-3.5 h-3.5" />
          </Button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-72 sm:w-80 lg:w-80 xl:w-84 bg-slate-950/80 border-l border-border/40 flex flex-col min-h-0 select-none shrink-0 p-3 space-y-3 overflow-y-auto transition-all duration-300 min-w-0 max-w-full">
      {/* Side Header with Title and Collapse Button */}
      <div className="flex items-center justify-between pb-1.5 border-b border-white/5">
        <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <Tv className="w-3.5 h-3.5 text-fuchsia-400" />
          Studio Monitors
        </span>
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-white/10 cursor-pointer transition-all"
            title="Collapse Side Monitors"
          >
            <span>Collapse</span>
            <ChevronRight className="w-3 h-3 text-fuchsia-400" />
          </button>
        )}
      </div>

      {/* 1. MASTER BROADCAST CONTROLS (At Top for Instant Access) */}
      <div className="bg-slate-900/90 border border-white/10 rounded-xl p-3 space-y-2.5 shadow-md">
        <div className="grid grid-cols-2 gap-2">
          {isLive ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={onStop}
              className="h-10 text-xs font-bold uppercase tracking-wider bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/40 cursor-pointer animate-pulse border border-rose-400"
              title="Stop Live / End Livestream (Shortcut: Esc)"
            >
              <Square className="w-3.5 h-3.5 mr-1.5 fill-white" />
              Stop Live
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={onGoLive}
              disabled={!previewSlide}
              className="h-10 text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white shadow-lg shadow-fuchsia-600/30 cursor-pointer disabled:opacity-40"
              title="Push staged slide to Live (Shortcut: Space or Enter)"
            >
              <Play className="w-3.5 h-3.5 mr-1.5 fill-white" />
              Go Live
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={onToggleBlank}
            className={`h-10 text-xs font-semibold border-white/15 cursor-pointer ${
              isBlank
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <EyeOff className="w-3.5 h-3.5 mr-1.5" />
            {isBlank ? 'Restore' : 'Blank'}
          </Button>
        </div>

        {/* Prev / Clear / Next Steppers */}
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onPrevSlide}
            className="h-8 text-xs border-white/10 bg-slate-900 text-slate-300 hover:bg-slate-800 cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5 mr-1" />
            Prev
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onClearAll}
            className="h-8 text-xs border-white/10 bg-slate-900 text-slate-400 hover:text-rose-400 hover:bg-slate-800 cursor-pointer"
            title="Clear live output and stage"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            Clear
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onNextSlide}
            className="h-8 text-xs border-white/10 bg-slate-900 text-slate-300 hover:bg-slate-800 cursor-pointer"
          >
            Next
            <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>

        {/* Transition Style Selector */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3" />
            Transition:
          </span>
          <div className="flex items-center gap-1">
            {(['fade', 'slide', 'none'] as const).map((trans) => (
              <button
                key={trans}
                onClick={() => onChangeTransition(trans)}
                className={`text-[10px] px-2 py-0.5 rounded capitalize font-medium transition-colors cursor-pointer ${
                  settings.transition === trans
                    ? 'bg-fuchsia-600/30 text-fuchsia-300 border border-fuchsia-500/40'
                    : 'text-slate-400 hover:text-white bg-slate-950/60'
                }`}
              >
                {trans}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. DUAL MONITORS (Preview vs Live Output) */}
      <div className="space-y-3">
        {/* PREVIEW MONITOR */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-amber-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Preview Staged
            </span>
            <span className="text-slate-500 font-mono text-[10px]">
              {previewSlide?.label || 'None'}
            </span>
          </div>
          <div className="aspect-video w-full rounded-xl border border-amber-500/40 bg-slate-900/90 shadow-md overflow-hidden relative">
            <SlideRenderer
              slide={previewSlide}
              settings={settings}
              mode="preview"
            />
          </div>
        </div>

        {/* LIVE OUTPUT MONITOR */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-rose-400">
            <span className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  isLive && !isBlank ? 'bg-rose-500 animate-pulse' : 'bg-slate-600'
                }`}
              />
              Live Output {isBlank ? '(Blanked)' : ''}
            </span>
            <span className="text-slate-500 font-mono text-[10px]">
              {liveSlide?.label || 'None'}
            </span>
          </div>
          <div
            className={`aspect-video w-full rounded-xl border shadow-lg overflow-hidden relative transition-all ${
              isLive && !isBlank
                ? 'border-rose-500 shadow-rose-500/20 ring-1 ring-rose-500/60'
                : 'border-white/10 opacity-75'
            }`}
          >
            {isBlank ? (
              <div className="w-full h-full bg-black flex items-center justify-center text-slate-500 text-xs font-semibold uppercase tracking-wider">
                Screen Blanked
              </div>
            ) : (
              <SlideRenderer
                slide={isLive ? liveSlide : null}
                settings={settings}
                overlay={overlay}
                mode="live"
              />
            )}
          </div>
        </div>
      </div>

      {/* 3. SCREEN OVERLAYS TRAY */}
      <div className="bg-slate-900/60 border border-white/10 rounded-xl p-3 space-y-2">
        <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          Live Screen Overlays
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Speaker Lower-Third Toggle */}
          <button
            onClick={onToggleSpeakerOverlay}
            className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
              overlay?.active && overlay.type === 'speaker'
                ? 'bg-fuchsia-950/50 border-fuchsia-500 text-white shadow-sm'
                : 'bg-slate-900/80 border-white/10 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-1">
              <UserCheck className="w-3.5 h-3.5 text-fuchsia-400" />
              <span
                className={`text-[9px] font-bold px-1 rounded ${
                  overlay?.active && overlay.type === 'speaker'
                    ? 'bg-fuchsia-500 text-white'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                {overlay?.active && overlay.type === 'speaker' ? 'ON' : 'OFF'}
              </span>
            </div>
            <div className="font-semibold text-xs text-white truncate">
              Speaker Name
            </div>
            <div className="text-[9px] text-muted-foreground truncate">
              Pastor David Samuel
            </div>
          </button>

          {/* Announcement Ticker Toggle */}
          <button
            onClick={onToggleTickerOverlay}
            className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
              overlay?.active && overlay.type === 'ticker'
                ? 'bg-fuchsia-950/50 border-fuchsia-500 text-white shadow-sm'
                : 'bg-slate-900/80 border-white/10 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-1">
              <Megaphone className="w-3.5 h-3.5 text-amber-400" />
              <span
                className={`text-[9px] font-bold px-1 rounded ${
                  overlay?.active && overlay.type === 'ticker'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                {overlay?.active && overlay.type === 'ticker' ? 'ON' : 'OFF'}
              </span>
            </div>
            <div className="font-semibold text-xs text-white truncate">
              News Ticker
            </div>
            <div className="text-[9px] text-muted-foreground truncate">
              Bottom ticker tape
            </div>
          </button>
        </div>
      </div>
    </aside>
  );
};
