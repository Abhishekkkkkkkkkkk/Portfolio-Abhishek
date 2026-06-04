<div align="center">

# 🚀 Personal Portfolio & Dev Workspace — Abhishek Kumar

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Site-6366f1?style=for-the-badge&logo=vercel)](https://krabhishek.vercel.app/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![MIT License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

<br/>

> A premium, fully responsive developer portfolio built with React.js, Tailwind CSS, Supabase SQL database, and Google Drive. Features a cinematic splash Welcome Loader, a custom VS Code-themed interactive Blog & Notes Workspace (with a built-in terminal compiler shell), GPU-accelerated canvas mini-games, and a polished dark-glass user interface.

<br/>

</div>

---

## 🔄 Migration & Technology Comparison

To achieve high performance, scalability, and modular code architecture, the project has been fully migrated from its original v1 implementation:

| Architectural Area | Previous Implementation | Current Upgraded V2 Implementation | Key Advantages of Migration |
| :--- | :--- | :--- | :--- |
| **Database & API Backend** | **Google Firebase Firestore** (NoSQL Database) | **Supabase PostgreSQL** (Relational Database) | Shifted to standard SQL queries, enabling clean database schemas (`supabase_schema.sql`), atomic view/like increments via database functions, and robust relational constraints. |
| **Workspace Sidebar Tree** | **Flat Category Mapping** (Grouped items in 4 hardcoded root folders) | **Dynamic Recursive Folder Trees** (Recursive nodes and nested subfolders) | Allows multi-level folder structures (e.g. `DSA` ➔ `Sorting` ➔ `Merge Sort`), rendering subfolders dynamically based on database categories array or slash-separated strings. |
| **Navigation Back Flow** | **Homepage Redirect Reset** (Escaping to home reset selected tab and scroll to top) | **Persistent Tab State & Scroll Restoration** | Retains selected tab index in `localStorage`. Uses `?tab=blog` URL query parameter to auto-focus the Blog tab and smooth-scroll back to the portfolio block. |
| **Mobile UX Layout** | **Static Workspace Explorer** (Sidebar kept open on mobile selection, blocking content viewport) | **Responsive Mobile Auto-Collapse** | Automatically disables sidebar on viewport load if `< 768px` and collapses sidebar explorer panel upon file selection, maximizing content view space. |
| **SPA Reload Routes** | **Direct Routing Paths** (Reloading subroutes on Vercel threw `404: NOT_FOUND` errors) | **Server-side Vercel Rewrites** (`vercel.json` mapping all paths to `index.html`) | Enables seamless browser reloading and link sharing for routed subpages like `/blog/:id` or `/project/:id` without 404 router errors. |
| **Asset Security** | **Sensitive credentials in repo** | **Clean placeholders in git** | Standardizes key references inside `.env.example` with safe placeholder strings to prevent API access token leaks. |

---

## ✨ Core Features & Workspaces

### 📂 Dynamic VS Code Blog Workspace
Explore technical publications through a highly-interactive IDE clone featuring:
- **Left Sidebar Explorer**: Expand folders and select files to navigate through technical papers dynamically.
- **Dynamic File Tree Builder**: Supports infinite nesting levels (e.g. `DSA` ➔ `Sorting` ➔ `Merge Sort`).
- **Quick Open (Ctrl+P / Cmd+P)**: Search and jump between files in real-time.
- **Settings Editor (`settings.json`)**: Customize font size, toggle line numbers, and switch between themes (**Dracula**, **Nord**, **Monokai**).
- **Interactive Bash Terminal**: Run mock commands (`help`, `ls`, `cat`, `theme`, `subscribe`) to interact with the site.
- **Real-Time Database Sync**: Subscribes to Supabase postgres changes to sync view counts dynamically.

### 🎮 Developer Mini-Games
Integrated directly into the layout to showcase interactive engineering skills:
- **Syntax Invaders**: A retro Canvas arcade shooter. Fire semicolon lasers (`;`) to destroy syntax bugs. Features difficulty levels, particle explosion bursts, and synth sound effects.
- **Dev Stack Matcher**: A memory matching card game showing tech icons side-by-side with your real-time LeetCode statistics.

### 📄 Google Drive Notes Viewer
Access high-yield computer science notes with an in-app PDF reader modal pulling directly from Google Drive `/preview` embeds.

### 🎬 Welcome Screen Loader
A lightweight loader that triggers a particle mesh, typewriter animation, and progress bar to ensure low bounce rates.

---

## 🛠️ Project Tech Stack

| Component / Layer | Technology / Library | Description |
| :--- | :--- | :--- |
| **Frontend Core** | **React.js** (v18.3) | Core JavaScript UI library |
| **Build & Bundler** | **Vite** (v6.3) | Dev server and optimized production bundler |
| **Styling & Layout** | **Tailwind CSS** (v3.4) & CSS | Responsive styling utilities & custom animation keyframes |
| **UI Components** | **Material UI** (MUI v6) | Tab panels and custom design themes |
| **Icon Set** | **Lucide React** | Modern SVG design icons |
| **Navigation & Tabs** | **React Router DOM** & **React Swipeable Views** | Client-side routing and mobile-friendly tab swipe controllers |
| **Animations** | **Framer Motion** & **AOS** | Entrance sweeps, modal popups, and scroll-fade triggers |
| **Database & Caching** | **Supabase** (PostgreSQL) | Dynamic database query client utilizing `localStorage` caching |
| **Form Alerts** | **SweetAlert2** | Interactive form submission alerts |
| **PDF Storage** | **Google Drive** | Hosts study notes PDFs via `/preview` embeds |
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
│   ├── pages/             # Standalone Routed Page Views
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
   *Fill in your Supabase credentials in the `.env` file (this file is automatically ignored in `.gitignore`).*

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

---

## ⚡ Supabase Database Setup

### Step 1 — Run the SQL Script
1. Log in to the [Supabase Console](https://supabase.com/).
2. Create a new project and navigate to the **SQL Editor** tab.
3. Paste the contents of `supabase_schema.sql` (found in the project root) and click **Run**.
4. This script sets up:
   - Database tables for projects, certificates, blogs, notes, and subscribers.
   - Row-Level Security (RLS) policies allowing public read access.
   - Database functions (`increment_blog_views`, `increment_blog_likes`) to update engagement metrics atomically.

### Step 2 — Configure Environment Variables
1. Go to **Project Settings** -> **API** in the Supabase Dashboard.
2. Copy the **Project URL** and the **`anon` public API key**.
3. Add them to your `.env` file:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```

---

## 📂 Multi-Level Folders Schema in Blogs

The VS Code workspace explorer dynamically builds directories based on the categories array in the Supabase database. You can organize your articles using either of the following methods:

1. **Using multiple categories**:
   Set `categories` to `["DSA", "Sorting"]`. The workspace explorer will automatically nest the article inside the `sorting` directory under `dsa`.
2. **Using a slash separator**:
   Set `categories` to `["DSA/Sorting"]`. The parser splits the string by `/` to render the folder structure recursively.

---

## ⚙️ Custom VS Code Interactive Shell

The bottom panel of the workspace runs a mock terminal interpreter that parses commands:
* `help` - Show lists of terminal command options.
* `ls` - List files in the current workspace.
* `cat <filename>` - Open and print the contents of a workspace file directly in the editor.
* `theme <name>` - Switch theme colors dynamically (`dracula`, `nord`, `monokai`).
* `subscribe <email>` - Subscribe to the newsletter database table in Supabase.
* `clear` - Flush all logs from the terminal screen.

---

## 🚀 Vercel Deployment Settings

The project contains a pre-configured `vercel.json` file to manage Single Page Application (SPA) routes.

1. **vercel.json rewrites**:
   ```json
   {
     "rewrites": [
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```
   *This maps all client-side URL requests to `index.html`, resolving `404: NOT_FOUND` page reload errors.*
2. **Build Configurations**:
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. **Environment Variables**: Add your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to Vercel's Environment Variables dashboard.

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
