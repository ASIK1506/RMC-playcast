import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  User,
  UserCheck,
  Clock,
  Layout,
  Plus,
  Trash2,
  Tv,
  Eye,
  EyeOff,
  Sparkles,
  Shield,
  Music,
  BookOpen,
} from 'lucide-react';
import type {
  ScreenOverlay,
  OverlayPosition,
  OverlayTimingMode,
  ChurchMemberPreset,
} from '@/types/playcast';

interface LowerThirdModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentOverlay: ScreenOverlay | null;
  onApplyOverlay: (overlay: ScreenOverlay) => void;
  onToggleActive: () => void;
}

const DEFAULT_PRESETS: ChurchMemberPreset[] = [
  {
    id: 'preset-1',
    name: 'Pastor David Samuel',
    role: 'Senior Pastor',
    category: 'Pastor',
  },
  {
    id: 'preset-2',
    name: 'Dr. John Wesley',
    role: 'Church Board Member',
    category: 'Board Member',
  },
  {
    id: 'preset-3',
    name: 'Sis. Rebecca Grace',
    role: 'Worship Leader • 10,000 Reasons',
    category: 'Worship Leader',
  },
  {
    id: 'preset-4',
    name: 'Bro. Daniel Moses',
    role: 'Scripture Reader • Psalm 23',
    category: 'Scripture Reader',
  },
  {
    id: 'preset-5',
    name: 'Elder Thomas Paul',
    role: 'Church Elder & Trustee',
    category: 'Elder',
  },
];

