// Tamil Bible Data - Full 66 books loaded from JSON at runtime
// Data source: aruljohn/Bible-tamil (MIT License)

export interface BibleVerse {
  book: string;
  bookTamil: string;
  chapter: number;
  verse: number;
  text: string;
}

export interface BibleBook {
  id: number;
  name: string;
  nameTamil: string;
  chapters: number;
  testament: 'old' | 'new';
}

// Compact JSON format: { e: english, t: tamil, c: [[verse_texts...], ...] }
interface RawBook {
  e: string;
  t: string;
  c: string[][];
}

// Bible books metadata (available immediately)
export const bibleBooks: BibleBook[] = [
  // Old Testament - பழைய ஏற்பாடு
  { id: 1, name: 'Genesis', nameTamil: 'ஆதியாகமம்', chapters: 50, testament: 'old' },
  { id: 2, name: 'Exodus', nameTamil: 'யாத்திராகமம்', chapters: 40, testament: 'old' },
  { id: 3, name: 'Leviticus', nameTamil: 'லேவியராகமம்', chapters: 27, testament: 'old' },
  { id: 4, name: 'Numbers', nameTamil: 'எண்ணாகமம்', chapters: 36, testament: 'old' },
  { id: 5, name: 'Deuteronomy', nameTamil: 'உபாகமம்', chapters: 34, testament: 'old' },
  { id: 6, name: 'Joshua', nameTamil: 'யோசுவா', chapters: 24, testament: 'old' },
  { id: 7, name: 'Judges', nameTamil: 'நியாயாதிபதிகள்', chapters: 21, testament: 'old' },
  { id: 8, name: 'Ruth', nameTamil: 'ரூத்', chapters: 4, testament: 'old' },
  { id: 9, name: '1 Samuel', nameTamil: '1 சாமுவேல்', chapters: 31, testament: 'old' },
  { id: 10, name: '2 Samuel', nameTamil: '2 சாமுவேல்', chapters: 24, testament: 'old' },
  { id: 11, name: '1 Kings', nameTamil: '1 இராஜாக்கள்', chapters: 22, testament: 'old' },
  { id: 12, name: '2 Kings', nameTamil: '2 இராஜாக்கள்', chapters: 25, testament: 'old' },
  { id: 13, name: '1 Chronicles', nameTamil: '1 நாளாகமம்', chapters: 29, testament: 'old' },
  { id: 14, name: '2 Chronicles', nameTamil: '2 நாளாகமம்', chapters: 36, testament: 'old' },
  { id: 15, name: 'Ezra', nameTamil: 'எஸ்றா', chapters: 10, testament: 'old' },
  { id: 16, name: 'Nehemiah', nameTamil: 'நெகேமியா', chapters: 13, testament: 'old' },
  { id: 17, name: 'Esther', nameTamil: 'எஸ்தர்', chapters: 10, testament: 'old' },
  { id: 18, name: 'Job', nameTamil: 'யோபு', chapters: 42, testament: 'old' },
  { id: 19, name: 'Psalms', nameTamil: 'சங்கீதம்', chapters: 150, testament: 'old' },
  { id: 20, name: 'Proverbs', nameTamil: 'நீதிமொழிகள்', chapters: 31, testament: 'old' },
  { id: 21, name: 'Ecclesiastes', nameTamil: 'பிரசங்கி', chapters: 12, testament: 'old' },
  { id: 22, name: 'Song of Solomon', nameTamil: 'உன்னதப்பாட்டு', chapters: 8, testament: 'old' },
  { id: 23, name: 'Isaiah', nameTamil: 'ஏசாயா', chapters: 66, testament: 'old' },
  { id: 24, name: 'Jeremiah', nameTamil: 'எரேமியா', chapters: 52, testament: 'old' },
  { id: 25, name: 'Lamentations', nameTamil: 'புலம்பல்', chapters: 5, testament: 'old' },
  { id: 26, name: 'Ezekiel', nameTamil: 'எசேக்கியேல்', chapters: 48, testament: 'old' },
  { id: 27, name: 'Daniel', nameTamil: 'தானியேல்', chapters: 12, testament: 'old' },
  { id: 28, name: 'Hosea', nameTamil: 'ஓசியா', chapters: 14, testament: 'old' },
  { id: 29, name: 'Joel', nameTamil: 'யோவேல்', chapters: 3, testament: 'old' },
  { id: 30, name: 'Amos', nameTamil: 'ஆமோஸ்', chapters: 9, testament: 'old' },
  { id: 31, name: 'Obadiah', nameTamil: 'ஒபதியா', chapters: 1, testament: 'old' },
  { id: 32, name: 'Jonah', nameTamil: 'யோனா', chapters: 4, testament: 'old' },
  { id: 33, name: 'Micah', nameTamil: 'மீகா', chapters: 7, testament: 'old' },
  { id: 34, name: 'Nahum', nameTamil: 'நாகூம்', chapters: 3, testament: 'old' },
  { id: 35, name: 'Habakkuk', nameTamil: 'ஆபகூக்', chapters: 3, testament: 'old' },
  { id: 36, name: 'Zephaniah', nameTamil: 'செப்பனியா', chapters: 3, testament: 'old' },
  { id: 37, name: 'Haggai', nameTamil: 'ஆகாய்', chapters: 2, testament: 'old' },
  { id: 38, name: 'Zechariah', nameTamil: 'சகரியா', chapters: 14, testament: 'old' },
  { id: 39, name: 'Malachi', nameTamil: 'மல்கியா', chapters: 4, testament: 'old' },
  // New Testament - புதிய ஏற்பாடு
  { id: 40, name: 'Matthew', nameTamil: 'மத்தேயு', chapters: 28, testament: 'new' },
  { id: 41, name: 'Mark', nameTamil: 'மாற்கு', chapters: 16, testament: 'new' },
  { id: 42, name: 'Luke', nameTamil: 'லூக்கா', chapters: 24, testament: 'new' },
  { id: 43, name: 'John', nameTamil: 'யோவான்', chapters: 21, testament: 'new' },
  { id: 44, name: 'Acts', nameTamil: 'அப்போஸ்தலர்', chapters: 28, testament: 'new' },
  { id: 45, name: 'Romans', nameTamil: 'ரோமர்', chapters: 16, testament: 'new' },
  { id: 46, name: '1 Corinthians', nameTamil: '1 கொரிந்தியர்', chapters: 16, testament: 'new' },
  { id: 47, name: '2 Corinthians', nameTamil: '2 கொரிந்தியர்', chapters: 13, testament: 'new' },
  { id: 48, name: 'Galatians', nameTamil: 'கலாத்தியர்', chapters: 6, testament: 'new' },
  { id: 49, name: 'Ephesians', nameTamil: 'எபேசியர்', chapters: 6, testament: 'new' },
  { id: 50, name: 'Philippians', nameTamil: 'பிலிப்பியர்', chapters: 4, testament: 'new' },
  { id: 51, name: 'Colossians', nameTamil: 'கொலோசெயர்', chapters: 4, testament: 'new' },
  { id: 52, name: '1 Thessalonians', nameTamil: '1 தெசலோனிக்கேயர்', chapters: 5, testament: 'new' },
  { id: 53, name: '2 Thessalonians', nameTamil: '2 தெசலோனிக்கேயர்', chapters: 3, testament: 'new' },
  { id: 54, name: '1 Timothy', nameTamil: '1 தீமோத்தேயு', chapters: 6, testament: 'new' },
  { id: 55, name: '2 Timothy', nameTamil: '2 தீமோத்தேயு', chapters: 4, testament: 'new' },
  { id: 56, name: 'Titus', nameTamil: 'தீத்து', chapters: 3, testament: 'new' },
  { id: 57, name: 'Philemon', nameTamil: 'பிலேமோன்', chapters: 1, testament: 'new' },
  { id: 58, name: 'Hebrews', nameTamil: 'எபிரெயர்', chapters: 13, testament: 'new' },
  { id: 59, name: 'James', nameTamil: 'யாக்கோபு', chapters: 5, testament: 'new' },
  { id: 60, name: '1 Peter', nameTamil: '1 பேதுரு', chapters: 5, testament: 'new' },
  { id: 61, name: '2 Peter', nameTamil: '2 பேதுரு', chapters: 3, testament: 'new' },
  { id: 62, name: '1 John', nameTamil: '1 யோவான்', chapters: 5, testament: 'new' },
  { id: 63, name: '2 John', nameTamil: '2 யோவான்', chapters: 1, testament: 'new' },
  { id: 64, name: '3 John', nameTamil: '3 யோவான்', chapters: 1, testament: 'new' },
  { id: 65, name: 'Jude', nameTamil: 'யூதா', chapters: 1, testament: 'new' },
  { id: 66, name: 'Revelation', nameTamil: 'வெளிப்படுத்தல்', chapters: 22, testament: 'new' },
];

