import React from 'react';
import { Play, Sparkles, Layers, Plus, Clock, Edit2 } from 'lucide-react';
import type { PlayCastSlide, ServiceItem } from '@/types/playcast';
import { Button } from '@/components/ui/button';

interface SlideMatrixProps {
  item: ServiceItem | null;
  liveSlide: PlayCastSlide | null;
  previewSlide: PlayCastSlide | null;
  onSelectSlide: (slide: PlayCastSlide) => void;
  onGoLiveSlide: (slide: PlayCastSlide) => void;
  onAddSlide?: () => void;
}

export const SlideMatrix: React.FC<SlideMatrixProps> = ({
  item,
  liveSlide,
  previewSlide,
  onSelectSlide,
  onGoLiveSlide,
  onAddSlide,
}) => {
  if (!item) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-950/40 text-muted-foreground select-none p-6">
        <Layers className="w-10 h-10 mb-3 opacity-30 text-fuchsia-400" />
        <p className="text-sm font-semibold text-slate-300">Select an item from the playlist</p>
        <p className="text-xs text-muted-foreground mt-1">
          Choose a worship song or scripture reading to display its slide matrix
        </p>
      </div>
    );
  }

  const getTagColor = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes('chorus')) return 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30';
    if (l.includes('verse')) return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
    if (l.includes('bridge')) return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    if (l.includes('outro') || l.includes('ending')) return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    return 'bg-slate-700/40 text-slate-300 border-slate-600/30';
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 min-w-0 bg-slate-950/40 select-none overflow-hidden">
      {/* Item Header & Arrangements Toolbar */}
      <div className="h-12 border-b border-border/40 px-4 flex items-center justify-between shrink-0 bg-slate-950/60 backdrop-blur-sm min-w-0">
        <div className="flex items-center gap-3 truncate min-w-0">
          <h2 className="text-sm font-bold text-white truncate flex items-center gap-2">
            <span>{item.title}</span>
            {item.tamilTitle && (
              <span className="text-xs font-normal text-muted-foreground truncate">
                ({item.tamilTitle})
              </span>
            )}
          </h2>

          <div className="h-3.5 w-px bg-white/10 shrink-0" />

          {/* Arrangement Tabs (FreeShow style) */}
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-[10px] text-muted-foreground font-semibold uppercase mr-1">
              Arrangement:
            </span>
            {['Default', 'Shorter'].map((arr) => (
              <button
                key={arr}
                className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium transition-all cursor-pointer ${
                  item.arrangement === arr
                    ? 'bg-fuchsia-600/25 text-fuchsia-300 border border-fuchsia-500/40'
                    : 'text-slate-400 hover:text-white bg-slate-900 border border-white/5'
                }`}
              >
                {arr}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onAddSlide && (
            <Button
              variant="outline"
              size="sm"
              onClick={onAddSlide}
              className="h-7 text-xs border-white/10 bg-slate-900 hover:bg-slate-800 text-slate-300 cursor-pointer"
            >
              <Plus className="w-3 h-3 mr-1 text-fuchsia-400" />
              Add Slide
            </Button>
          )}
        </div>
      </div>

      {/* Slide Matrix Canvas */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 min-w-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 min-w-0">
          {item.slides.map((slide, index) => {
            const isLive = liveSlide?.id === slide.id;
            const isPreview = previewSlide?.id === slide.id;

            return (
              <div
                key={slide.id}
                onClick={() => onSelectSlide(slide)}
                onDoubleClick={() => onGoLiveSlide(slide)}
                className={`group relative rounded-xl border transition-all duration-200 cursor-pointer flex flex-col overflow-hidden min-w-0 ${
                  isLive
                    ? 'border-fuchsia-500 shadow-xl shadow-fuchsia-500/20 ring-2 ring-fuchsia-500/80 bg-fuchsia-950/25'
                    : isPreview
                    ? 'border-amber-500 shadow-md shadow-amber-500/10 ring-1 ring-amber-500 bg-slate-900/90'
                    : 'border-white/10 hover:border-white/25 bg-slate-900/60 hover:bg-slate-900/90'
                }`}
              >
                {/* Card Header (Tag & Slide Actions) */}
                <div className="h-7 px-2.5 bg-slate-950/80 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded border ${getTagColor(
                        slide.label
                      )}`}
                    >
                      {slide.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {slide.duration && (
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {slide.duration}s
                      </span>
                    )}
                    <span className="text-[10px] text-slate-500 font-mono">
                      #{index + 1}
                    </span>
                  </div>
                </div>

                {/* 16:9 Thumbnail Body */}
                <div
                  className="aspect-video w-full p-3 flex flex-col justify-center items-center text-center relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40"
                  style={{
                    background: slide.background?.gradientFrom
                      ? `linear-gradient(135deg, ${slide.background.gradientFrom}, ${slide.background.gradientTo})`
                      : undefined,
                  }}
                >
                  {slide.textTamil && (
                    <p className="text-xs sm:text-sm font-semibold text-white line-clamp-3 leading-snug drop-shadow-sm font-['Noto_Sans_Tamil']">
                      {slide.textTamil}
                    </p>
                  )}
                  {slide.textEnglish && (
                    <p className="text-[10px] text-slate-300 italic line-clamp-2 mt-1 opacity-80 leading-tight">
                      {slide.textEnglish}
                    </p>
                  )}

                  {/* Hover Quick "Go Live" Overlay Button */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onGoLiveSlide(slide);
                      }}
                      className="h-7 px-3 text-xs font-semibold bg-fuchsia-600 hover:bg-fuchsia-500 text-white shadow-md shadow-fuchsia-600/40 cursor-pointer"
                    >
                      <Play className="w-3 h-3 mr-1 fill-white" />
                      Go Live
                    </Button>
                  </div>
                </div>

                {/* Card Footer / Status Marker */}
                <div className="h-6 px-2.5 bg-slate-950/90 flex items-center justify-between text-[10px] border-t border-white/5">
                  <span className="text-muted-foreground truncate">
                    {slide.reference || slide.title || ''}
                  </span>
                  {isLive && (
                    <span className="font-bold text-fuchsia-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 animate-pulse" />
                      LIVE
                    </span>
                  )}
                  {isPreview && !isLive && (
                    <span className="font-semibold text-amber-400">
                      STAGED
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
