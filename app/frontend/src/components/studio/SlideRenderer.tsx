import React from 'react';
import type { PlayCastSlide, ScreenOverlay } from '@/types/playcast';
import type { DisplaySettings } from '@/lib/sync';

interface SlideRendererProps {
  slide: PlayCastSlide | null;
  settings?: DisplaySettings;
  overlay?: ScreenOverlay | null;
  mode?: 'preview' | 'live' | 'projector' | 'obs' | 'stage' | 'editor';
  isTransitioning?: boolean;
}

export const SlideRenderer: React.FC<SlideRendererProps> = ({
  slide,
  settings,
  overlay,
  mode = 'live',
  isTransitioning = false,
}) => {
  // Auto-hide timing effect for overlay
  const [overlayVisible, setOverlayVisible] = React.useState(!!overlay?.active);

  React.useEffect(() => {
    if (!overlay?.active) {
      setOverlayVisible(false);
      return;
    }

    setOverlayVisible(true);

    if (overlay.timingMode === 'auto-hide') {
      const duration = (overlay.autoHideSeconds || 8) * 1000;
      const timer = setTimeout(() => {
        setOverlayVisible(false);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [overlay?.active, overlay?.activatedAt, overlay?.timingMode, overlay?.autoHideSeconds]);

  if (!slide) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-black/40 text-muted-foreground select-none">
        <span className="text-xs uppercase tracking-widest opacity-40">No Slide Live</span>
      </div>
    );
  }

  const templateId = slide.templateId || settings?.templateId || 'fullscreen';
  const baseFontSize = settings?.fontSize || 42;
  const isThumbnailOrPreview = mode === 'preview' || mode === 'live';
  const isEditor = mode === 'editor';

  // Responsive font sizing: Studio monitors (~320px), Editor canvas (~600px), vs 1080p full screens
  const fontSize = isThumbnailOrPreview
    ? Math.max(11, Math.min(15, Math.round(baseFontSize * 0.32)))
    : isEditor
    ? Math.max(15, Math.min(22, Math.round(baseFontSize * 0.45)))
    : baseFontSize;
  const englishFontSize = isThumbnailOrPreview
    ? Math.max(9, Math.min(12, Math.round(fontSize * 0.75)))
    : isEditor
    ? Math.max(12, Math.min(16, Math.round(fontSize * 0.75)))
    : Math.max(16, Math.round(baseFontSize * 0.55));

  const fontColor = settings?.fontColor || '#ffffff';
  const textAlign = settings?.textAlign || 'center';
  const isObs = mode === 'obs';

  const getOverlayPositionClass = (pos?: string) => {
    if (pos === 'bottom-center') {
      return isThumbnailOrPreview
        ? 'bottom-1.5 left-1/2 -translate-x-1/2 max-w-[90%]'
        : 'bottom-8 left-1/2 -translate-x-1/2 max-w-2xl';
    }
    if (pos === 'bottom-right') {
      return isThumbnailOrPreview ? 'bottom-1.5 right-2' : 'bottom-8 right-10';
    }
    if (pos === 'top-left') {
      return isThumbnailOrPreview ? 'top-1.5 left-2' : 'top-8 left-10';
    }
    if (pos === 'full-bottom') {
      return 'bottom-0 left-0 right-0 w-full';
    }
    // Default bottom-left
    return isThumbnailOrPreview ? 'bottom-1.5 left-2' : 'bottom-8 left-10';
  };

  // Compute background
  const getBackgroundStyle = (): React.CSSProperties => {
    // In OBS mode, Lower-Third and overlay templates MUST have a transparent canvas so camera video passes through
    if (isObs) {
      if (templateId === 'lower-third' || settings?.backgroundType === 'transparent' || slide.background?.type === 'transparent') {
        return { backgroundColor: 'transparent' };
      }
    }

    if (slide.background) {
      if (slide.background.type === 'gradient') {
        return {
          background: `linear-gradient(135deg, ${slide.background.gradientFrom || '#090916'}, ${slide.background.gradientTo || '#21183c'})`,
        };
      }
      if (slide.background.type === 'solid') {
        return { backgroundColor: slide.background.color || '#0a0a14' };
      }
      if (slide.background.type === 'transparent') {
        return { backgroundColor: 'transparent' };
      }
    }

    if (isObs) {
      return { backgroundColor: 'transparent' };
    }
    if (settings?.backgroundType === 'gradient') {
      return {
        background: `linear-gradient(135deg, ${settings.gradientFrom || '#090916'}, ${settings.gradientTo || '#21183c'})`,
      };
    }
    if (settings?.backgroundType === 'transparent') {
      return { backgroundColor: 'transparent' };
    }
    return { backgroundColor: settings?.backgroundColor || '#0a0a14' };
  };

  const getTransitionClass = () => {
    if (settings?.transition === 'fade') {
      return isTransitioning ? 'opacity-0 scale-[0.98]' : 'opacity-100 scale-100';
    }
    if (settings?.transition === 'slide') {
      return isTransitioning ? 'opacity-0 translate-y-6' : 'opacity-100 translate-y-0';
    }
    return '';
  };

  return (
    <div
      className={`w-full h-full relative overflow-hidden flex flex-col justify-center items-center transition-all duration-300 ${getTransitionClass()}`}
      style={getBackgroundStyle()}
    >
      {/* Background Image / Texture if present */}
      {slide.background?.imageUrl && (
        <>
          <img
            src={slide.background.imageUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div
            className="absolute inset-0 bg-black"
            style={{ opacity: (slide.background.overlay ?? 60) / 100 }}
          />
        </>
      )}

      {/* Main Slide Content Based on Template */}
      <div
        className={`relative z-10 w-full h-full flex flex-col justify-center pointer-events-none ${
          isThumbnailOrPreview ? 'p-2.5 sm:p-3' : 'p-6 sm:p-10'
        }`}
      >
        {/* TEMPLATE: LOWER THIRD (OBS Live Stream Style) */}
        {templateId === 'lower-third' ? (
          <div className={`mt-auto w-full max-w-4xl mx-auto ${isThumbnailOrPreview ? 'mb-1' : 'mb-4'}`}>
            <div
              className={`bg-slate-950/85 backdrop-blur-md border border-white/10 shadow-2xl relative overflow-hidden ${
                isThumbnailOrPreview ? 'p-2 rounded-lg' : 'p-5 rounded-xl'
              }`}
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500" />
              {slide.reference && (
                <div
                  className={`uppercase font-bold tracking-wider text-fuchsia-400 flex items-center gap-1.5 ${
                    isThumbnailOrPreview ? 'text-[9px] mb-1' : 'text-xs mb-1.5'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 animate-pulse" />
                  {slide.reference}
                </div>
              )}
              {slide.textTamil && (
                <p
                  className={`font-semibold leading-snug drop-shadow-md ${
                    isThumbnailOrPreview ? 'line-clamp-2' : ''
                  }`}
                  style={{
                    color: fontColor,
                    fontSize: `${fontSize}px`,
                    textAlign,
                  }}
                >
                  {slide.textTamil}
                </p>
              )}
              {slide.textEnglish && (
                <p
                  className={`text-slate-300 font-normal leading-normal italic ${
                    isThumbnailOrPreview ? 'line-clamp-1 mt-0.5' : 'mt-1'
                  }`}
                  style={{
                    fontSize: `${englishFontSize}px`,
                    textAlign,
                  }}
                >
                  {slide.textEnglish}
                </p>
              )}
            </div>
          </div>
        ) : templateId === 'box' ? (
          /* TEMPLATE: GLASS BOX (Prayer / Scripture Focus) */
          <div className="max-w-4xl mx-auto my-auto w-full">
            <div
              className={`bg-black/40 backdrop-blur-xl border border-white/15 shadow-2xl text-center ${
                isThumbnailOrPreview ? 'p-2.5 rounded-lg' : 'p-8 sm:p-12 rounded-2xl'
              }`}
            >
              {slide.reference && (
                <div
                  className={`inline-block rounded-full bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30 font-semibold uppercase tracking-wider ${
                    isThumbnailOrPreview ? 'text-[8px] px-2 py-0.2 mb-1' : 'text-xs px-3 py-1 mb-4'
                  }`}
                >
                  {slide.reference}
                </div>
              )}
              {slide.textTamil && (
                <p
                  className={`font-bold leading-relaxed whitespace-pre-line tracking-wide drop-shadow-lg ${
                    isThumbnailOrPreview ? 'line-clamp-3' : ''
                  }`}
                  style={{
                    color: fontColor,
                    fontSize: `${fontSize}px`,
                    textAlign,
                  }}
                >
                  {slide.textTamil}
                </p>
              )}
              {slide.textEnglish && (
                <p
                  className={`text-slate-300 font-medium leading-relaxed italic opacity-85 whitespace-pre-line ${
                    isThumbnailOrPreview ? 'line-clamp-2 mt-1' : 'mt-4'
                  }`}
                  style={{
                    fontSize: `${englishFontSize}px`,
                    textAlign,
                  }}
                >
                  {slide.textEnglish}
                </p>
              )}
            </div>
          </div>
        ) : templateId === 'trendy' ? (
          /* TEMPLATE: TRENDY ACCENT (Youth / Modern Worship) */
          <div className="max-w-5xl mx-auto my-auto w-full flex flex-col justify-center items-center">
            {slide.reference && (
              <div
                className={`flex items-center gap-1.5 uppercase tracking-widest text-amber-400 font-bold bg-amber-500/10 rounded-md border border-amber-500/20 ${
                  isThumbnailOrPreview ? 'text-[8px] px-2 py-0.5 mb-1.5' : 'text-xs px-3.5 py-1 mb-4'
                }`}
              >
                <span>✦</span>
                <span>{slide.reference}</span>
                <span>✦</span>
              </div>
            )}
            {slide.textTamil && (
              <p
                className={`font-extrabold leading-snug drop-shadow-xl whitespace-pre-line ${
                  isThumbnailOrPreview ? 'line-clamp-3' : ''
                }`}
                style={{
                  color: fontColor,
                  fontSize: `${fontSize}px`,
                  textAlign,
                }}
              >
                {slide.textTamil}
              </p>
            )}
            {slide.textEnglish && (
              <div
                className={`border-t border-white/20 w-3/4 text-center ${
                  isThumbnailOrPreview ? 'mt-1.5 pt-1' : 'mt-4 pt-3'
                }`}
              >
                <p
                  className={`text-slate-300 font-normal leading-normal italic opacity-90 ${
                    isThumbnailOrPreview ? 'line-clamp-2' : ''
                  }`}
                  style={{
                    fontSize: `${englishFontSize}px`,
                    textAlign,
                  }}
                >
                  {slide.textEnglish}
                </p>
              </div>
            )}
          </div>
        ) : (
          /* TEMPLATE: FULLSCREEN (Default FreeShow / Sanctuary Style) */
          <div className="w-full max-w-5xl mx-auto my-auto flex flex-col justify-center items-center">
            {settings?.showReference && settings?.referencePosition === 'top' && slide.reference && (
              <div
                className={`font-semibold uppercase tracking-wider text-fuchsia-400 opacity-90 ${
                  isThumbnailOrPreview ? 'text-[9px] mb-1' : 'text-xs mb-4'
                }`}
              >
                {slide.reference}
              </div>
            )}
            {slide.textTamil && (
              <p
                className={`font-semibold leading-relaxed whitespace-pre-line drop-shadow-md ${
                  isThumbnailOrPreview ? 'line-clamp-3' : ''
                }`}
                style={{
                  color: fontColor,
                  fontSize: `${fontSize}px`,
                  textAlign,
                }}
              >
                {slide.textTamil}
              </p>
            )}
            {slide.textEnglish && (
              <p
                className={`text-slate-300 font-normal leading-normal italic opacity-85 whitespace-pre-line ${
                  isThumbnailOrPreview ? 'line-clamp-2 mt-1' : 'mt-4'
                }`}
                style={{
                  fontSize: `${englishFontSize}px`,
                  textAlign,
                }}
              >
                {slide.textEnglish}
              </p>
            )}
            {settings?.showReference && settings?.referencePosition === 'bottom' && slide.reference && (
              <div
                className={`font-semibold uppercase tracking-wider text-fuchsia-400/90 ${
                  isThumbnailOrPreview ? 'text-[9px] mt-1.5' : 'text-xs mt-6'
                }`}
              >
                {slide.reference}
              </div>
            )}
          </div>
        )}
      </div>

      {/* LOWER-THIRD OVERLAY (Church Personalities / Speaker / Member Badge) */}
      {overlayVisible && overlay?.active && overlay.type === 'speaker' && (
        <div
          className={`absolute z-30 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 ${getOverlayPositionClass(
            overlay.position
          )}`}
        >
          {overlay.position === 'full-bottom' ? (
            <div
              className={`w-full bg-slate-950/92 backdrop-blur-md border-t border-fuchsia-500/40 shadow-2xl flex items-center justify-between ${
                isThumbnailOrPreview ? 'px-3 py-1.5' : 'px-8 sm:px-12 py-3.5'
              }`}
            >
              <div className="flex items-center gap-2 sm:gap-3.5">
                <div
                  className={`${
                    isThumbnailOrPreview ? 'w-1 h-4' : 'w-1.5 h-8'
                  } rounded-full bg-gradient-to-b from-fuchsia-500 to-indigo-500 shrink-0`}
                />
                <div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span
                      className={`font-bold text-white leading-tight ${
                        isThumbnailOrPreview ? 'text-[10px]' : 'text-lg'
                      }`}
                    >
                      {overlay.name || 'Member'}
                    </span>
                    {overlay.category && (
                      <span
                        className={`rounded font-semibold uppercase tracking-wider bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30 shrink-0 ${
                          isThumbnailOrPreview
                            ? 'text-[7px] px-1'
                            : 'text-[10px] px-2 py-0.5'
                        }`}
                      >
                        {overlay.category}
                      </span>
                    )}
                  </div>
                  <div
                    className={`text-slate-300 font-medium ${
                      isThumbnailOrPreview ? 'text-[8px]' : 'text-xs mt-0.5'
                    }`}
                  >
                    {overlay.title || overlay.subtitle || ''}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Boxed badge (Bottom-Left, Center, Right, Top-Left) */
            <div
              className={`bg-slate-950/92 backdrop-blur-md border border-fuchsia-500/40 rounded-xl shadow-2xl flex items-center gap-2.5 sm:gap-3.5 ${
                isThumbnailOrPreview ? 'p-1.5 pl-2 pr-3' : 'p-3.5 pl-5 pr-8'
              }`}
            >
              <div
                className={`${
                  isThumbnailOrPreview ? 'w-1 h-5' : 'w-1.5 h-10'
                } rounded-full bg-gradient-to-b from-fuchsia-500 to-indigo-500 shrink-0`}
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span
                    className={`font-bold text-white leading-tight truncate ${
                      isThumbnailOrPreview ? 'text-[10px]' : 'text-lg'
                    }`}
                  >
                    {overlay.name || 'Member'}
                  </span>
                  {overlay.category && (
                    <span
                      className={`rounded font-semibold uppercase tracking-wider bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30 shrink-0 ${
                        isThumbnailOrPreview
                          ? 'text-[7px] px-1'
                          : 'text-[10px] px-2 py-0.5'
                      }`}
                    >
                      {overlay.category}
                    </span>
                  )}
                </div>
                <div
                  className={`text-fuchsia-300/90 font-medium truncate ${
                    isThumbnailOrPreview ? 'text-[8px]' : 'text-xs mt-0.5'
                  }`}
                >
                  {overlay.title || overlay.subtitle || ''}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TICKER OVERLAY (Scrolling Announcement) */}
      {overlay?.active && overlay.type === 'ticker' && (
        <div className="absolute bottom-0 left-0 right-0 z-30 bg-black/85 backdrop-blur-md border-t border-fuchsia-500/30 py-2 px-4 overflow-hidden whitespace-nowrap">
          <div className="inline-block animate-marquee text-xs font-medium text-slate-200">
            📢 {overlay.tickerText || 'Welcome to our Sunday service! God bless you.'}
          </div>
        </div>
      )}
    </div>
  );
};
