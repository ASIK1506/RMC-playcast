import React, { useState, useEffect } from 'react';
import { syncManager, type DisplayState } from '@/lib/sync';
import { Clock, Tv, MessageSquare } from 'lucide-react';

export default function StagePage() {
  const [state, setState] = useState<DisplayState>(() => syncManager.getState());
  const [currentTime, setCurrentTime] = useState('');

  // Clock ticker
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Sync state
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

  const { currentSlide, nextSlide, isLive, isBlank, timer } = state;

  return (
    <div className="w-screen h-screen bg-black text-white p-6 sm:p-8 flex flex-col justify-between select-none font-sans overflow-hidden">
      {/* Top Bar: Large Clock + Service Status + Live Timer */}
      <header className="flex items-center justify-between border-b border-white/20 pb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900 border border-white/10 px-3 py-1.5 rounded-lg text-emerald-400 font-mono text-sm font-bold">
            <Tv className="w-4 h-4" />
            <span>STAGE MONITOR</span>
          </div>

          <div
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              isLive && !isBlank
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {isLive && !isBlank ? '● ON AIR' : 'OFFLINE'}
          </div>

          {/* Active Live Broadcast Timer */}
          {timer && timer.isRunning && (
            <div className="flex items-center gap-2 bg-slate-900 border border-amber-500/50 px-3 py-1 rounded-lg shadow-md">
              <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              <span className="text-xs font-bold text-amber-400 font-mono">
                {timer.label}:{' '}
                {Math.floor((timer.remainingSeconds ?? 0) / 60)
                  .toString()
                  .padStart(2, '0')}
                :
                {((timer.remainingSeconds ?? 0) % 60).toString().padStart(2, '0')}
              </span>
            </div>
          )}
        </div>

        {/* Big Clock for Musicians/Speaker */}
        <div className="flex items-center gap-2 text-3xl sm:text-4xl font-mono font-bold tracking-tight text-amber-400">
          <Clock className="w-6 h-6 text-amber-400/80" />
          <span>{currentTime}</span>
        </div>
      </header>

      {/* Main Center Area: CURRENT SLIDE (Large) */}
      <main className="flex-1 flex flex-col justify-center my-6 min-h-0">
        <div className="text-xs uppercase font-bold tracking-widest text-fuchsia-400 mb-2">
          {currentSlide?.label ? `Current Slide: ${currentSlide.label}` : 'Current Slide'}
        </div>

        <div className="bg-slate-950 border border-white/15 rounded-2xl p-6 sm:p-10 flex-1 flex flex-col justify-center shadow-2xl">
          {currentSlide ? (
            <div>
              {currentSlide.textTamil && (
                <p className="text-2xl sm:text-4xl md:text-5xl font-bold leading-relaxed whitespace-pre-line text-white font-['Noto_Sans_Tamil']">
                  {currentSlide.textTamil}
                </p>
              )}
              {currentSlide.textEnglish && (
                <p className="text-lg sm:text-2xl text-slate-300 italic mt-4 font-medium opacity-85">
                  {currentSlide.textEnglish}
                </p>
              )}
            </div>
          ) : (
            <div className="text-slate-600 text-2xl font-bold uppercase tracking-widest text-center">
              No Active Slide
            </div>
          )}
        </div>
      </main>

      {/* Stage Message Alert from Director */}
      {state.stageMessage && (
        <div className="my-2 bg-amber-500/25 border-2 border-amber-500 text-amber-200 px-5 py-3 rounded-xl flex items-center justify-between shadow-2xl animate-pulse">
          <div className="flex items-center gap-3">
            <span className="bg-amber-500 text-black px-2.5 py-0.5 rounded text-xs font-black uppercase tracking-wider shrink-0">
              DIRECTOR MESSAGE
            </span>
            <span className="text-lg sm:text-xl font-bold font-sans text-amber-200">{state.stageMessage}</span>
          </div>
        </div>
      )}

      {/* Bottom Bar: NEXT SLIDE PREVIEW (Yellow/Amber Preview for Singers) */}
      <footer className="shrink-0 bg-slate-950/80 border border-white/15 rounded-xl p-4 flex items-center justify-between gap-6">
        <div className="flex-1 truncate">
          <div className="text-[11px] uppercase font-bold tracking-wider text-amber-400 mb-1 flex items-center gap-1.5">
            <span>Next Slide ➜</span>
            {nextSlide?.label && (
              <span className="text-slate-400 font-normal">({nextSlide.label})</span>
            )}
          </div>
          <p className="text-sm sm:text-base font-semibold text-slate-300 truncate">
            {nextSlide?.textTamil || nextSlide?.textEnglish || 'End of Item / Next Item'}
          </p>
        </div>

        {/* Soundbooth Confidence Note */}
        <div className="shrink-0 flex items-center gap-2 bg-slate-900 border border-white/10 px-3 py-2 rounded-lg text-xs text-slate-400">
          <MessageSquare className="w-4 h-4 text-fuchsia-400 shrink-0" />
          <span>Stage Audio Balanced</span>
        </div>
      </footer>
    </div>
  );
}
