import React, { useState, useEffect } from 'react';
import {
  Edit3,
  Plus,
  Trash2,
  Copy,
  Play,
  MonitorPlay,
  ArrowLeft,
  Check,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  SplitSquareVertical,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { ServiceItem, PlayCastSlide } from '@/types/playcast';
import type { DisplaySettings as DisplaySettingsType } from '@/lib/sync';
import { SlideRenderer } from './SlideRenderer';

interface SlideEditorWorkspaceProps {
  item: ServiceItem | null;
  onUpdateItem: (updatedItem: ServiceItem) => void;
  onClose: () => void;
  onSelectSlideForPreview: (slide: PlayCastSlide) => void;
  onGoLiveSlide: (slide: PlayCastSlide) => void;
  settings: DisplaySettingsType;
}

export const SlideEditorWorkspace: React.FC<SlideEditorWorkspaceProps> = ({
  item,
  onUpdateItem,
  onClose,
  onSelectSlideForPreview,
  onGoLiveSlide,
  settings,
}) => {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form State for current slide
  const activeSlide = item?.slides?.[activeSlideIndex] || item?.slides?.[0];

  const [label, setLabel] = useState(activeSlide?.label || 'Verse 1');
  const [title, setTitle] = useState(activeSlide?.title || item?.title || '');
  const [reference, setReference] = useState(activeSlide?.reference || '');
  const [textTamil, setTextTamil] = useState(activeSlide?.textTamil || '');
  const [textEnglish, setTextEnglish] = useState(activeSlide?.textEnglish || '');
  const [presenterName, setPresenterName] = useState(item?.presenterInfo?.name || '');
  const [presenterRole, setPresenterRole] = useState(item?.presenterInfo?.role || '');

  // Sync form when active slide changes
  useEffect(() => {
    if (activeSlide) {
      setLabel(activeSlide.label || `Slide ${activeSlideIndex + 1}`);
      setTitle(activeSlide.title || item?.title || '');
      setReference(activeSlide.reference || '');
      setTextTamil(activeSlide.textTamil || '');
      setTextEnglish(activeSlide.textEnglish || '');
    }
  }, [activeSlideIndex, item, activeSlide]);

  useEffect(() => {
    setPresenterName(item?.presenterInfo?.name || '');
    setPresenterRole(item?.presenterInfo?.role || '');
  }, [item]);

  if (!item || !item.slides || item.slides.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-950 text-slate-400">
        <Edit3 className="w-12 h-12 text-muted-foreground/40 mb-3" />
        <h3 className="text-lg font-bold text-white mb-1">No Service Item Selected</h3>
        <p className="text-sm max-w-md text-center text-slate-400 mb-4">
          Please select a song, scripture, or presentation from the Service Playlist or Lyrics Library in Show mode to edit its slides.
        </p>
        <Button onClick={onClose} variant="secondary" className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Show Mode</span>
        </Button>
      </div>
    );
  }

  // Apply changes to parent
  const handleSaveCurrentSlide = () => {
    const updatedSlides = [...item.slides];
    updatedSlides[activeSlideIndex] = {
      ...activeSlide,
      label,
      title,
      reference,
      textTamil,
      textEnglish,
    };

    const updatedItem: ServiceItem = {
      ...item,
      presenterInfo: presenterName.trim()
        ? {
            name: presenterName.trim(),
            role: presenterRole.trim() || 'Worship Leader',
          }
        : undefined,
      slides: updatedSlides,
    };

    onUpdateItem(updatedItem);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 1800);
  };

  // Add new slide
  const handleAddSlide = () => {
    const newSlide: PlayCastSlide = {
      id: `slide-${Date.now()}`,
      label: `Verse ${item.slides.length + 1}`,
      title: item.title,
      type: 'lyrics',
      textTamil: 'புதிய பாடல் வரி...',
      textEnglish: 'New verse lyrics line...',
      reference: item.title,
    };

    const updatedItem = {
      ...item,
      slides: [...item.slides, newSlide],
    };

    onUpdateItem(updatedItem);
    setActiveSlideIndex(item.slides.length);
  };

  // Duplicate slide
  const handleDuplicateSlide = () => {
    const duplicated: PlayCastSlide = {
      ...activeSlide,
      id: `slide-${Date.now()}`,
      label: `${activeSlide.label} (Copy)`,
    };

    const updatedSlides = [...item.slides];
    updatedSlides.splice(activeSlideIndex + 1, 0, duplicated);

    onUpdateItem({
      ...item,
      slides: updatedSlides,
    });
    setActiveSlideIndex(activeSlideIndex + 1);
  };

  // Delete slide
  const handleDeleteSlide = () => {
    if (item.slides.length <= 1) {
      alert('An item must have at least one slide.');
      return;
    }

    const updatedSlides = item.slides.filter((_, idx) => idx !== activeSlideIndex);
    const newIdx = Math.max(0, activeSlideIndex - 1);

    onUpdateItem({
      ...item,
      slides: updatedSlides,
    });
    setActiveSlideIndex(newIdx);
  };

  // Split slide by double newline or 4 lines
  const handleSplitSlide = () => {
    const lines = textTamil.split('\n').filter((l) => l.trim().length > 0);
    if (lines.length <= 2) {
      alert('Slide has too few lines to split.');
      return;
    }

    const mid = Math.ceil(lines.length / 2);
    const part1 = lines.slice(0, mid).join('\n');
    const part2 = lines.slice(mid).join('\n');

    const updatedSlides = [...item.slides];
    updatedSlides[activeSlideIndex] = {
      ...activeSlide,
      label: `${label} (Part 1)`,
      textTamil: part1,
    };

    const secondPart: PlayCastSlide = {
      ...activeSlide,
      id: `slide-split-${Date.now()}`,
      label: `${label} (Part 2)`,
      textTamil: part2,
    };

    updatedSlides.splice(activeSlideIndex + 1, 0, secondPart);

    onUpdateItem({
      ...item,
      slides: updatedSlides,
    });
  };

  const previewCurrent: PlayCastSlide = {
    ...activeSlide,
    label,
    title,
    reference,
    textTamil,
    textEnglish,
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-white min-h-0 min-w-0 overflow-hidden font-sans">
      {/* Editor Sub-Header */}
      <div className="h-12 bg-slate-900/90 border-b border-white/10 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            className="h-8 px-2.5 text-xs text-slate-400 hover:text-white hover:bg-white/10 flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Show</span>
          </Button>

          <div className="h-4 w-px bg-white/10" />

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-600/30">
              EDIT MODE
            </span>
            <span className="text-sm font-bold text-white truncate max-w-[280px]">
              {item.title}
            </span>
            <span className="text-xs text-muted-foreground hidden md:inline">
              (Slide {activeSlideIndex + 1} of {item.slides.length})
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleSaveCurrentSlide}
            className={`h-8 px-3 text-xs font-semibold flex items-center gap-1.5 transition-all ${
              saveSuccess
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-fuchsia-600 hover:bg-fuchsia-500 text-white'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            <span>{saveSuccess ? 'Saved!' : 'Save Slide'}</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => onSelectSlideForPreview(previewCurrent)}
            className="h-8 px-2.5 text-xs bg-slate-800 border-white/10 hover:bg-white/10 text-white flex items-center gap-1.5"
            title="Cue this slide in the studio Preview Monitor"
          >
            <MonitorPlay className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Stage Preview</span>
          </Button>

          <Button
            size="sm"
            onClick={() => onGoLiveSlide(previewCurrent)}
            className="h-8 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5"
            title="Directly send this edited slide to Live Broadcast"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Push Live</span>
          </Button>
        </div>
      </div>

      {/* Main 3-Section Workspace */}
      <div className="flex-1 flex min-h-0 min-w-0 overflow-hidden">
        {/* Left Column: Slide Thumbnails List */}
        <div className="w-60 bg-slate-900/60 border-r border-white/10 flex flex-col shrink-0">
          <div className="p-3 border-b border-white/10 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Slides ({item.slides.length})
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleAddSlide}
              className="h-6 px-2 text-xs text-fuchsia-400 hover:text-white hover:bg-fuchsia-950 flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>Add</span>
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
            {item.slides.map((s, idx) => {
              const isSelected = idx === activeSlideIndex;
              return (
                <div
                  key={s.id || idx}
                  onClick={() => {
                    handleSaveCurrentSlide();
                    setActiveSlideIndex(idx);
                  }}
                  className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-fuchsia-950/40 border-fuchsia-500 shadow-md shadow-fuchsia-600/10'
                      : 'bg-slate-900 border-white/5 hover:border-white/20 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                        isSelected
                          ? 'bg-fuchsia-600 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {s.label || `Slide ${idx + 1}`}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">#{idx + 1}</span>
                  </div>

                  <p className="text-xs font-medium text-slate-200 line-clamp-2 leading-relaxed">
                    {s.textTamil || s.textEnglish || 'Empty Slide Content'}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="p-2 border-t border-white/10 flex items-center gap-1.5 bg-slate-950/40">
            <Button
              size="sm"
              variant="outline"
              onClick={handleDuplicateSlide}
              className="flex-1 h-7 text-xs bg-slate-800 border-white/10 hover:bg-white/10 text-slate-300"
              title="Duplicate selected slide"
            >
              <Copy className="w-3 h-3 mr-1" />
              Duplicate
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDeleteSlide}
              className="h-7 px-2 text-xs bg-rose-950/30 border-rose-500/30 text-rose-300 hover:bg-rose-900/50"
              title="Delete selected slide"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Center Column: Live Visual Canvas Preview */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-950/80 overflow-y-auto">
          <div className="w-full max-w-3xl flex flex-col items-center">
            <div className="w-full flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-fuchsia-400" />
                Live Presentation Preview
              </span>
              <span className="text-slate-500">16:9 Broadcast Aspect</span>
            </div>

            {/* 16:9 Canvas */}
            <div className="w-full aspect-video rounded-xl overflow-hidden border border-white/20 shadow-2xl relative bg-black">
              <SlideRenderer
                slide={previewCurrent}
                settings={settings}
                mode="editor"
                className="w-full h-full"
              />
            </div>

            <div className="w-full mt-3 flex items-center justify-between text-[11px] text-slate-500">
              <span>Text auto-centers based on selected template</span>
              <span>Changes in the right panel reflect live on this canvas</span>
            </div>
          </div>
        </div>

        {/* Right Column: Slide Text & Metadata Properties Inspector */}
        <div className="w-84 sm:w-96 bg-slate-900/90 border-l border-white/10 flex flex-col shrink-0 overflow-y-auto p-4 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Type className="w-4 h-4 text-fuchsia-400" />
              Slide Content Properties
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleSplitSlide}
              className="h-6 px-2 text-[11px] text-cyan-400 hover:bg-cyan-950/50 flex items-center gap-1"
              title="Split long text into two slides"
            >
              <SplitSquareVertical className="w-3 h-3" />
              Split Slide
            </Button>
          </div>

          {/* Section Tag */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Section Label (Tag)
            </label>
            <div className="flex gap-1.5 flex-wrap">
              {['Verse 1', 'Verse 2', 'Verse 3', 'Chorus', 'Bridge', 'Scripture'].map(
                (preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setLabel(preset);
                      setTimeout(handleSaveCurrentSlide, 50);
                    }}
                    className={`px-2 py-0.5 text-[11px] rounded font-medium border cursor-pointer transition-all ${
                      label === preset
                        ? 'bg-fuchsia-600 text-white border-fuchsia-500'
                        : 'bg-slate-800 text-slate-400 border-white/10 hover:text-white'
                    }`}
                  >
                    {preset}
                  </button>
                )
              )}
            </div>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Verse 1, Chorus, Outro"
              className="h-8 text-xs bg-slate-950 border-white/10 text-white mt-1"
            />
          </div>

          {/* Title / Header */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Slide Title / Song Header
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Song or Chapter Title"
              className="h-8 text-xs bg-slate-950 border-white/10 text-white"
            />
          </div>

          {/* Tamil Primary Text */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-fuchsia-300 flex items-center gap-1">
                <span>Tamil Text (முதன்மை உரை)</span>
              </label>
              <span className="text-[10px] text-slate-500">Supports Unicode</span>
            </div>
            <Textarea
              value={textTamil}
              onChange={(e) => setTextTamil(e.target.value)}
              rows={4}
              placeholder="தமிழ் பாடல் வரிகள் அல்லது வசனத்தை இங்கே உள்ளிடவும்..."
              className="text-sm bg-slate-950 border-white/10 text-white font-['Noto_Sans_Tamil'] resize-none leading-relaxed"
            />
          </div>

          {/* English Secondary Text */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              English Subtitle / Translation
            </label>
            <Textarea
              value={textEnglish}
              onChange={(e) => setTextEnglish(e.target.value)}
              rows={3}
              placeholder="English translation or secondary chorus lyrics..."
              className="text-xs bg-slate-950 border-white/10 text-slate-200 resize-none leading-relaxed"
            />
          </div>

          {/* Reference / Subtitle */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Scripture Reference / Author Credit
            </label>
            <Input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="e.g. John 3:16 / John Newton"
              className="h-8 text-xs bg-slate-950 border-white/10 text-white"
            />
          </div>

          {/* Presenter / Worship Leader Lower-Third Info */}
          <div className="pt-2 border-t border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-fuchsia-300">
                Presenter / Leader Lower-Third
              </label>
              <span className="text-[10px] text-muted-foreground">Optional Tag</span>
            </div>
            <div className="space-y-2 bg-slate-950/60 p-2.5 rounded-lg border border-white/5">
              <div>
                <label className="text-[10px] font-semibold text-slate-400 block mb-1">
                  Leader / Speaker Name
                </label>
                <Input
                  value={presenterName}
                  onChange={(e) => setPresenterName(e.target.value)}
                  placeholder="e.g. Bro. Daniel / Sis. Sarah"
                  className="h-7 text-xs bg-slate-900 border-white/10 text-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-400 block mb-1">
                  Role or Title
                </label>
                <Input
                  value={presenterRole}
                  onChange={(e) => setPresenterRole(e.target.value)}
                  placeholder="e.g. Worship Leader / Scripture Reader"
                  className="h-7 text-xs bg-slate-900 border-white/10 text-white"
                />
              </div>
              <p className="text-[9px] text-slate-500">
                When this item is selected in Show mode, these details pre-load for the Lower-Third overlay.
              </p>
            </div>
          </div>

          {/* Quick Apply Button */}
          <div className="pt-2">
            <Button
              onClick={handleSaveCurrentSlide}
              className="w-full h-9 bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-xs font-bold shadow-md shadow-fuchsia-600/20"
            >
              <Check className="w-4 h-4 mr-1.5" />
              Apply Slide Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
