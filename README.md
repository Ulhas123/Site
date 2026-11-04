<div align="center">

# 📖 Webnovel & Digital Reader

**A high-performance, distraction-free modern web reader for webnovels, classic literature, and academic compendiums.**

[![React](https://img.shields.io/badge/React-19.3-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06b6d4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646cff?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Cloudflare Pages](https://img.shields.io/badge/Deploy-Cloudflare_Pages-f38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://pages.cloudflare.com/)
[![Vitest](https://img.shields.io/badge/Tested_with-Vitest-729b1b?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev/)

[Features](#-features) • [Library Catalog](#-library-catalog) • [Tech Stack](#-tech-stack) • [Quick Start](#-quick-start) • [Cloudflare Deployment](#-cloudflare-pages-deployment) • [Keyboard Shortcuts](#-keyboard-shortcuts)

---

</div>

## 🌟 Overview

**Webnovel Reader** is an open-source, client-side digital reading application engineered for speed, typography fidelity, and reading comfort. It brings the tactile elegance of e-readers into the browser, handling massive webnovels with thousands of chapters, timeless classic Hindi literature, and technical textbooks with MathML equations and vector diagrams.

Built with **Vite**, **React 19**, and **Tailwind CSS v4**, the site deploys seamlessly to **Cloudflare Pages** as a blazingly fast Single-Page Application (SPA).

---

## ✨ Features

### 🧱 Typed Block Content Architecture
Unlike traditional readers that dump raw HTML strings, this reader renders content as **strictly typed semantic blocks**:
* **Narrative Prose:** Paragraphs with responsive sizing, automatic word-breaking, and configurable margins.
* **Dialogue Formatting:** Speaker attribution with distinct typography and quote highlighting.
* **System Panels & Notifications:** Cyberpunk/cultivation-style HUD callouts for game-lit novels.
* **Academic Callouts:** Definition, Theorem, Proof, and Pitfall boxes with semantic styling.
* **Mathematical Notation:** Embedded MathML and LaTeX rendering for scientific formulas.
* **Syntax-Highlighted Code:** Monospaced code listings with filename labels and language badges.
* **Vector Diagrams & Figures:** Responsive SVG engineering diagrams and illustrations.

### 🎨 Custom Typography & Reading Themes
* **4 Handcrafted Color Themes:**
  * 🌙 **Dark:** Standard contrast for low-light reading.
  * 📜 **Sepia:** Warm parchment tones for reduced eye strain.
  * 🌌 **Midnight:** Deep AMOLED blacks for battery conservation.
  * ☀️ **Light:** Crisp, high-contrast daylight reading.
* **Versatile Typography Engine:**
  * Variable serif and sans-serif fonts: **Lora**, **Inter**, and **Merriweather**.
  * Embedded **Noto Serif Devanagari** font for native Hindi ligature and matra rendering.
  * **JetBrains Mono** for technical code and system notifications.
* **Deep Reading Customization:**
  * Adjustable font size (14px – 28px).
  * Line height (1.6 – 2.2) and paragraph spacing (16px – 32px).
  * Reading width constraints (680px, 800px, 960px, or Full Width).
  * Continuous **Vertical Scroll** or **Paginated Page-Flip** reading modes.

### 🚀 Performance & Navigation
* **Lightning-Fast Table of Contents:** Instant debounced search and filtering across thousands of chapters (<50ms search latency).
* **Auto-Resume & Reading Progress:** Seamlessly saves your reading progress, exact scroll position, and bookmarks in `localStorage`.
* **Floating Reader Dock:** Unobtrusive, auto-hiding dock providing one-click access to chapter navigation, TOC, and reading settings.
* **Dual Library Classification:** Separate views for recreational Webnovels and academic Study Materials.

---

## 📚 Library Catalog

| Title | Author | Chapters | Category | Details |
| :--- | :--- | :---: | :---: | :--- |
| **गोदान (Godaan)** | मुंशी प्रेमचंद (Munshi Premchand) | 36 | `Webnovel` | Hindi literature's greatest realistic masterpiece, complete with Devanagari typography and standalone EPUB. |
| **Supremacy Games** | Midgard | 1,958 | `Webnovel` | Epic sci-fi fantasy webnovel formatted into typed narrative and dialogue blocks. |
| **AI & DS Engineering Handbook** | Ulhas Karankar | 17 | `Study` | Systems engineering compendium with MathML formulas, vector diagrams, and companion PDF. |

---

## 🛠️ Tech Stack

* **Frontend:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) (Strict mode)
* **Build Tool:** [Vite 8](https://vitejs.dev/) with Fast HMR
* **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) with semantic CSS token variables
* **State Management:** [Zustand](https://github.com/pmndrs/zustand) with persistent storage
* **Icons:** [Lucide React](https://lucide.dev/)
* **Routing:** [React Router v7](https://reactrouter.com/)
* **Quality Assurance:** [Vitest](https://vitest.dev/) (Unit & Component testing) + [Oxlint](https://oxc.rs/) (Fast Rust-based linter)
* **Hosting:** [Cloudflare Pages](https://pages.cloudflare.com/)

---

## 📂 Project Structure

```text
Site/
├── public/                      # Static assets served directly
│   ├── favicon.svg
│   ├── fonts/                   # Embedded typography (NotoSerifDevanagari.ttf)
│   └── novels/                  # JSON catalog, covers, and chapter blocks
│       ├── godaan/              # Complete 36-chapter Godaan novel data & EPUB
│       ├── supremacy-games/     # Scraped webnovel chapter JSONs
│       ├── ai-and-ds-.../       # Technical textbook data, diagrams, and PDF
│       └── index.json           # Master library catalog
├── src/
│   ├── components/
│   │   ├── home/                # Homepage headers, novel cards, password modal
│   │   ├── reader/              # BlockRenderer, Dock, Header, TOC, Settings
│   │   ├── styleguide/          # Design system contrast & specimen showcase
│   │   └── ui/                  # Accessible Drawer, Modal, and Toast primitives
│   ├── data/                    # API client, comments, and novel registry
│   ├── hooks/                   # Prefs applicator, gesture handling, hotkeys
│   ├── pages/                   # HomePage, ReaderPage, StyleguidePage
│   ├── store/                   # Zustand stores (Prefs, Progress, Auth, UI)
│   ├── theme/                   # Theme tokens (Dark, Sepia, Midnight, Light)
│   └── types/                   # TypeScript interfaces (Block, Chapter, Novel)
├── scripts/                     # Content transformation pipelines
│   ├── convert_godaan_to_site.py # EPUB to typed-blocks converter
│   ├── import_latex_books.py     # LaTeX to typed textbook converter
│   └── init_novels.py           # Webnovel scraper ingestion pipeline
├── index.html                   # HTML entry point
├── package.json                 # Project dependencies & scripts
├── tsconfig.json                # TypeScript compiler configuration
├── vite.config.ts               # Vite configuration
└── wrangler.json                # Cloudflare Pages SPA routing configuration
```

---

## ⚡ Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/Ulhas123/Site.git
cd Site
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start development server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 4. Run tests and linter
```bash
# Run unit and component test suites (95+ tests)
npm run test

# Run Rust-based oxlint
npm run lint
```

### 5. Build for production
```bash
npm run build
```
The compiled output will be generated inside the `dist/` directory.

---

## ☁️ Cloudflare Pages Deployment

This repository is optimized for deployment on **Cloudflare Pages**:

1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/) and navigate to **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
2. Select the `Ulhas123/Site` repository.
3. Configure the build settings:
   * **Framework preset:** `Vite`
   * **Build command:** `npm run build`
   * **Build output directory:** `dist`
   * **Root directory:** `/` (or leave empty)
4. Click **Save and Deploy**.

### Single-Page Application (SPA) Routing
SPA routing is handled natively by [`wrangler.json`](./wrangler.json):
```json
{
  "name": "my-reader",
  "assets": {
    "directory": "./dist",
    "not_found_handling": "single-page-application"
  }
}
```
This ensures direct URLs (such as `/novel/godaan/chapter/chapter-1` or `/styleguide`) load directly without 404 or redirect loop errors.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Space` / `Shift + Space` | Scroll down / Scroll up (or flip page in paginated mode) |
| `ArrowRight` / `ArrowLeft` | Next Chapter / Previous Chapter |
| `Escape` | Close any active Drawer (TOC, Settings, Comments) or Modal |
| `M` / Middle Click | Toggle reader chrome and navigation dock |

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
Literature and novel contents belong to their respective authors and publishers.
