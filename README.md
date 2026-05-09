# 📚 Nook & Note: A Digital Sanctuary for the Mindful Reader

Build a lightweight, serene web application to track books and save reflective notes/quotes. The goal is to create a digital space that feels as calm as a private library on a cold, rainy afternoon—free from the pressure of reading statistics, gamification, or social pressure.

---

## 📖 Table of Contents
- [Overview](#-overview)
- [Project Structure](#-project-structure)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [License](#-license)
- [Author](#-author)

---

## 🌟 Overview
**Nook & Note** is designed for those who find peace in the pages of a book. Unlike modern tracking apps focused on "goals" and "streaks," Nook & Note focuses on the *feeling* of reading. It provides a distraction-free environment to archive your library and capture the echoes of your thoughts.

---

## 📂 Project Structure
```text
nook-and-note/
├── data/                   # Sanctuary Archives (JSON storage)
│   ├── books.json          # Book collection & reflections
│   └── journal.json        # General reflections
├── src/                    # Frontend (React + Vite)
│   ├── App.tsx             # Main Sanctuary Logic
│   ├── index.css           # Aesthetic Definitions (Tailwind + Themes)
│   └── main.tsx            # Entry Point
├── server.ts               # The Librarian (Express Backend)
├── package.json            # Sanctuary Inventory
└── metadata.json           # App Metadata
```

---

## ✨ Key Features

### 1. Three Aesthetic Themes
Smooth, poetic transitions between curated environments:
- **Light**: Soft cotton, like a morning in a sunlit study.
- **Dark**: Midnight indigo, for late-night reading sessions.
- **Sepia**: Aged paper, evoking the aroma of old bookshops.

### 2. Daily Reader's Affirmation
A warm, mindful greeting or literary quote displays every time the app opens to set a contemplative mood.

### 3. Digital Bookshelf
A minimalist grid view focusing on the titles that have touched your soul. No ratings, just presence.

### 4. Reflective Journaling Overlay
A dedicated, distraction-free modal to record timestamped notes and quotes for each book.

### 5. New Volume Ritual
An elegant, modal-based form to add new books, replacing standard, jarring inputs with a mindful interaction.

### 6. Volume Refinement
Refine and update book information through a serene and intuitive interface.

---

## 🛠️ Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion (motion/react).
- **Backend**: Node.js with Express.js.
- **Storage**: Local JSON (data/books.json) for simplicity and privacy.
- **Typography**: 
  - **Lora**: Classic Serif for a literary feel.
  - **Montserrat**: Clean Sans-Serif for functional UI nodes.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or later)
- npm or yarn

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/nook-and-note.git
cd nook-and-note
```

### 2. Setup Environment
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env.example` if needed, though this project runs locally.
```bash
cp .env.example .env
```

### 4. Run Development Server
```bash
npm run dev
```

### 5. Access the sanctuary
Open your browser and navigate to `http://localhost:3000`.

---

## 📜 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## ✍️ Author
**Ni Putu Sintia Wati**
- GitHub: [@sintiasnn](https://github.com/sintiasnn)
- Project: [Nook & Note](https://github.com/sintiasnn/nook-and-note)