export const LowerThirdModal: React.FC<LowerThirdModalProps> = ({
  isOpen,
  onClose,
  currentOverlay,
  onApplyOverlay,
  onToggleActive,
}) => {
  // Local editable state for overlay fields
  const [name, setName] = useState(currentOverlay?.name || 'Pastor David Samuel');
  const [role, setRole] = useState(currentOverlay?.title || 'Senior Pastor');
  const [category, setCategory] = useState<ChurchMemberPreset['category']>(
    (currentOverlay?.category as ChurchMemberPreset['category']) || 'Pastor'
  );
  const [position, setPosition] = useState<OverlayPosition>(
    currentOverlay?.position || 'bottom-left'
  );
  const [timingMode, setTimingMode] = useState<OverlayTimingMode>(
    currentOverlay?.timingMode || 'persistent'
  );
  const [autoHideSeconds, setAutoHideSeconds] = useState<number>(
    currentOverlay?.autoHideSeconds || 8
  );

  // Church Member Presets (stored in localStorage)
  const [presets, setPresets] = useState<ChurchMemberPreset[]>(() => {
    try {
      const saved = localStorage.getItem('playcast-member-presets');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_PRESETS;
  });

  // New preset form state
  const [isAddingPreset, setIsAddingPreset] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetRole, setNewPresetRole] = useState('');
  const [newPresetCategory, setNewPresetCategory] =
    useState<ChurchMemberPreset['category']>('Board Member');

  // Sync from prop when modal opens
  useEffect(() => {
    if (isOpen && currentOverlay) {
      setName(currentOverlay.name || '');
      setRole(currentOverlay.title || '');
      if (currentOverlay.category) {
        setCategory(currentOverlay.category as ChurchMemberPreset['category']);
      }
      if (currentOverlay.position) {
        setPosition(currentOverlay.position);
      }
      if (currentOverlay.timingMode) {
        setTimingMode(currentOverlay.timingMode);
      }
      if (currentOverlay.autoHideSeconds) {
        setAutoHideSeconds(currentOverlay.autoHideSeconds);
      }
    }
  }, [isOpen, currentOverlay]);

  const savePresets = (updated: ChurchMemberPreset[]) => {
    setPresets(updated);
    try {
      localStorage.setItem('playcast-member-presets', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleApplyChanges = (goLiveNow = false) => {
    const updatedOverlay: ScreenOverlay = {
      id: currentOverlay?.id || 'ov-speaker',
      type: 'speaker',
      name: name.trim() || 'Speaker',
      title: role.trim() || 'Church Member',
      category,
      position,
      timingMode,
      autoHideSeconds,
      active: goLiveNow ? true : currentOverlay?.active ?? false,
      activatedAt: goLiveNow ? Date.now() : currentOverlay?.activatedAt,
    };
    onApplyOverlay(updatedOverlay);
  };

  const handleSelectPreset = (p: ChurchMemberPreset, sendLive = false) => {
    setName(p.name);
    setRole(p.role);
    setCategory(p.category);

    const updatedOverlay: ScreenOverlay = {
      id: 'ov-speaker',
      type: 'speaker',
      name: p.name,
      title: p.role,
      category: p.category,
      position,
      timingMode,
      autoHideSeconds,
      active: sendLive ? true : currentOverlay?.active ?? false,
      activatedAt: sendLive ? Date.now() : currentOverlay?.activatedAt,
    };
    onApplyOverlay(updatedOverlay);
  };

  const handleAddPreset = () => {
    if (!newPresetName.trim()) return;
    const item: ChurchMemberPreset = {
      id: `preset-${Date.now()}`,
      name: newPresetName.trim(),
      role: newPresetRole.trim() || 'Church Member',
      category: newPresetCategory,
    };
    const updated = [...presets, item];
    savePresets(updated);
    setNewPresetName('');
    setNewPresetRole('');
    setIsAddingPreset(false);
  };

  const handleDeletePreset = (id: string) => {
    const updated = presets.filter((p) => p.id !== id);
    savePresets(updated);
  };

  const isLive = currentOverlay?.active && currentOverlay.type === 'speaker';

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Pastor':
        return <Sparkles className="w-3.5 h-3.5 text-amber-400" />;
      case 'Board Member':
        return <Shield className="w-3.5 h-3.5 text-indigo-400" />;
      case 'Worship Leader':
        return <Music className="w-3.5 h-3.5 text-fuchsia-400" />;
      case 'Scripture Reader':
        return <BookOpen className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <User className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-slate-950 border border-white/10 text-slate-100 max-h-[90vh] overflow-y-auto p-5">
        <DialogHeader className="border-b border-white/10 pb-3">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-fuchsia-400" />
              Church Personalities & Lower-Third Overlays
            </DialogTitle>
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  isLive
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                    : 'bg-slate-800 text-slate-400 border border-white/5'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isLive ? 'bg-rose-500' : 'bg-slate-500'
                  }`}
                />
                {isLive ? 'ON SCREEN LIVE' : 'OVERLAY OFF'}
              </span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Display details of church board members, worship leaders, scripture readers, or
            dignitaries over the live full-screen presentation.
          </p>
        </DialogHeader>

        <div className="space-y-5 pt-3">
          {/* 1. LIVE PREVIEW BOX */}
          <div className="rounded-xl border border-white/10 bg-slate-900/80 p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Tv className="w-3.5 h-3.5 text-fuchsia-400" />
                Live Screen Preview (Placement: {position})
              </span>
              <span className="text-[10px] text-muted-foreground">
                Timing: {timingMode === 'persistent' ? 'Ongoing Display' : `Auto-hide (${autoHideSeconds}s)`}
              </span>
            </div>

            {/* Mock Screen Canvas */}
            <div className="aspect-[16/7] w-full rounded-lg bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40 border border-white/5 relative p-4 flex flex-col justify-between overflow-hidden shadow-inner">
              {/* Background Mock Slide Text */}
              <div className="text-center my-auto opacity-35 select-none pointer-events-none">
                <p className="text-xs font-semibold text-white">
                  என் ஆத்துமாவே கர்த்தரை ஸ்தோத்திரி (Chorus)
                </p>
                <p className="text-[10px] text-slate-400 italic">
                  Bless the Lord, O my soul, and all that is within me
                </p>
              </div>

              {/* Lower Third Overlay Badge Rendered inside Preview */}
              <div
                className={`absolute z-10 transition-all ${
                  position === 'bottom-center'
                    ? 'bottom-3 left-1/2 -translate-x-1/2'
                    : position === 'bottom-right'
                    ? 'bottom-3 right-4'
                    : position === 'top-left'
                    ? 'top-3 left-4'
                    : position === 'full-bottom'
                    ? 'bottom-0 left-0 right-0'
                    : 'bottom-3 left-4'
                }`}
              >
                {position === 'full-bottom' ? (
                  <div className="w-full bg-slate-950/95 border-t border-fuchsia-500/40 px-4 py-2 flex items-center gap-2.5 shadow-2xl">
                    <div className="w-1.5 h-7 rounded-full bg-gradient-to-b from-fuchsia-500 to-indigo-500 shrink-0" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">
                          {name || 'Member Name'}
                        </span>
                        {category && (
                          <span className="text-[8px] font-bold px-1.5 py-0.2 rounded bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30 uppercase">
                            {category}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-300">
                        {role || 'Role / Details'}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-950/95 border border-fuchsia-500/40 rounded-lg p-2.5 pl-3.5 pr-5 shadow-2xl flex items-center gap-2.5">
                    <div className="w-1 h-7 rounded-full bg-gradient-to-b from-fuchsia-500 to-indigo-500 shrink-0" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">
                          {name || 'Member Name'}
                        </span>
                        {category && (
                          <span className="text-[8px] font-bold px-1.5 py-0.2 rounded bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30 uppercase">
                            {category}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-fuchsia-300/90 font-medium">
                        {role || 'Role / Details'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Live Trigger Actions */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-400">
                Pushes directly over ongoing lyrics on Projector, OBS, and Stage.
              </span>
              <div className="flex items-center gap-2">
                {isLive ? (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={onToggleActive}
                    className="h-8 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white cursor-pointer"
                  >
                    <EyeOff className="w-3.5 h-3.5 mr-1.5" />
                    Hide from Screen
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => {
                      handleApplyChanges(true);
                    }}
                    className="h-8 text-xs font-semibold bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 text-white shadow-md shadow-fuchsia-600/30 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 mr-1.5" />
                    Show on Screen Live
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* 2. CUSTOMIZE ACTIVE DETAILS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Member / Personality Name
              </label>
              <Input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                }}
                placeholder="e.g. Bro. Daniel / Pastor David"
                className="h-8 text-xs bg-slate-900 border-white/10 text-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Role, Title or Action
              </label>
              <Input
                value={role}
                onChange={(e) => {
                  setRole(e.target.value);
                }}
                placeholder="e.g. Worship Leader / Board Member"
                className="h-8 text-xs bg-slate-900 border-white/10 text-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Category Badge
              </label>
              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as ChurchMemberPreset['category'])
                }
                className="h-8 w-full rounded-md border border-white/10 bg-slate-900 px-2 text-xs text-white"
              >
                <option value="Pastor">Pastor</option>
                <option value="Board Member">Church Board Member</option>
                <option value="Worship Leader">Worship Leader</option>
                <option value="Scripture Reader">Scripture Reader</option>
                <option value="Elder">Elder / Trustee</option>
                <option value="Guest">Guest Speaker</option>
                <option value="General">General Member</option>
              </select>
            </div>
          </div>

          {/* 3. SCREEN PLACEMENT & TIMING CONTROLS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* Screen Placement */}
            <div className="bg-slate-900/60 border border-white/10 rounded-xl p-3 space-y-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Layout className="w-3.5 h-3.5 text-fuchsia-400" />
                Screen Placement / Position
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'bottom-left', label: 'Bottom-Left' },
                  { id: 'bottom-center', label: 'Bottom-Center' },
                  { id: 'bottom-right', label: 'Bottom-Right' },
                  { id: 'top-left', label: 'Top-Left' },
                  { id: 'full-bottom', label: 'Full Width Bottom' },
                ].map((pos) => (
                  <button
                    key={pos.id}
                    onClick={() => {
                      setPosition(pos.id as OverlayPosition);
                    }}
                    className={`text-[10px] font-medium p-2 rounded-lg border text-center transition-all cursor-pointer ${
                      position === pos.id
                        ? 'bg-fuchsia-950/60 border-fuchsia-500 text-white shadow-sm ring-1 ring-fuchsia-500'
                        : 'bg-slate-900/80 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    {pos.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Display Timing */}
            <div className="bg-slate-900/60 border border-white/10 rounded-xl p-3 space-y-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Display Duration Policy
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setTimingMode('persistent')}
                  className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                    timingMode === 'persistent'
                      ? 'bg-fuchsia-950/60 border-fuchsia-500 text-white ring-1 ring-fuchsia-500'
                      : 'bg-slate-900/80 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="text-[11px] font-semibold">📌 Ongoing Display</div>
                  <div className="text-[9px] text-muted-foreground mt-0.5">
                    Stays on screen until you click Hide
                  </div>
                </button>

                <button
                  onClick={() => setTimingMode('auto-hide')}
                  className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                    timingMode === 'auto-hide'
                      ? 'bg-fuchsia-950/60 border-fuchsia-500 text-white ring-1 ring-fuchsia-500'
                      : 'bg-slate-900/80 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="text-[11px] font-semibold">⏱️ Auto-Hide</div>
                  <div className="text-[9px] text-muted-foreground mt-0.5">
                    Fades out automatically
                  </div>
                </button>
              </div>

              {timingMode === 'auto-hide' && (
                <div className="pt-1 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400">Auto-hide after:</span>
                  <div className="flex items-center gap-1">
                    {[5, 8, 10, 15].map((sec) => (
                      <button
                        key={sec}
                        onClick={() => setAutoHideSeconds(sec)}
                        className={`text-[10px] px-2 py-0.5 rounded font-semibold cursor-pointer ${
                          autoHideSeconds === sec
                            ? 'bg-amber-500 text-slate-950 font-bold'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {sec}s
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 4. CHURCH DIRECTORY / SAVED PRESETS */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-fuchsia-400" />
                  Saved Church Members & Personalities ({presets.length})
                </span>
                <span className="text-[10px] text-muted-foreground block">
                  Click any personality to instantly load or push to the live screen.
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddingPreset(!isAddingPreset)}
                className="h-7 text-xs border-white/10 bg-slate-900 text-slate-300 hover:bg-slate-800 cursor-pointer"
              >
                <Plus className="w-3 h-3 mr-1 text-fuchsia-400" />
                {isAddingPreset ? 'Cancel' : 'Add Personality'}
              </Button>
            </div>

            {/* Add Preset Form */}
            {isAddingPreset && (
              <div className="bg-slate-900/90 border border-fuchsia-500/30 rounded-xl p-3 grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                <Input
                  placeholder="Full Name"
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  className="h-8 text-xs bg-slate-950 border-white/10 text-white"
                />
                <Input
                  placeholder="Title or Role (e.g. Board Member)"
                  value={newPresetRole}
                  onChange={(e) => setNewPresetRole(e.target.value)}
                  className="h-8 text-xs bg-slate-950 border-white/10 text-white"
                />
                <select
                  value={newPresetCategory}
                  onChange={(e) =>
                    setNewPresetCategory(
                      e.target.value as ChurchMemberPreset['category']
                    )
                  }
                  className="h-8 rounded-md border border-white/10 bg-slate-950 px-2 text-xs text-white"
                >
                  <option value="Pastor">Pastor</option>
                  <option value="Board Member">Board Member</option>
                  <option value="Worship Leader">Worship Leader</option>
                  <option value="Scripture Reader">Scripture Reader</option>
                  <option value="Elder">Elder</option>
                  <option value="Guest">Guest</option>
                  <option value="General">General</option>
                </select>
                <Button
                  size="sm"
                  onClick={handleAddPreset}
                  className="h-8 text-xs bg-fuchsia-600 hover:bg-fuchsia-500 text-white cursor-pointer"
                >
                  Save to Directory
                </Button>
              </div>
            )}

            {/* Presets Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {presets.map((p) => {
                const isSelected = name === p.name && role === p.role;
                return (
                  <div
                    key={p.id}
                    onClick={() => handleSelectPreset(p, false)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between group relative ${
                      isSelected
                        ? 'bg-fuchsia-950/40 border-fuchsia-400 ring-1 ring-fuchsia-400'
                        : 'bg-slate-900/60 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          {getCategoryIcon(p.category)}
                          <span className="text-[10px] uppercase font-bold text-slate-400">
                            {p.category}
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePreset(p.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 p-0.5 transition-opacity"
                          title="Delete from presets"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="text-xs font-bold text-white truncate">
                        {p.name}
                      </div>
                      <div className="text-[10px] text-fuchsia-300/80 truncate">
                        {p.role}
                      </div>
                    </div>

                    <div className="pt-2 mt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">
                        {isSelected ? 'Loaded' : 'Click to Load'}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectPreset(p, true);
                        }}
                        className="h-5 px-1.5 text-[9px] font-semibold text-fuchsia-300 hover:text-white hover:bg-fuchsia-600/30"
                      >
                        Push Live →
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-white/10 pt-3 mt-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white"
          >
            Close
          </Button>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                handleApplyChanges(false);
                onClose();
              }}
              className="text-xs border-white/15 bg-slate-900 text-slate-300 hover:bg-slate-800"
            >
              Save Settings
            </Button>
            <Button
              size="sm"
              onClick={() => {
                handleApplyChanges(true);
                onClose();
              }}
              className="text-xs font-semibold bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 text-white shadow-md shadow-fuchsia-600/30"
            >
              Apply & Go Live Now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
