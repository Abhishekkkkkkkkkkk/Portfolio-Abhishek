<div align="center">

# 🚀 Portfolio V2 — Abhishek Kumar

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Site-6366f1?style=for-the-badge&logo=vercel)](https://krabhishek.vercel.app/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![MIT License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

<br/>

> A fully redesigned, modular personal portfolio built with React.js, Tailwind CSS, Firebase, and Google Drive storage. Features a cinematic welcome screen, structured blog/notes system, premium GPU-accelerated animations, developer mini-games, and a polished dark-glass UI.

<br/>

</div>

---

## ✨ What's New in V2

| Feature | Description |
|---|---|
| 🏗️ **Clean Architecture** | Decoupled codebase separating page sections, layouts, standalone routed views, and centralized configuration services |
| 👾 **Syntax Invaders Game** | High-performance HTML5 Canvas arcade shooter. Blast descending bugs with semicolon lasers (;) complete with levels, particle bursts, and retro synthesizer audio |
| 🎴 **Dev Stack Matcher** | Interactive memory matching card game integrated side-by-side with your LeetCode Stats card inside the Hero section |
| 📝 **Blog System** | Write and publish articles from Firebase with category filters, cover images, reading time calculations, and full HTML rendering |
| 📄 **Notes Section** | Built-in modal PDF viewer displaying study notes hosted on Google Drive |
| 🎬 **Welcome Screen** | Optimized loading screen with particle mesh, typewriter URL chip, progress bar, and spring animations |
| 🎨 **Premium UI** | Polished dark glassmorphism, glow borders, sweep transitions, and skeleton layout loaders |
| ⚡ **GPU Animations Fix** | Fixed scroll lag by shifting the infinite scroll background loop onto throttled browser repaint cycles |
| 📦 **Legacy Peer Resolution** | Added `.npmrc` configuration to resolve npm peer conflicts automatically on remote hosts like Vercel |

---

## ✨ Core Features

- 📱 **Mobile-First Responsive Layout** optimized across all standard screen sizes.
- 🎨 **Glassmorphism Dark UI** utilizing tailwind color ranges, subtle shadows, and borders.
- 🌀 **GPU-Accelerated Animations** powered by AOS and Framer Motion transitions.
- 🎬 **Loading Screen** with a throttled particle generator that finishes loading within 1 second for low bounce rates.
- 💼 **Project Detail Subpages** providing a lock popup if code repositories are private.
- 📬 **Contact Form** validated using SweetAlert2 popup messages.

---

## 🛠️ Complete Tech Stack

Here is the complete list of technologies, languages, databases, and development tools used across this full-stack portfolio:

| Category | Technologies |
| :--- | :--- |
| **Languages** | Java, JavaScript, TypeScript, C++, C, HTML5, CSS3 |
| **Frontend Frameworks & UI** | React.js, Next.js, Redux Toolkit, Tailwind CSS, Material UI (MUI), Bootstrap, SCSS |
| **Backend Systems & Security** | Spring Boot, Spring MVC, Spring Security, RESTful APIs, JWT (JSON Web Tokens), OAuth 2.0, Node.js, Express.js |
| **Databases & ORM** | Cloud Firestore (Firebase), MySQL, MongoDB, Hibernate / JPA |
| **DevOps, Tools & Hosting** | Git, GitHub, Maven, Docker, CI/CD, Postman, Vite, Vercel, Netlify, Firebase Hosting, VS Code, Canva |

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
│   │   └── firebase.js    ← Initialized Firebase and Firestore client
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
│   │   ├── BlogDetail.jsx    ← Article view for `/blog/:id`
│   │   └── ThankYou.jsx      ← Success redirect page
│   ├── components/        # Reusable Atomic UI Blocks
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
   *Fill in your Firebase config keys in the `.env` file (these files are automatically ignored in `.gitignore`).*

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

---

## 🔥 Firebase Setup

### Step 1 — Create a Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** and create a new project.

### Step 2 — Enable Cloud Firestore Database
1. Navigate to **Firestore Database** in the left menu.
2. Click **Create database** and select your regional location.
3. Apply the following read-only rules to allow public access to your portfolio content:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read: if true;
         allow write: if false; // Restrict writes to Firebase Console only
       }
     }
   }
   ```

### Step 3 — Register a Web App
1. Under **Project Settings**, register a new web application (`</>`).
2. Copy the credentials (API key, Auth Domain, Project ID, App ID, etc.) into your local `.env` file.

---

## 🗄️ Firestore Collections Schema

Set up the following collections in your Firestore database to populate your portfolio showcase:

### `projects` (Collection)
| Field | Type | Description |
|---|---|---|
| `Title` | string | Name of the project |
| `Description` | string | Summary paragraph |
| `Img` | string | Screenshot URL |
| `Link` | string | Live demo site URL |
| `Github` | string | Repository link (or `"Private"`) |
| `TechStack` | array | e.g. `["React.js", "Spring Boot"]` |
| `Features` | array | e.g. `["Secure REST Endpoints", "PDF Generation"]` |

### `certificates` (Collection)
| Field | Type | Description |
|---|---|---|
| `Img` | string | Image URL of the certificate |

### `blogs` (Collection)
| Field | Type | Description |
|---|---|---|
| `title` | string | Post title |
| `description` | string | Summary text |
| `content` | string | Full article content (supports HTML tags) |
| `tags` | array | e.g. `["Java", "Spring Boot"]` |
| `date` | string | Publication date (e.g. `"Jun 2026"`) |
| `readTime` | string | reading speed indicator |
| `views` | string | integer or string views counts |
| `coverEmoji` | string | display emoji (e.g. `"☕"`) |
| `featured` | boolean | Set `true` to display inside the featured blog header slot |

### `notes` (Collection)
| Field | Type | Description |
|---|---|---|
| `title` | string | Notes title |
| `description` | string | Notes description |
| `subject` | string | Subject filter category (e.g., `"Java"`) |
| `tags` | array | e.g. `["OOP", "Multithreading"]` |
| `pdfUrl` | string | Google Drive PDF share link in `/preview` format |
| `coverEmoji` | string | display emoji (e.g. `"📚"`) |
| `pages` | string | page counts metadata |
| `date` | string | date metadata |
| `featured` | boolean | Set `true` to showcase in notes view |

---

## 🚀 Vercel Deployment Settings

When importing this project onto Vercel, apply the following project configuration settings:

1. **Root Directory**: Ensure this is set to the project root **`./`** (leave default/blank). Do NOT set the Root Directory to `dist`.
2. **Build Settings**: Vercel will auto-detect the **Vite** preset:
   - Build Command: `vite build`
   - Output Directory: `dist`
3. **Environment Variables**: Navigate to **Settings** > **Environment Variables** in the Vercel dashboard and add all the keys from your `.env` file (e.g. `VITE_FIREBASE_API_KEY`, etc.) so the live site can connect to your database.

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
