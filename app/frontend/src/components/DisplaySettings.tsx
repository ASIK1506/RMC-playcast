import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { type DisplaySettings as DisplaySettingsType } from '@/lib/sync';

interface DisplaySettingsProps {
  settings: DisplaySettingsType;
  onChange: (settings: DisplaySettingsType) => void;
}

export function DisplaySettings({ settings, onChange }: DisplaySettingsProps) {
  const update = (partial: Partial<DisplaySettingsType>) => {
    onChange({ ...settings, ...partial });
  };

  return (
    <div className="space-y-5 p-1">
      {/* Font Size */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Font Size</Label>
          <span className="text-xs font-mono text-primary">{settings.fontSize}px</span>
        </div>
        <Slider
          value={[settings.fontSize]}
          onValueChange={([v]) => update({ fontSize: v })}
          min={24}
          max={96}
          step={2}
          className="cursor-pointer"
        />
      </div>

      {/* Padding */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Padding</Label>
          <span className="text-xs font-mono text-primary">{settings.padding}px</span>
        </div>
        <Slider
          value={[settings.padding]}
          onValueChange={([v]) => update({ padding: v })}
          min={20}
          max={120}
          step={5}
          className="cursor-pointer"
        />
      </div>

      {/* Text Color */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Font Color</Label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={settings.fontColor}
            onChange={(e) => update({ fontColor: e.target.value })}
            className="w-10 h-10 p-1 cursor-pointer"
          />
          <Input
            value={settings.fontColor}
            onChange={(e) => update({ fontColor: e.target.value })}
            className="flex-1 font-mono text-xs"
          />
        </div>
      </div>

      {/* Background Type */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Background Type</Label>
        <Select value={settings.backgroundType} onValueChange={(v) => update({ backgroundType: v as 'solid' | 'gradient' | 'transparent' | 'image' })}>
          <SelectTrigger className="cursor-pointer">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="solid">Solid</SelectItem>
            <SelectItem value="gradient">Gradient</SelectItem>
            <SelectItem value="image">Image</SelectItem>
            <SelectItem value="transparent">Transparent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Background Colors */}
      {settings.backgroundType === 'solid' && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Background Color</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={settings.backgroundColor}
              onChange={(e) => update({ backgroundColor: e.target.value })}
              className="w-10 h-10 p-1 cursor-pointer"
            />
            <Input
              value={settings.backgroundColor}
              onChange={(e) => update({ backgroundColor: e.target.value })}
              className="flex-1 font-mono text-xs"
            />
          </div>
        </div>
      )}

      {settings.backgroundType === 'gradient' && (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Gradient Start</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={settings.gradientFrom}
                onChange={(e) => update({ gradientFrom: e.target.value })}
                className="w-10 h-10 p-1 cursor-pointer"
              />
              <Input
                value={settings.gradientFrom}
                onChange={(e) => update({ gradientFrom: e.target.value })}
                className="flex-1 font-mono text-xs"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Gradient End</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={settings.gradientTo}
                onChange={(e) => update({ gradientTo: e.target.value })}
                className="w-10 h-10 p-1 cursor-pointer"
              />
              <Input
                value={settings.gradientTo}
                onChange={(e) => update({ gradientTo: e.target.value })}
                className="flex-1 font-mono text-xs"
              />
            </div>
          </div>
        </div>
      )}

      {/* Background Image */}
      {settings.backgroundType === 'image' && (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Image URL</Label>
            <Input
              value={settings.backgroundImage}
              onChange={(e) => update({ backgroundImage: e.target.value })}
              placeholder="https://example.com/image.jpg"
              className="text-xs"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Dark Overlay</Label>
              <span className="text-xs font-mono text-primary">{settings.backgroundOverlay}%</span>
            </div>
            <Slider
              value={[settings.backgroundOverlay]}
              onValueChange={([v]) => update({ backgroundOverlay: v })}
              min={0}
              max={90}
              step={5}
              className="cursor-pointer"
            />
          </div>
          {settings.backgroundImage && (
            <div className="rounded-md overflow-hidden border border-muted/50 aspect-video relative">
              <img
                src={settings.backgroundImage}
                alt="Background preview"
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              <div
                className="absolute inset-0"
                style={{ backgroundColor: `rgba(0,0,0,${settings.backgroundOverlay / 100})` }}
              />
            </div>
          )}
        </div>
      )}

      {/* Text Alignment */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Text Alignment</Label>
        <Select value={settings.textAlign} onValueChange={(v) => update({ textAlign: v as 'left' | 'center' | 'right' })}>
          <SelectTrigger className="cursor-pointer">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="left">Left</SelectItem>
            <SelectItem value="center">Center</SelectItem>
            <SelectItem value="right">Right</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Transition */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Transition</Label>
        <Select value={settings.transition} onValueChange={(v) => update({ transition: v as 'fade' | 'slide' | 'none' })}>
          <SelectTrigger className="cursor-pointer">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fade">Fade</SelectItem>
            <SelectItem value="slide">Slide</SelectItem>
            <SelectItem value="none">None</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Show Reference */}
      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground">Show Reference</Label>
        <Switch
          checked={settings.showReference}
          onCheckedChange={(v) => update({ showReference: v })}
          className="cursor-pointer"
        />
      </div>

      {/* Reference Position */}
      {settings.showReference && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Reference Position</Label>
          <Select value={settings.referencePosition} onValueChange={(v) => update({ referencePosition: v as 'top' | 'bottom' })}>
            <SelectTrigger className="cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="top">Top</SelectItem>
              <SelectItem value="bottom">Bottom</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Preset Backgrounds */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Preset Backgrounds</Label>
        <div className="grid grid-cols-4 gap-2">
          {[
            { from: '#0f0c29', to: '#302b63', label: 'Night' },
            { from: '#1a1a2e', to: '#16213e', label: 'Ocean' },
            { from: '#2d1b69', to: '#11001c', label: 'Purple' },
            { from: '#0a1628', to: '#1a3a5c', label: 'Blue' },
            { from: '#1a0000', to: '#4a0000', label: 'Red' },
            { from: '#0d2818', to: '#1a4d2e', label: 'Green' },
            { from: '#000000', to: '#000000', label: 'Black' },
            { from: '#1a1a1a', to: '#333333', label: 'Gray' },
          ].map((preset) => (
            <button
              key={preset.label}
              onClick={() => update({ backgroundType: 'gradient', gradientFrom: preset.from, gradientTo: preset.to })}
              className="aspect-square rounded-md border border-muted/50 hover:border-primary/50 transition-colors cursor-pointer overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${preset.from}, ${preset.to})` }}
              title={preset.label}
            />
          ))}
        </div>
      </div>
    </div>
  );
}