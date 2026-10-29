import React, { useState, useEffect, useCallback } from 'react';
import type {
  ServiceSection,
  ServiceItem,
  PlayCastSlide,
  WorshipSong,
  ScreenOverlay,
} from '@/types/playcast';
import {
  syncManager,
  defaultSettings,
  type DisplaySettings as DisplaySettingsType,
  type DisplayState,
} from '@/lib/sync';
import { defaultServiceSections, defaultSongLibrary } from '@/data/default-service';
import { loadBibleData, isBibleLoaded } from '@/data/tamil-bible';
import { fetchSongs, saveService, postLiveBroadcastState } from '@/lib/api';
import { TopBar } from '@/components/studio/TopBar';
import { ServiceSidebar } from '@/components/studio/ServiceSidebar';
import { SlideMatrix } from '@/components/studio/SlideMatrix';
import { LiveDualMonitors } from '@/components/studio/LiveDualMonitors';
import { BottomDock } from '@/components/studio/BottomDock';
import { SlideEditorWorkspace } from '@/components/studio/SlideEditorWorkspace';
import { StageWorkspace } from '@/components/studio/StageWorkspace';
import { DisplaySettings } from '@/components/DisplaySettings';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function PlayCastStudio() {
  // 1. Data Initialization
  const [bibleReady, setBibleReady] = useState(isBibleLoaded());
  useEffect(() => {
    if (!bibleReady) {
      loadBibleData().then(() => setBibleReady(true));
    }
  }, [bibleReady]);

  const [sections, setSections] = useState<ServiceSection[]>(() => {
    try {
      const saved = localStorage.getItem('playcast-sections');
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return defaultServiceSections;
  });

  const [songLibrary, setSongLibrary] = useState<WorshipSong[]>(defaultSongLibrary);

  // Active playlist selection
  const [selectedItem, setSelectedItem] = useState<ServiceItem | null>(() => {
    return sections[1]?.items[0] || sections[0]?.items[0] || null;
  });

  // Staging & Live Broadcast State
  const [previewSlide, setPreviewSlide] = useState<PlayCastSlide | null>(() => {
    return selectedItem?.slides[0] || null;
  });
  const [liveSlide, setLiveSlide] = useState<PlayCastSlide | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [isBlank, setIsBlank] = useState(false);
  const [settings, setSettings] = useState<DisplaySettingsType>(defaultSettings);
  const [activeMode, setActiveMode] = useState<'show' | 'edit' | 'stage'>('show');
  const [serviceName, setServiceName] = useState<string>(() => {
    return localStorage.getItem('playcast-service-name') || 'Sunday Morning Service';
  });
  const [stageMessage, setStageMessage] = useState<string | null>(null);
  const [activeTimer, setActiveTimer] = useState<ServiceTimer | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSideCollapsed, setIsSideCollapsed] = useState(false);

  // Overlays (Speaker Lower-Third & Announcement Ticker)
  const [overlay, setOverlay] = useState<ScreenOverlay | null>({
    id: 'ov-speaker',
    type: 'speaker',
    name: 'Pastor David Samuel',
    title: 'Senior Pastor',
    active: false,
  });

  // Load worship songs from PHP backend on mount
  useEffect(() => {
    fetchSongs().then((songs) => {
      if (songs && songs.length > 0) {
        setSongLibrary(songs);
      }
    });
  }, []);

  const handleSaveSongToLibrary = (song: WorshipSong) => {
    setSongLibrary((prev) => [song, ...prev.filter((s) => s.id !== song.id)]);
  };

  // Save sections on change to localStorage AND PHP backend
  useEffect(() => {
    try {
      localStorage.setItem('playcast-sections', JSON.stringify(sections));
      localStorage.setItem('playcast-service-name', serviceName);
      saveService({
        id: 'service-sunday-default',
        name: serviceName,
        isActive: true,
        sections,
      });
    } catch {
      // Ignore
    }
  }, [sections, serviceName]);

  // Broadcast state helper
  const broadcastCurrentState = useCallback(
    (updates?: Partial<DisplayState>) => {
      const stateToBroadcast: DisplayState = {
        verse: liveSlide?.textTamil
          ? {
              bookTamil: liveSlide.reference || 'வேதாகமம்',
              chapter: 1,
              verse: 1,
              text: liveSlide.textTamil,
              reference: liveSlide.reference || liveSlide.title || '',
            }
          : null,
        currentSlide: liveSlide,
        nextSlide: null,
        isLive,
        isBlank,
        activeOverlay: overlay,
        timer: activeTimer,
        stageMessage,
        serviceName,
        settings,
        ...updates,
      };

      // Calculate next slide for stage display preview
      if (selectedItem && (updates?.currentSlide || liveSlide)) {
        const cur = updates?.currentSlide || liveSlide;
        const idx = selectedItem.slides.findIndex((s) => s.id === cur?.id);
        if (idx >= 0 && idx < selectedItem.slides.length - 1) {
          stateToBroadcast.nextSlide = selectedItem.slides[idx + 1];
        }
      }

      syncManager.broadcast(stateToBroadcast);
    },
    [liveSlide, isLive, isBlank, overlay, settings, selectedItem, activeTimer, stageMessage, serviceName]
  );

  // Rename Service Handler
  const handleRenameService = (newName: string) => {
    setServiceName(newName);
    try {
      localStorage.setItem('playcast-service-name', newName);
      saveService({
        id: 'service-sunday-default',
        name: newName,
        isActive: true,
        sections,
      });
    } catch {
      // Ignore
    }
    broadcastCurrentState({ serviceName: newName });
  };

  // Send message to stage confidence monitor
  const handleSendStageMessage = (msg: string | null) => {
    setStageMessage(msg);
    broadcastCurrentState({ stageMessage: msg });
  };

  // Update item from Slide Editor
  const handleUpdateItem = (updatedItem: ServiceItem) => {
    setSections((prev) =>
      prev.map((sec) => ({
        ...sec,
        items: sec.items.map((it) => (it.id === updatedItem.id ? updatedItem : it)),
      }))
    );
    setSelectedItem(updatedItem);
  };

  const handleUpdateTimer = (timer: ServiceTimer | null) => {
    setActiveTimer(timer);
    broadcastCurrentState({ timer });
  };

  // Sync when settings change
  useEffect(() => {
    broadcastCurrentState({ settings });
  }, [settings, broadcastCurrentState]);

  // Slide Selection (Staging)
  const handleSelectSlide = (slide: PlayCastSlide) => {
    setPreviewSlide(slide);
  };

  // Go Live with a slide
  const handleGoLiveSlide = (slide: PlayCastSlide) => {
    setPreviewSlide(slide);
    setLiveSlide(slide);
    setIsLive(true);
    setIsBlank(false);
    broadcastCurrentState({
      currentSlide: slide,
      isLive: true,
      isBlank: false,
    });
  };

  // Go Live with currently previewed slide
  const handleGoLiveStaged = () => {
    if (!previewSlide) return;
    setLiveSlide(previewSlide);
    setIsLive(true);
    setIsBlank(false);
    broadcastCurrentState({
      currentSlide: previewSlide,
      isLive: true,
      isBlank: false,
    });
  };

  const handleStop = () => {
    setIsLive(false);
    setIsBlank(false);
    broadcastCurrentState({
      isLive: false,
      isBlank: false,
    });
  };

  const handleToggleBlank = () => {
    const nextBlank = !isBlank;
    setIsBlank(nextBlank);
    broadcastCurrentState({
      isBlank: nextBlank,
    });
  };

  const handleClearAll = () => {
    setLiveSlide(null);
    setIsLive(false);
    setIsBlank(false);
    broadcastCurrentState({
      currentSlide: null,
      isLive: false,
      isBlank: false,
    });
  };

  // Next / Previous navigation
  const handleNextSlide = () => {
    if (!selectedItem) return;
    const current = liveSlide || previewSlide;
    const currentIndex = selectedItem.slides.findIndex((s) => s.id === current?.id);

    if (currentIndex >= 0 && currentIndex < selectedItem.slides.length - 1) {
      const next = selectedItem.slides[currentIndex + 1];
      if (isLive) {
        handleGoLiveSlide(next);
      } else {
        handleSelectSlide(next);
      }
    }
  };

  const handlePrevSlide = () => {
    if (!selectedItem) return;
    const current = liveSlide || previewSlide;
    const currentIndex = selectedItem.slides.findIndex((s) => s.id === current?.id);

    if (currentIndex > 0) {
      const prev = selectedItem.slides[currentIndex - 1];
      if (isLive) {
        handleGoLiveSlide(prev);
      } else {
        handleSelectSlide(prev);
      }
    }
  };

  // Overlay Toggles
  const handleToggleSpeakerOverlay = () => {
    const nextActive = !(overlay?.active && overlay.type === 'speaker');
    const newOverlay: ScreenOverlay = {
      id: 'ov-speaker',
      type: 'speaker',
      name: 'Pastor David Samuel',
      title: 'Senior Pastor',
      active: nextActive,
    };
    setOverlay(newOverlay);
    broadcastCurrentState({ activeOverlay: newOverlay });
  };

  const handleToggleTickerOverlay = () => {
    const nextActive = !(overlay?.active && overlay.type === 'ticker');
    const newOverlay: ScreenOverlay = {
      id: 'ov-ticker',
      type: 'ticker',
      tickerText: 'ஆலயத்திற்கு அன்புடன் வரவேற்கிறோம் • Welcome to Sunday Morning Worship • God bless you!',
      active: nextActive,
    };
    setOverlay(newOverlay);
    broadcastCurrentState({ activeOverlay: newOverlay });
  };

  // Add Scripture Verse to Service
  const handleAddScriptureToService = (verse: {
    bookTamil: string;
    chapter: number;
    verse: number;
    text: string;
    reference: string;
  }) => {
    const newSlide: PlayCastSlide = {
      id: `scrip-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      label: `${verse.bookTamil} ${verse.chapter}:${verse.verse}`,
      type: 'scripture',
      title: verse.reference,
      textTamil: verse.text,
      reference: verse.reference,
      templateId: settings.templateId || 'box',
      background: {
        type: 'gradient',
        gradientFrom: '#09151e',
        gradientTo: '#103947',
        overlay: 60,
      },
    };

    setSections((prev) => {
      const updated = [...prev];
      let scripSection = updated.find((s) => s.id === 'sec-scripture');
      if (!scripSection) {
        scripSection = { id: 'sec-scripture', name: 'Scripture Reading', items: [] };
        updated.push(scripSection);
      }

      // Add to an item or create one
      const targetItem = scripSection.items[0];
      if (targetItem) {
        targetItem.slides.push(newSlide);
      } else {
        scripSection.items.push({
          id: `item-${Date.now()}`,
          title: `${verse.bookTamil} ${verse.chapter}`,
          category: 'Scripture',
          arrangement: 'Default',
          slides: [newSlide],
        });
      }
      return updated;
    });

    // Auto-select staged slide
    setPreviewSlide(newSlide);
  };

  // Add Song from Library to Service
  const handleAddSongToService = (song: WorshipSong) => {
    const slides: PlayCastSlide[] = song.sections.map((sec, idx) => ({
      id: `song-${song.id}-s${idx}`,
      label: sec.tag,
      type: 'lyrics',
      title: song.title,
      textTamil: sec.tamilText,
      textEnglish: sec.englishText,
      templateId: settings.templateId || 'fullscreen',
      background: {
        type: 'gradient',
        gradientFrom: '#120b22',
        gradientTo: '#43135c',
        overlay: 70,
      },
    }));

    const newItem: ServiceItem = {
      id: `service-song-${Date.now()}`,
      title: `${song.title} (${song.tamilTitle || ''})`,
      tamilTitle: song.tamilTitle,
      category: 'Worship',
      arrangement: 'Default',
      slides,
    };

    setSections((prev) => {
      const updated = [...prev];
      let worshipSec = updated.find((s) => s.id === 'sec-worship');
      if (!worshipSec) {
        worshipSec = { id: 'sec-worship', name: 'Worship Songs', items: [] };
        updated.push(worshipSec);
      }
      worshipSec.items.push(newItem);
      return updated;
    });

    setSelectedItem(newItem);
    if (slides[0]) setPreviewSlide(slides[0]);
  };

  // Apply Background Presets (updates settings, active item slides, preview, and live output)
  const handleApplyBackground = (bg: {
    type: 'gradient' | 'solid' | 'transparent';
    gradientFrom?: string;
    gradientTo?: string;
    color?: string;
  }) => {
    const updatedBg = {
      type: bg.type,
      gradientFrom: bg.gradientFrom,
      gradientTo: bg.gradientTo,
      color: bg.color,
      overlay: 60,
    };

    const newSettings: DisplaySettingsType = {
      ...settings,
      backgroundType: bg.type,
      gradientFrom: bg.gradientFrom || settings.gradientFrom,
      gradientTo: bg.gradientTo || settings.gradientTo,
      backgroundColor: bg.color || settings.backgroundColor,
    };
    setSettings(newSettings);

    if (selectedItem) {
      const updatedSlides = selectedItem.slides.map((s) => ({
        ...s,
        background: updatedBg,
      }));
      const updatedItem = { ...selectedItem, slides: updatedSlides };
      setSelectedItem(updatedItem);
      setSections((prev) =>
        prev.map((sec) => ({
          ...sec,
          items: sec.items.map((it) => (it.id === updatedItem.id ? updatedItem : it)),
        }))
      );
    }

    if (previewSlide) {
      setPreviewSlide((prev) => (prev ? { ...prev, background: updatedBg } : null));
    }

    if (liveSlide) {
      const updatedLive = { ...liveSlide, background: updatedBg };
      setLiveSlide(updatedLive);
      broadcastCurrentState({ currentSlide: updatedLive, settings: newSettings });
    } else {
      broadcastCurrentState({ settings: newSettings });
    }
  };

  // Apply Template Preset (updates settings, active item slides, preview, and live output)
  const handleApplyTemplate = (
    templateId: 'fullscreen' | 'lower-third' | 'box' | 'trendy' | 'minimal'
  ) => {
    const newSettings: DisplaySettingsType = {
      ...settings,
      templateId,
    };
    setSettings(newSettings);

    if (selectedItem) {
      const updatedSlides = selectedItem.slides.map((s) => ({
        ...s,
        templateId,
      }));
      const updatedItem = { ...selectedItem, slides: updatedSlides };
      setSelectedItem(updatedItem);
      setSections((prev) =>
        prev.map((sec) => ({
          ...sec,
          items: sec.items.map((it) => (it.id === updatedItem.id ? updatedItem : it)),
        }))
      );
    }

    if (previewSlide) {
      setPreviewSlide((prev) => (prev ? { ...prev, templateId } : null));
    }

    if (liveSlide) {
      const updatedLive = { ...liveSlide, templateId };
      setLiveSlide(updatedLive);
      broadcastCurrentState({ currentSlide: updatedLive, settings: newSettings });
    } else {
      broadcastCurrentState({ settings: newSettings });
    }
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)
        return;

      switch (e.key) {
        case 'ArrowRight':
        case 'PageDown':
          e.preventDefault();
          handleNextSlide();
          break;
        case 'ArrowLeft':
        case 'PageUp':
          e.preventDefault();
          handlePrevSlide();
          break;
        case 'Escape':
          e.preventDefault();
          if (isLive) handleStop();
          else handleToggleBlank();
          break;
        case ' ':
          e.preventDefault();
          if (isLive) handleStop();
          else handleGoLiveStaged();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  return (
    <div className="h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden font-sans">
      {/* 1. TOP BAR */}
      <TopBar
        isLive={isLive && !isBlank}
        activeService={serviceName}
        onRenameService={handleRenameService}
        activeMode={activeMode}
        onModeChange={setActiveMode}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onStopLive={handleStop}
        onGoLive={handleGoLiveStaged}
      />

      {/* 2. MODE-BASED WORKSPACE SWITCHING (SHOW / EDIT / STAGE) */}
      {activeMode === 'show' && (
        <>
          <div className="flex-1 flex min-h-0 min-w-0 w-full overflow-hidden">
            {/* Left Column: Service Playlist Sidebar */}
            <ServiceSidebar
              sections={sections}
              selectedItem={selectedItem}
              onSelectItem={(item) => {
                setSelectedItem(item);
                if (item.slides.length > 0) setPreviewSlide(item.slides[0]);
              }}
              onAddItem={(sectionId) => {
                // Add a blank placeholder slide to section
                const newItem: ServiceItem = {
                  id: `item-${Date.now()}`,
                  title: 'New Service Item',
                  category: 'Worship',
                  arrangement: 'Default',
                  slides: [
                    {
                      id: `s-${Date.now()}`,
                      label: 'Slide 1',
                      type: 'presentation',
                      textTamil: 'புதிய ஸ்லைடு உரை',
                      textEnglish: 'New slide content',
                    },
                  ],
                };
                setSections((prev) =>
                  prev.map((s) => (s.id === sectionId ? { ...s, items: [...s.items, newItem] } : s))
                );
                setSelectedItem(newItem);
              }}
              onDeleteItem={(itemId) => {
                setSections((prev) =>
                  prev.map((s) => ({
                    ...s,
                    items: s.items.filter((i) => i.id !== itemId),
                  }))
                );
                if (selectedItem?.id === itemId) setSelectedItem(null);
              }}
              onAddSection={() => {
                const newSec: ServiceSection = {
                  id: `sec-${Date.now()}`,
                  name: 'New Section',
                  items: [],
                };
                setSections((prev) => [...prev, newSec]);
              }}
            />

            {/* Center Column: Slide Matrix Canvas */}
            <SlideMatrix
              item={selectedItem}
              liveSlide={liveSlide}
              previewSlide={previewSlide}
              onSelectSlide={handleSelectSlide}
              onGoLiveSlide={handleGoLiveSlide}
            />

            {/* Right Column: Dual Monitors & Live Actions */}
            <LiveDualMonitors
              previewSlide={previewSlide}
              liveSlide={liveSlide}
              isLive={isLive}
              isBlank={isBlank}
              overlay={overlay}
              settings={settings}
              isCollapsed={isSideCollapsed}
              onToggleCollapse={() => setIsSideCollapsed((prev) => !prev)}
              onGoLive={handleGoLiveStaged}
              onStop={handleStop}
              onToggleBlank={handleToggleBlank}
              onClearAll={handleClearAll}
              onPrevSlide={handlePrevSlide}
              onNextSlide={handleNextSlide}
              onToggleSpeakerOverlay={handleToggleSpeakerOverlay}
              onToggleTickerOverlay={handleToggleTickerOverlay}
              onChangeTransition={(trans) =>
                setSettings((prev) => ({ ...prev, transition: trans }))
              }
            />
          </div>

          {/* 3. BOTTOM ASSET & MEDIA DOCK (FreeShow Style) */}
          <BottomDock
            songLibrary={songLibrary}
            settings={settings}
            activeTimer={activeTimer}
            onUpdateTimer={handleUpdateTimer}
            onAddScriptureToService={handleAddScriptureToService}
            onAddSongToService={handleAddSongToService}
            onSaveSongToLibrary={handleSaveSongToLibrary}
            onApplyBackground={handleApplyBackground}
            onApplyTemplate={handleApplyTemplate}
          />
        </>
      )}

      {/* EDIT MODE: Slide & Content Editor */}
      {activeMode === 'edit' && (
        <SlideEditorWorkspace
          item={selectedItem}
          onUpdateItem={handleUpdateItem}
          onClose={() => setActiveMode('show')}
          onSelectSlideForPreview={handleSelectSlide}
          onGoLiveSlide={handleGoLiveSlide}
          settings={settings}
        />
      )}

      {/* STAGE MODE: Stage Confidence Director & Prompter */}
      {activeMode === 'stage' && (
        <StageWorkspace
          liveSlide={liveSlide}
          nextSlide={
            selectedItem && liveSlide
              ? (() => {
                  const idx = selectedItem.slides.findIndex((s) => s.id === liveSlide.id);
                  return idx >= 0 && idx < selectedItem.slides.length - 1
                    ? selectedItem.slides[idx + 1]
                    : null;
                })()
              : null
          }
          isLive={isLive}
          isBlank={isBlank}
          activeTimer={activeTimer}
          onUpdateTimer={handleUpdateTimer}
          stageMessage={stageMessage}
          onSendStageMessage={handleSendStageMessage}
          serviceName={serviceName}
          onClose={() => setActiveMode('show')}
        />
      )}

      {/* Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="max-w-xl bg-slate-950 border-white/15 text-white max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              Display & Output Settings
            </DialogTitle>
          </DialogHeader>
          <div className="p-2">
            <DisplaySettings settings={settings} onChange={setSettings} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}