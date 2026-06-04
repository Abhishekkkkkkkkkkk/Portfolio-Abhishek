<div align="center">

# 🚀 Portfolio V2 — Abhishek Kumar

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Site-6366f1?style=for-the-badge&logo=vercel)](https://krabhishek.vercel.app/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![MIT License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

<br/>

> A fully redesigned, modular personal portfolio built with React.js, Tailwind CSS, Supabase database, and Google Drive storage. Features a cinematic welcome screen, a VS Code-themed interactive blog/notes workspace, premium GPU-accelerated animations, developer mini-games, and a polished dark-glass UI.

<br/>

</div>

---

## ✨ What's New in V2

| Feature | Description |
|---|---|
| 🏗️ **Clean Architecture** | Decoupled codebase separating page sections, layouts, standalone routed views, and centralized configuration services. |
| 📂 **Recursive Multi-Level Folders** | Dynamic nested folder trees inside the Blog Workspace sidebar, perfect for multi-layered topics (e.g. `DSA` ➔ `Sorting` ➔ `Merge Sort`). |
| 🔄 **Vercel Reload 404 Fix** | Pre-configured `vercel.json` rewrite routing to resolve client-side SPA route mismatches when pages are reloaded. |
| 📍 **Persistent Tab & Scroll Restoration** | Remembers your active workspace tab via `localStorage`. Exiting a blog details page or pressing back auto-focuses the **Blog** tab and scrolls directly down to the `#Portfolio` workspace. |
| 📱 **Responsive Mobile Sidebar Mode** | Workspace sidebar is collapsed by default on mobile viewports and automatically slides shut when a file (`README`, `ABOUT_ME`, `settings.json`, or a blog post) is selected. |
| 👾 **Syntax Invaders Game** | High-performance HTML5 Canvas arcade shooter. Blast descending bugs with semicolon lasers (;) complete with levels, particle bursts, and retro synthesizer audio. |
| 🎴 **Dev Stack Matcher** | Interactive memory matching card game integrated side-by-side with your LeetCode Stats card inside the Hero section. |
| 📄 **Notes Section** | Built-in modal PDF viewer displaying study notes hosted on Google Drive. |
| 🎬 **Welcome Screen** | Optimized loading screen with particle mesh, typewriter URL chip, progress bar, and spring animations. |

---

## 🔄 Migration & Technology Comparison

This section details the migrations and architectural decisions implemented to upgrade from the previous personal portfolio template:

| Architectural Area | Previous Implementation | Current Upgraded V2 Implementation | Key Advantages of Migration |
| :--- | :--- | :--- | :--- |
| **Database & API Backend** | **Google Firebase Firestore** (NoSQL Database) | **Supabase PostgreSQL** (Relational Database) | Shifted to standard SQL queries, enabling clean database schemas (`supabase_schema.sql`), atomic counter operations via DB triggers (`increment_blog_views`), and robust relational constraints. |
| **Workspace Sidebar Tree** | **Flat Category Mapping** (Grouped items in 4 hardcoded root folders) | **Dynamic Recursive Folder Trees** (Recursive nodes and nested subfolders) | Allows multi-level folder structures (e.g. `DSA` ➔ `Sorting` ➔ `Merge Sort`), rendering subfolders dynamically based on database categories array or slashes. |
| **Navigation Back Flow** | **Homepage Redirect Reset** (Escaping to home reset selected tab and scroll to top) | **Persistent Tab State & Scroll Restoration** | Retains selected tab index in `localStorage`. Uses `?tab=blog` url query handling to auto-focus the Blog tab and smooth-scroll back to the portfolio block. |
| **Mobile UX Layout** | **Static Workspace Explorer** (Sidebar kept open on mobile selection, blocking content viewport) | **Responsive Mobile Auto-Collapse** | Automatically disables sidebar on viewport load if `< 768px` and collapses sidebar explorer panel upon file selection, maximizing content view space. |
| **SPA Reload Routes** | **Direct Routing Paths** (Reloading subroutes on Vercel threw `404: NOT_FOUND` errors) | **Server-side Vercel Rewrites** (`vercel.json` mapping all paths to `index.html`) | Enables seamless browser reloading and link sharing for routed subpages like `/blog/:id` or `/project/:id` without 404 router errors. |

---

## 🛠️ Project Tech Stack

The technologies, frameworks, and libraries used to build and deploy this portfolio website are:

| Component / Layer | Technology / Library | Description |
| :--- | :--- | :--- |
| **Frontend Core** | **React.js** (v18.3) | Core JavaScript UI library |
| **Build & Bundler** | **Vite** (v6.3) | Dev server and optimized production bundler |
| **Styling & Layout** | **Tailwind CSS** (v3.4) & CSS | Responsive styling utilities & custom animation keyframes |
| **UI Components** | **Material UI** (MUI v6) | Tab panels and custom design themes |
| **Icon Set** | **Lucide React** | Modern SVG design icons |
| **Navigation & Tabs** | **React Router DOM** & **React Swipeable Views** | Client-side routing and mobile-friendly tab swipe controllers |
| **Animations** | **Framer Motion** & **AOS** | Entrance sweeps, modal popups, and scroll-fade triggers |
| **Database & Caching** | **Supabase** (PostgreSQL) | Fetches dynamic projects, certificates, blogs, notes, and registers subscribers |
| **Form Alerts** | **SweetAlert2** | Interactive form submission alerts |
| **PDF Storage** | **Google Drive** | Hosts and renders study notes PDFs via `/preview` embeds |
| **Hosting & Deploy** | **Vercel** | Automated CI/CD branch deployments with custom redirects |

---

## 📁 Project Structure

The project has been organized into a professional React architecture:

```
Portfolio-Abhishek/
├── public/                ← Static assets (favicons, PDFs, tech stack SVG icons)
├── src/
│   ├── assets/            ← Component-level static icons and images
│   ├── constants/         ← Global layout configs and navigation items
│   │   └── navigation.js
│   ├── data/              ← Timelines and structured developer profiles
│   │   └── TimelineData.js
│   ├── services/          # Services & API Configurations
│   │   └── supabase.js    ← Initialized Supabase PostgreSQL client connection
│   ├── layouts/           # Page structural framing components
│   │   ├── Navbar.jsx     ← Top navigation component with corrected anchors
│   │   ├── Footer.jsx     ← Footnote copyright and navigation panel
│   │   └── Background.jsx ← GPU-optimized particle background wrapper
│   ├── sections/          # Scrollable sections of the landing page (/)
│   │   ├── Home.jsx       ← Hero panel with memory game & stats
│   │   ├── About.jsx      ← Intro, skill tags, timeline, and Syntax Invaders
│   │   ├── Portfolio.jsx  ← Showcases, certificates, tech tabs, blog, and notes
│   │   └── Contact.jsx    ← Forms and social link buttons
│   ├── pages/             # Standalone Routed Page Views (React.lazy loaded)
│   │   ├── WelcomeScreen.jsx ← Welcome loader/splash view
│   │   ├── ProjectDetail.jsx ← Details page for `/project/:id`
│   │   ├── BlogDetail.jsx    ← Article VS Code workspace view for `/blog/:id`
│   │   └── ThankYou.jsx      ← Success redirect page
│   ├── components/        # Reusable Atomic UI Blocks
│   │   ├── vscode/        # Modular VS Code Interactive Widgets
│   │   │   ├── ActivityBar.jsx
│   │   │   ├── BottomPanel.jsx
│   │   │   ├── Breadcrumbs.jsx
│   │   │   ├── EditorTabs.jsx
│   │   │   ├── QuickOpen.jsx
│   │   │   ├── SidebarExplorer.jsx ← Dynamic recursive tree view explorer
│   │   │   └── StatusBar.jsx
│   │   ├── games/         # Premium Mini-Games
│   │   │   ├── MemoryGame.jsx     ← Card-matching stack game
│   │   │   └── SyntaxInvaders.jsx ← Bug-shooter retro arcade game
│   │   ├── BlogCard.jsx
│   │   ├── CardProject.jsx
│   │   ├── Certificate.jsx
│   │   ├── EducationTimelineItem.jsx
│   │   ├── ExperienceTimelineItem.jsx
│   │   ├── FeaturedBlogCard.jsx
│   │   ├── NoteCard.jsx
│   │   └── TechStackIcon.jsx
│   ├── App.jsx            ← React routing and layouts composer
│   └── main.jsx           ← Entry point mount file
├── .env.example           ← Environment keys template configuration
├── .npmrc                 ← Legacy peer dependencies configuration
├── supabase_schema.sql    ← PostgreSQL schema definition for Supabase Setup
├── vercel.json            ← Vercel SPA router config for reload redirects
├── index.html             ← Landing HTML template with JSON-LD SEO schema
├── tailwind.config.js     ← Tailwind rules & styling overrides
├── package.json           ← Project modules and dependency scripts
└── vite.config.js         ← Vite compilation instructions
```

---

## ⚙️ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18.0.0 or higher
- npm (Node Package Manager)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Abhishekkkkkkkkkkk/Portfolio-Abhishek
   cd Portfolio-Abhishek
   ```

2. **Install dependencies:**
   The repository contains a `.npmrc` file that automatically enables `--legacy-peer-deps` resolution. Standard installation will execute without peer errors:
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory by copying the template:
   ```bash
   cp .env.example .env
   ```
   *Fill in your Supabase & Firebase config keys in the `.env` file (this file is automatically ignored in `.gitignore`).*

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

---

## ⚡ Supabase Setup

### Step 1 — Create a Supabase Project
1. Go to the [Supabase Dashboard](https://supabase.com/) and click **New Project**.
2. Set your project name, database password, and choose a region close to your target users.

### Step 2 — Run the Database Schema
1. Once the project is provisioned, navigate to the **SQL Editor** in the left sidebar.
2. Click **New query**.
3. Open the [supabase_schema.sql](file:///d:/Abhishek%20Portfolio/supabase_schema.sql) file from the project root, copy its entire contents, paste it into the Supabase editor, and click **Run**.
4. This script will create the necessary tables (`projects`, `certificates`, `blogs`, `notes`, `subscribers`), build the search indices, enable Row-Level Security (RLS) policies for public read access, and configure functions for tracking views and likes.

### Step 3 — Get API Credentials
1. Go to **Project Settings** -> **API**.
2. Copy the **Project URL** and the **`anon` (public)** key.
3. Paste these values into your `.env` file as:
   ```env
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_public_key
   ```

---

## 📂 Multi-Level Folders Schema in Blogs

The VS Code workspace sidebar supports nested folders automatically. You can nest articles by organizing your categories list in the database.

* **Method A (Multiple array elements)**: Save the `categories` field for your blog post as `["DSA", "Sorting"]`. This automatically places the article file under the `DSA` parent folder inside a `Sorting` subfolder.
* **Method B (Slash Separator)**: Save the first element of the `categories` array as a slash-separated string like `["DSA/Sorting"]`. The parser splits this string to render the folders hierarchically.

---

## 🚀 Vercel Deployment Settings

When importing this project onto Vercel, the configuration settings are managed automatically by the included `vercel.json` file.

1. **Root Directory**: Ensure this is set to the project root **`./`** (leave default/blank). Do NOT set the Root Directory to `dist`.
2. **Build Settings**: Vercel will auto-detect the **Vite** preset:
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. **Environment Variables**: Navigate to **Settings** > **Environment Variables** in the Vercel dashboard and add all the keys from your `.env` file (e.g. `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, etc.) so the live site can connect to your database.

---

## 🙋‍♂️ Author

**Abhishek Kumar** — Java Full Stack Developer

[![Portfolio](https://img.shields.io/badge/Portfolio-krabhishek.vercel.app-6366f1?style=flat-square&logo=vercel)](https://krabhishek.vercel.app/)
[![GitHub](https://img.shields.io/badge/GitHub-Abhishekkkkkkkkkkk-black?style=flat-square&logo=github)](https://github.com/Abhishekkkkkkkkkkk)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-abhishek2k24-0A66C2?style=flat-square&logo=linkedin)](https://www.linkedin.com/in/abhishek2k24/)

---

<div align="center">

⭐ **If you found this project helpful, consider giving it a star!**

*Built with ❤️ by Abhishek Kumar*

</div>
