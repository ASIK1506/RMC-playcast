import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, Play, ChevronUp, ChevronDown, ListX } from 'lucide-react';

export interface QueuedVerse {
  id: string;
  bookTamil: string;
  chapter: number;
  verse: number;
  text: string;
  reference: string;
}

interface VerseQueueProps {
  queue: QueuedVerse[];
  currentIndex: number;
  onSelect: (index: number) => void;
  onRemove: (id: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onClearAll: () => void;
  onGoLive: (index: number) => void;
}

export function VerseQueue({
  queue,
  currentIndex,
  onSelect,
  onRemove,
  onMoveUp,
  onMoveDown,
  onClearAll,
  onGoLive,
}: VerseQueueProps) {
  if (queue.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
          <ListX className="h-8 w-8 text-muted-foreground/50" />
        </div>
        <p className="text-muted-foreground text-sm">Queue is empty</p>
        <p className="text-muted-foreground/60 text-xs mt-1">Search and add verses to the queue</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-muted-foreground">
          {queue.length} verses
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs text-destructive hover:text-destructive cursor-pointer"
          onClick={onClearAll}
        >
          <Trash2 className="h-3 w-3 mr-1" />
          Clear All
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-1.5">
          {queue.map((item, index) => (
            <div
              key={item.id}
              className={`group relative p-3 rounded-lg border transition-all cursor-pointer
                ${index === currentIndex
                  ? 'border-primary/50 bg-primary/10 shadow-sm shadow-primary/5'
                  : 'border-transparent hover:border-muted hover:bg-muted/20'
                }`}
              onClick={() => onSelect(index)}
            >
              <div className="flex items-start gap-2">
                <span className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold
                  ${index === currentIndex ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground'}`}>
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-primary/80 mb-0.5">{item.reference}</p>
                  <p className="text-sm leading-relaxed line-clamp-2">{item.text}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="absolute right-2 top-2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 cursor-pointer"
                  onClick={(e) => { e.stopPropagation(); onGoLive(index); }}
                  title="Go Live"
                >
                  <Play className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 cursor-pointer"
                  onClick={(e) => { e.stopPropagation(); onMoveUp(index); }}
                  disabled={index === 0}
                  title="Move Up"
                >
                  <ChevronUp className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 cursor-pointer"
                  onClick={(e) => { e.stopPropagation(); onMoveDown(index); }}
                  disabled={index === queue.length - 1}
                  title="Move Down"
                >
                  <ChevronDown className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-destructive hover:text-destructive cursor-pointer"
                  onClick={(e) => { e.stopPropagation(); onRemove(item.id); }}
                  title="Remove"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}