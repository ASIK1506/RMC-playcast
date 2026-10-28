import React, { useState, useEffect } from 'react';
import {
  Tv,
  Clock,
  MessageSquare,
  Send,
  Trash2,
  ExternalLink,
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  AlertCircle,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { PlayCastSlide, ServiceTimer } from '@/types/playcast';

interface StageWorkspaceProps {
  liveSlide: PlayCastSlide | null;
  nextSlide: PlayCastSlide | null;
  isLive: boolean;
  isBlank: boolean;
  activeTimer: ServiceTimer | null;
  onUpdateTimer: (timer: ServiceTimer | null) => void;
  stageMessage: string | null;
  onSendStageMessage: (msg: string | null) => void;
  serviceName: string;
  onClose: () => void;
}

export const StageWorkspace: React.FC<StageWorkspaceProps> = ({
  liveSlide,
  nextSlide,
  isLive,
  isBlank,
  activeTimer,
  onUpdateTimer,
  stageMessage,
  onSendStageMessage,
  serviceName,
  onClose,
}) => {
  const [customMsg, setCustomMsg] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [alertSuccess, setAlertSuccess] = useState(false);

  // Digital clock
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

  const handleSendPreset = (msg: string) => {
    onSendStageMessage(msg);
    setAlertSuccess(true);
    setTimeout(() => setAlertSuccess(false), 2000);
  };

  const handleSendCustom = () => {
    if (!customMsg.trim()) return;
    onSendStageMessage(customMsg.trim());
    setAlertSuccess(true);
    setTimeout(() => setAlertSuccess(false), 2000);
  };

  const handleClearMessage = () => {
    onSendStageMessage(null);
    setCustomMsg('');
  };

  // Timer controls
  const handleStartTimer = (seconds: number, label: string) => {
    onUpdateTimer({
      id: `timer-${Date.now()}`,
      label,
      type: 'countdown',
      totalSeconds: seconds,
      remainingSeconds: seconds,
      isRunning: true,
    });
  };

  const handleToggleTimerRunning = () => {
    if (!activeTimer) return;
    onUpdateTimer({
      ...activeTimer,
      isRunning: !activeTimer.isRunning,
    });
  };

  const handleResetTimer = () => {
    if (!activeTimer) return;
    onUpdateTimer({
      ...activeTimer,
      remainingSeconds: activeTimer.totalSeconds,
      isRunning: false,
    });
  };

  const openStageWindow = () => {
    const url = `${window.location.origin}/stage`;
    window.open(url, 'PlayCastStageMonitor', 'width=1920,height=1080,menubar=no,toolbar=no');
  };

  return (
    <div className="flex-1 flex flex-col bg-black text-white min-h-0 min-w-0 overflow-hidden font-sans select-none">
      {/* Sub-Header */}
      <div className="h-12 bg-slate-950 border-b border-white/10 px-4 flex items-center justify-between shrink-0">
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
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-600/30 flex items-center gap-1.5">
              <Tv className="w-3 h-3 text-amber-400" />
              STAGE CONFIDENCE DIRECTOR
            </span>
            <span className="text-xs text-slate-400 hidden sm:inline">
              Topic: <strong className="text-white">{serviceName}</strong>
            </span>
          </div>
        </div>

        {/* Right: Clock & Launch External Display */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-sm font-mono font-bold text-amber-400 bg-slate-900 border border-white/10 px-2.5 py-1 rounded-md">
            <Clock className="w-3.5 h-3.5 text-amber-400/80" />
            <span>{currentTime}</span>
          </div>

          <Button
            size="sm"
            onClick={openStageWindow}
            className="h-8 px-3 text-xs font-bold bg-amber-600 hover:bg-amber-500 text-black flex items-center gap-1.5 shadow-md shadow-amber-600/20"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Stage Window</span>
          </Button>
        </div>
      </div>

      {/* Main 2-Column Stage View */}
      <div className="flex-1 flex min-h-0 min-w-0 overflow-hidden">
        {/* Left Column: Real-time Stage Confidence Screen View */}
        <div className="flex-1 flex flex-col justify-between p-6 bg-slate-950/90 border-r border-white/10 overflow-y-auto">
          {/* Stage Monitor Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-mono font-bold tracking-wider text-emerald-400 flex items-center gap-1.5 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded">
                <Tv className="w-3.5 h-3.5" />
                STAGE MONITOR SIMULATOR
              </span>

              <span
                className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${
                  isLive && !isBlank
                    ? 'bg-rose-950 text-rose-300 border border-rose-500/40 animate-pulse'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {isLive && !isBlank ? '● ON AIR' : 'STANDBY'}
              </span>
            </div>

            {/* Active Live Timer */}
            {activeTimer && (
              <div className="flex items-center gap-2 bg-slate-900 border border-amber-500/40 px-3 py-1 rounded-lg">
                <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                <span className="text-xs font-mono font-bold text-amber-400">
                  {activeTimer.label}:{' '}
                  {Math.floor((activeTimer.remainingSeconds ?? 0) / 60)
                    .toString()
                    .padStart(2, '0')}
                  :
                  {((activeTimer.remainingSeconds ?? 0) % 60).toString().padStart(2, '0')}
                </span>
              </div>
            )}
          </div>

          {/* Director Alert Banner (If Active) */}
          {stageMessage && (
            <div className="my-3 bg-amber-500/20 border-2 border-amber-500 text-amber-200 px-4 py-2.5 rounded-xl flex items-center justify-between shadow-2xl animate-pulse">
              <div className="flex items-center gap-2.5">
                <span className="bg-amber-500 text-black px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">
                  DIRECTOR PROMPT
                </span>
                <span className="text-base sm:text-lg font-bold font-sans text-amber-200">
                  {stageMessage}
                </span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleClearMessage}
                className="h-6 px-2 text-xs text-amber-300 hover:text-white hover:bg-amber-500/30"
              >
                Clear
              </Button>
            </div>
          )}

          {/* Current Slide Display (High-Contrast for Speaker) */}
          <div className="flex-1 my-4 bg-black border border-white/15 rounded-2xl p-6 sm:p-8 flex flex-col justify-center shadow-inner">
            <div className="text-[11px] uppercase font-bold tracking-widest text-fuchsia-400 mb-2 flex items-center justify-between">
              <span>{liveSlide?.label ? `Current Slide: ${liveSlide.label}` : 'Current Live Slide'}</span>
              {liveSlide?.reference && (
                <span className="text-amber-400 font-mono">{liveSlide.reference}</span>
              )}
            </div>

            {liveSlide ? (
              <div>
                {liveSlide.textTamil && (
                  <p className="text-2xl sm:text-3xl md:text-4xl font-bold leading-relaxed whitespace-pre-line text-white font-['Noto_Sans_Tamil']">
                    {liveSlide.textTamil}
                  </p>
                )}
                {liveSlide.textEnglish && (
                  <p className="text-base sm:text-xl text-slate-300 italic mt-3 font-medium opacity-85">
                    {liveSlide.textEnglish}
                  </p>
                )}
              </div>
            ) : (
              <div className="text-slate-600 text-xl font-bold uppercase tracking-widest text-center py-12">
                No Slide Currently Live on Stage
              </div>
            )}
          </div>

          {/* Next Slide Preview Box */}
          <div className="shrink-0 bg-slate-900/80 border border-white/10 rounded-xl p-3.5 flex items-center justify-between gap-4">
            <div className="flex-1 truncate">
              <div className="text-[10px] uppercase font-bold tracking-wider text-amber-400 mb-0.5 flex items-center gap-1.5">
                <span>Next Slide ➜</span>
                {nextSlide?.label && (
                  <span className="text-slate-400 font-normal">({nextSlide.label})</span>
                )}
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-300 truncate">
                {nextSlide?.textTamil || nextSlide?.textEnglish || 'End of Item / Next Item'}
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-1.5 bg-slate-950 border border-white/10 px-2.5 py-1 rounded text-[11px] text-slate-400">
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              <span>Singer Preview</span>
            </div>
          </div>
        </div>

        {/* Right Column: Stage Director Control Console */}
        <div className="w-80 sm:w-92 bg-slate-950 border-l border-white/10 flex flex-col shrink-0 p-4 space-y-5 overflow-y-auto">
          {/* 1. Stage Prompter / Message Dispatcher */}
          <div className="space-y-3 pb-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" />
                Stage Alert Prompter
              </span>
              {alertSuccess && (
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Sent!
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              Send instant high-visibility alerts directly to the preacher or worship team.
            </p>

            {/* Presets */}
            <div className="flex flex-wrap gap-1.5">
              {[
                '⏱️ 5 Minutes Remaining',
                '⏳ Please Wrap Up',
                '🎵 Switch to Song 2',
                '🎤 Speak Closer to Mic',
                '👶 Nursery Call: #104',
              ].map((preset) => (
                <button
                  key={preset}
                  onClick={() => handleSendPreset(preset)}
                  className="px-2 py-1 rounded text-[11px] font-medium bg-slate-900 border border-white/10 hover:border-amber-500/40 hover:bg-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer text-left"
                >
                  {preset}
                </button>
              ))}
            </div>

            {/* Custom Input */}
            <div className="flex gap-2">
              <Input
                value={customMsg}
                onChange={(e) => setCustomMsg(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendCustom()}
                placeholder="Type custom stage alert..."
                className="h-8 text-xs bg-slate-900 border-white/10 text-white"
              />
              <Button
                size="sm"
                onClick={handleSendCustom}
                className="h-8 px-2.5 bg-amber-600 hover:bg-amber-500 text-black font-bold text-xs shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </Button>
              {stageMessage && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleClearMessage}
                  className="h-8 px-2 text-rose-400 hover:bg-rose-950/40 text-xs shrink-0"
                  title="Clear Active Alert"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          </div>

          {/* 2. Stage Timer Controller */}
          <div className="space-y-3 pb-4 border-b border-white/10">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-fuchsia-400" />
              Stage Countdown Timers
            </span>

            <div className="grid grid-cols-2 gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleStartTimer(300, 'Pre-Service Countdown')}
                className="h-8 text-xs bg-slate-900 border-white/10 hover:bg-white/10 text-slate-200"
              >
                5 Min Countdown
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleStartTimer(600, 'Pre-Service Countdown')}
                className="h-8 text-xs bg-slate-900 border-white/10 hover:bg-white/10 text-slate-200"
              >
                10 Min Countdown
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleStartTimer(1800, 'Sermon Time Limit')}
                className="h-8 text-xs bg-slate-900 border-white/10 hover:bg-white/10 text-slate-200"
              >
                30 Min Sermon
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleStartTimer(2700, 'Sermon Time Limit')}
                className="h-8 text-xs bg-slate-900 border-white/10 hover:bg-white/10 text-slate-200"
              >
                45 Min Sermon
              </Button>
            </div>

            {/* Timer State Controls */}
            {activeTimer && (
              <div className="flex items-center gap-2 pt-1">
                <Button
                  size="sm"
                  onClick={handleToggleTimerRunning}
                  className={`flex-1 h-8 text-xs font-bold flex items-center justify-center gap-1.5 ${
                    activeTimer.isRunning
                      ? 'bg-amber-600 hover:bg-amber-500 text-black'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  {activeTimer.isRunning ? (
                    <>
                      <Pause className="w-3 h-3 fill-current" />
                      <span>Pause Timer</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 fill-current" />
                      <span>Resume Timer</span>
                    </>
                  )}
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleResetTimer}
                  className="h-8 px-2.5 text-xs bg-slate-900 border-white/10 hover:bg-white/10 text-slate-300"
                  title="Reset Timer"
                >
                  <RotateCcw className="w-3 h-3" />
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onUpdateTimer(null)}
                  className="h-8 px-2 text-rose-400 hover:bg-rose-950/40 text-xs"
                  title="Stop and Clear Timer"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>

          {/* 3. Output Window Instructions */}
          <div className="p-3 bg-slate-900/60 border border-white/10 rounded-xl space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 text-cyan-400" />
              Stage Display Setup Tip
            </span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Open <strong>/stage</strong> in a separate browser tab and drag it onto your secondary HDMI cable or stage TV monitor. Press <strong>F11</strong> for borderless fullscreen.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
