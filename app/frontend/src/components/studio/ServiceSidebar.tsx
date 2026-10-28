import React from 'react';
import {
  Folder,
  Music,
  BookOpen,
  Mic,
  Clock,
  Plus,
  Trash2,
  ChevronRight,
  ListPlus,
} from 'lucide-react';
import type { ServiceSection, ServiceItem } from '@/types/playcast';
import { Button } from '@/components/ui/button';

interface ServiceSidebarProps {
  sections: ServiceSection[];
  selectedItem: ServiceItem | null;
  onSelectItem: (item: ServiceItem) => void;
  onAddItem: (sectionId: string) => void;
  onDeleteItem: (itemId: string) => void;
  onAddSection: () => void;
}

export const ServiceSidebar: React.FC<ServiceSidebarProps> = ({
  sections,
  selectedItem,
  onSelectItem,
  onAddItem,
  onDeleteItem,
  onAddSection,
}) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Worship':
        return <Music className="w-3.5 h-3.5 text-fuchsia-400" />;
      case 'Scripture':
        return <BookOpen className="w-3.5 h-3.5 text-amber-400" />;
      case 'Sermon':
        return <Mic className="w-3.5 h-3.5 text-indigo-400" />;
      case 'Welcome':
      case 'Countdown':
        return <Clock className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <Folder className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <aside className="w-64 bg-slate-950/70 border-r border-border/40 flex flex-col min-h-0 select-none shrink-0">
      {/* Header */}
      <div className="h-10 px-3 border-b border-border/40 flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Folder className="w-3.5 h-3.5 text-fuchsia-400" />
          Service Playlist
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={onAddSection}
          className="h-6 w-6 text-muted-foreground hover:text-white hover:bg-slate-900 cursor-pointer"
          title="New Service Section"
        >
          <Plus className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Playlist Items Tree */}
      <div className="flex-1 overflow-y-auto p-2 space-y-4">
        {sections.map((section) => (
          <div key={section.id} className="space-y-1">
            {/* Section Header */}
            <div className="px-2 py-1 flex items-center justify-between group">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider truncate">
                {section.name}
              </span>
              <button
                onClick={() => onAddItem(section.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
                title="Add Item to Section"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            {/* Section Item Cards */}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isSelected = selectedItem?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => onSelectItem(item)}
                    className={`group/item flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-fuchsia-950/40 text-fuchsia-200 border border-fuchsia-500/40 shadow-sm'
                        : 'text-slate-300 hover:bg-slate-900/80 hover:text-white border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {getCategoryIcon(item.category)}
                      <div className="truncate">
                        <div className="truncate font-semibold">{item.title}</div>
                        {item.tamilTitle && item.tamilTitle !== item.title && (
                          <div className="text-[10px] text-muted-foreground truncate">
                            {item.tamilTitle}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded font-mono">
                        {item.slides.length}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteItem(item.id);
                        }}
                        className="text-slate-500 hover:text-rose-400 p-0.5 rounded cursor-pointer"
                        title="Remove from playlist"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {section.items.length === 0 && (
                <div
                  onClick={() => onAddItem(section.id)}
                  className="px-3 py-2 text-[11px] text-muted-foreground/60 border border-dashed border-white/5 rounded-lg text-center cursor-pointer hover:border-white/20 transition-colors"
                >
                  + Add song or scripture
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Quick Action */}
      <div className="p-2 border-t border-border/40">
        <Button
          variant="outline"
          size="sm"
          onClick={onAddSection}
          className="w-full text-xs font-medium border-dashed border-white/15 bg-slate-900/60 hover:bg-slate-900 text-slate-300 cursor-pointer"
        >
          <ListPlus className="w-3.5 h-3.5 mr-1.5 text-fuchsia-400" />
          Add Service Section
        </Button>
      </div>
    </aside>
  );
};
