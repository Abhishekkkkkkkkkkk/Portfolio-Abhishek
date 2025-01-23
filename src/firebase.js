import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"
import { collection, addDoc, getDocs } from "@firebase/firestore"; // Perbarui ini


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBWEHPxamFi51u1wt_rybJ5MwLyN3mb3T0",
  authDomain: "my-portfolio-a37dd.firebaseapp.com",
  projectId: "my-portfolio-a37dd",
  storageBucket: "my-portfolio-a37dd.firebasestorage.app",
  messagingSenderId: "267897047236",
  appId: "1:267897047236:web:9f173a917d12ec5c51a191",
  measurementId: "G-TF4TGX4GWD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, collection, addDoc };