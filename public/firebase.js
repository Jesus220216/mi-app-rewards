// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, onSnapshot, updateDoc, increment, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCOm3jbBL63R_XQjiDBi27WQJCr9lVGakI",
  authDomain: "mi-app-rewards-rd.firebaseapp.com",
  projectId: "mi-app-rewards-rd",
  storageBucket: "mi-app-rewards-rd.firebasestorage.app",
  messagingSenderId: "862164914639",
  appId: "1:862164914639:web:0a2a0ba4beab0dac0cc2ba",
  measurementId: "G-9BMKB6QNV2"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export {
  doc,
  onSnapshot,
  updateDoc,
  increment,
  getDoc,
  setDoc
};
