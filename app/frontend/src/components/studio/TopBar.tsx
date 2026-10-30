import React from 'react';
import {
  Cast,
  Tv,
  MonitorPlay,
  Smartphone,
  ExternalLink,
  Copy,
  Radio,
  Sliders,
  Check,
  Layers,
  Edit3,
  Square,
  Play,
  Calendar,
  Sparkles,
  Shield,
  LogOut,
  User as UserIcon,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface TopBarProps {
  isLive: boolean;
  activeService: string;
  onRenameService?: (newName: string) => void;
  activeMode: 'show' | 'edit' | 'stage';
  onModeChange: (mode: 'show' | 'edit' | 'stage') => void;
  onOpenSettings: () => void;
  onOpenLowerThird?: () => void;
  onStopLive?: () => void;
  onGoLive?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  isLive,
  activeService,
  onRenameService,
  activeMode,
  onModeChange,
  onOpenSettings,
  onOpenLowerThird,
  onStopLive,
  onGoLive,
}) => {
  const { user, isSuperAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const [copiedUrl, setCopiedUrl] = React.useState<string | null>(null);
  const [serviceInput, setServiceInput] = React.useState(activeService);
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);

  React.useEffect(() => {
    setServiceInput(activeService);
  }, [activeService]);

  const handleApplyServiceRename = () => {
    if (serviceInput.trim() && onRenameService) {
      onRenameService(serviceInput.trim());
      setIsPopoverOpen(false);
    }
  };

  const copyUrl = (path: string, label: string) => {
    const url = `${window.location.origin}${path}`;
    navigator.clipboard.writeText(url);
    setCopiedUrl(label);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const openWindow = (path: string, title: string) => {
    const url = `${window.location.origin}${path}`;
    window.open(url, title, 'width=1920,height=1080,menubar=no,toolbar=no,location=no,status=no');
  };

  return (
    <header className="h-13 bg-slate-950/90 border-b border-border/40 px-3.5 flex items-center justify-between select-none z-30 shrink-0 backdrop-blur-md">
      {/* Left: Brand + Service Selector */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-fuchsia-600 to-indigo-600 flex items-center justify-center shadow-md shadow-fuchsia-600/30">
            <Cast className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-tight text-white leading-none flex items-center gap-1.5">
              PlayCast
              <span className="text-[10px] font-semibold text-fuchsia-400 bg-fuchsia-950/80 px-1.5 py-0.2 rounded border border-fuchsia-500/30">
                PRO
              </span>
            </span>
            <span className="text-[10px] text-muted-foreground leading-tight">
              Church Presentation & OBS Studio
            </span>
          </div>
        </div>

        <div className="h-4 w-px bg-white/10 mx-1 hidden sm:block" />

        {/* Active Service Selector & Renamer Popover */}
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <button
              className="hidden md:flex items-center gap-2 bg-slate-900 border border-white/10 hover:border-fuchsia-500/50 hover:bg-slate-800 px-2.5 py-1 rounded-md text-xs font-semibold text-slate-200 transition-all cursor-pointer group shadow-sm"
              title="Click to rename service or switch service playlist"
            >
              <Layers className="w-3.5 h-3.5 text-fuchsia-400 group-hover:scale-110 transition-transform" />
              <span className="truncate max-w-[180px]">{activeService}</span>
              <Edit3 className="w-3 h-3 text-slate-500 group-hover:text-fuchsia-400" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-80 bg-slate-950 border border-white/15 text-white p-4 shadow-2xl rounded-xl space-y-3">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-fuchsia-300 uppercase tracking-wider">
                <Calendar className="w-3.5 h-3.5 text-fuchsia-400" />
                Service Playlist & Topic
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                This is the active church gathering or sermon topic. All songs, scripture passages, and announcements belong to this service.
              </p>
            </div>

            {/* Custom Input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-300">
                Service / Gathering Name
              </label>
              <div className="flex gap-1.5">
                <Input
                  value={serviceInput}
                  onChange={(e) => setServiceInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyServiceRename()}
                  placeholder="e.g. Sunday Morning Service"
                  className="h-8 text-xs bg-slate-900 border-white/10 text-white"
                />
                <Button
                  size="sm"
                  onClick={handleApplyServiceRename}
                  className="h-8 px-2.5 bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-xs font-bold shrink-0"
                >
                  Save
                </Button>
              </div>
            </div>

            {/* Presets */}
            <div className="space-y-1.5 pt-1 border-t border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Quick Service Presets
              </span>
              <div className="space-y-1">
                {[
                  'Sunday Morning Service',
                  'Sunday Evening Tamil Worship',
                  'Wednesday Fasting & Prayer',
                  'Youth & Young Adults Service',
                  'Friday Bible Study & Word',
                  'Special Communion Service',
                ].map((name) => (
                  <button
                    key={name}
                    onClick={() => {
                      setServiceInput(name);
                      if (onRenameService) onRenameService(name);
                      setIsPopoverOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-medium transition-all flex items-center justify-between ${
                      activeService === name
                        ? 'bg-fuchsia-950/60 text-fuchsia-300 border border-fuchsia-500/40'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span>{name}</span>
                    {activeService === name && (
                      <Check className="w-3.5 h-3.5 text-fuchsia-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Center: Mode Switcher (Show / Edit / Stage) like FreeShow */}
      <div className="flex items-center bg-slate-900 border border-white/10 p-0.5 rounded-lg">
        <button
          onClick={() => onModeChange('show')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
            activeMode === 'show'
              ? 'bg-fuchsia-600 text-white shadow-sm shadow-fuchsia-600/40'
              : 'text-muted-foreground hover:text-white'
          }`}
        >
          <MonitorPlay className="w-3.5 h-3.5" />
          <span>Show</span>
        </button>

        <button
          onClick={() => onModeChange('edit')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
            activeMode === 'edit'
              ? 'bg-fuchsia-600 text-white shadow-sm shadow-fuchsia-600/40'
              : 'text-muted-foreground hover:text-white'
          }`}
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Edit</span>
        </button>

        <button
          onClick={() => onModeChange('stage')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
            activeMode === 'stage'
              ? 'bg-fuchsia-600 text-white shadow-sm shadow-fuchsia-600/40'
              : 'text-muted-foreground hover:text-white'
          }`}
        >
          <Tv className="w-3.5 h-3.5" />
          <span>Stage</span>
        </button>
      </div>

      {/* Right: Live Badge + Output Dropdowns + Settings */}
      <div className="flex items-center gap-2">
        {/* Live Broadcast Indicator & Stop Live Button */}
        {isLive ? (
          <Button
            size="sm"
            variant="destructive"
            onClick={onStopLive}
            title="End livestream / Stop broadcast (Shortcut: Esc)"
            className="h-8 px-3 text-xs font-bold uppercase tracking-wider bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/40 cursor-pointer flex items-center gap-1.5 border border-rose-400"
          >
            <Square className="w-3 h-3 fill-white animate-pulse" />
            <span>STOP LIVE</span>
          </Button>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold transition-all border bg-slate-900 text-slate-400 border-white/10">
            <div className="w-2 h-2 rounded-full bg-slate-600" />
            <span>OFFLINE</span>
          </div>
        )}

        {/* Outputs Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs font-medium border-white/10 bg-slate-900 hover:bg-slate-800 text-slate-200 cursor-pointer"
            >
              <Radio className="w-3.5 h-3.5 mr-1.5 text-fuchsia-400" />
              Outputs
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 bg-slate-950 border-white/15 text-slate-200">
            <DropdownMenuLabel className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
              PlayCast Output Feeds
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/10" />

            {/* OBS Browser Source */}
            <DropdownMenuItem
              onClick={() => openWindow('/display', 'playcast-obs')}
              className="flex items-center justify-between cursor-pointer py-2"
            >
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-rose-400" />
                <div>
                  <div className="font-semibold text-xs text-white">OBS Browser Source</div>
                  <div className="text-[10px] text-muted-foreground">Transparent 1080p Overlay</div>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
            </DropdownMenuItem>

            {/* Projector Window */}
            <DropdownMenuItem
              onClick={() => openWindow('/projector', 'playcast-projector')}
              className="flex items-center justify-between cursor-pointer py-2"
            >
              <div className="flex items-center gap-2">
                <Tv className="w-4 h-4 text-indigo-400" />
                <div>
                  <div className="font-semibold text-xs text-white">Auditorium Projector</div>
                  <div className="text-[10px] text-muted-foreground">Full-screen Congregation View</div>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
            </DropdownMenuItem>

            {/* Stage Monitor */}
            <DropdownMenuItem
              onClick={() => openWindow('/stage', 'playcast-stage')}
              className="flex items-center justify-between cursor-pointer py-2"
            >
              <div className="flex items-center gap-2">
                <MonitorPlay className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="font-semibold text-xs text-white">Stage Confidence Monitor</div>
                  <div className="text-[10px] text-muted-foreground">Current + Next + Clock</div>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
            </DropdownMenuItem>

            {/* Mobile Remote */}
            <DropdownMenuItem
              onClick={() => openWindow('/remote', 'playcast-remote')}
              className="flex items-center justify-between cursor-pointer py-2"
            >
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-amber-400" />
                <div>
                  <div className="font-semibold text-xs text-white">Mobile Web Remote</div>
                  <div className="text-[10px] text-muted-foreground">Control via iPad/Tablet</div>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-white/10" />

            {/* Quick Copy Link */}
            <DropdownMenuItem
              onClick={() => copyUrl('/display', 'OBS URL')}
              className="flex items-center justify-between cursor-pointer text-xs"
            >
              <div className="flex items-center gap-2">
                <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Copy OBS Source URL</span>
              </div>
              {copiedUrl === 'OBS URL' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Lower Thirds & Personalities Modal Trigger */}
        {onOpenLowerThird && (
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenLowerThird}
            className="h-8 text-xs font-semibold border-white/10 bg-slate-900 hover:bg-slate-800 text-slate-200 cursor-pointer hidden sm:flex items-center gap-1.5"
            title="Church Personalities & Lower-Third Overlays"
          >
            <UserCheck className="w-3.5 h-3.5 text-fuchsia-400" />
            <span>Lower Thirds</span>
          </Button>
        )}

        {/* Settings Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenSettings}
          className="h-8 w-8 text-muted-foreground hover:text-white hover:bg-slate-900 cursor-pointer"
          title="Display & Stream Settings"
        >
          <Sliders className="w-4 h-4" />
        </Button>

        {/* User Account / Admin Menu */}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-lg bg-slate-900 border border-white/10 hover:border-fuchsia-500/50 hover:bg-slate-800 transition cursor-pointer text-xs"
                title={`${user.name} (${user.role})`}
              >
                <div
                  className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-[11px] ${
                    isSuperAdmin
                      ? 'bg-gradient-to-br from-fuchsia-600 to-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-200 border border-white/10'
                  }`}
                >
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span className="font-semibold text-slate-200 hidden sm:inline-block max-w-[100px] truncate">
                  {user.name || user.username}
                </span>
                {isSuperAdmin && (
                  <span className="text-[9px] font-bold uppercase tracking-wider text-fuchsia-400 bg-fuchsia-950/80 px-1 py-0.2 rounded border border-fuchsia-500/30 hidden md:inline-block">
                    Admin
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-slate-950 border-white/15 text-slate-200">
              <div className="p-3 border-b border-white/10">
                <p className="text-xs font-bold text-white truncate">{user.name}</p>
                <p className="text-[11px] text-slate-400 truncate">@{user.username}</p>
                <div className="mt-1">
                  <span className="text-[10px] font-semibold text-fuchsia-400 bg-fuchsia-950/60 px-1.5 py-0.5 rounded border border-fuchsia-500/30">
                    {isSuperAdmin ? 'Super Administrator' : 'Operator'}
                  </span>
                </div>
              </div>

              {isSuperAdmin && (
                <DropdownMenuItem
                  onClick={() => navigate('/admin')}
                  className="flex items-center gap-2 py-2 cursor-pointer text-xs hover:text-white"
                >
                  <Shield className="w-4 h-4 text-fuchsia-400" />
                  <span>Admin Panel</span>
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator className="bg-white/10" />

              <DropdownMenuItem
                onClick={handleLogout}
                className="flex items-center gap-2 py-2 cursor-pointer text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
};
