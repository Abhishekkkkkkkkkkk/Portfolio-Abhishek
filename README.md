<div align="center">

# 🚀 Portfolio V1 — Abhishek Kumar

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Site-blue?style=for-the-badge&logo=vercel)](https://krabhishek.vercel.app/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![MIT License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

<br/>

> A modern, responsive personal portfolio website built with React.js, Tailwind CSS, and Firebase — featuring smooth animations and a clean UI/UX.

<br/>

![Portfolio Preview](https://img.sanishtech.com/u/6a2f81994d9ad1b4238aafa803b1fcad.png)

</div>

---

## ✨ Features

- 📱 Fully **responsive** design across all screen sizes
- 🎨 Modern and clean **UI/UX**
- 🌀 Smooth scroll **animations** with AOS & Framer Motion
- 💼 **Project showcase** section
- 📬 **Contact form** powered by Firebase Firestore
- ⚡ Fast performance with **Vite** bundler

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| Frontend Framework | React.js |
| Styling | Tailwind CSS |
| Animations | Framer Motion, AOS |
| UI Components | Material UI, Lucide |
| Backend / DB | Firebase (Firestore) |
| Alerts | SweetAlert2 |
| Deployment | Vercel |

---

## 📁 Project Structure

```
Portfolio-Abhishek/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── pages/
│   ├── firebase.js        ← Firebase config goes here
│   ├── App.jsx
│   └── main.jsx
├── .env
├── index.html
├── package.json
└── vite.config.js
```

---

## ⚙️ Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or above recommended)
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

> If you run into peer dependency conflicts, use:
> ```bash
> npm install --legacy-peer-deps
> ```

**3. Configure Firebase** (see [Firebase Setup](#-firebase-setup) below)

**4. Start the development server:**

```bash
npm run dev
```

Open the URL shown in your terminal (usually `http://localhost:5173`) to view the app.

---

## 🔥 Firebase Setup

This project uses **Firebase Firestore** to handle the contact form submissions.

### Step 1 — Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **Add project** and follow the setup steps

### Step 2 — Enable Firestore

1. In your project, navigate to **Firestore Database**
2. Click **Create database** and choose a region

### Step 3 — Get Your Config

1. Go to **Project Settings** → **Your apps**
2. Register a Web App (`</>`)
3. Copy the `firebaseConfig` object

### Step 4 — Update `firebase.js`

Open `src/firebase.js` and replace the config with your own:

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

### Step 5 — Set Firestore Rules

For development/testing, set rules to:

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

> ⚠️ **Important:** Secure your Firestore rules before deploying to production.

### Step 6 — Firestore Collection Structure

Set up the Firestore collections as shown below:

![Firestore Collection Structure](https://i.postimg.cc/5ypDcG3X/fire1.png)
![Firestore Data Example](https://i.postimg.cc/cL8gHNnG/fire2.png)

---

## 📦 Production Build

To generate an optimized production build:

```bash
npm run build
```

The output will be in the `dist/` folder. You can deploy this to any static hosting platform (Vercel, Netlify, etc.).

---

## 🚀 Deployment

This project is deployed on **Vercel**. To deploy your own:

1. Push your code to GitHub
2. Import the repository on [vercel.com](https://vercel.com/)
3. Set any required environment variables
4. Click **Deploy**

---

## 🐛 Troubleshooting

| Issue | Fix |
|-------|-----|
| `npm install` fails | Try `npm install --legacy-peer-deps` |
| Firebase errors | Double-check your `firebaseConfig` values in `firebase.js` |
| Page not found on refresh | Configure Vercel for SPA routing (`vercel.json` rewrites) |
| Animations not working | Ensure AOS is initialized in `App.jsx` |

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

> 🙏 If you use this project as a base or reference, please provide proper credit. It means a lot!

---

## 🙋‍♂️ Author

**Abhishek Kumar**

[![Portfolio](https://img.shields.io/badge/Portfolio-krabhishek.vercel.app-blue?style=flat-square&logo=vercel)](https://krabhishek.vercel.app/)
[![GitHub](https://img.shields.io/badge/GitHub-Abhishekkkkkkkkkkk-black?style=flat-square&logo=github)](https://github.com/Abhishekkkkkkkkkkk)

---

<div align="center">

⭐ If you found this project helpful, consider giving it a **star**!

</div>
