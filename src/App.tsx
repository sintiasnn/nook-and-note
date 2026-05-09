import React, { useState, useEffect, useMemo } from 'react';
import { Book, PenTool, Moon, Sun, Coffee, BookOpen, Plus, Trash2, X, Quote, Edit3, Heart, ArrowRight, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db } from './lib/firebase';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, deleteDoc, orderBy, serverTimestamp, getDocs } from 'firebase/firestore';

type Theme = 'light' | 'dark' | 'sepia';

interface IReflection {
  id: string;
  content: string;
  timestamp: number;
}

interface IBook {
  id: string;
  title: string;
  author: string;
  genre: string;
  userId: string;
  addedAt: number;
  coverUrl?: string;
  status?: 'unread' | 'reading' | 'finished';
  rating?: number;
  reflections?: IReflection[];
}

const translations = {
  id: {
    "login.loading": "Menyeduh keheningan...",
    "login.welcome": "\"Selamat datang kembali di tempat teduhmu.\"",
    "login.button": "Masuk dengan Google",
    "theme.light": "Kapas Lembut",
    "theme.sepia": "Kertas Tua",
    "theme.dark": "Malam Indigo",
    "header.ritual": "Ritual Baru",
    "filter.all": "Semua",
    "filter.unread": "Belum Dibaca",
    "filter.reading": "Sedang Dibaca",
    "filter.finished": "Selesai",
    "book.genre.default": "Sastra",
    "book.tooltip.journal": "Buka Jurnal",
    "book.tooltip.edit": "Ubah Volume",
    "book.tooltip.delete": "Hapus",
    "empty.title": "Rak masih hening...",
    "empty.subtitle": "Biarkan sebuah cerita masuk.",
    "journal.placeholder": "Goreskan pemikiran yang bersemi di benakmu...",
    "journal.time": "Waktu Keheningan:",
    "journal.save": "Abadikan Refleksi",
    "journal.history": "Goresan Terdahulu",
    "journal.empty": "Halaman ini masih menunggu gema pikiranmu.",
    "modal.add.title": "Ritual Volume Baru",
    "modal.edit.title": "Penyempurnaan Volume",
    "modal.book.title": "Gelar / Nama Karya",
    "modal.book.title.placeholder": "Judul yang bergaung...",
    "modal.book.author": "Sang Pujangga",
    "modal.book.author.placeholder": "Penulis...",
    "modal.book.genre": "Aliran / Genre",
    "modal.book.genre.placeholder": "Sastra...",
    "modal.book.cover": "Sampul Buku (URL)",
    "modal.book.status": "Status",
    "modal.book.rating": "Penilaian",
    "modal.button.cancel": "Batalkan",
    "modal.button.save": "Simpan ke Rak",
    "modal.button.update": "Sempurnakan",
    "footer": "— Terkurasi dalam Keheningan —",
    "auth.logout": "Keluar",
    "confirm.delete": "Apakah koleksi ini benar-benar harus pergi?",
    "confirm.update": "Apakah Anda yakin ingin menyimpan perubahan ini?",
    "confirm.yes_delete": "Ya, hapus",
    "confirm.yes_update": "Ya, simpan",
    "confirm.cancel": "Batal",
    "affirmations": [
      "Buku adalah saku yang penuh dengan mimpi.",
      "Membaca memberi kita tempat untuk pergi ketika kita harus tetap di tempat kita berada.",
      "Sebuah perpustakaan adalah tempat di mana sejarah datang untuk beristirahat.",
      "Kata-kata memiliki kekuatan untuk menyembuhkan jiwa yang lelah.",
      "Di antara dua sampul, ada dunia yang menanti untuk ditemukan.",
      "Membaca adalah meditasi tanpa perlu menutup mata.",
      "Setiap buku adalah petualangan baru yang tenang."
    ]
  },
  en: {
    "login.loading": "Brewing silence...",
    "login.welcome": "\"Welcome back to your shady retreat.\"",
    "login.button": "Sign in with Google",
    "theme.light": "Soft Cotton",
    "theme.sepia": "Old Paper",
    "theme.dark": "Indigo Night",
    "header.ritual": "New Ritual",
    "filter.all": "All",
    "filter.unread": "Unread",
    "filter.reading": "Reading",
    "filter.finished": "Finished",
    "book.genre.default": "Literature",
    "book.tooltip.journal": "Open Journal",
    "book.tooltip.edit": "Edit Volume",
    "book.tooltip.delete": "Delete",
    "empty.title": "The shelf is still silent...",
    "empty.subtitle": "Let a story enter.",
    "journal.placeholder": "Write down the thoughts blooming in your mind...",
    "journal.time": "Time of Silence:",
    "journal.save": "Capture Reflection",
    "journal.history": "Past Strokes",
    "journal.empty": "This page is still waiting for the echo of your thoughts.",
    "modal.add.title": "New Volume Ritual",
    "modal.edit.title": "Volume Refinement",
    "modal.book.title": "Title / Name of Work",
    "modal.book.title.placeholder": "A resonant title...",
    "modal.book.author": "The Poet",
    "modal.book.author.placeholder": "Author...",
    "modal.book.genre": "Flow / Genre",
    "modal.book.genre.placeholder": "Literature...",
    "modal.book.cover": "Book Cover (URL)",
    "modal.book.status": "Status",
    "modal.book.rating": "Rating",
    "modal.button.cancel": "Cancel",
    "modal.button.save": "Save to Shelf",
    "modal.button.update": "Refine",
    "footer": "— Curated in Silence —",
    "auth.logout": "Sign out",
    "confirm.delete": "Should this collection really leave?",
    "confirm.update": "Are you sure you want to save these changes?",
    "confirm.yes_delete": "Yes, delete",
    "confirm.yes_update": "Yes, save",
    "confirm.cancel": "Cancel",
    "affirmations": [
      "A book is a pocket full of dreams.",
      "Reading gives us someplace to go when we have to stay where we are.",
      "A library is a place where history comes to rest.",
      "Words have the power to heal a weary soul.",
      "Between two covers, there is a world waiting to be discovered.",
      "Reading is meditation without the need to close your eyes.",
      "Every book is a quiet new adventure."
    ]
  }
};