// Runtime Bible data store
let bibleData: RawBook[] | null = null;
let loadPromise: Promise<void> | null = null;
let isLoaded = false;

// Name mapping from our app's Tamil names to the JSON data's Tamil names
const nameMapping: Record<string, string> = {};

function buildNameMapping(data: RawBook[]) {
  // Map our bibleBooks Tamil names to JSON data Tamil names
  for (const book of data) {
    const jsonTamil = book.t.trim();
    // Try to find matching book in our list by English name
    const ourBook = bibleBooks.find(b => b.name === book.e || 
      b.name.replace('Song of Solomon', 'Song of Songs') === book.e);
    if (ourBook) {
      nameMapping[ourBook.nameTamil] = jsonTamil;
      // Also map the JSON name to itself
      nameMapping[jsonTamil] = jsonTamil;
    }
  }
}

function findBookData(bookTamil: string): RawBook | null {
  if (!bibleData) return null;
  
  // Direct match by Tamil name from JSON
  const mappedName = nameMapping[bookTamil];
  if (mappedName) {
    const found = bibleData.find(b => b.t.trim() === mappedName);
    if (found) return found;
  }
  
  // Fallback: try matching by our bibleBooks English name
  const ourBook = bibleBooks.find(b => b.nameTamil === bookTamil);
  if (ourBook) {
    const found = bibleData.find(b => b.e === ourBook.name || 
      b.e === ourBook.name.replace('Song of Solomon', 'Song of Songs'));
    if (found) return found;
  }
  
  // Last resort: partial Tamil name match
  const found = bibleData.find(b => 
    b.t.trim().includes(bookTamil) || bookTamil.includes(b.t.trim())
  );
  return found || null;
}

