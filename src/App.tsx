import { useState, useEffect, useMemo } from 'react';
import { Book, PenTool, Moon, Sun, Coffee, BookOpen, Plus, Trash2, X, Quote, Edit3, Heart, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Theme = 'light' | 'dark' | 'sepia';

interface IReflection {
  id: string;
  content: string;
  timestamp: string;
}

interface IBook {
  id: string;
  title: string;
  author: string;
  genre: string;
  reflections: IReflection[];
}

const AFFIRMATIONS = [
  "Buku adalah saku yang penuh dengan mimpi.",
  "Membaca memberi kita tempat untuk pergi ketika kita harus tetap di tempat kita berada.",
  "Sebuah perpustakaan adalah tempat di mana sejarah datang untuk beristirahat.",
  "Kata-kata memiliki kekuatan untuk menyembuhkan jiwa yang lelah.",
  "Di antara dua sampul, ada dunia yang menanti untuk ditemukan.",
  "Membaca adalah meditasi tanpa perlu menutup mata.",
  "Setiap buku adalah petualangan baru yang tenang."
];

export default function App() {
  const [theme, setTheme] = useState<Theme>('sepia');
  const [books, setBooks] = useState<IBook[]>([]);
  const [showAddBook, setShowAddBook] = useState(false);
  const [editingBook, setEditingBook] = useState<IBook | null>(null);
  const [journalBook, setJournalBook] = useState<IBook | null>(null);
  const [newBook, setNewBook] = useState({ title: '', author: '', genre: '' });
  const [newReflection, setNewReflection] = useState('');
  
  const affirmation = useMemo(() => {
    return AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)];
  }, []);

  useEffect(() => {
    document.body.className = `theme-${theme}`;
  }, [theme]);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const res = await fetch('/api/books');
      setBooks(await res.json());
    } catch (err) {
      console.error('Failed to fetch books', err);
    }
  };

  const handleSaveBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBook.title) return;
    
    try {
      const url = editingBook ? `/api/books/${editingBook.id}` : '/api/books';
      const method = editingBook ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBook),
      });
      
      await res.json();
      await fetchBooks();
      setNewBook({ title: '', author: '', genre: '' });
      setShowAddBook(false);
      setEditingBook(null);
    } catch (err) {
      console.error('Failed to save book', err);
    }
  };

  const handleAddReflection = async () => {
    if (!newReflection.trim() || !journalBook) return;
    try {
      const res = await fetch(`/api/books/${journalBook.id}/reflections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newReflection }),
      });
      const saved = await res.json();
      
      // Update local state for current journal view
      const updatedBooks = books.map(b => {
        if (b.id === journalBook.id) {
          return { ...b, reflections: [...(b.reflections || []), saved] };
        }
        return b;
      });
      setBooks(updatedBooks);
      setJournalBook(updatedBooks.find(b => b.id === journalBook.id) || null);
      setNewReflection('');
    } catch (err) {
      console.error('Failed to add reflection', err);
    }
  };

  const handleDeleteBook = async (id: string) => {
    if (!confirm('Apakah koleksi ini benar-benar harus pergi?')) return;
    try {
      await fetch(`/api/books/${id}`, { method: 'DELETE' });
      setBooks(books.filter(b => b.id !== id));
    } catch (err) {
      console.error('Failed to delete book', err);
    }
  };

  const themes: { id: Theme; icon: any; label: string }[] = [
    { id: 'light', icon: Sun, label: 'Kapas Lembut' },
    { id: 'sepia', icon: Coffee, label: 'Kertas Tua' },
    { id: 'dark', icon: Moon, label: 'Malam Indigo' },
  ];

  return (
    <AnimatePresence mode="popLayout">
      <motion.div 
        key={theme}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className={`min-h-screen flex flex-col font-sans theme-${theme}`}
      >
        {/* Soft Header */}
      <header className="px-8 py-10 md:px-16 md:py-16 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-8 h-8 opacity-40" />
            <h1 className="text-4xl font-serif italic italic font-medium tracking-tight">Nook & Note</h1>
          </div>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-lg font-serif italic opacity-40 max-w-md leading-relaxed"
          >
            "{affirmation}"
          </motion.p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 p-1.5 rounded-full border border-current opacity-20">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`p-2 rounded-full transition-all ${
                  theme === t.id ? 'bg-current shadow-sm scale-110' : 'hover:scale-110'
                }`}
              >
                <div className={theme === t.id ? 'mix-blend-difference' : ''}>
                  <t.icon className="w-4 h-4" />
                </div>
              </button>
            ))}
          </div>
          <button 
            onClick={() => {
              setEditingBook(null);
              setNewBook({ title: '', author: '', genre: '' });
              setShowAddBook(true);
            }}
            className="px-8 py-4 bg-accent-sanc text-bg-sanc rounded-full hover:shadow-2xl transition-all flex items-center gap-3 group"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            <span className="font-medium">Ritual Baru</span>
          </button>
        </div>
      </header>

      {/* Bookshelf */}
      <main className="flex-1 px-8 md:px-16 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12 max-w-7xl mx-auto">
          {books.map((book, idx) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={book.id}
              className="group aspect-[3/4.5] relative rounded-[2rem] p-8 flex flex-col border border-current/10 hover:border-current/30 transition-all hover:shadow-2xl hover:-translate-y-2 overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-2 h-full bg-current/5" />
              
              <div className="flex-1">
                <span className="text-[10px] uppercase tracking-widest opacity-30 font-bold mb-3 block">{book.genre || 'Sastra'}</span>
                <h3 className="font-serif text-3xl leading-snug group-hover:italic transition-all duration-500 mb-2">{book.title}</h3>
                <p className="opacity-50 text-sm font-medium italic">{book.author}</p>
              </div>

              <div className="flex items-center justify-between mt-auto pt-6 border-t border-current/5">
                <div className="flex gap-2">
                  <button 
                    onClick={() => setJournalBook(book)}
                    title="Buka Jurnal"
                    className="p-3 bg-current/5 rounded-full hover:bg-current/10 transition-colors"
                  >
                    <PenTool className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => {
                      setEditingBook(book);
                      setNewBook({ title: book.title, author: book.author, genre: book.genre });
                      setShowAddBook(true);
                    }}
                    title="Ubah Volume"
                    className="p-3 bg-current/5 rounded-full hover:bg-current/10 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
                <button 
                  onClick={() => handleDeleteBook(book.id)}
                  title="Hapus"
                  className="p-3 hover:text-red-500 transition-colors opacity-30 hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}

          {books.length === 0 && (
            <div className="col-span-full py-40 text-center opacity-20 flex flex-col items-center">
              <Book className="w-20 h-20 mb-8 stroke-1" />
              <p className="text-2xl font-serif italic mb-2 tracking-wide">Rak masih hening...</p>
              <p className="text-sm uppercase tracking-widest">Biarkan sebuah cerita masuk.</p>
            </div>
          )}
        </div>
      </main>

      {/* Journaling Overlay */}
      <AnimatePresence>
        {journalBook && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-6 md:p-12"
          >
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setJournalBook(null)}
              className="absolute inset-0 bg-stone-950/60 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ scale: 0.95, y: 40, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 40, opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 150 }}
              className="w-full max-w-4xl h-full max-h-[85vh] bg-bg-sanc rounded-[3rem] shadow-3xl relative z-10 overflow-hidden flex flex-col border border-border-sanc"
            >
              <div className="p-8 md:p-14 border-b border-current/5 flex justify-between items-center bg-current/[0.02]">
                <div className="flex items-center gap-6">
                  <motion.div 
                    initial={{ rotate: -10, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    className="p-4 bg-current/5 rounded-[1.5rem]"
                  >
                    <Quote className="w-8 h-8 opacity-40" />
                  </motion.div>
                  <div>
                    <h3 className="font-serif text-3xl font-medium tracking-tight mb-1">{journalBook.title}</h3>
                    <p className="text-sm opacity-40 uppercase tracking-[0.2em] font-medium">{journalBook.author}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setJournalBook(null)}
                  className="p-4 hover:bg-current/5 rounded-full transition-all group"
                >
                  <X className="w-7 h-7 opacity-30 group-hover:opacity-100 transition-opacity" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 md:p-20 space-y-16 scrollbar-hide">
                <section className="space-y-8">
                  <textarea 
                    value={newReflection}
                    onChange={(e) => setNewReflection(e.target.value)}
                    placeholder="Goreskan pemikiran yang bersemi di benakmu..."
                    className="w-full h-48 bg-transparent border-none outline-none resize-none font-serif text-4xl leading-relaxed placeholder:opacity-5 placeholder:italic focus:placeholder:opacity-0 transition-all"
                  />
                  <div className="flex justify-between items-center pt-8 border-t border-current/5">
                    <span className="text-[10px] uppercase tracking-[0.3em] opacity-20 font-bold">
                      Waktu Keheningan: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </span>
                    <button 
                      onClick={handleAddReflection}
                      className="px-12 py-5 bg-accent-sanc text-bg-sanc rounded-full font-bold shadow-xl hover:-translate-y-1 active:scale-95 transition-all text-sm tracking-wide"
                    >
                      Abadikan Refleksi
                    </button>
                  </div>
                </section>

                <div className="space-y-12">
                  <h4 className="text-[10px] uppercase tracking-[0.4em] opacity-20 font-bold border-b border-current/5 pb-6">Goresan Terdahulu</h4>
                  
                  <div className="space-y-12">
                    {(journalBook.reflections || []).slice().reverse().map((ref, idx) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={ref.id} 
                        className="relative pl-14 group"
                      >
                        <div className="absolute left-0 top-2 w-1 h-full bg-current/[0.03] group-hover:bg-current/10 rounded-full transition-colors" />
                        <div className="absolute left-[-2px] top-2 w-2 h-2 rounded-full bg-current/20" />
                        <p className="text-3xl font-serif italic leading-relaxed opacity-80">{ref.content}</p>
                        <p className="text-[10px] opacity-30 mt-8 uppercase tracking-[0.2em]">
                          {new Date(ref.timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} • {new Date(ref.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </motion.div>
                    ))}
                    
                    {(!journalBook.reflections || journalBook.reflections.length === 0) && (
                      <div className="text-center py-20 opacity-10 italic font-serif text-2xl">
                        Halaman ini masih menunggu gema pikiranmu.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit/Add Modal */}
      <AnimatePresence>
        {showAddBook && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddBook(false)}
              className="absolute inset-0 bg-stone-950/60 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ scale: 0.9, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 30, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-bg-sanc w-full max-w-lg rounded-[3rem] p-10 md:p-14 shadow-3xl relative z-10 border border-border-sanc overflow-hidden"
            >
              {/* Subtle background decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent-sanc/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />

              <motion.h3 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="font-serif text-4xl mb-12 italic tracking-tight"
              >
                {editingBook ? 'Volume Refinement' : 'New Volume Ritual'}
              </motion.h3>

              <form onSubmit={handleSaveBook} className="space-y-10 relative">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-3"
                >
                  <label className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-30 ml-2">Gelar / Nama Karya</label>
                  <input 
                    autoFocus
                    required
                    value={newBook.title}
                    onChange={e => setNewBook({...newBook, title: e.target.value})}
                    type="text" 
                    placeholder="Judul yang bergaung..."
                    className="w-full bg-current/5 border border-transparent rounded-2xl px-7 py-5 focus:outline-none focus:border-current/20 focus:bg-transparent transition-all font-serif text-2xl placeholder:opacity-10 placeholder:italic"
                  />
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-3"
                  >
                    <label className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-30 ml-2">Sang Pujangga</label>
                    <input 
                      value={newBook.author}
                      onChange={e => setNewBook({...newBook, author: e.target.value})}
                      type="text" 
                      placeholder="Penulis..."
                      className="w-full bg-current/5 border border-transparent rounded-2xl px-6 py-4 focus:outline-none focus:border-current/20 focus:bg-transparent transition-all font-sans text-lg placeholder:opacity-10"
                    />
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-3"
                  >
                    <label className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-30 ml-2">Aliran / Genre</label>
                    <input 
                      value={newBook.genre}
                      onChange={e => setNewBook({...newBook, genre: e.target.value})}
                      type="text"
                      placeholder="Sastra..."
                      className="w-full bg-current/5 border border-transparent rounded-2xl px-6 py-4 focus:outline-none focus:border-current/20 focus:bg-transparent transition-all font-sans text-lg placeholder:opacity-10"
                    />
                  </motion.div>
                </div>

                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex gap-6 pt-6"
                >
                  <button 
                    type="button"
                    onClick={() => setShowAddBook(false)}
                    className="flex-1 py-5 rounded-2xl font-bold opacity-30 hover:opacity-100 transition-opacity uppercase text-[10px] tracking-widest"
                  >
                    Batalkan
                  </button>
                  <button 
                    type="submit" 
                    className="flex-[2] py-5 bg-accent-sanc text-bg-sanc rounded-2xl font-bold hover:shadow-2xl hover:-translate-y-1 active:scale-95 transition-all text-sm tracking-wide"
                  >
                    {editingBook ? 'Sempurnakan' : 'Simpan ke Rak'}
                  </button>
                </motion.div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="py-16 text-center opacity-20 text-[10px] tracking-[0.6em] uppercase font-light">
        — Terkurasi dalam Keheningan —
      </footer>
      </motion.div>
    </AnimatePresence>
  );
}

