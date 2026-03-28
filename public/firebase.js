// firebase.js
// 🔥 IMPORTS FIREBASE
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// 🔥 CONFIG (USA LA TUYA)
const firebaseConfig = {
  apiKey: "AIzaSyCOm3jbBL63R_XQjiDBi27WQJCr9lVGakI",
  authDomain: "mi-app-rewards-rd.firebaseapp.com",
  projectId: "mi-app-rewards-rd",
  storageBucket: "mi-app-rewards-rd.firebasestorage.app",
  messagingSenderId: "862164914639",
  appId: "1:862164914639:web:0a2a0ba4beab0dac0cc2ba",
  measurementId: "G-9BMKB6QNV2"
};

// 🔥 INIT
const app = initializeApp(firebaseConfig);

// 🔥 EXPORTS
export const db = getFirestore(app);
export const auth = getAuth(app);;