export async function loadBibleData(): Promise<void> {
  if (isLoaded) return;
  if (loadPromise) return loadPromise;
  
  loadPromise = (async () => {
    try {
      const response = await fetch('/data/tamil-bible.json');
      if (!response.ok) throw new Error(`Failed to load Bible data: ${response.status}`);
      bibleData = await response.json();
      buildNameMapping(bibleData!);
      isLoaded = true;
      
      // Update chapter counts from actual data
      for (const book of bibleData!) {
        const ourBook = bibleBooks.find(b => b.name === book.e || 
          b.name.replace('Song of Solomon', 'Song of Songs') === book.e);
        if (ourBook) {
          ourBook.chapters = book.c.length;
        }
      }
    } catch (err) {
      console.error('Failed to load Tamil Bible data:', err);
      loadPromise = null;
    }
  })();
  
  return loadPromise;
}

export function isBibleLoaded(): boolean {
  return isLoaded;
}

export function getVersesForChapter(bookTamil: string, chapter: number): number {
  const bookData = findBookData(bookTamil);
  if (!bookData) return 30; // Default fallback
  const chapterIdx = chapter - 1;
  if (chapterIdx < 0 || chapterIdx >= bookData.c.length) return 30;
  return bookData.c[chapterIdx].length;
}

export function getVerse(bookTamil: string, chapter: number, verse: number): string | null {
  const bookData = findBookData(bookTamil);
  if (!bookData) return null;
  const chapterIdx = chapter - 1;
  const verseIdx = verse - 1;
  if (chapterIdx < 0 || chapterIdx >= bookData.c.length) return null;
  if (verseIdx < 0 || verseIdx >= bookData.c[chapterIdx].length) return null;
  return bookData.c[chapterIdx][verseIdx];
}

export function getVerseReference(bookTamil: string, chapter: number, verse: number): string {
  return `${bookTamil} ${chapter}:${verse}`;
}

export function searchVerses(query: string): BibleVerse[] {
  if (!bibleData) return [];
  const results: BibleVerse[] = [];
  const lowerQuery = query.toLowerCase();
  
  for (const book of bibleData) {
    const ourBook = bibleBooks.find(b => b.name === book.e || 
      b.name.replace('Song of Solomon', 'Song of Songs') === book.e);
    const bookTamil = ourBook?.nameTamil || book.t.trim();
    
    for (let chIdx = 0; chIdx < book.c.length; chIdx++) {
      for (let vIdx = 0; vIdx < book.c[chIdx].length; vIdx++) {
        const text = book.c[chIdx][vIdx];
        if (text.includes(query) || text.toLowerCase().includes(lowerQuery)) {
          results.push({
            book: book.e,
            bookTamil,
            chapter: chIdx + 1,
            verse: vIdx + 1,
            text,
          });
          if (results.length >= 50) return results; // Limit results
        }
      }
    }
  }
  
  return results;
}

export function getAllVersesForBook(bookTamil: string): BibleVerse[] {
  const bookData = findBookData(bookTamil);
  if (!bookData) return [];
  
  const results: BibleVerse[] = [];
  const ourBook = bibleBooks.find(b => b.nameTamil === bookTamil);
  
  for (let chIdx = 0; chIdx < bookData.c.length; chIdx++) {
    for (let vIdx = 0; vIdx < bookData.c[chIdx].length; vIdx++) {
      results.push({
        book: ourBook?.name || bookData.e,
        bookTamil,
        chapter: chIdx + 1,
        verse: vIdx + 1,
        text: bookData.c[chIdx][vIdx],
      });
    }
  }
  
  return results;
}

export function getChapterVerses(bookId: number, chapter: number): { verse: number; text: string }[] {
  const ourBook = bibleBooks.find(b => b.id === bookId);
  if (!ourBook) return [];
  const bookData = findBookData(ourBook.nameTamil);
  if (!bookData) return [];
  const chIdx = chapter - 1;
  if (chIdx < 0 || chIdx >= bookData.c.length) return [];

  return bookData.c[chIdx].map((text, idx) => ({
    verse: idx + 1,
    text,
  }));
}