type Language = 'id' | 'en';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [theme, setTheme] = useState<Theme>('sepia');
  const [lang, setLang] = useState<Language>('id');
  const t = translations[lang];
  const [books, setBooks] = useState<IBook[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddBook, setShowAddBook] = useState(false);
  const [editingBook, setEditingBook] = useState<IBook | null>(null);
  const [journalBook, setJournalBook] = useState<IBook | null>(null);
  const [newBook, setNewBook] = useState<{title: string; author: string; genre: string; coverUrl: string; status: 'unread'|'reading'|'finished'; rating: number}>({ 
    title: '', author: '', genre: '', coverUrl: '', status: 'unread', rating: 0 
  });
  const [newReflection, setNewReflection] = useState('');
  
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title?: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
  } | null>(null);
  
  const affirmation = useMemo(() => {
    const list = t.affirmations;
    return list[Math.floor(Math.random() * list.length)];
  }, [lang]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error('Login failed', err);
      alert('Login error: ' + err.message);
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoadingAuth(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    document.body.className = `theme-${theme}`;
  }, [theme]);

  useEffect(() => {
    if (!user) {
      setBooks([]);
      return;
    }
    
    // Listen to books
    const q = query(collection(db, 'books'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const booksData: IBook[] = [];
      for (const docSnap of snapshot.docs) {
        const bookData = { id: docSnap.id, ...docSnap.data() } as IBook;
        
        // Fetch reflections for this book
        const refQ = query(collection(db, `books/${docSnap.id}/reflections`), orderBy('timestamp', 'asc'));
        const refSnapshot = await getDocs(refQ);
        const reflections = refSnapshot.docs.map(refDoc => ({
          id: refDoc.id,
          ...refDoc.data()
        })) as IReflection[];
        
        bookData.reflections = reflections;
        booksData.push(bookData);
      }
      
      // Sort in memory by addedAt to keep simple indices
      booksData.sort((a, b) => b.addedAt - a.addedAt);
      setBooks(booksData);
      
      // Update journalBook if it's currently open
      if (journalBook) {
        const updatedJournal = booksData.find(b => b.id === journalBook.id);
        if (updatedJournal) setJournalBook(updatedJournal);
      }
    }, (error) => {
      console.error('Firestore Error: ', error);
    });

    return () => unsubscribe();
  }, [user]); // We keep this simple for now, though journalBook changes shouldn't re-trigger snapshot listening.

  const handleSaveBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBook.title || !user) return;
    
    const performSave = async () => {
      try {
        const bookDataToSave: any = {
          title: newBook.title,
          status: newBook.status,
        };
        if (newBook.author) bookDataToSave.author = newBook.author;
        else bookDataToSave.author = 'Anonim';
        
        if (newBook.genre) bookDataToSave.genre = newBook.genre;
        if (newBook.coverUrl) bookDataToSave.coverUrl = newBook.coverUrl;
        if (newBook.rating && newBook.rating > 0) bookDataToSave.rating = newBook.rating;

        if (editingBook) {
          await updateDoc(doc(db, 'books', editingBook.id), bookDataToSave);
        } else {
          await addDoc(collection(db, 'books'), {
            ...bookDataToSave,
            userId: user.uid,
            addedAt: Date.now(),
          });
        }
        
        setNewBook({ title: '', author: '', genre: '', coverUrl: '', status: 'unread', rating: 0 });
        setShowAddBook(false);
        setEditingBook(null);
      } catch (err: any) {
        console.error('Failed to save book', err);
        // Detailed error for rules
        const errInfo = {
          message: err.message,
          payload: {
            title: newBook.title,
            status: newBook.status,
            userId: user.uid,
            addedAt: Date.now(),
          },
        };
        alert('Gagal menyimapan buku: ' + JSON.stringify(errInfo, null, 2));
      }
    };

    if (editingBook) {
      setConfirmModal({
        isOpen: true,
        message: t["confirm.update"],
        onConfirm: () => {
          setConfirmModal(null);
          performSave();
        },
        confirmText: t["confirm.yes_update"],
        cancelText: t["confirm.cancel"]
      });
    } else {
      performSave();
    }
  };

  const handleAddReflection = async () => {
    if (!newReflection.trim() || !journalBook || !user) return;
    try {
      const payload = {
        content: newReflection,
        timestamp: Date.now()
      };
      const docRef = await addDoc(collection(db, `books/${journalBook.id}/reflections`), payload);
      
      const newRef = { id: docRef.id, ...payload };
      
      setJournalBook(prev => {
        if (!prev) return prev;
        return { ...prev, reflections: [...(prev.reflections || []), newRef] };
      });
      
      setBooks(prev => prev.map(b => {
        if (b.id === journalBook.id) {
          return { ...b, reflections: [...(b.reflections || []), newRef] };
        }
        return b;
      }));
      
      setNewReflection('');
    } catch (err: any) {
      console.error('Failed to add reflection', err);
      // Detailed error for rules
      const errInfo = {
        message: err.message,
        payload: {
          content: newReflection,
          timestamp: Date.now()
        },
      };
      alert('Gagal menyimapan kutipan: ' + JSON.stringify(errInfo, null, 2));
    }
  };

  const handleDeleteReflection = async (refId: string) => {
    if (!journalBook) return;
    
    setConfirmModal({
      isOpen: true,
      message: t["confirm.delete"],
      isDestructive: true,
      confirmText: t["confirm.yes_delete"],
      cancelText: t["confirm.cancel"],
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          await deleteDoc(doc(db, `books/${journalBook.id}/reflections`, refId));
          
          setJournalBook(prev => {
            if (!prev) return prev;
            return { ...prev, reflections: (prev.reflections || []).filter(r => r.id !== refId) };
          });
          
          setBooks(prev => prev.map(b => {
            if (b.id === journalBook.id) {
              return { ...b, reflections: (b.reflections || []).filter(r => r.id !== refId) };
            }
            return b;
          }));
          
        } catch (err: any) {
          console.error('Failed to delete reflection', err);
          // Detailed error for rules
          const errInfo = {
            message: err.message,
            path: `books/${journalBook.id}/reflections/${refId}`
          };
          alert('Gagal menghapus kutipan: ' + JSON.stringify(errInfo, null, 2));
        }
      }
    });
  };

  const handleDeleteBook = async (id: string) => {
    setConfirmModal({
      isOpen: true,
      message: t["confirm.delete"],
      isDestructive: true,
      confirmText: t["confirm.yes_delete"],
      cancelText: t["confirm.cancel"],
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          await deleteDoc(doc(db, 'books', id));
        } catch (err: any) {
          console.error('Failed to delete book', err);
          // Detailed error for rules
          const errInfo = {
            message: err.message,
            path: `books/${id}`
          };
          alert('Gagal menghapus buku: ' + JSON.stringify(errInfo, null, 2));
        }
      }
    });
  };

  const themesData: { id: Theme; icon: any; label: string; textKey: keyof typeof translations['id'] }[] = [
    { id: 'light', icon: Sun, label: 'Kapas Lembut', textKey: 'theme.light' },
    { id: 'sepia', icon: Coffee, label: 'Kertas Tua', textKey: 'theme.sepia' },
    { id: 'dark', icon: Moon, label: 'Malam Indigo', textKey: 'theme.dark' },
  ];

  if (loadingAuth) {
    return <div className={`min-h-screen flex items-center justify-center p-6 theme-${theme}`}><p className="italic font-serif opacity-50">{t["login.loading"]}</p></div>;
  }

  if (!user) {
    return (
      <AnimatePresence mode="wait">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`min-h-screen flex items-center justify-center p-6 theme-${theme} relative`}
        >
          <div className="absolute top-8 right-8 flex items-center gap-2 p-1.5 rounded-full border border-current opacity-40 hover:opacity-80 transition-opacity text-xs font-bold uppercase overflow-hidden">
            <button onClick={() => setLang('id')} className={`px-2 py-1 rounded-full ${lang === 'id' ? 'bg-current text-bg-sanc' : ''}`}>ID</button>
            <button onClick={() => setLang('en')} className={`px-2 py-1 rounded-full ${lang === 'en' ? 'bg-current text-bg-sanc' : ''}`}>EN</button>
          </div>
          <div className="max-w-md w-full text-center space-y-12">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <BookOpen className="w-12 h-12 mx-auto mb-6 opacity-20" />
              <h1 className="font-serif text-5xl italic font-medium mb-4 tracking-tight">Nook & Note</h1>
              <p className="font-serif italic opacity-40 text-lg">{t["login.welcome"]}</p>
            </motion.div>

            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="space-y-6"
            >
              <button 
                onClick={handleLogin}
                className="group flex flex-col items-center gap-3 mx-auto px-10 py-4 opacity-40 hover:opacity-100 transition-all border border-transparent hover:border-current/10 rounded-[2rem]"
              >
                <div className="flex items-center gap-3">
                  <span className="font-sans text-[10px] font-bold uppercase tracking-[0.4em]">{t["login.button"]}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                </div>
              </button>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex justify-center gap-4 pt-12"
            >
              {themesData.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`p-2 rounded-full border border-current/10 ${theme === t.id ? 'bg-current opacity-100' : 'opacity-20 hover:opacity-40'}`}
                >
                  <div className={theme === t.id ? 'mix-blend-difference' : ''}>
                    <t.icon className="w-3 h-3" />
                  </div>
                </button>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

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
      <header className="px-6 py-10 md:px-16 md:py-16 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-8 h-8 opacity-40 shrink-0" />
            <h1 className="text-3xl md:text-4xl font-serif italic font-medium tracking-tight">Nook & Note</h1>
          </div>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-base md:text-lg font-serif italic opacity-40 max-w-md leading-relaxed"
          >
            "{affirmation}"
          </motion.p>
        </div>

        <div className="flex flex-col items-start md:items-end gap-6 w-full md:w-auto">
          <div className="flex items-center justify-between md:justify-end w-full gap-4">
            <p className="text-[10px] uppercase tracking-[0.2em] opacity-40 font-bold truncate max-w-[150px] md:max-w-none">{user.displayName || user.email}</p>
            <button onClick={handleLogout} className="p-2 opacity-30 hover:opacity-100 transition-opacity" title={t["auth.logout"]}>
              <LogOut className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 p-1.5 rounded-full border border-current opacity-20 text-xs font-bold uppercase overflow-hidden shrink-0">
              <button onClick={() => setLang('id')} className={`px-2 py-1 rounded-full ${lang === 'id' ? 'bg-current text-bg-sanc' : ''}`}>ID</button>
              <button onClick={() => setLang('en')} className={`px-2 py-1 rounded-full ${lang === 'en' ? 'bg-current text-bg-sanc' : ''}`}>EN</button>
            </div>
            <div className="flex items-center gap-1.5 p-1.5 rounded-full border border-current opacity-20 shrink-0">
              {themesData.map((themeData) => (
                <button
                  key={themeData.id}
                  onClick={() => setTheme(themeData.id)}
                  title={t[themeData.textKey]}
                  className={`p-1.5 md:p-2 rounded-full transition-all ${
                    theme === themeData.id ? 'bg-current shadow-sm scale-110' : 'hover:scale-110'
                  }`}
                >
                  <div className={theme === themeData.id ? 'mix-blend-difference' : ''}>
                    <themeData.icon className="w-3 h-3 md:w-4 md:h-4" />
                  </div>
                </button>
              ))}
            </div>
            <button 
              onClick={() => {
                setEditingBook(null);
                setNewBook({ title: '', author: '', genre: '', coverUrl: '', status: 'unread', rating: 0 });
                setShowAddBook(true);
              }}
              className="px-6 md:px-8 py-3 md:py-4 bg-accent-sanc text-bg-sanc rounded-full hover:shadow-2xl transition-all flex items-center gap-3 group ml-auto md:ml-0"
            >
              <Plus className="w-4 h-4 md:w-5 md:h-5 group-hover:rotate-90 transition-transform" />
              <span className="font-medium text-sm md:text-base">{t["header.ritual"]}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Bookshelf */}
      <main className="flex-1 px-6 md:px-16 pb-24">
        
        {books.length > 0 && (
          <div className="max-w-7xl mx-auto mb-10 flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {['all', 'unread', 'reading', 'finished'].map(status => (
              <button 
                key={status} 
                onClick={() => setFilterStatus(status)}
                className={`px-5 py-2 rounded-full border transition-all text-xs font-bold uppercase tracking-widest ${
                  filterStatus === status 
                    ? 'border-current bg-current text-bg-sanc' 
                    : 'border-current/20 hover:border-current/50 opacity-50 hover:opacity-100'
                }`}
              >
                {status === 'all' ? t["filter.all"] : status === 'unread' ? t["filter.unread"] : status === 'reading' ? t["filter.reading"] : t["filter.finished"]}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12 max-w-7xl mx-auto">
          {books.filter(b => filterStatus === 'all' || b.status === filterStatus).map((book, idx) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={book.id}
              className="group aspect-[3/4.5] relative rounded-[2rem] p-8 flex flex-col border border-current/10 hover:border-current/30 transition-all hover:shadow-2xl hover:-translate-y-2 overflow-hidden bg-cover bg-center"
              style={{
                backgroundImage: book.coverUrl ? `linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0.8)), url(${book.coverUrl})` : 'none',
                color: book.coverUrl ? '#E5E5E5' : 'inherit',
                borderColor: book.coverUrl ? 'rgba(255,255,255,0.1)' : ''
              }}
            >
              <div className="absolute top-0 left-0 w-2 h-full bg-current/5" />
              
              <div className="flex-1 relative z-10">
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full ${book.coverUrl ? 'bg-white/10 text-white' : 'bg-current/5'} opacity-80 backdrop-blur-sm`}>
                    {book.genre || t["book.genre.default"]}
                  </span>
                  
                  {book.rating ? (
                    <div className="flex gap-0.5">
                      {Array.from({ length: book.rating }).map((_, i) => (
                        <Heart key={i} className={`w-3 h-3 fill-current ${book.coverUrl ? 'text-white' : ''}`} />
                      ))}
                    </div>
                  ) : null}
                </div>
                
                <h3 className={`font-serif text-3xl leading-snug group-hover:italic transition-all duration-500 mb-2 mt-4`}>{book.title}</h3>
                <p className={`opacity-70 text-sm font-medium italic`}>{book.author}</p>
              </div>

              <div className="flex items-center justify-between mt-auto pt-6 border-t relative z-10" style={{ borderColor: book.coverUrl ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setJournalBook(book)}
                    title={t["book.tooltip.journal"]}
                    className={`p-3 rounded-full transition-colors ${book.coverUrl ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-current/5 hover:bg-current/10'}`}
                  >
                    <PenTool className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => {
                      setEditingBook(book);
                      setNewBook({ 
                        title: book.title, 
                        author: book.author, 
                        genre: book.genre,
                        coverUrl: book.coverUrl || '',
                        status: book.status || 'unread',
                        rating: book.rating || 0
                      });
                      setShowAddBook(true);
                    }}
                    title={t["book.tooltip.edit"]}
                    className={`p-3 rounded-full transition-colors ${book.coverUrl ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-current/5 hover:bg-current/10'}`}
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
                <button 
                  onClick={() => handleDeleteBook(book.id)}
                  title={t["book.tooltip.delete"]}
                  className={`p-3 transition-colors opacity-50 hover:opacity-100 ${book.coverUrl ? 'hover:text-red-400 text-white' : 'hover:text-red-500'}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}

          {books.length === 0 && (
            <div className="col-span-full py-40 text-center opacity-20 flex flex-col items-center">
              <Book className="w-20 h-20 mb-8 stroke-1" />
              <p className="text-2xl font-serif italic mb-2 tracking-wide">{t["empty.title"]}</p>
              <p className="text-sm uppercase tracking-widest">{t["empty.subtitle"]}</p>
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
              className="w-full max-w-4xl h-full max-h-[90vh] bg-bg-sanc rounded-[2rem] md:rounded-[3rem] shadow-3xl relative z-10 overflow-hidden flex flex-col border border-border-sanc"
            >
              <div className="p-6 md:p-14 border-b border-current/5 flex justify-between items-start md:items-center bg-current/[0.02] gap-4">
                <div className="flex items-center gap-4 md:gap-6">
                  <motion.div 
                    initial={{ rotate: -10, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    className="p-3 md:p-4 bg-current/5 rounded-[1rem] md:rounded-[1.5rem] shrink-0"
                  >
                    <Quote className="w-5 h-5 md:w-8 md:h-8 opacity-40" />
                  </motion.div>
                  <div>
                    <h3 className="font-serif text-2xl md:text-3xl font-medium tracking-tight mb-1">{journalBook.title}</h3>
                    <p className="text-xs md:text-sm opacity-40 uppercase tracking-[0.2em] font-medium">{journalBook.author}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setJournalBook(null)}
                  className="p-2 md:p-4 hover:bg-current/5 rounded-full transition-all group shrink-0"
                >
                  <X className="w-6 h-6 md:w-7 md:h-7 opacity-30 group-hover:opacity-100 transition-opacity" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 md:p-20 space-y-12 md:space-y-16 scrollbar-hide">
                <section className="space-y-6 md:space-y-8">
                  <textarea 
                    value={newReflection}
                    onChange={(e) => setNewReflection(e.target.value)}
                    placeholder={t["journal.placeholder"]}
                    className="w-full h-32 md:h-48 bg-transparent border-none outline-none resize-none font-serif text-2xl md:text-4xl leading-relaxed placeholder:opacity-5 placeholder:italic focus:placeholder:opacity-0 transition-all"
                  />
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center pt-6 md:pt-8 border-t border-current/5 gap-6">
                    <span className="text-[10px] uppercase tracking-[0.3em] opacity-20 font-bold">
                      {t["journal.time"]} {new Date().toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short' })}
                    </span>
                    <button 
                      onClick={handleAddReflection}
                      className="px-12 py-5 bg-accent-sanc text-bg-sanc rounded-full font-bold shadow-xl hover:-translate-y-1 active:scale-95 transition-all text-sm tracking-wide"
                    >
                      {t["journal.save"]}
                    </button>
                  </div>
                </section>

                <div className="space-y-12">
                  <h4 className="text-[10px] uppercase tracking-[0.4em] opacity-20 font-bold border-b border-current/5 pb-6">{t["journal.history"]}</h4>
                  
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
                        <div className="flex items-center gap-4 mt-8">
                          <p className="text-[10px] opacity-30 uppercase tracking-[0.2em]">
                            {new Date(ref.timestamp).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })} • {new Date(ref.timestamp).toLocaleTimeString(lang === 'id' ? 'id-ID' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          <button 
                            onClick={() => ref.id && handleDeleteReflection(ref.id)}
                            className="p-1.5 hover:bg-red-500/10 hover:text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-all text-current/40"
                            title={t["confirm.delete"]}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                    
                    {(!journalBook.reflections || journalBook.reflections.length === 0) && (
                      <div className="text-center py-20 opacity-10 italic font-serif text-2xl">
                        {t["journal.empty"]}
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
              className="bg-bg-sanc w-full max-w-lg rounded-[2rem] md:rounded-[3rem] p-6 md:p-14 shadow-3xl relative z-10 border border-border-sanc overflow-y-auto max-h-[90vh]"
            >
              {/* Subtle background decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent-sanc/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />

              <motion.h3 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="font-serif text-4xl mb-12 italic tracking-tight"
              >
                {editingBook ? t["modal.edit.title"] : t["modal.add.title"]}
              </motion.h3>

              <form onSubmit={handleSaveBook} className="space-y-10 relative">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-3"
                >
                  <label className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-30 ml-2">{t["modal.book.title"]}</label>
                  <input 
                    autoFocus
                    required
                    value={newBook.title}
                    onChange={e => setNewBook({...newBook, title: e.target.value})}
                    type="text" 
                    placeholder={t["modal.book.title.placeholder"]}
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
                    <label className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-30 ml-2">{t["modal.book.author"]}</label>
                    <input 
                      value={newBook.author}
                      onChange={e => setNewBook({...newBook, author: e.target.value})}
                      type="text" 
                      placeholder={t["modal.book.author.placeholder"]}
                      className="w-full bg-current/5 border border-transparent rounded-2xl px-6 py-4 focus:outline-none focus:border-current/20 focus:bg-transparent transition-all font-sans text-lg placeholder:opacity-10"
                    />
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-3"
                  >
                    <label className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-30 ml-2">{t["modal.book.genre"]}</label>
                    <input 
                      value={newBook.genre}
                      onChange={e => setNewBook({...newBook, genre: e.target.value})}
                      type="text"
                      placeholder={t["modal.book.genre.placeholder"]}
                      className="w-full bg-current/5 border border-transparent rounded-2xl px-6 py-4 focus:outline-none focus:border-current/20 focus:bg-transparent transition-all font-sans text-lg placeholder:opacity-10"
                    />
                  </motion.div>
                </div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                  className="space-y-3"
                >
                  <label className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-30 ml-2">{t["modal.book.cover"]}</label>
                  <input 
                    value={newBook.coverUrl}
                    onChange={e => setNewBook({...newBook, coverUrl: e.target.value})}
                    type="url"
                    placeholder="https://..."
                    className="w-full bg-current/5 border border-transparent rounded-2xl px-6 py-4 focus:outline-none focus:border-current/20 focus:bg-transparent transition-all font-sans text-sm placeholder:opacity-10"
                  />
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.46 }}
                    className="space-y-3"
                  >
                    <label className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-30 ml-2">{t["modal.book.status"]}</label>
                    <select
                      value={newBook.status}
                      onChange={e => setNewBook({...newBook, status: e.target.value as any})}
                      className="w-full bg-current/5 border border-transparent rounded-2xl px-6 py-4 focus:outline-none focus:border-current/20 focus:bg-transparent transition-all font-sans text-lg outline-none appearance-none cursor-pointer"
                    >
                      <option value="unread" className="bg-bg-sanc">{t["filter.unread"]}</option>
                      <option value="reading" className="bg-bg-sanc">{t["filter.reading"]}</option>
                      <option value="finished" className="bg-bg-sanc">{t["filter.finished"]}</option>
                    </select>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.47 }}
                    className="space-y-3"
                  >
                    <label className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-30 ml-2">{t["modal.book.rating"]}</label>
                    <div className="flex gap-2 items-center bg-current/5 rounded-2xl px-6 py-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewBook({...newBook, rating: star === newBook.rating ? 0 : star})}
                          className={`p-1 transition-transform hover:scale-110 ${newBook.rating >= star ? 'text-accent-sanc' : 'opacity-20'}`}
                        >
                          <Heart className={newBook.rating >= star ? 'fill-current' : ''} />
                        </button>
                      ))}
                    </div>
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
                    {t["modal.button.cancel"]}
                  </button>
                  <button 
                    type="submit" 
                    className="flex-[2] py-5 bg-accent-sanc text-bg-sanc rounded-2xl font-bold hover:shadow-2xl hover:-translate-y-1 active:scale-95 transition-all text-sm tracking-wide"
                  >
                    {editingBook ? t["modal.button.update"] : t["modal.button.save"]}
                  </button>
                </motion.div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirm Modal */}
      <AnimatePresence>
        {confirmModal && confirmModal.isOpen && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-bg-sanc/90 backdrop-blur-xl"
              onClick={() => setConfirmModal(null)}
            />
            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="bg-bg-sanc w-full max-w-sm rounded-[2rem] p-8 shadow-3xl relative z-10 border border-border-sanc"
            >
              <div className="text-center space-y-6">
                {confirmModal.title && <h3 className="font-serif text-2xl font-medium">{confirmModal.title}</h3>}
                <p className="text-base font-serif italic text-current/70">{confirmModal.message}</p>
                
                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => setConfirmModal(null)}
                    className="flex-1 py-4 rounded-xl font-bold opacity-50 hover:opacity-100 transition-opacity uppercase text-[10px] tracking-widest bg-current/5 hover:bg-current/10"
                  >
                    {confirmModal.cancelText || t["confirm.cancel"]}
                  </button>
                  <button 
                    onClick={confirmModal.onConfirm}
                    className={`flex-1 py-4 text-bg-sanc rounded-xl font-bold hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all text-[10px] tracking-widest uppercase ${
                      confirmModal.isDestructive ? 'bg-red-800/90' : 'bg-accent-sanc'
                    }`}
                  >
                    {confirmModal.confirmText || 'Confirm'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="py-16 text-center opacity-20 text-[10px] tracking-[0.6em] uppercase font-light">
        {t["footer"]}
      </footer>
      </motion.div>
    </AnimatePresence>
  );
}

