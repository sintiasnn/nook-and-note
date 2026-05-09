import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs/promises";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/books", async (req, res) => {
    try {
      const data = await fs.readFile(path.join(process.cwd(), "data", "books.json"), "utf-8");
      res.json(JSON.parse(data));
    } catch (error) {
      res.status(500).json({ error: "Gagal membaca data buku" });
    }
  });

  app.post("/api/books", async (req, res) => {
    try {
      const books = JSON.parse(await fs.readFile(path.join(process.cwd(), "data", "books.json"), "utf-8"));
      const newBook = { 
        id: Date.now().toString(), 
        reflections: [],
        ...req.body 
      };
      books.push(newBook);
      await fs.writeFile(path.join(process.cwd(), "data", "books.json"), JSON.stringify(books, null, 2));
      res.json(newBook);
    } catch (error) {
      res.status(500).json({ error: "Gagal menyimpan buku" });
    }
  });

  // Volume Refinement (Edit)
  app.put("/api/books/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const books = JSON.parse(await fs.readFile(path.join(process.cwd(), "data", "books.json"), "utf-8"));
      const index = books.findIndex((b: any) => b.id === id);
      if (index === -1) return res.status(404).json({ error: "Buku tidak ditemukan" });
      
      books[index] = { ...books[index], ...req.body };
      await fs.writeFile(path.join(process.cwd(), "data", "books.json"), JSON.stringify(books, null, 2));
      res.json(books[index]);
    } catch (error) {
      res.status(500).json({ error: "Gagal memperbarui buku" });
    }
  });

  // Handle Reflections for a specific book
  app.post("/api/books/:id/reflections", async (req, res) => {
    try {
      const { id } = req.params;
      const books = JSON.parse(await fs.readFile(path.join(process.cwd(), "data", "books.json"), "utf-8"));
      const index = books.findIndex((b: any) => b.id === id);
      if (index === -1) return res.status(404).json({ error: "Buku tidak ditemukan" });

      const newReflection = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        content: req.body.content
      };

      if (!books[index].reflections) books[index].reflections = [];
      books[index].reflections.push(newReflection);
      
      await fs.writeFile(path.join(process.cwd(), "data", "books.json"), JSON.stringify(books, null, 2));
      res.json(newReflection);
    } catch (error) {
      res.status(500).json({ error: "Gagal menyimpan refleksi" });
    }
  });

  app.get("/api/journal", async (req, res) => {
    try {
      const data = await fs.readFile(path.join(process.cwd(), "data", "journal.json"), "utf-8");
      res.json(JSON.parse(data));
    } catch (error) {
      res.status(500).json({ error: "Gagal membaca jurnal" });
    }
  });

  app.post("/api/journal", async (req, res) => {
    try {
      const journal = JSON.parse(await fs.readFile(path.join(process.cwd(), "data", "journal.json"), "utf-8"));
      const entry = { id: Date.now().toString(), date: new Date().toISOString(), ...req.body };
      journal.push(entry);
      await fs.writeFile(path.join(process.cwd(), "data", "journal.json"), JSON.stringify(journal, null, 2));
      res.json(entry);
    } catch (error) {
      res.status(500).json({ error: "Gagal menyimpan jurnal" });
    }
  });

  app.delete("/api/books/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const books = JSON.parse(await fs.readFile(path.join(process.cwd(), "data", "books.json"), "utf-8"));
      const filtered = books.filter((b: any) => b.id !== id);
      await fs.writeFile(path.join(process.cwd(), "data", "books.json"), JSON.stringify(filtered, null, 2));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Gagal menghapus buku" });
    }
  });

  app.delete("/api/journal/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const journal = JSON.parse(await fs.readFile(path.join(process.cwd(), "data", "journal.json"), "utf-8"));
      const filtered = journal.filter((j: any) => j.id !== id);
      await fs.writeFile(path.join(process.cwd(), "data", "journal.json"), JSON.stringify(filtered, null, 2));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Gagal menghapus jurnal" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`
🌧️ Hujan turun di luar...
📚 Nook & Note telah dibuka di http://localhost:${PORT}
   Silakan masuk dan temukan ketenanganmu.
    `);
  });
}

startServer();
