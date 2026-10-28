import React, { useState, useEffect } from 'react';
import { syncManager, type DisplayState } from '@/lib/sync';
import { SlideRenderer } from '@/components/studio/SlideRenderer';
import { getApiUrl } from '@/lib/api';

export default function ProjectorPage() {
  const [state, setState] = useState<DisplayState>(() => syncManager.getState());

  const lastTimestamp = React.useRef<number>(0);

  useEffect(() => {
    // Initial fetch from backend
    fetch(getApiUrl('/live'))
      .then((r) => r.json())
      .then((json) => {
        if (json?.success && json?.state) {
          setState(json.state);
          if (json.state.timestamp) lastTimestamp.current = json.state.timestamp;
        }
      })
      .catch(() => {});

    const unsubscribe = syncManager.subscribe((newState) => {
      setState(newState);
    });

    const poll = setInterval(async () => {
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
        // Ignore
      }

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
    }, 300);

    return () => {
      unsubscribe();
      clearInterval(poll);
    };
  }, [state]);

  const { currentSlide, isLive, isBlank, settings, overlay } = state;

  return (
    <div className="w-screen h-screen overflow-hidden bg-black flex items-center justify-center select-none cursor-none">
      {isLive && !isBlank && currentSlide ? (
        <SlideRenderer
          slide={currentSlide}
          settings={settings}
          overlay={overlay}
          mode="projector"
        />
      ) : (
        <div className="w-full h-full bg-black" />
      )}
    </div>
  );
}
