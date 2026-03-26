<div align="center">

# 🚀 Portfolio V2 — Abhishek Kumar

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Site-6366f1?style=for-the-badge&logo=vercel)](https://krabhishek.vercel.app/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![MIT License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

<br/>

> A fully redesigned, feature-rich personal portfolio built with React.js, Tailwind CSS, Firebase, and Google Drive storage - featuring a cinematic welcome screen, blog system, notes viewer, premium animations, and a polished dark UI.

<br/>

![Portfolio Preview](https://img.sanishtech.com/u/9c2e2baf2b104625072288b35fd273af.png)

</div>

---

## ✨ What's New in V2

| Feature | Description |
|---|---|
| 📝 Blog System | Write & publish articles from Firebase with category filters, cover images, and full HTML rendering |
| 📄 Notes Section | Upload PDF notes to Google Drive and view them in a built-in modal viewer |
| 🎬 Welcome Screen | Cinematic loading screen with particle mesh, glitch text, progress bar and spring animations |
| 🎨 Premium UI | Complete redesign - glassmorphism, glow effects, shine sweeps, and skeleton loaders throughout |
| 📊 Stat Counters | Animated scroll-triggered counters on the About page |
| 🎉 Fun Section | Matrix code rain background, live availability status, and interactive developer stat cards |
| 🔔 Portal Modals | All modals (PDF viewer, Certificate) render via `createPortal` - no overflow issues |
| 📱 Mobile Fixed | Fixed navbar overlap, badge overflow, and tab layout on all screen sizes |

---

## ✨ Features

- 📱 Fully **responsive** design across all screen sizes
- 🎨 Premium **dark UI** with glassmorphism, glow, and shine effects
- 🌀 Smooth **animations** with AOS & Framer Motion
- 🎬 **Cinematic welcome screen** with particle field and glitch effects
- 💼 **Project showcase** with hover effects and detail pages
- 📝 **Blog system** powered by Firebase Firestore
- 📄 **Notes viewer** with Google Drive PDF storage
- 🏆 **Certificates** gallery with fullscreen modal viewer
- 🛠️ **Tech stack** categorized into 5 sections
- 📬 **Contact form** with focus glow effects and fun animated section
- ⚡ Fast performance with **Vite** bundler

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| Frontend Framework | React.js |
| Styling | Tailwind CSS |
| Animations | Framer Motion, AOS |
| UI Components | Material UI, Lucide React |
| Backend / Database | Firebase Firestore |
| File Storage | Google Drive (PDFs) |
| Alerts | SweetAlert2 |
| Deployment | Vercel |

---

## 📁 Project Structure

```
Portfolio-Abhishek/
├── public/
│   └── assets/            ← Tech stack SVG icons
├── src/
│   ├── components/
│   │   ├── BlogCard.jsx         ← Blog post card
│   │   ├── FeaturedBlogCard.jsx ← Featured blog card
│   │   ├── NoteCard.jsx         ← Notes card with PDF viewer
│   │   ├── CardProject.jsx      ← Project card
│   │   ├── Certificate.jsx      ← Certificate with modal
│   │   ├── TechStackIcon.jsx    ← Tech stack icon card
│   │   ├── SocialLinks.jsx      ← Social media links panel
│   │   ├── ProjectDetail.jsx    ← Project detail page
│   │   ├── Navbar.jsx           ← Navigation bar
│   │   └── Background.jsx       ← Animated background
│   ├── Pages/
│   │   ├── Home.jsx             ← Hero section
│   │   ├── About.jsx            ← About me section
│   │   ├── Portofolio.jsx       ← Portfolio showcase (5 tabs)
│   │   ├── Contact.jsx          ← Contact form + fun section
│   │   ├── BlogDetail.jsx       ← Full blog article page
│   │   └── WelcomeScreen.jsx    ← Cinematic loading screen
│   ├── data/
│   │   └── timelineData.js      ← Education & experience data
│   ├── firebase.js              ← Firebase configuration
│   ├── App.jsx                  ← Routes & layout
│   └── main.jsx                 ← Entry point
├── .env
├── index.html
├── tailwind.config.js
├── package.json
└── vite.config.js
```

---

## ⚙️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or above
- npm (comes with Node.js)

### Installation

**1. Clone the repository:**

```bash
git clone https://github.com/Abhishekkkkkkkkkkk/Portfolio-Abhishek
cd Portfolio-Abhishek
```

**2. Install dependencies:**

```bash
npm install
```

> If you run into peer dependency conflicts:
> ```bash
> npm install --legacy-peer-deps
> ```

**3. Configure Firebase** (see [Firebase Setup](#-firebase-setup) below)

**4. Start the development server:**

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🔥 Firebase Setup

### Step 1 — Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **Add project** and follow the setup steps

### Step 2 — Enable Firestore

1. Navigate to **Firestore Database**
2. Click **Create database** → choose a region

### Step 3 — Get Your Config

1. Go to **Project Settings → Your apps**
2. Register a Web App (`</>`)
3. Copy the `firebaseConfig` object

### Step 4 — Update `firebase.js`

```js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### Step 5 — Firestore Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

> ⚠️ Secure your rules before deploying to production.

---

## 🗄️ Firestore Collections

### `projects`
| Field | Type | Description |
|---|---|---|
| `Title` | string | Project name |
| `Description` | string | Short description |
| `Img` | string | Cover image URL |
| `Link` | string | Live demo URL |
| `Github` | string | GitHub URL or `"Private"` |
| `TechStack` | array | List of technologies |
| `Features` | array | List of key features |

### `certificates`
| Field | Type | Description |
|---|---|---|
| `Img` | string | Certificate image URL |

### `blogs`
| Field | Type | Description |
|---|---|---|
| `title` | string | Article title |
| `description` | string | Short summary |
| `content` | string | Full HTML content |
| `tags` | array | e.g. `["Java", "Spring Boot"]` |
| `date` | string | e.g. `"Jan 2025"` |
| `readTime` | string | e.g. `"8 min read"` |
| `views` | string | e.g. `"1.2k views"` |
| `coverEmoji` | string | e.g. `"🚀"` |
| `coverImg` | string | Cover image URL (optional) |
| `featured` | boolean | Show as featured post |

### `notes`
| Field | Type | Description |
|---|---|---|
| `title` | string | Notes title |
| `description` | string | Short description |
| `subject` | string | e.g. `"Java"` |
| `tags` | array | e.g. `["Java", "OOP"]` |
| `pdfUrl` | string | Google Drive PDF URL |
| `coverEmoji` | string | e.g. `"☕"` |
| `pages` | string | e.g. `"45 pages"` |
| `date` | string | e.g. `"Jan 2025"` |
| `featured` | boolean | Show as featured note |

---

## ☁️ Google Drive Setup (for Notes PDFs)

1. Upload your PDF files to Google Drive
2. Right-click the file → click on **Share**
3. Change access to **Anyone with the link**
4. Copy the shareable link

Example link:

```
https://drive.google.com/file/d/FILE_ID/view?usp=sharing
```

5. Convert it into a direct preview link:

```
https://drive.google.com/file/d/FILE_ID/preview
```

6. Use this link as `pdfUrl` in your Firestore `notes` collection

> ✅ This allows seamless PDF viewing inside your app without external redirects.

---

## 📦 Production Build

```bash
npm run build
```

Output will be in the `dist/` folder. Deploy to Vercel, Netlify, or any static host.

---

## 🚀 Deployment

1. Push your code to GitHub
2. Import the repository on [vercel.com](https://vercel.com/)
3. Set any required environment variables
4. Click **Deploy**

---

## 🐛 Troubleshooting

| Issue | Fix |
|---|---|
| `npm install` fails | Use `npm install --legacy-peer-deps` |
| Firebase errors | Double-check `firebaseConfig` values in `firebase.js` |
| Page not found on refresh | Add `vercel.json` with SPA rewrites |
| PDF not loading in modal | Ensure Google Drive link is in `/preview` format and file is public |
| Animations not working | Ensure `AOS.init()` is called in the component's `useEffect` |
| Badge overflowing on mobile | Make sure `StatusBadge` is inside `hidden lg:block` wrapper |

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

> 🙏 If you use this project as a base or reference, please provide proper credit. It means a lot!

---

## 🙋‍♂️ Author

**Abhishek Kumar** — Full Stack Developer

[![Portfolio](https://img.shields.io/badge/Portfolio-krabhishek.vercel.app-6366f1?style=flat-square&logo=vercel)](https://krabhishek.vercel.app/)
[![GitHub](https://img.shields.io/badge/GitHub-Abhishekkkkkkkkkkk-black?style=flat-square&logo=github)](https://github.com/Abhishekkkkkkkkkkk)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-abhishek2k24-0A66C2?style=flat-square&logo=linkedin)](https://www.linkedin.com/in/abhishek2k24/)

---

<div align="center">

⭐ **If you found this project helpful, consider giving it a star!**

*Built with ❤️ by Abhishek Kumar*

</div>