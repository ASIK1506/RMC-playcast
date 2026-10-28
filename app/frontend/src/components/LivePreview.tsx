import { type DisplayState } from '@/lib/sync';

interface LivePreviewProps {
  state: DisplayState;
}

export function LivePreview({ state }: LivePreviewProps) {
  const { verse, settings, isLive } = state;

  const getBackground = () => {
    if (settings.backgroundType === 'transparent') return 'bg-[repeating-conic-gradient(#1a1a1a_0%_25%,#2a2a2a_0%_50%)] bg-[length:20px_20px]';
    if (settings.backgroundType === 'gradient') return '';
    if (settings.backgroundType === 'image') return '';
    return '';
  };

  const getBackgroundStyle = () => {
    if (settings.backgroundType === 'solid') return { backgroundColor: settings.backgroundColor };
    if (settings.backgroundType === 'gradient') return { background: `linear-gradient(135deg, ${settings.gradientFrom}, ${settings.gradientTo})` };
    if (settings.backgroundType === 'image') return { backgroundColor: '#000000' };
    return {};
  };

  return (
    <div className="relative rounded-lg overflow-hidden border border-muted/30 aspect-video">
      {/* Status indicator */}
      <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5">
        <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-red-500 animate-pulse' : 'bg-muted-foreground/30'}`} />
        <span className="text-[10px] font-medium text-white/70">
          {isLive ? 'Live' : 'Stopped'}
        </span>
      </div>

      {/* Preview content */}
      <div
        className={`w-full h-full flex flex-col items-center justify-center relative ${getBackground()}`}
        style={{
          ...getBackgroundStyle(),
          padding: `${settings.padding / 4}px`,
        }}
      >
        {/* Background Image Layer */}
        {settings.backgroundType === 'image' && settings.backgroundImage && (
          <>
            <img
              src={settings.backgroundImage}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div
              className="absolute inset-0"
              style={{ backgroundColor: `rgba(0,0,0,${(settings.backgroundOverlay ?? 50) / 100})` }}
            />
          </>
        )}
        {verse ? (
          <div className="relative z-10 flex flex-col items-center justify-center h-full w-full" style={{ textAlign: settings.textAlign }}>
            {settings.showReference && settings.referencePosition === 'top' && (
              <p className="text-[8px] font-medium mb-1 opacity-70" style={{ color: settings.fontColor }}>
                {verse.reference}
              </p>
            )}
            <p
              className="leading-relaxed font-medium"
              style={{
                color: settings.fontColor,
                fontSize: `${Math.max(8, settings.fontSize / 5)}px`,
                textAlign: settings.textAlign,
              }}
            >
              {verse.text}
            </p>
            {settings.showReference && settings.referencePosition === 'bottom' && (
              <p className="text-[8px] font-medium mt-1 opacity-70" style={{ color: settings.fontColor }}>
                {verse.reference}
              </p>
            )}
          </div>
        ) : (
          <p className="text-[10px] text-muted-foreground relative z-10">No display</p>
        )}
      </div>
    </div>
  );
}