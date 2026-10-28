import React, { useState, useEffect, useRef } from 'react';
import { syncManager, type DisplayState } from '@/lib/sync';
import { SlideRenderer } from '@/components/studio/SlideRenderer';
import { getApiUrl } from '@/lib/api';

export default function DisplayPage() {
  const [state, setState] = useState<DisplayState>(() => syncManager.getState());
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showStandbyNotice, setShowStandbyNotice] = useState(true);
  const transitionTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTimestamp = useRef<number>(0);

  // Auto-hide the standby notice after 10 seconds so it never interferes with streaming
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowStandbyNotice(false);
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  // 1. Initial fetch from Backend for OBS Studio CEF
  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const res = await fetch(getApiUrl('/live'));
        if (res.ok) {
          const json = await res.json();
          if (json?.success && json?.state) {
            setState(json.state);
            if (json.state.timestamp) {
              lastTimestamp.current = json.state.timestamp;
            }
          }
        }
      } catch {
        // Fall back to syncManager / localStorage
      }
    };
    fetchInitial();
  }, []);

  // 2. Dual Sync: BroadcastChannel (Instant <2ms for browser) + Backend Polling (300ms for OBS CEF)
  useEffect(() => {
    // A. BroadcastChannel subscriber (same-browser tabs)
    const unsubscribe = syncManager.subscribe((newState) => {
      const hasChanged =
        JSON.stringify(newState.currentSlide) !== JSON.stringify(state.currentSlide) ||
        JSON.stringify(newState.verse) !== JSON.stringify(state.verse);

      if (newState.settings?.transition !== 'none' && hasChanged && newState.isLive) {
        setIsTransitioning(true);
        if (transitionTimeout.current) clearTimeout(transitionTimeout.current);
        transitionTimeout.current = setTimeout(() => {
          setState(newState);
          setIsTransitioning(false);
        }, 300);
      } else {
        setState(newState);
      }
    });

    // B. Backend Polling every 300ms for OBS Studio CEF isolation
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(getApiUrl('/live'));
        if (res.ok) {
          const json = await res.json();
          if (json?.success && json?.state) {
            const remoteState: DisplayState = json.state;
            const remoteTs = remoteState.timestamp || 0;
            if (remoteTs > lastTimestamp.current) {
              lastTimestamp.current = remoteTs;
              setState(remoteState);
            }
          }
        }
      } catch {
        // Ignore network hiccups
      }

      // Fallback check on localStorage as well
      try {
        const stored = localStorage.getItem('playcast-obs-state');
        if (stored) {
          const parsed: DisplayState = JSON.parse(stored);
          const currentStr = JSON.stringify(state);
          const newStr = JSON.stringify(parsed);
          if (currentStr !== newStr) {
            setState(parsed);
          }
        }
      } catch {
        // Ignore
      }
    }, 300);

    return () => {
      unsubscribe();
      clearInterval(pollInterval);
      if (transitionTimeout.current) clearTimeout(transitionTimeout.current);
    };
  }, [state]);

  const { currentSlide, verse, isLive, isBlank, settings, overlay } = state;

  // Active slide to render (either PlayCast enhanced slide or legacy verse mapped)
  const activeSlide =
    currentSlide ||
    (verse
      ? {
          id: `legacy-${verse.chapter}-${verse.verse}`,
          label: verse.reference,
          type: 'scripture' as const,
          textTamil: verse.text,
          reference: verse.reference,
          templateId: settings?.templateId || 'fullscreen',
        }
      : null);

  const isActuallyShowing = isLive && !isBlank && activeSlide;

  return (
    <div className="w-screen h-screen overflow-hidden flex items-center justify-center relative select-none bg-transparent">
      {isActuallyShowing ? (
        <SlideRenderer
          slide={activeSlide}
          settings={settings}
          overlay={overlay}
          mode="obs"
          isTransitioning={isTransitioning}
        />
      ) : (
        /* When offline or blank, provide transparent canvas with temporary connection confirmation */
        <div className="w-full h-full bg-transparent flex flex-col items-center justify-end pb-8 pointer-events-none">
          {showStandbyNotice && (
            <div className="bg-slate-950/80 border border-emerald-500/40 text-emerald-300 px-4 py-2 rounded-xl flex items-center gap-2.5 shadow-2xl backdrop-blur-md">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold tracking-wide">
                PlayCast OBS Source Connected • Ready
              </span>
              <span className="text-[10px] text-slate-400 border-l border-white/20 pl-2">
                Click any slide & press &quot;Go Live&quot; in Studio to project
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}