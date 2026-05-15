# Nook & Note: A Digital Sanctuary for the Mindful Reader

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)
![Firebase](https://img.shields.io/badge/Firebase-12-FFC400?logo=firebase)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)

[Live App](https://nook-note-763519437512.asia-southeast1.run.app)

Build a lightweight, serene web application to track books and save reflective notes/quotes. The goal is to create a digital space that feels as calm as a private library on a cold, rainy afternoon—free from the pressure of reading statistics, gamification, or social pressure.

---

## Table of Contents
- [Overview](#overview)
- [Project Structure](#project-structure)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Changelog](#changelog)
- [Getting Started](#getting-started)
- [License](#license)
- [Author](#author)

---

## Overview
**Nook & Note** is designed for those who find peace in the pages of a book. Unlike modern tracking apps focused on "goals" and "streaks," Nook & Note focuses on the *feeling* of reading. It provides a distraction-free environment to archive your library and capture the echoes of your thoughts.

---

## Project Structure
```text
nook-and-note/
├── public/                 # Static Assets (favicon, icons)
├── src/                    # Frontend (React + Vite)
│   ├── lib/
│   │   └── firebase.ts     # Firebase Configuration & Auth
│   ├── App.tsx             # Main Sanctuary Logic
│   ├── index.css           # Aesthetic Definitions (Tailwind + Themes)
│   └── main.tsx            # Entry Point
├── index.html              # Main HTML Document
├── firestore.rules         # Firebase Security Rules
├── package.json            # Sanctuary Inventory & Scripts
├── vite.config.ts          # Vite Configuration
├── tsconfig.json           # TypeScript Configuration
├── eslint.config.js        # ESLint Configuration
├── metadata.json           # App Metadata
├── .gitignore              # Ignored Files Mapping
└── README.md               # Project Documentation
```

---

## Key Features

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

## Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion (motion/react).
- **Backend & Storage**: Firebase (Authentication and Firestore) for cloud sync and privacy.
- **Typography**: 
  - **Lora**: Classic Serif for a literary feel.
  - **Montserrat**: Clean Sans-Serif for functional UI nodes.

---

## Changelog
See the [CHANGELOG.md](CHANGELOG.md) file for details about new features, changes, and bug fixes across different versions of Nook & Note.

---

## Getting Started

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

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Author
**Ni Putu Sintia Wati**
- GitHub: [@sintiasnn](https://github.com/sintiasnn)
- Project: [Nook & Note](https://github.com/sintiasnn/nook-and-note)
