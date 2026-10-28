import React, { useState, useEffect } from 'react';
import { syncManager, type DisplayState } from '@/lib/sync';
import {
  Play,
  Square,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Smartphone,
  Radio,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RemotePage() {
  const [state, setState] = useState<DisplayState>(() => syncManager.getState());

  useEffect(() => {
    const unsubscribe = syncManager.subscribe((newState) => {
      setState(newState);
    });

    const poll = setInterval(() => {
      try {
        const stored = localStorage.getItem('playcast-obs-state');
        if (stored) {
          const parsed: DisplayState = JSON.parse(stored);
          if (JSON.stringify(parsed) !== JSON.stringify(state)) {
            setState(parsed);
          }
        }
      } catch {
        // Ignore
      }
    }, 400);

    return () => {
      unsubscribe();
      clearInterval(poll);
    };
  }, [state]);

  const { currentSlide, nextSlide, isLive, isBlank } = state;

  const handleToggleBlank = () => {
    syncManager.broadcast({
      ...state,
      isBlank: !state.isBlank,
    });
  };

  const handleStop = () => {
    syncManager.broadcast({
      ...state,
      isLive: false,
      isBlank: false,
    });
  };

  const handleGoLive = () => {
    syncManager.broadcast({
      ...state,
      isLive: true,
      isBlank: false,
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 flex flex-col justify-between max-w-md mx-auto select-none font-sans">
      {/* Remote Header */}
      <header className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-fuchsia-400" />
          <span className="font-bold text-sm tracking-tight">PlayCast Remote</span>
        </div>

        <div
          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
            isLive && !isBlank
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
              : 'bg-slate-800 text-slate-400'
          }`}
        >
          <Radio className="w-3 h-3" />
          <span>{isLive && !isBlank ? 'LIVE' : 'STANDBY'}</span>
        </div>
      </header>

      {/* Main Slide Monitor Display */}
      <main className="my-4 space-y-3">
        {/* Current Live Slide */}
        <div className="bg-slate-900 border border-fuchsia-500/40 rounded-xl p-4 shadow-lg">
          <div className="text-[10px] uppercase font-bold text-fuchsia-400 mb-1">
            Current Live Slide {currentSlide?.label ? `(${currentSlide.label})` : ''}
          </div>
          <p className="text-base font-bold text-white line-clamp-3 leading-snug font-['Noto_Sans_Tamil']">
            {currentSlide?.textTamil || 'No slide active'}
          </p>
          {currentSlide?.textEnglish && (
            <p className="text-xs text-slate-300 italic mt-1 line-clamp-2">
              {currentSlide.textEnglish}
            </p>
          )}
        </div>

        {/* Next Slide Preview */}
        {nextSlide && (
          <div className="bg-slate-900/60 border border-amber-500/30 rounded-xl p-3">
            <div className="text-[10px] uppercase font-bold text-amber-400 mb-0.5">
              Next Up: {nextSlide.label}
            </div>
            <p className="text-xs text-slate-300 truncate">
              {nextSlide.textTamil || nextSlide.textEnglish}
            </p>
          </div>
        )}
      </main>

      {/* Touch-Friendly Action Controls */}
      <footer className="space-y-3 pt-2">
        {/* Giant Next / Prev Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            size="lg"
            variant="outline"
            className="h-16 text-base font-bold border-white/20 bg-slate-900 hover:bg-slate-800 text-white rounded-xl active:scale-95 transition-transform"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Previous
          </Button>

          <Button
            size="lg"
            className="h-16 text-base font-bold bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-xl shadow-lg shadow-fuchsia-600/30 active:scale-95 transition-transform"
          >
            Next
            <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
        </div>

        {/* Stop & Blank Controls */}
        <div className="grid grid-cols-2 gap-3">
          {isLive ? (
            <Button
              variant="destructive"
              size="lg"
              onClick={handleStop}
              className="h-12 text-sm font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-xl active:scale-95"
            >
              <Square className="w-4 h-4 mr-1.5 fill-white" />
              Stop Live
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={handleGoLive}
              className="h-12 text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl active:scale-95"
            >
              <Play className="w-4 h-4 mr-1.5 fill-white" />
              Go Live
            </Button>
          )}

          <Button
            variant="outline"
            size="lg"
            onClick={handleToggleBlank}
            className={`h-12 text-sm font-semibold border-white/15 rounded-xl active:scale-95 ${
              isBlank
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-900 text-slate-300'
            }`}
          >
            <EyeOff className="w-4 h-4 mr-1.5" />
            {isBlank ? 'Restore' : 'Blank'}
          </Button>
        </div>
      </footer>
    </div>
  );
}
