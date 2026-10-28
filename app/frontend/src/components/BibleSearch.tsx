import { useState, useMemo } from 'react';
import { bibleBooks, getVerse, getVersesForChapter, getVerseReference, type BibleBook } from '@/data/tamil-bible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Plus, Search, Loader2 } from 'lucide-react';

interface BibleSearchProps {
  onAddToQueue: (verse: { bookTamil: string; chapter: number; verse: number; text: string; reference: string }) => void;
  onGoLive: (verse: { bookTamil: string; chapter: number; verse: number; text: string; reference: string }) => void;
  bibleReady?: boolean;
}

export function BibleSearch({ onAddToQueue, onGoLive, bibleReady = true }: BibleSearchProps) {
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('books');
  const [rangeFrom, setRangeFrom] = useState('');
  const [rangeTo, setRangeTo] = useState('');

  const oldTestament = useMemo(() => bibleBooks.filter(b => b.testament === 'old'), []);
  const newTestament = useMemo(() => bibleBooks.filter(b => b.testament === 'new'), []);

  const filteredBooks = useMemo(() => {
    if (!searchQuery) return null;
    return bibleBooks.filter(b =>
      b.nameTamil.includes(searchQuery) || b.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const chapters = useMemo(() => {
    if (!selectedBook) return [];
    return Array.from({ length: selectedBook.chapters }, (_, i) => i + 1);
  }, [selectedBook, bibleReady]);

  const verses = useMemo(() => {
    if (!selectedBook || !selectedChapter || !bibleReady) return [];
    const count = getVersesForChapter(selectedBook.nameTamil, selectedChapter);
    return Array.from({ length: count }, (_, i) => {
      const verseNum = i + 1;
      const text = getVerse(selectedBook.nameTamil, selectedChapter, verseNum);
      return { verse: verseNum, text };
    });
  }, [selectedBook, selectedChapter, bibleReady]);

  const handleSelectBook = (book: BibleBook) => {
    setSelectedBook(book);
    setSelectedChapter(null);
    setActiveTab('chapters');
  };

  const handleSelectChapter = (chapter: number) => {
    setSelectedChapter(chapter);
    setActiveTab('verses');
  };

  const handleAddVerse = (verseNum: number, text: string | null) => {
    if (!selectedBook || !selectedChapter) return;
    const reference = `${selectedBook.nameTamil} ${selectedChapter}:${verseNum}`;
    const verseText = text || reference;
    onAddToQueue({ bookTamil: selectedBook.nameTamil, chapter: selectedChapter, verse: verseNum, text: verseText, reference });
  };

  const handleGoLiveVerse = (verseNum: number, text: string | null) => {
    if (!selectedBook || !selectedChapter) return;
    const reference = `${selectedBook.nameTamil} ${selectedChapter}:${verseNum}`;
    const verseText = text || reference;
    onGoLive({ bookTamil: selectedBook.nameTamil, chapter: selectedChapter, verse: verseNum, text: verseText, reference });
  };

  const handleAddRange = () => {
    if (!selectedBook || !selectedChapter) return;
    const from = parseInt(rangeFrom);
    const to = parseInt(rangeTo);
    if (isNaN(from) || isNaN(to) || from < 1 || to < from) return;
    const maxVerse = verses.length;
    const end = Math.min(to, maxVerse);
    for (let i = from; i <= end; i++) {
      const text = getVerse(selectedBook.nameTamil, selectedChapter, i);
      const reference = `${selectedBook.nameTamil} ${selectedChapter}:${i}`;
      onAddToQueue({ bookTamil: selectedBook.nameTamil, chapter: selectedChapter, verse: i, text: text || reference, reference });
    }
    setRangeFrom('');
    setRangeTo('');
  };

  const renderBookGrid = (books: BibleBook[]) => (
    <div className="grid grid-cols-2 gap-1.5">
      {books.map(book => (
        <button
          key={book.id}
          onClick={() => handleSelectBook(book)}
          className={`text-left px-3 py-2 rounded-md text-sm transition-colors cursor-pointer
            ${selectedBook?.id === book.id
              ? 'bg-primary/20 text-primary border border-primary/30'
              : 'hover:bg-muted/50 text-foreground/80 hover:text-foreground'
            }`}
        >
          <span className="font-medium block">{book.nameTamil}</span>
          <span className="text-[10px] text-muted-foreground">{book.name}</span>
        </button>
      ))}
    </div>
  );

  if (!bibleReady) {
    return (
      <div className="flex flex-col h-full items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading Bible...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search Input */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search books..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-muted/30 border-muted"
        />
      </div>

      {/* Breadcrumb */}
      {selectedBook && (
        <div className="flex items-center gap-1 mb-3 text-sm">
          <button onClick={() => { setSelectedBook(null); setSelectedChapter(null); setActiveTab('books'); }} className="text-muted-foreground hover:text-foreground cursor-pointer">
            Books
          </button>
          <span className="text-muted-foreground">/</span>
          <button onClick={() => { setSelectedChapter(null); setActiveTab('chapters'); }} className="text-primary cursor-pointer">
            {selectedBook.nameTamil}
          </button>
          {selectedChapter && (
            <>
              <span className="text-muted-foreground">/</span>
              <span className="text-primary">Chapter {selectedChapter}</span>
            </>
          )}
        </div>
      )}

      {/* Search Results */}
      {searchQuery && filteredBooks && (
        <ScrollArea className="flex-1">
          <div className="grid grid-cols-2 gap-1.5">
            {filteredBooks.map(book => (
              <button
                key={book.id}
                onClick={() => { handleSelectBook(book); setSearchQuery(''); }}
                className="text-left px-3 py-2 rounded-md text-sm hover:bg-muted/50 cursor-pointer"
              >
                <span className="font-medium block">{book.nameTamil}</span>
                <span className="text-[10px] text-muted-foreground">{book.name}</span>
              </button>
            ))}
          </div>
        </ScrollArea>
      )}

      {/* Main Navigation */}
      {!searchQuery && !selectedBook && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-2 mb-3">
            <TabsTrigger value="books" className="text-xs">Old Testament</TabsTrigger>
            <TabsTrigger value="new" className="text-xs">New Testament</TabsTrigger>
          </TabsList>
          <TabsContent value="books" className="flex-1 min-h-0 mt-0 overflow-hidden">
            <ScrollArea className="h-full">
              {renderBookGrid(oldTestament)}
            </ScrollArea>
          </TabsContent>
          <TabsContent value="new" className="flex-1 min-h-0 mt-0 overflow-hidden">
            <ScrollArea className="h-full">
              {renderBookGrid(newTestament)}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      )}

      {/* Chapter Grid */}
      {!searchQuery && selectedBook && !selectedChapter && (
        <ScrollArea className="flex-1">
          <div className="grid grid-cols-5 gap-2">
            {chapters.map(ch => (
              <button
                key={ch}
                onClick={() => handleSelectChapter(ch)}
                className="aspect-square flex items-center justify-center rounded-md text-sm font-medium bg-muted/30 hover:bg-primary/20 hover:text-primary transition-colors cursor-pointer"
              >
                {ch}
              </button>
            ))}
          </div>
        </ScrollArea>
      )}

      {/* Verse Range Selector */}
      {!searchQuery && selectedBook && selectedChapter && (
        <div className="flex items-center gap-2 mb-3 p-2 rounded-lg bg-muted/20 border border-muted/30">
          <span className="text-xs text-muted-foreground whitespace-nowrap">Add range:</span>
          <Input
            type="number"
            min={1}
            max={verses.length}
            placeholder="From"
            value={rangeFrom}
            onChange={(e) => setRangeFrom(e.target.value)}
            className="h-7 w-16 text-xs text-center"
          />
          <span className="text-xs text-muted-foreground">to</span>
          <Input
            type="number"
            min={1}
            max={verses.length}
            placeholder="To"
            value={rangeTo}
            onChange={(e) => setRangeTo(e.target.value)}
            className="h-7 w-16 text-xs text-center"
          />
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs cursor-pointer whitespace-nowrap"
            onClick={handleAddRange}
            disabled={!rangeFrom || !rangeTo || parseInt(rangeFrom) > parseInt(rangeTo)}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add
          </Button>
        </div>
      )}

      {/* Verse List */}
      {!searchQuery && selectedBook && selectedChapter && (
        <ScrollArea className="flex-1">
          <div className="space-y-2">
            {verses.map(({ verse: verseNum, text }) => (
              <div
                key={verseNum}
                className="group p-3 rounded-lg border border-transparent hover:border-muted hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="shrink-0 mt-0.5 text-[10px] px-1.5">
                    {verseNum}
                  </Badge>
                  <p className="text-sm leading-relaxed flex-1">
                    {text || <span className="text-muted-foreground italic">{selectedBook.nameTamil} {selectedChapter}:{verseNum}</span>}
                  </p>
                </div>
                <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs cursor-pointer"
                    onClick={() => handleAddVerse(verseNum, text)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add to Queue
                  </Button>
                  <Button
                    size="sm"
                    className="h-7 text-xs cursor-pointer"
                    onClick={() => handleGoLiveVerse(verseNum, text)}
                  >
                    <BookOpen className="h-3 w-3 mr-1" />
                    Go Live
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}