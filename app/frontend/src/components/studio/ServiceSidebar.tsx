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
    <aside className="w-64 bg-slate-50/95 dark:bg-slate-950/70 border-r border-slate-200 dark:border-border/40 flex flex-col min-h-0 select-none shrink-0 transition-colors">
      {/* Header */}
      <div className="h-10 px-3 border-b border-slate-200 dark:border-border/40 flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-muted-foreground flex items-center gap-1.5">
          <Folder className="w-3.5 h-3.5 text-fuchsia-500 dark:text-fuchsia-400" />
          Service Playlist
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={onAddSection}
          className="h-6 w-6 text-slate-500 hover:text-slate-900 hover:bg-slate-200/80 dark:text-muted-foreground dark:hover:text-white dark:hover:bg-slate-900 cursor-pointer"
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
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
                {section.name}
              </span>
              <button
                onClick={() => onAddItem(section.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white p-0.5 rounded cursor-pointer"
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
                        ? 'bg-fuchsia-100 text-fuchsia-900 border border-fuchsia-300 shadow-sm dark:bg-fuchsia-950/40 dark:text-fuchsia-200 dark:border-fuchsia-500/40'
                        : 'text-slate-700 hover:bg-slate-200/70 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900/80 dark:hover:text-white border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {getCategoryIcon(item.category)}
                      <div className="truncate">
                        <div className="truncate font-semibold">{item.title}</div>
                        {item.tamilTitle && item.tamilTitle !== item.title && (
                          <div className="text-[10px] text-slate-500 dark:text-muted-foreground truncate">
                            {item.tamilTitle}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                      <span className="text-[10px] bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400 px-1.5 py-0.2 rounded font-mono">
                        {item.slides.length}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteItem(item.id);
                        }}
                        className="text-slate-400 hover:text-rose-600 dark:text-slate-500 dark:hover:text-rose-400 p-0.5 rounded cursor-pointer"
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
                  className="px-3 py-2 text-[11px] text-slate-400 dark:text-muted-foreground/60 border border-dashed border-slate-300 hover:border-slate-400 dark:border-white/5 dark:hover:border-white/20 rounded-lg text-center cursor-pointer transition-colors"
                >
                  + Add song or scripture
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Quick Action */}
      <div className="p-2 border-t border-slate-200 dark:border-border/40">
        <Button
          variant="outline"
          size="sm"
          onClick={onAddSection}
          className="w-full text-xs font-medium border-dashed border-slate-300 dark:border-white/15 bg-white dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 cursor-pointer shadow-sm"
        >
          <ListPlus className="w-3.5 h-3.5 mr-1.5 text-fuchsia-500 dark:text-fuchsia-400" />
          Add Service Section
        </Button>
      </div>
    </aside>
  );
};
