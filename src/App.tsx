import { useState, useEffect } from 'react';
import { Book, PenTool, Moon, Sun, Coffee, BookOpen, Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Theme = 'light' | 'dark' | 'sepia';

export default function App() {
  const [theme, setTheme] = useState<Theme>('light');
  const [activeTab, setActiveTab] = useState<'shelf' | 'journal'>('shelf');

  useEffect(() => {
    document.body.className = `theme-${theme}`;
  }, [theme]);

  const navItems = [
    { id: 'shelf', icon: Book, label: 'Rak Buku' },
    { id: 'journal', icon: PenTool, label: 'Jurnal' },
  ];

  const themes: { id: Theme; icon: any; label: string }[] = [
    { id: 'light', icon: Sun, label: 'Terang' },
    { id: 'sepia', icon: Coffee, label: 'Sepia' },
    { id: 'dark', icon: Moon, label: 'Gelap' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200/20 px-6 py-4 flex justify-between items-center backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <BookOpen className="w-6 h-6" />
          <h1 className="font-serif text-2xl italic font-bold">Nook & Note</h1>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`flex items-center gap-2 transition-all ${
                activeTab === item.id ? 'opacity-100 font-medium scale-105' : 'opacity-50 hover:opacity-80'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 p-1 rounded-full">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              title={t.label}
              className={`p-2 rounded-full transition-all ${
                theme === t.id ? 'bg-white dark:bg-stone-800 shadow-sm' : 'opacity-40 hover:opacity-100'
              }`}
            >
              <t.icon className="w-4 h-4" />
            </button>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full p-6 md:p-12">
        <AnimatePresence mode="wait">
          {activeTab === 'shelf' ? (
            <motion.section
              key="shelf"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-4xl font-serif">Koleksi Anda</h2>
                  <p className="opacity-60 mt-2 italic">Tempat buku-buku beristirahat.</p>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-full hover:scale-105 transition-transform">
                  <Plus className="w-4 h-4" />
                  Tambah Buku
                </button>
              </div>

              {/* Empty state placeholder */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-8">
                <div className="aspect-[3/4] border-2 border-dashed border-gray-400/30 rounded-2xl flex flex-col items-center justify-center p-8 text-center opacity-50">
                  <Book className="w-12 h-12 mb-4 opacity-20" />
                  <p className="text-sm">Belum ada buku di rak ini.</p>
                  <p className="text-xs mt-2 italic">Mulailah dengan menambahkan satu judul.</p>
                </div>
              </div>
            </motion.section>
          ) : (
            <motion.section
              key="journal"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-4xl font-serif">Meja Tulis</h2>
                <p className="opacity-60 mt-2 italic">Goresan tinta di atas memori.</p>
              </div>

              <div className="bg-white/5 border border-gray-400/20 rounded-3xl p-8 backdrop-blur-sm">
                <textarea
                  placeholder="Tuliskan refleksi atau kutipan favoritmu hari ini..."
                  className="w-full h-40 bg-transparent border-none outline-none resize-none font-serif text-xl leading-relaxed"
                />
                <div className="flex justify-end mt-4">
                  <button className="px-8 py-3 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-full">
                    Abadikan
                  </button>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="p-8 text-center opacity-30 text-xs tracking-widest uppercase">
        — Nook & Note —
      </footer>

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-stone-900/10 dark:bg-white/10 backdrop-blur-md p-2 rounded-full border border-white/20">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as any)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all ${
              activeTab === item.id ? 'bg-white dark:bg-stone-800 shadow-lg scale-105' : 'opacity-40'
            }`}
          >
            <item.icon className="w-4 h-4" />
            <span className={activeTab === item.id ? 'block' : 'hidden'}>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
